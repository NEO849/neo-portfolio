# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: Bild-Analyse (Reverse Image / EXIF)
# Lädt ein Bild von einer URL, extrahiert EXIF-Metadaten,
# berechnet Perceptual Hash und generiert Reverse-Search-Links.
# Nur passive Analyse — kein Upload zu Drittdiensten.
# ═══════════════════════════════════════════════════════════════════

import httpx
import hashlib
import io
from datetime import datetime
from PIL import Image, ExifTags
from PIL.ExifTags import TAGS, GPSTAGS
import imagehash


MAX_BILDGROESSE = 10 * 1024 * 1024  # 10 MB


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
        ergebnis["kamera"] = exif_roh.get("Make", "") + " " + exif_roh.get("Model", "")
        ergebnis["kamera"] = ergebnis["kamera"].strip() or None
        ergebnis["aufnahmedatum"] = exif_roh.get("DateTimeOriginal") or exif_roh.get("DateTime")
        ergebnis["software"] = exif_roh.get("Software")
        ergebnis["blende"] = str(exif_roh.get("FNumber")) if exif_roh.get("FNumber") else None
        ergebnis["belichtungszeit"] = str(exif_roh.get("ExposureTime")) if exif_roh.get("ExposureTime") else None
        ergebnis["iso"] = exif_roh.get("ISOSpeedRatings")
        ergebnis["brennweite"] = str(exif_roh.get("FocalLength")) if exif_roh.get("FocalLength") else None
        ergebnis["orientierung"] = exif_roh.get("Orientation")

        # GPS-Koordinaten
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
                ergebnis["gps"] = {
                    "lat": lat,
                    "lon": lon,
                    "maps_link": f"https://www.google.com/maps?q={lat},{lon}",
                    "hinweis": "GPS-Koordinaten gefunden — Aufnahmeort rekonstruierbar",
                }
            else:
                ergebnis["gps"] = None
        else:
            ergebnis["gps"] = None

    except Exception:
        return {"verfuegbar": False, "hinweis": "EXIF konnte nicht gelesen werden"}

    return ergebnis


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

    # Bild herunterladen
    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            antwort = await client.get(bild_url, headers={
                "User-Agent": "Mozilla/5.0 (compatible; OSINTBot/1.0)"
            })
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

    except httpx.HTTPStatusError as e:
        return {"url": bild_url, "fehler": f"HTTP-Fehler: {e.response.status_code}", "analysiert_am": datetime.utcnow().isoformat() + "Z"}
    except Exception as e:
        return {"url": bild_url, "fehler": f"Bild nicht erreichbar: {str(e)[:80]}", "analysiert_am": datetime.utcnow().isoformat() + "Z"}

    # PIL öffnen
    try:
        bild = Image.open(io.BytesIO(bild_bytes))
        breite, hoehe = bild.size
        format_name = bild.format or "Unbekannt"
        modus = bild.mode
    except Exception as e:
        return {"url": bild_url, "fehler": f"Bild konnte nicht geöffnet werden: {str(e)[:80]}", "analysiert_am": datetime.utcnow().isoformat() + "Z"}

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

    # Dateigröße
    groesse_kb = round(len(bild_bytes) / 1024, 1)
    groesse_mb = round(len(bild_bytes) / (1024 * 1024), 2)

    # Reverse Image Suchlinks
    from urllib.parse import quote
    url_encoded = quote(bild_url, safe="")
    suchlinks = [
        {"name": "Google Lens",  "url": f"https://lens.google.com/uploadbyurl?url={url_encoded}"},
        {"name": "TinEye",       "url": f"https://tineye.com/search?url={url_encoded}"},
        {"name": "Yandex",       "url": f"https://yandex.com/images/search?url={url_encoded}&rpt=imageview"},
        {"name": "Bing Visual",  "url": f"https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:{url_encoded}"},
        {"name": "Baidu",        "url": f"https://image.baidu.com/pcdutu?queryImageUrl={url_encoded}"},
    ]

    # Sicherheitsanalyse
    sicherheits_hinweise = []
    if exif.get("gps"):
        sicherheits_hinweise.append({
            "stufe": "hoch",
            "meldung": "GPS-Koordinaten im Bild — Aufnahmeort ist rekonstruierbar",
        })
    if exif.get("kamera"):
        sicherheits_hinweise.append({
            "stufe": "mittel",
            "meldung": f"Kameramodell sichtbar: {exif['kamera']}",
        })
    if exif.get("aufnahmedatum"):
        sicherheits_hinweise.append({
            "stufe": "niedrig",
            "meldung": f"Aufnahmedatum sichtbar: {exif['aufnahmedatum']}",
        })

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
        "suchlinks": suchlinks,
        "sicherheits_hinweise": sicherheits_hinweise,
    }
