# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: Benutzername-Suche (Senior-Elite Edition)
# Sherlock + WhatsMyName Fusion — prüft 600+ Plattformen.
#
# Quellen:
#  • WhatsMyName JSON-DB (https://whatsmyname.app, MIT-Lizenz)
#  • Curated Hochpriorität-Plattformen (entwicklung, sicherheit, social)
#
# Strategie:
#  • DB wird beim ersten Aufruf live geladen + 24h gecached
#  • Tier-1 Plattformen IMMER zuerst (geringe Latenz, höchste Aussage)
#  • Tier-2 (Long-Tail) parallel via Semaphor (max 40 concurrent)
#  • Detection via e_string/m_string Pattern-Match (false-positive-resistent)
#  • Per-Plattform User-Agent + Header (manche Sites blocken Default-UA)
#  • Confidence-Score (string-match > status-only)
# ═══════════════════════════════════════════════════════════════════

import asyncio
import json
import time
from pathlib import Path

import httpx
from datetime import datetime

# ─── Konfiguration ──────────────────────────────────────────────────

WMN_URL = "https://raw.githubusercontent.com/WebBreacher/WhatsMyName/main/wmn-data.json"
CACHE_DATEI = Path("/tmp/wmn-data-cache.json")
CACHE_TTL_SEKUNDEN = 86_400  # 24h

MAX_PARALLEL = 40
TIMEOUT_S = 8

# Tier-1: kuratiert, hohe Aussagekraft (immer zuerst, eigene Beschreibung)
TIER1_PLATTFORMEN: list[dict] = [
    {"name": "GitHub",          "kategorie": "entwicklung", "url": "https://github.com/{username}",                "methode": "status", "tier": 1, "symbol": "⚙"},
    {"name": "GitLab",          "kategorie": "entwicklung", "url": "https://gitlab.com/{username}",                "methode": "status", "tier": 1, "symbol": "⚙"},
    {"name": "HackerOne",       "kategorie": "sicherheit",  "url": "https://hackerone.com/{username}",             "methode": "status", "tier": 1, "symbol": "🛡"},
    {"name": "Bugcrowd",        "kategorie": "sicherheit",  "url": "https://bugcrowd.com/{username}",              "methode": "status", "tier": 1, "symbol": "🛡"},
    {"name": "Intigriti",       "kategorie": "sicherheit",  "url": "https://app.intigriti.com/researcher/profile/{username}", "methode": "status", "tier": 1, "symbol": "🛡"},
    {"name": "Keybase",         "kategorie": "sicherheit",  "url": "https://keybase.io/{username}",                "methode": "status", "tier": 1, "symbol": "🔑"},
    {"name": "LinkedIn",        "kategorie": "beruf",       "url": "https://www.linkedin.com/in/{username}",       "methode": "status", "tier": 1, "symbol": "in"},
    {"name": "Mastodon (infosec)", "kategorie": "sicherheit", "url": "https://infosec.exchange/@{username}",       "methode": "status", "tier": 1, "symbol": "◈"},
    {"name": "Dev.to",          "kategorie": "entwicklung", "url": "https://dev.to/{username}",                    "methode": "status", "tier": 1, "symbol": "▲"},
    {"name": "DockerHub",       "kategorie": "entwicklung", "url": "https://hub.docker.com/u/{username}",          "methode": "status", "tier": 1, "symbol": "◈"},
    {"name": "npm",             "kategorie": "entwicklung", "url": "https://www.npmjs.com/~{username}",            "methode": "status", "tier": 1, "symbol": "◈"},
    {"name": "PyPI",            "kategorie": "entwicklung", "url": "https://pypi.org/user/{username}/",            "methode": "status", "tier": 1, "symbol": "◈"},
]

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.7,de;q=0.6",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
}


# ─── WhatsMyName DB Loading + Cache ─────────────────────────────────

def _cache_gueltig() -> bool:
    if not CACHE_DATEI.exists():
        return False
    alter = time.time() - CACHE_DATEI.stat().st_mtime
    return alter < CACHE_TTL_SEKUNDEN


async def _wmn_db_laden(client: httpx.AsyncClient) -> list[dict]:
    """Lädt die WhatsMyName-DB (cached 24h). Bei Fehler: leere Liste."""
    if _cache_gueltig():
        try:
            with CACHE_DATEI.open() as f:
                return json.load(f).get("sites", [])
        except Exception:
            pass
    try:
        antwort = await client.get(WMN_URL, timeout=15)
        antwort.raise_for_status()
        daten = antwort.json()
        # Cache speichern
        try:
            CACHE_DATEI.write_text(json.dumps(daten))
        except Exception:
            pass
        return daten.get("sites", [])
    except Exception:
        # Fallback: alten Cache nehmen falls vorhanden
        if CACHE_DATEI.exists():
            try:
                with CACHE_DATEI.open() as f:
                    return json.load(f).get("sites", [])
            except Exception:
                pass
        return []


def _wmn_zu_plattform(wmn_site: dict) -> dict | None:
    """Konvertiert einen WMN-Eintrag in unser internes Plattform-Format."""
    name = wmn_site.get("name")
    uri_check = wmn_site.get("uri_check")
    e_code = wmn_site.get("e_code", 200)
    e_string = wmn_site.get("e_string")
    m_string = wmn_site.get("m_string")
    if not name or not uri_check:
        return None
    return {
        "name": name,
        "url": uri_check,                       # Enthält {account} Placeholder
        "kategorie": wmn_site.get("cat", "sonstige"),
        "e_code": e_code,
        "e_string": e_string,                   # MUSS in Body sein → gefunden
        "m_string": m_string,                   # WENN in Body → NICHT gefunden
        "tier": 2,
        "headers": wmn_site.get("headers", {}),
        "symbol": "•",
    }


# ─── Detection ──────────────────────────────────────────────────────

async def _plattform_pruefen(
    client: httpx.AsyncClient,
    plattform: dict,
    benutzername: str,
    semaphore: asyncio.Semaphore,
) -> dict:
    """Prüft eine einzelne Plattform. Detection via Status + e_string/m_string."""
    async with semaphore:
        # URL-Substitution: sowohl {username} (Tier-1) als auch {account} (WMN) supporten
        url = plattform["url"].replace("{username}", benutzername).replace("{account}", benutzername)
        ergebnis_basis = {
            "plattform": plattform["name"],
            "kategorie": plattform.get("kategorie", "sonstige"),
            "url": url,
        }
        try:
            headers = {**DEFAULT_HEADERS, **plattform.get("headers", {})}
            antwort = await client.get(url, headers=headers, follow_redirects=False, timeout=TIMEOUT_S)

            status = antwort.status_code
            text = antwort.text if antwort.status_code < 400 else ""

            # Detection-Logik
            e_string = plattform.get("e_string")
            m_string = plattform.get("m_string")
            e_code = plattform.get("e_code", 200)

            if e_string or m_string:
                # WMN-Stil: präzise String-Detection
                e_string_match = bool(e_string and e_string in text)
                m_string_match = bool(m_string and m_string in text)
                gefunden = (status == e_code) and e_string_match and not m_string_match
                konfidenz = "hoch" if e_string_match else "mittel"
            else:
                # Fallback: nur Status
                gefunden = status == e_code
                konfidenz = "niedrig"  # Status-only ist anfällig für False-Positives

            return {
                **ergebnis_basis,
                "gefunden": gefunden,
                "status": status,
                "konfidenz": konfidenz,
                "tier": plattform.get("tier", 2),
            }
        except (httpx.TimeoutException, httpx.ConnectError):
            return {**ergebnis_basis, "gefunden": None, "fehler": "Timeout"}
        except Exception:
            return {**ergebnis_basis, "gefunden": None, "fehler": "Netzwerkfehler"}


# ─── Hauptfunktion ──────────────────────────────────────────────────

async def benutzername_suchen(benutzername: str, nur_tier1: bool = False) -> dict:
    """
    Sucht Benutzernamen auf 600+ Plattformen.

    Args:
        benutzername: zu prüfender Username
        nur_tier1: wenn True, nur die ~12 kuratierten Hochpriorität-Sites
    """
    benutzername = benutzername.strip()

    if not benutzername or len(benutzername) < 2:
        return {"benutzername": benutzername, "fehler": "Benutzername zu kurz",
                "analysiert_am": datetime.utcnow().isoformat() + "Z"}
    if len(benutzername) > 50:
        return {"benutzername": benutzername, "fehler": "Benutzername zu lang",
                "analysiert_am": datetime.utcnow().isoformat() + "Z"}

    semaphore = asyncio.Semaphore(MAX_PARALLEL)

    async with httpx.AsyncClient(verify=False, http2=False) as client:
        # Tier-2 DB laden (parallel zur Tier-1-Ausführung)
        plattformen: list[dict] = list(TIER1_PLATTFORMEN)

        if not nur_tier1:
            wmn_sites = await _wmn_db_laden(client)
            tier1_namen = {p["name"].lower() for p in TIER1_PLATTFORMEN}
            for site in wmn_sites:
                konv = _wmn_zu_plattform(site)
                if konv and konv["name"].lower() not in tier1_namen:
                    plattformen.append(konv)

        # Alle parallel prüfen (mit Semaphor begrenzt)
        aufgaben = [_plattform_pruefen(client, p, benutzername, semaphore) for p in plattformen]
        ergebnisse = await asyncio.gather(*aufgaben)

    # Auswertung
    gefunden = [e for e in ergebnisse if e.get("gefunden") is True]
    nicht_gefunden = [e for e in ergebnisse if e.get("gefunden") is False]
    fehler = [e for e in ergebnisse if e.get("gefunden") is None]

    # Sortierung: hohe Konfidenz + Tier-1 zuerst
    gefunden.sort(key=lambda e: (e.get("tier", 9), 0 if e.get("konfidenz") == "hoch" else 1, e["plattform"]))

    # Nach Kategorien gruppieren
    nach_kategorie: dict[str, list] = {}
    for eintrag in gefunden:
        kat = eintrag.get("kategorie", "sonstige")
        nach_kategorie.setdefault(kat, []).append(eintrag)

    # Konfidenz-Stats
    hoch = sum(1 for e in gefunden if e.get("konfidenz") == "hoch")
    mittel = sum(1 for e in gefunden if e.get("konfidenz") == "mittel")
    niedrig = sum(1 for e in gefunden if e.get("konfidenz") == "niedrig")

    treffer_basis = max(len(ergebnisse) - len(fehler), 1)

    return {
        "benutzername": benutzername,
        "analysiert_am": datetime.utcnow().isoformat() + "Z",
        "modus": "tier1" if nur_tier1 else "vollscan",
        "zusammenfassung": {
            "geprueft": len(ergebnisse),
            "gefunden": len(gefunden),
            "nicht_gefunden": len(nicht_gefunden),
            "fehler": len(fehler),
            "treffer_rate": round(len(gefunden) / treffer_basis * 100),
            "konfidenz_hoch": hoch,
            "konfidenz_mittel": mittel,
            "konfidenz_niedrig": niedrig,
        },
        "plattformen": {
            "gefunden": gefunden,
            "nicht_gefunden": [
                {"plattform": e["plattform"], "kategorie": e.get("kategorie"), "url": e["url"]}
                for e in nicht_gefunden[:30]  # Antwort-Größe begrenzen
            ],
            "fehler": fehler[:20],
        },
        "nach_kategorie": nach_kategorie,
    }
