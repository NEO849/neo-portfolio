# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: NumVerify-Anreicherung (optional, key-gated)
#
# Reichert ein Telefon-Ergebnis ADDITIV um Live-Carrier, Leitungstyp
# (mobile/landline) und Ort an (NumVerify / apilayer). Ergänzt die
# lokale phonenumbers-Analyse um den ECHTEN, aktuellen Carrier.
#
#   · Ohne Key (NUMVERIFY_API_KEY) → kein "numverify"-Feld.
#   · Nur bei GÜLTIGER Nummer → schont das Free-Kontingent (100/Monat).
#   · 7-Tage-Cache (sha256-Key) → gleiche Nummer kostet nur 1× Kontingent.
#   · Jeder Fehler graceful abgefangen; bestehende Analyse bricht NIE.
# ═══════════════════════════════════════════════════════════════════

from __future__ import annotations

import os
import httpx

from werkzeuge.cache import cache_schluessel, standard_cache

NV_URL = "https://apilayer.net/api/validate"
_TTL = 7 * 24 * 3600  # 7 Tage — Carrier/Leitungstyp ändern sich praktisch nie
_TIMEOUT = 10.0


def numverify_verfuegbar() -> bool:
    """True, wenn ein NumVerify-API-Key konfiguriert ist."""
    return bool((os.environ.get("NUMVERIFY_API_KEY") or "").strip())


async def _abfrage(key: str, e164: str) -> dict:
    nummer = e164.lstrip("+")
    try:
        async with httpx.AsyncClient(verify=True) as client:
            antwort = await client.get(
                NV_URL,
                params={"access_key": key, "number": nummer, "format": 1},
                timeout=_TIMEOUT,
            )
    except Exception:
        return {"geprueft": False, "hinweis": "NumVerify nicht erreichbar"}

    if antwort.status_code != 200:
        return {"geprueft": False, "hinweis": f"NumVerify HTTP {antwort.status_code}"}

    try:
        d = antwort.json()
    except Exception:
        return {"geprueft": False, "hinweis": "NumVerify: ungültige Antwort"}

    if d.get("success") is False:
        info = (d.get("error") or {}).get("info") or "NumVerify-Fehler"
        return {"geprueft": False, "hinweis": info}

    if not d.get("valid", False):
        return {"geprueft": True, "valid": False,
                "hinweis": "NumVerify stuft die Nummer als nicht zustellbar ein",
                "quelle": "NumVerify (apilayer)"}

    return {
        "geprueft": True,
        "valid": True,
        "carrier": d.get("carrier") or None,
        "line_type": d.get("line_type") or None,
        "location": d.get("location") or None,
        "land": d.get("country_name") or None,
        "quelle": "NumVerify (apilayer)",
    }


async def numverify_anreichern(ergebnis: dict) -> dict:
    """
    Hängt additiv ein "numverify"-Feld an ein Telefon-Ergebnis.
    Crasht nie; ohne Key / ungültige Nummer bleibt das Ergebnis unverändert.
    """
    if not isinstance(ergebnis, dict) or ergebnis.get("fehler"):
        return ergebnis

    key = (os.environ.get("NUMVERIFY_API_KEY") or "").strip()
    if not key or not ergebnis.get("gueltig"):
        return ergebnis  # ohne Key / ungültige Nummer: keine Anreicherung (Quota schonen)

    e164 = (ergebnis.get("format") or {}).get("e164")
    if not e164:
        return ergebnis

    schluessel = cache_schluessel("numverify", e164)
    try:
        gecacht = await standard_cache.holen(schluessel)
        if gecacht is not None:
            ergebnis["numverify"] = gecacht
            return ergebnis
        res = await _abfrage(key, e164)
        # Nur echte Determinierungen cachen (kein Negativ-Caching von Limit-/Netzfehlern).
        if res.get("geprueft"):
            await standard_cache.setzen(schluessel, res, _TTL)
        ergebnis["numverify"] = res
    except Exception:
        ergebnis["numverify"] = {"geprueft": False, "hinweis": "NumVerify nicht erreichbar"}

    return ergebnis
