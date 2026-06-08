# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: Reverse-Geocoding (Welle 1 — Reverse-Image)
#
# Wandelt GPS-Koordinaten (z.B. aus Foto-EXIF) in einen lesbaren Ort
# um: "48.137, 11.575" → "München, Bayern, Deutschland".
#
# Quelle: Nominatim (OpenStreetMap) — kostenlos, keyless.
#
# Senior-Elite / Policy-konform:
#   · Nominatim Usage-Policy: gültiger, identifizierender User-Agent
#     ist PFLICHT; max. 1 Request/Sekunde. Wir erfüllen das + cachen
#     aggressiv (Ortsnamen ändern sich praktisch nie → TTL 7 Tage),
#     wodurch reale Aufrufe minimal bleiben.
#   · Fester, NICHT nutzerkontrollierter Host → kein SSRF-Vektor.
#     Trotzdem: TLS-Verify an, Timeout, Antwortgröße unkritisch (JSON).
#   · Graceful Degradation: jeder Fehler → {gefunden: False}; der
#     Aufrufer behält immer die Roh-Koordinaten + Karten-Link.
#   · Selbst-host-fähig: NOMINATIM_BASE_URL per ENV überschreibbar
#     (eigene Instanz → keine Rate-Limits).
# ═══════════════════════════════════════════════════════════════════

from __future__ import annotations

import os
from typing import Awaitable, Callable
from urllib.parse import urlencode

import httpx

from werkzeuge.cache import cache_schluessel, standard_cache

BASIS_URL = os.environ.get(
    "NOMINATIM_BASE_URL", "https://nominatim.openstreetmap.org"
).rstrip("/")

USER_AGENT = os.environ.get(
    "NOMINATIM_USER_AGENT",
    "f3-data-solutions OSINT Self-Check (+https://www.f3-data-solutions.com)",
)

TIMEOUT_S = 8
CACHE_TTL_S = 7 * 24 * 3600  # 7 Tage — Ortsnamen sind quasi statisch


def koordinaten_gueltig(lat: float, lon: float) -> bool:
    try:
        return -90.0 <= float(lat) <= 90.0 and -180.0 <= float(lon) <= 180.0
    except (TypeError, ValueError):
        return False


def _geocode_url(lat: float, lon: float, sprache: str) -> str:
    params = urlencode({
        "lat": f"{lat:.6f}",
        "lon": f"{lon:.6f}",
        "format": "jsonv2",
        "zoom": 16,               # Adress-/Straßen-Ebene
        "addressdetails": 1,
        "accept-language": sprache,
    })
    return f"{BASIS_URL}/reverse?{params}"


def _kurzname(adresse: dict) -> str | None:
    """Baut einen kompakten Ortsnamen aus den Adress-Komponenten."""
    ort = (
        adresse.get("city")
        or adresse.get("town")
        or adresse.get("village")
        or adresse.get("municipality")
        or adresse.get("county")
    )
    land = adresse.get("country")
    teile = [t for t in (ort, adresse.get("state"), land) if t]
    # Dedup, Reihenfolge erhalten
    gesehen: set[str] = set()
    sauber = []
    for t in teile:
        if t not in gesehen:
            gesehen.add(t)
            sauber.append(t)
    return ", ".join(sauber) if sauber else None


def _parse_nominatim(daten: dict, lat: float, lon: float) -> dict:
    """Reiner Parser der Nominatim-Antwort → strukturiertes Ergebnis."""
    if not isinstance(daten, dict) or daten.get("error"):
        return {"gefunden": False, "hinweis": "Kein Ort zu diesen Koordinaten gefunden"}

    adresse = daten.get("address") or {}
    return {
        "gefunden": True,
        "ort_name": _kurzname(adresse),
        "adresse": daten.get("display_name"),
        "komponenten": {
            "strasse": adresse.get("road"),
            "hausnummer": adresse.get("house_number"),
            "plz": adresse.get("postcode"),
            "ort": adresse.get("city") or adresse.get("town") or adresse.get("village"),
            "bezirk": adresse.get("suburb") or adresse.get("city_district"),
            "kreis": adresse.get("county"),
            "bundesland": adresse.get("state"),
            "land": adresse.get("country"),
            "land_code": (adresse.get("country_code") or "").upper() or None,
        },
        "osm_link": f"https://www.openstreetmap.org/?mlat={lat:.6f}&mlon={lon:.6f}#map=17/{lat:.5f}/{lon:.5f}",
        "quelle": "Nominatim / OpenStreetMap",
    }


async def _standard_fetch(url: str) -> dict | None:
    async with httpx.AsyncClient(verify=True, follow_redirects=True) as client:
        antwort = await client.get(
            url,
            headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
            timeout=TIMEOUT_S,
        )
        if antwort.status_code != 200:
            return None
        return antwort.json()


async def reverse_geocode(
    lat: float,
    lon: float,
    sprache: str = "de",
    *,
    fetch: Callable[[str], Awaitable[dict | None]] | None = None,
) -> dict:
    """
    Reverse-Geocoding für GPS-Koordinaten.

    Args:
        lat, lon: Dezimalgrad
        sprache: bevorzugte Sprache der Ortsnamen (ISO, z.B. "de")
        fetch: optionaler Fetch-Override (für Tests; default = httpx→Nominatim)

    Returns:
        {gefunden, ort_name, adresse, komponenten, osm_link, quelle}
        oder {gefunden: False, hinweis} bei Fehler/keinem Treffer.
        Wirft NIE — Aufrufer behält immer die Roh-Koordinaten.
    """
    if not koordinaten_gueltig(lat, lon):
        return {"gefunden": False, "hinweis": "Ungültige Koordinaten"}

    lat = float(lat)
    lon = float(lon)
    fetcher = fetch or _standard_fetch
    schluessel = cache_schluessel("geocode", round(lat, 5), round(lon, 5), sprache)

    # 1) Cache-Treffer? (es werden nur Erfolge gecacht — s.u.)
    gecacht = await standard_cache.holen(schluessel)
    if gecacht is not None:
        return gecacht  # type: ignore[return-value]

    # 2) Live abfragen — immer graceful, wirft nie nach außen.
    try:
        daten = await fetcher(_geocode_url(lat, lon, sprache))
        if daten is None:
            return {"gefunden": False, "hinweis": "Geocoding-Dienst nicht erreichbar"}
        ergebnis = _parse_nominatim(daten, lat, lon)
    except Exception:
        return {"gefunden": False, "hinweis": "Geocoding fehlgeschlagen"}

    # 3) Nur erfolgreiche Treffer cachen (kein Negativ-Caching transienter Fehler).
    if ergebnis.get("gefunden"):
        await standard_cache.setzen(schluessel, ergebnis, ttl_sekunden=CACHE_TTL_S)
    return ergebnis
