# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: Bild-Analyse (Reverse Image / EXIF)
# Lädt ein Bild von einer URL, extrahiert EXIF-Metadaten,
# berechnet Perceptual Hash und generiert Reverse-Search-Links.
# Nur passive Analyse — kein Upload zu Drittdiensten.
#
# Welle 1: + Reverse-Geocoding (GPS → Ortsname via Nominatim),
#          + erweiterte forensische EXIF-Felder (Seriennummer/Objektiv/…),
#          + Privacy-Verdikt mit konkreten Handlungsempfehlungen
#            ("kenne deine Spur — gibt es Handlungsbedarf?").
# ═══════════════════════════════════════════════════════════════════

import httpx
import hashlib
import io
import json
from datetime import datetime
from PIL import Image, ExifTags
from PIL.ExifTags import TAGS, GPSTAGS
import imagehash

from werkzeuge.netz_schutz import sichere_get, SSRFBlockiert
from werkzeuge.geocoding import reverse_geocode, koordinaten_gueltig


MAX_BILDGROESSE = 10 * 1024 * 1024  # 10 MB (Bytes auf der Leitung)

# Decompression-Bomb-Schutz: ein 10-MB-PNG kann zu mehreren GB Pixel
# dekomprimieren → OOM-Vektor. Pillow wirft bei Überschreitung
# DecompressionBombError (statt den Speicher zu sprengen). 24 MP (~6000×4000)
# deckt jede reale Foto-/Kamera-Auflösung ab, blockt aber Bomben.
# (Lehre 2026-06-10: jeder unbegrenzte Speicher-Pfad ist ein OOM-Risiko.)
MAX_PIXEL = 24_000_000
Image.MAX_IMAGE_PIXELS = MAX_PIXEL


def _gps_dezimal(werte, ref: str) -> float | None:
    """Konvertiert GPS-EXIF-Werte (Grad/Minuten/Sekunden) in Dezimalgrad."""
    try:
        grad = float(werte[0])
        minuten = float(werte[1])
        sekunden = float(werte[2])
        dezimal = grad + (minuten / 60.0) + (sekunden / 3600.0)
        if ref in ("S", "W"):
            dezimal = -dezimal
        return round(dezimal, 6)
    except Exception:
        return None


def _rational(wert) -> float | None:
    """Wandelt einen EXIF-Rational/Tupel-Wert in float (oder None)."""
    try:
        if isinstance(wert, (tuple, list)) and len(wert) == 2:
            return round(float(wert[0]) / float(wert[1]), 2)
        return round(float(wert), 2)
    except Exception:
        return None


def _exif_extrahieren(bild: Image.Image) -> dict:
    """Extrahiert EXIF-Metadaten aus einem PIL-Bild."""
    exif_roh = {}
    gps_daten = {}
    ergebnis = {}

    try:
        exif_data = bild._getexif()  # type: ignore
        if not exif_data:
            return {"verfuegbar": False}

        for tag_id, wert in exif_data.items():
            tag = TAGS.get(tag_id, str(tag_id))
            if tag == "GPSInfo":
                for gps_id, gps_wert in wert.items():
                    gps_tag = GPSTAGS.get(gps_id, str(gps_id))
                    gps_daten[gps_tag] = gps_wert
            else:
                # Nur serialisierbare Werte
                if isinstance(wert, (str, int, float, bytes)):
                    exif_roh[tag] = str(wert) if isinstance(wert, bytes) else wert

        ergebnis["verfuegbar"] = True
        ergebnis["kamera"] = (exif_roh.get("Make", "") + " " + exif_roh.get("Model", "")).strip() or None
        ergebnis["aufnahmedatum"] = exif_roh.get("DateTimeOriginal") or exif_roh.get("DateTime")
        ergebnis["software"] = exif_roh.get("Software")
        ergebnis["blende"] = str(exif_roh.get("FNumber")) if exif_roh.get("FNumber") else None
        ergebnis["belichtungszeit"] = str(exif_roh.get("ExposureTime")) if exif_roh.get("ExposureTime") else None
        ergebnis["iso"] = exif_roh.get("ISOSpeedRatings")
        ergebnis["brennweite"] = str(exif_roh.get("FocalLength")) if exif_roh.get("FocalLength") else None
        ergebnis["orientierung"] = exif_roh.get("Orientation")

        # Erweiterte, forensisch/Privacy-relevante Felder
        # Seriennummer = eindeutiger Geräte-Identifikator (verkettet Fotos derselben Kamera!)
        ergebnis["seriennummer"] = (
            exif_roh.get("BodySerialNumber")
            or exif_roh.get("CameraSerialNumber")
            or exif_roh.get("SerialNumber")
        )
        ergebnis["objektiv"] = exif_roh.get("LensModel") or exif_roh.get("LensMake")
        # Artist/Copyright tragen oft den Klarnamen des Fotografen
        ergebnis["kuenstler"] = exif_roh.get("Artist")
        ergebnis["copyright"] = exif_roh.get("Copyright")
        ergebnis["benutzerkommentar"] = exif_roh.get("UserComment") or exif_roh.get("ImageDescription")

        # GPS-Koordinaten + Zusatzdaten
        if gps_daten:
            lat = _gps_dezimal(
                gps_daten.get("GPSLatitude", []),
                gps_daten.get("GPSLatitudeRef", "N")
            )
            lon = _gps_dezimal(
                gps_daten.get("GPSLongitude", []),
                gps_daten.get("GPSLongitudeRef", "E")
            )
            if lat and lon:
                gps = {
                    "lat": lat,
                    "lon": lon,
                    "maps_link": f"https://www.google.com/maps?q={lat},{lon}",
                    "hinweis": "GPS-Koordinaten gefunden — Aufnahmeort rekonstruierbar",
                }
                # Höhe
                hoehe = _rational(gps_daten.get("GPSAltitude"))
                if hoehe is not None:
                    if gps_daten.get("GPSAltitudeRef") in (1, b"\x01"):
                        hoehe = -hoehe
                    gps["hoehe_meter"] = hoehe
                # Blickrichtung (in welche Richtung die Kamera zeigte)
                richtung = _rational(gps_daten.get("GPSImgDirection"))
                if richtung is not None:
                    gps["blickrichtung_grad"] = richtung
                # GPS-Zeitstempel (Datum)
                if gps_daten.get("GPSDateStamp"):
                    gps["gps_datum"] = str(gps_daten.get("GPSDateStamp"))
                ergebnis["gps"] = gps
            else:
                ergebnis["gps"] = None
        else:
            ergebnis["gps"] = None

    except Exception:
        return {"verfuegbar": False, "hinweis": "EXIF konnte nicht gelesen werden"}

    return ergebnis


def _privacy_bewertung(exif: dict) -> dict:
    """
    Reiner Bewerter: leitet aus den EXIF-Daten ein klares Privacy-Verdikt
    + konkrete Handlungsempfehlungen ab. Kern der "gibt es Handlungsbedarf?"-
    Mission. Seiteneffektfrei → offline testbar.
    """
    punkte = 0
    befunde: list[dict] = []
    empfehlungen: list[str] = []

    if not exif or not exif.get("verfuegbar"):
        return {
            "stufe": "Unkritisch",
            "punkte": 0,
            "zusammenfassung": "Das Bild enthält keine auslesbaren EXIF-Metadaten — "
                               "gut für die Privatsphäre (vermutlich bereits bereinigt).",
            "befunde": [],
            "empfehlungen": [],
        }

    gps = exif.get("gps") or {}
    if gps.get("lat") is not None and gps.get("lon") is not None:
        punkte += 4
        ort = gps.get("ort_name")
        meldung = "Exakte GPS-Koordinaten im Bild — der Aufnahmeort ist rekonstruierbar"
        if ort:
            meldung = f"Exakter Aufnahmeort im Bild: {ort}"
        befunde.append({"stufe": "hoch", "kategorie": "Standort", "meldung": meldung})
        empfehlungen.append("Entferne die GPS-/Standortdaten, bevor du das Bild öffentlich teilst.")

    if exif.get("seriennummer"):
        punkte += 3
        befunde.append({
            "stufe": "hoch", "kategorie": "Geräte-ID",
            "meldung": f"Kamera-Seriennummer sichtbar: {exif['seriennummer']} — "
                       "verkettet alle Fotos desselben Geräts eindeutig.",
        })
        empfehlungen.append("Seriennummer aus den Metadaten entfernen (verhindert Geräte-Verkettung).")

    if exif.get("kuenstler") or exif.get("copyright"):
        punkte += 2
        wer = exif.get("kuenstler") or exif.get("copyright")
        befunde.append({
            "stufe": "mittel", "kategorie": "Identität",
            "meldung": f"Name/Copyright im Bild hinterlegt: {wer}",
        })
        empfehlungen.append("Prüfe das Artist-/Copyright-Feld — es kann deinen Klarnamen enthalten.")

    if exif.get("kamera"):
        punkte += 1
        befunde.append({
            "stufe": "niedrig", "kategorie": "Gerät",
            "meldung": f"Kameramodell sichtbar: {exif['kamera']}",
        })

    if exif.get("aufnahmedatum"):
        punkte += 1
        befunde.append({
            "stufe": "niedrig", "kategorie": "Zeit",
            "meldung": f"Aufnahmezeitpunkt sichtbar: {exif['aufnahmedatum']}",
        })

    if exif.get("software"):
        befunde.append({
            "stufe": "info", "kategorie": "Software",
            "meldung": f"Bearbeitungs-/Geräte-Software sichtbar: {exif['software']}",
        })

    if befunde and not any(e for e in empfehlungen):
        empfehlungen.append("Metadaten vor dem Teilen mit einem EXIF-Cleaner entfernen.")

    if punkte >= 5:
        stufe, zus = "Hoch", "Das Bild verrät sensible Informationen (u.a. Standort/Geräte-ID). Vor dem Teilen bereinigen."
    elif punkte >= 2:
        stufe, zus = "Mittel", "Das Bild enthält identifizierende Metadaten. Prüfe, ob du sie öffentlich preisgeben willst."
    elif punkte >= 1:
        stufe, zus = "Gering", "Das Bild enthält geringfügige Metadaten."
    else:
        stufe, zus = "Unkritisch", "Keine kritischen Metadaten gefunden."

    return {
        "stufe": stufe,
        "punkte": punkte,
        "zusammenfassung": zus,
        "befunde": befunde,
        "empfehlungen": list(dict.fromkeys(empfehlungen)),
    }


# ─── Senior-Forensik 2026: versteckte Daten, KI-Herkunft, C2PA ──────

def _versteckte_daten(bild_bytes: bytes, format_name: str) -> dict:
    """
    Erkennt an das offizielle Datei-Ende ANGEHÄNGTE Daten — ein klassischer
    Träger für versteckte Inhalte (Stego/Polyglot) oder Reste. Reiner Byte-
    Check, kein Extrahieren (keine ToS-/Sicherheitsfläche).
    """
    try:
        marker = (b"\xff\xd9" if format_name == "JPEG"
                  else b"\x49\x45\x4e\x44\xae\x42\x60\x82" if format_name == "PNG"
                  else None)
        if not marker:
            return {"geprueft": False}
        idx = bild_bytes.rfind(marker)
        if idx == -1:
            return {"geprueft": True, "hat_trailing_data": False}
        trailing = len(bild_bytes) - (idx + len(marker))
        return {
            "geprueft": True,
            "hat_trailing_data": trailing > 32,   # kleine Reste sind normal
            "trailing_bytes": max(0, trailing),
            "hinweis": ("Daten nach dem regulären Datei-Ende gefunden — möglicher "
                        "versteckter Container / angehängter Payload.") if trailing > 32 else None,
        }
    except Exception:
        return {"geprueft": False}


def _xmp_auswerten(bild: Image.Image) -> dict:
    """
    Liest XMP-Metadaten (Pillow, offline): KI-Herkunft (IPTC DigitalSourceType)
    + Hinweis auf Bearbeitungs-Historie. Wichtig fürs Deepfake-/Echtheits-Thema.
    """
    try:
        xmp = bild.getxmp()
    except Exception:
        return {"vorhanden": False}
    if not xmp:
        return {"vorhanden": False}
    roh = json.dumps(xmp, default=str).lower()
    ki = any(s in roh for s in (
        "trainedalgorithmicmedia", "algorithmicmedia", "compositewithtrainedalgorithmicmedia",
        "ai-generated", "genai", "generativeai",
    ))
    return {
        "vorhanden": True,
        "ki_erzeugt": ki,
        "hat_bearbeitungs_historie": ("history" in roh or "documentid" in roh),
        "hinweis": ("XMP kennzeichnet das Bild als KI-/algorithmisch erzeugt (DigitalSourceType)."
                    if ki else None),
    }


def _content_credentials(bild_bytes: bytes, content_type: str) -> dict:
    """
    C2PA / Content Credentials — verifizierbares Herkunfts-Manifest (Adobe, Leica,
    Sony, OpenAI, …). 2026-Industriestandard für Bild-Authentizität. Optionale
    Abhängigkeit: ohne installierte Lib graceful deaktiviert.
    """
    try:
        from c2pa import Reader  # optional
    except Exception:
        return {"verfuegbar": False, "hinweis": "C2PA-Prüfung nicht aktiviert (Bibliothek fehlt)"}
    try:
        mime = (content_type.split(";")[0].strip() or "image/jpeg")
        if not mime.startswith("image/"):
            mime = "image/jpeg"
        reader = Reader(mime, io.BytesIO(bild_bytes))
        manifest = json.loads(reader.json())
        aktiv = manifest.get("active_manifest")
        store = (manifest.get("manifests") or {}).get(aktiv, {}) if aktiv else {}
        sig = store.get("signature_info") or {}
        aktionen: list[str] = []
        for a in store.get("assertions", []) or []:
            if a.get("label") == "c2pa.actions":
                for act in (a.get("data") or {}).get("actions", []) or []:
                    if act.get("action"):
                        aktionen.append(str(act["action"]).replace("c2pa.", ""))
        return {
            "verfuegbar": True,
            "hat_manifest": bool(aktiv),
            "erzeugt_von": (store.get("claim_generator") or "").split("(")[0].strip() or None,
            "signiert_von": sig.get("issuer"),
            "signatur_zeit": sig.get("time"),
            "aktionen": list(dict.fromkeys(aktionen))[:8],
            "hinweis": "Verifizierbare Herkunfts-Signatur (C2PA) vorhanden." if aktiv else
                       "Kein C2PA-Manifest — Herkunft nicht kryptografisch belegt (≠ unecht).",
        }
    except Exception:
        return {"verfuegbar": True, "hat_manifest": False}


async def bild_analysieren(bild_url: str) -> dict:
    """
    Hauptfunktion: Lädt Bild von URL, extrahiert Metadaten, berechnet Hashes,
    generiert Reverse-Image-Suchlinks.
    """
    bild_url = bild_url.strip()

    if not bild_url.startswith(("http://", "https://")):
        return {
            "url": bild_url,
            "fehler": "Bitte eine vollständige URL angeben (https://...)",
            "analysiert_am": datetime.utcnow().isoformat() + "Z",
        }

    # Bild herunterladen — SSRF-sicher (Guard prüft Ziel-IP + jeden Redirect)
    try:
        antwort = await sichere_get(
            bild_url,
            headers={"User-Agent": "Mozilla/5.0 (compatible; OSINTBot/1.0)"},
            timeout=15,
            max_bytes=MAX_BILDGROESSE,
        )
        antwort.raise_for_status()

        content_type = antwort.headers.get("content-type", "")
        if not any(t in content_type for t in ("image/", "application/octet-stream")):
            return {
                "url": bild_url,
                "fehler": f"URL liefert kein Bild (Content-Type: {content_type})",
                "analysiert_am": datetime.utcnow().isoformat() + "Z",
            }

        bild_bytes = antwort.content
        if len(bild_bytes) > MAX_BILDGROESSE:
            return {
                "url": bild_url,
                "fehler": "Bild zu groß (max. 10 MB)",
                "analysiert_am": datetime.utcnow().isoformat() + "Z",
            }

    except SSRFBlockiert as e:
        return {"url": bild_url, "fehler": f"Ziel blockiert (Sicherheitsrichtlinie): {e}", "analysiert_am": datetime.utcnow().isoformat() + "Z"}
    except httpx.HTTPStatusError as e:
        return {"url": bild_url, "fehler": f"HTTP-Fehler: {e.response.status_code}", "analysiert_am": datetime.utcnow().isoformat() + "Z"}
    except Exception as e:
        return {"url": bild_url, "fehler": f"Bild nicht erreichbar: {str(e)[:80]}", "analysiert_am": datetime.utcnow().isoformat() + "Z"}

    # PIL öffnen — der Header liefert die Maße OHNE Voll-Dekodierung (günstig).
    try:
        bild = Image.open(io.BytesIO(bild_bytes))
        breite, hoehe = bild.size
        format_name = bild.format or "Unbekannt"
        modus = bild.mode
    except Image.DecompressionBombError:
        return {"url": bild_url, "fehler": "Bild abgelehnt: Auflösung überschreitet das Sicherheitslimit (Decompression-Bomb-Schutz).", "analysiert_am": datetime.utcnow().isoformat() + "Z"}
    except Exception as e:
        return {"url": bild_url, "fehler": f"Bild konnte nicht geöffnet werden: {str(e)[:80]}", "analysiert_am": datetime.utcnow().isoformat() + "Z"}

    # Pixel-Limit explizit prüfen, BEVOR imagehash das Bild voll dekodiert (OOM-Schutz)
    if breite * hoehe > MAX_PIXEL:
        return {"url": bild_url, "fehler": f"Bild abgelehnt: {breite}×{hoehe} Pixel überschreiten das Sicherheitslimit ({MAX_PIXEL:,} px).", "analysiert_am": datetime.utcnow().isoformat() + "Z"}

    # Hashes berechnen
    md5 = hashlib.md5(bild_bytes).hexdigest()
    sha256 = hashlib.sha256(bild_bytes).hexdigest()
    try:
        phash = str(imagehash.phash(bild))
        ahash = str(imagehash.average_hash(bild))
        dhash = str(imagehash.dhash(bild))
    except Exception:
        phash = ahash = dhash = "Nicht verfügbar"

    # EXIF extrahieren
    exif = _exif_extrahieren(bild)

    # GPS → Ortsname (Reverse-Geocoding, gecacht, graceful).
    # Roh-Koordinaten + Karten-Link bleiben IMMER erhalten, auch wenn
    # der Geocoding-Dienst nicht erreichbar ist.
    gps = exif.get("gps") if isinstance(exif, dict) else None
    if gps and koordinaten_gueltig(gps.get("lat"), gps.get("lon")):
        geo = await reverse_geocode(gps["lat"], gps["lon"])
        if geo.get("gefunden"):
            gps["ort_name"] = geo.get("ort_name")
            gps["adresse"] = geo.get("adresse")
            gps["komponenten"] = geo.get("komponenten")
            gps["osm_link"] = geo.get("osm_link")
            gps["geocoding_quelle"] = geo.get("quelle")
            if geo.get("ort_name"):
                gps["hinweis"] = f"Aufnahmeort rekonstruiert: {geo['ort_name']}"

    # Dateigröße
    groesse_kb = round(len(bild_bytes) / 1024, 1)
    groesse_mb = round(len(bild_bytes) / (1024 * 1024), 2)

    # Reverse Image Suchlinks — kuratiert über alle Coverage-Bereiche
    from urllib.parse import quote
    url_encoded = quote(bild_url, safe="")
    suchlinks = [
        # Mainstream
        {"name": "Google Lens",   "kategorie": "Mainstream",  "url": f"https://lens.google.com/uploadbyurl?url={url_encoded}"},
        {"name": "Google Images", "kategorie": "Mainstream",  "url": f"https://www.google.com/searchbyimage?image_url={url_encoded}"},
        {"name": "TinEye",        "kategorie": "Mainstream",  "url": f"https://tineye.com/search?url={url_encoded}"},
        {"name": "Bing Visual",   "kategorie": "Mainstream",  "url": f"https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:{url_encoded}"},
        # Regional
        {"name": "Yandex",        "kategorie": "EU/CIS",      "url": f"https://yandex.com/images/search?url={url_encoded}&rpt=imageview"},
        {"name": "Baidu",         "kategorie": "China",       "url": f"https://image.baidu.com/pcdutu?queryImageUrl={url_encoded}"},
        # Face-Engines (paid, manuell)
        {"name": "PimEyes",       "kategorie": "Face (paid)", "url": "https://pimeyes.com/en"},
        {"name": "FaceCheck.ID",  "kategorie": "Face (paid)", "url": "https://facecheck.id"},
        {"name": "Search4Faces",  "kategorie": "Face CIS",    "url": "https://search4faces.com/en/"},
        {"name": "FindClone",     "kategorie": "Face CIS",    "url": "https://findclone.ru/"},
        {"name": "Lenso.ai",      "kategorie": "Face AI",     "url": "https://lenso.ai/"},
        # Art/Anime
        {"name": "SauceNAO",      "kategorie": "Anime/Art",   "url": f"https://saucenao.com/search.php?url={url_encoded}"},
        {"name": "IQDB",          "kategorie": "Anime/Art",   "url": f"https://iqdb.org/?url={url_encoded}"},
        # Celebs
        {"name": "PicTriev",      "kategorie": "Celebrity",   "url": "http://www.pictriev.com"},
    ]

    # Senior-Forensik 2026: versteckte Daten, KI-Herkunft (XMP), C2PA-Herkunft
    versteckte_daten = _versteckte_daten(bild_bytes, format_name)
    xmp = _xmp_auswerten(bild)
    content_credentials = _content_credentials(bild_bytes, content_type)

    # Privacy-Verdikt + konkrete Handlungsempfehlungen (Welle 1)
    bewertung = _privacy_bewertung(exif)

    # Forensik-Befunde additiv ergänzen (Authentizität / versteckte Daten)
    if xmp.get("ki_erzeugt"):
        bewertung["befunde"].append({
            "stufe": "mittel", "kategorie": "Authentizität",
            "meldung": "Metadaten kennzeichnen das Bild als KI-/algorithmisch erzeugt (DigitalSourceType).",
        })
    if content_credentials.get("hat_manifest"):
        bewertung["befunde"].append({
            "stufe": "info", "kategorie": "Herkunft (C2PA)",
            "meldung": f"Verifizierbares Herkunfts-Manifest vorhanden"
                       + (f" — erzeugt von {content_credentials['erzeugt_von']}" if content_credentials.get("erzeugt_von") else "") + ".",
        })
    if versteckte_daten.get("hat_trailing_data"):
        bewertung["befunde"].append({
            "stufe": "mittel", "kategorie": "Versteckte Daten",
            "meldung": f"{versteckte_daten.get('trailing_bytes')} Byte nach dem Datei-Ende — "
                       "möglicher versteckter/angehängter Inhalt.",
        })
        bewertung["empfehlungen"].append(
            "Bild über einen Re-Encoder neu speichern — entfernt angehängte Daten und Metadaten.")

    # Backward-Compat: flache Hinweis-Liste (alte UI-Form {stufe, meldung}),
    # abgeleitet aus den Verdikt-Befunden.
    sicherheits_hinweise = [
        {"stufe": b["stufe"], "meldung": b["meldung"]}
        for b in bewertung.get("befunde", [])
        if b.get("stufe") != "info"
    ]

    return {
        "url": bild_url,
        "analysiert_am": datetime.utcnow().isoformat() + "Z",
        "bild": {
            "format": format_name,
            "breite": breite,
            "hoehe": hoehe,
            "modus": modus,
            "groesse_kb": groesse_kb,
            "groesse_mb": groesse_mb,
        },
        "hashes": {
            "md5": md5,
            "sha256": sha256[:32] + "...",
            "phash": phash,
            "ahash": ahash,
            "dhash": dhash,
        },
        "exif": exif,
        "versteckte_daten": versteckte_daten,
        "xmp": xmp,
        "content_credentials": content_credentials,
        "suchlinks": suchlinks,
        "bewertung": bewertung,
        "sicherheits_hinweise": sicherheits_hinweise,
    }
