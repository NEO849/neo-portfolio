# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: VirusTotal-Reputation (optional, key-gated)
#
# Reichert ein Domain- oder IP-Ergebnis ADDITIV um eine Reputations-
# Bewertung von VirusTotal an (wie viele AV-/URL-Engines die Domain/IP
# als schädlich einstufen). Gleiches Muster wie _mit_pivots:
#   · Ohne Key (VIRUSTOTAL_API_KEY) → kein "vt"-Feld, Ergebnis unverändert.
#   · Jeder Fehler wird abgefangen → bestehende Analyse bricht NIE.
#
# Free Public API: 4 Anfragen/min, 500/Tag. Ein Call pro Analyse.
# ═══════════════════════════════════════════════════════════════════

from __future__ import annotations

import os
import httpx

VT_BASIS = "https://www.virustotal.com/api/v3"
_TIMEOUT = 8.0


def vt_verfuegbar() -> bool:
    """True, wenn ein VirusTotal-API-Key konfiguriert ist."""
    return bool((os.environ.get("VIRUSTOTAL_API_KEY") or "").strip())


def _stufe(malicious: int, suspicious: int, gesamt: int) -> str:
    if malicious >= 3:
        return "Schädlich"
    if malicious >= 1 or suspicious >= 2:
        return "Verdächtig"
    if gesamt > 0:
        return "Sauber"
    return "Unbekannt"


async def vt_anreichern(typ: str, ergebnis: dict) -> dict:
    """
    Hängt additiv ein "vt"-Feld an ein Domain-/IP-Ergebnis.

    typ: "domain" | "ip"
    Crasht nie; ohne Key bleibt das Ergebnis exakt unverändert.
    """
    if not isinstance(ergebnis, dict) or ergebnis.get("fehler"):
        return ergebnis

    key = (os.environ.get("VIRUSTOTAL_API_KEY") or "").strip()
    if not key:
        return ergebnis  # graceful: keine Anreicherung ohne Key

    if typ == "domain":
        ziel = ergebnis.get("domain")
        pfad = f"/domains/{ziel}" if ziel else None
    else:  # ip
        ziel = ergebnis.get("ip") or ergebnis.get("ziel")
        pfad = f"/ip_addresses/{ziel}" if ziel else None
    if not pfad:
        return ergebnis

    try:
        async with httpx.AsyncClient(verify=True) as client:
            antwort = await client.get(
                f"{VT_BASIS}{pfad}",
                headers={"x-apikey": key, "Accept": "application/json"},
                timeout=_TIMEOUT,
            )
        if antwort.status_code == 429:
            ergebnis["vt"] = {"geprueft": False, "hinweis": "VirusTotal Rate-Limit (4/min) erreicht"}
            return ergebnis
        if antwort.status_code in (401, 403):
            ergebnis["vt"] = {"geprueft": False, "hinweis": "VirusTotal-Key ungültig oder ohne Berechtigung"}
            return ergebnis
        if antwort.status_code == 404:
            ergebnis["vt"] = {"geprueft": True, "stufe": "Unbekannt", "gesamt_engines": 0,
                              "hinweis": "VirusTotal kennt dieses Ziel (noch) nicht",
                              "quelle": "VirusTotal API v3"}
            return ergebnis
        if antwort.status_code != 200:
            ergebnis["vt"] = {"geprueft": False, "hinweis": f"VirusTotal HTTP {antwort.status_code}"}
            return ergebnis

        attr = (antwort.json().get("data") or {}).get("attributes") or {}
        stats = attr.get("last_analysis_stats") or {}
        mal = int(stats.get("malicious", 0))
        susp = int(stats.get("suspicious", 0))
        harm = int(stats.get("harmless", 0))
        unde = int(stats.get("undetected", 0))
        gesamt = mal + susp + harm + unde + int(stats.get("timeout", 0))
        kategorien = sorted({str(v) for v in (attr.get("categories") or {}).values() if v})

        ergebnis["vt"] = {
            "geprueft": True,
            "stufe": _stufe(mal, susp, gesamt),
            "malicious": mal,
            "suspicious": susp,
            "harmless": harm,
            "undetected": unde,
            "gesamt_engines": gesamt,
            "reputation": attr.get("reputation"),
            "kategorien": kategorien[:8],
            "quelle": "VirusTotal API v3",
        }
    except Exception:
        ergebnis["vt"] = {"geprueft": False, "hinweis": "VirusTotal nicht erreichbar"}

    return ergebnis
