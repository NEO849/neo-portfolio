# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: HLR-Lookup (Welle 4 — Telefon, pluggable)
#
# Live-Status einer Mobilnummer via hlr-lookups.com (HLR = Home Location
# Register): erreichbar/abwesend, Carrier, Portierung, Roaming.
#
# Pluggable + graceful:
#   · Liest HLR_API_KEY + HLR_API_SECRET aus der Service-Env (nie im Code).
#   · Ohne Keys → {aktiv: False} (das Telefon-Werkzeug läuft normal weiter,
#     nur ohne Live-Status). So ist der Code jetzt fertig und schaltet sich
#     automatisch frei, sobald die Keys hinterlegt sind.
#
# Auth: Digest-Auth (empfohlen) — HMAC-SHA256 über
#       endpoint_path + timestamp + method + body, signiert mit api_secret.
#
# Kosten/Datenschutz: kostenpflichtig pro Abfrage (~€0,01). Ergebnisse
# werden kurz gecacht (30 min, gehashter Key) → spart Kosten bei
# Wiederholungen; Live-Status ändert sich in dem Fenster praktisch nicht.
# ═══════════════════════════════════════════════════════════════════

from __future__ import annotations

import hashlib
import hmac
import json
import os
import time
from datetime import datetime
from typing import Awaitable, Callable

import httpx

from werkzeuge.cache import cache_schluessel, standard_cache

ENDPOINT_PATH = "/api/v2/hlr-lookup"
BASIS_URL = os.environ.get("HLR_BASE_URL", "https://www.hlr-lookups.com").rstrip("/")
TIMEOUT_S = 12
CACHE_TTL_S = 1800  # 30 min

CONNECTIVITY_TEXT = {
    "CONNECTED": "Erreichbar (Nummer aktiv im Netz)",
    "ABSENT": "Nicht erreichbar (Gerät aus / kein Netz)",
    "INVALID_MSISDN": "Ungültige Nummer",
    "UNDETERMINED": "Unbestimmt (Netz lieferte keine eindeutige Auskunft)",
}


def hlr_konfiguriert() -> bool:
    return bool((os.environ.get("HLR_API_KEY") or "").strip()
                and (os.environ.get("HLR_API_SECRET") or "").strip())


def _signatur_bauen(api_secret: str, timestamp: str, body: str, method: str = "POST") -> str:
    """HMAC-SHA256 über endpoint_path + timestamp + method + body."""
    nachricht = f"{ENDPOINT_PATH}{timestamp}{method}{body}"
    return hmac.new(api_secret.encode("utf-8"), nachricht.encode("utf-8"),
                    hashlib.sha256).hexdigest()


def _auswerten(daten: dict) -> dict:
    """Mappt die hlr-lookups-Antwort auf strukturierte deutsche Felder + Verdikt."""
    status = (daten.get("connectivity_status") or "UNDETERMINED").upper()
    carrier = daten.get("ported_network_name") or daten.get("original_network_name")
    return {
        "aktiv": True,
        "status": status,
        "status_text": CONNECTIVITY_TEXT.get(status, status),
        "erreichbar": status == "CONNECTED",
        "carrier": carrier,
        "ursprungs_carrier": daten.get("original_network_name"),
        "portiert": daten.get("is_ported"),
        "roaming": daten.get("is_roaming"),
        "roaming_netz": daten.get("roaming_network_name"),
        "mccmnc": daten.get("mccmnc"),
        "kosten_eur": daten.get("cost"),
        "quelle": "hlr-lookups.com",
    }


async def _standard_fetch(url: str, headers: dict, body: str) -> tuple[int, dict]:
    async with httpx.AsyncClient(verify=True) as client:
        r = await client.post(url, headers=headers, content=body, timeout=TIMEOUT_S)
        try:
            return r.status_code, r.json()
        except Exception:
            return r.status_code, {}


async def hlr_lookup(
    msisdn: str,
    *,
    fetch: Callable[[str, dict, str], Awaitable[tuple[int, dict]]] | None = None,
) -> dict:
    """
    Live-HLR-Abfrage für eine E.164-Nummer. Pluggable + graceful.

    Ohne konfigurierte Keys: {aktiv: False, hinweis: ...}.
    Wirft nie — jeder Fehler wird graceful zurückgegeben.
    """
    api_key = (os.environ.get("HLR_API_KEY") or "").strip()
    api_secret = (os.environ.get("HLR_API_SECRET") or "").strip()
    if not (api_key and api_secret):
        return {"aktiv": False, "hinweis": "HLR-Live-Status nicht konfiguriert (kein API-Key)"}

    if not msisdn:
        return {"aktiv": False, "hinweis": "Keine Nummer"}

    schluessel = cache_schluessel("hlr", msisdn)
    gecacht = await standard_cache.holen(schluessel)
    if gecacht is not None:
        return {**gecacht, "aus_cache": True}

    body = json.dumps({"msisdn": msisdn}, separators=(",", ":"))
    timestamp = str(int(time.time()))
    headers = {
        "Content-Type": "application/json",
        "X-Digest-Key": api_key,
        "X-Digest-Signature": _signatur_bauen(api_secret, timestamp, body),
        "X-Digest-Timestamp": timestamp,
    }

    fetcher = fetch or _standard_fetch
    try:
        status_code, daten = await fetcher(f"{BASIS_URL}{ENDPOINT_PATH}", headers, body)
    except Exception:
        return {"aktiv": False, "hinweis": "HLR-Dienst nicht erreichbar"}

    if status_code != 200 or not isinstance(daten, dict):
        return {"aktiv": False, "hinweis": f"HLR-Abfrage fehlgeschlagen (HTTP {status_code})"}

    ergebnis = _auswerten(daten)
    await standard_cache.setzen(schluessel, ergebnis, ttl_sekunden=CACHE_TTL_S)
    return ergebnis
