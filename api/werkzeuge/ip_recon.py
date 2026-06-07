# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: IP-Recon via RIPEstat (keyless)
#
# RIPEstat Data API (https://stat.ripe.net/data/) ist die offizielle,
# kostenlose und auth-freie Schnittstelle des RIPE NCC. Liefert
# autoritative Routing- und Registrierungsdaten:
#   • network-info          — ASN(s) + announced Prefix der IP
#   • as-overview           — AS-Holder (Betreiber), Typ, announced
#   • prefix-overview       — Prefix-Inhaber + Routing-Status
#   • abuse-contact-finder  — Abuse-/Missbrauchs-Kontakt der IP
#
# Ergänzt das Shodan-InternetDB-Modul (Ports/Vulns) um die Frage
# „WEM gehört diese IP und WIE wird sie geroutet?".
# ═══════════════════════════════════════════════════════════════════

from __future__ import annotations

import asyncio
import ipaddress
import socket
from datetime import datetime

import httpx

from werkzeuge.netz_schutz import ip_ist_oeffentlich

RIPESTAT = "https://stat.ripe.net/data/{call}/data.json"
TIMEOUT_S = 10


async def _ripe(client: httpx.AsyncClient, call: str, resource: str) -> dict:
    """Ein RIPEstat-Call. Gibt das 'data'-Objekt zurück (leer bei Fehler)."""
    try:
        r = await client.get(
            RIPESTAT.format(call=call),
            params={"resource": resource, "sourceapp": "neo-portfolio-osint"},
            timeout=TIMEOUT_S,
        )
        if r.status_code == 200:
            return r.json().get("data", {}) or {}
    except Exception:
        pass
    return {}


def _ist_ip(text: str) -> bool:
    try:
        ipaddress.ip_address(text)
        return True
    except ValueError:
        return False


async def _domain_zu_ip(domain: str) -> str | None:
    loop = asyncio.get_event_loop()
    try:
        return await loop.run_in_executor(None, socket.gethostbyname, domain)
    except Exception:
        return None


async def ip_intel(ziel: str) -> dict:
    """
    Holt Routing-/Ownership-/Abuse-Intel für eine IP (oder Domain → IP).
    """
    ziel = ziel.strip().lower()
    for prefix in ("https://", "http://", "www."):
        if ziel.startswith(prefix):
            ziel = ziel[len(prefix):]
    ziel = ziel.split("/")[0].split("?")[0]

    if not ziel:
        return {"ziel": ziel, "fehler": "Leeres Ziel",
                "analysiert_am": datetime.utcnow().isoformat() + "Z"}

    # Domain → IP auflösen
    if _ist_ip(ziel):
        ip = ziel
        eingabe_typ = "ip"
    else:
        ip = await _domain_zu_ip(ziel)
        eingabe_typ = "domain"
        if not ip:
            return {"ziel": ziel, "eingabe_typ": "domain",
                    "fehler": "Domain konnte nicht in IP aufgelöst werden",
                    "analysiert_am": datetime.utcnow().isoformat() + "Z"}

    # Nur öffentliche IPs ergeben bei RIPEstat Sinn
    if not ip_ist_oeffentlich(ip):
        return {"ziel": ziel, "ip": ip, "eingabe_typ": eingabe_typ,
                "fehler": "IP ist nicht öffentlich routbar (privat/reserviert)",
                "analysiert_am": datetime.utcnow().isoformat() + "Z"}

    async with httpx.AsyncClient(verify=True,
                                 headers={"User-Agent": "neo-portfolio-osint/1.0"}) as client:
        # 1) network-info liefert ASN(s) + Prefix
        netz = await _ripe(client, "network-info", ip)
        asns = netz.get("asns", []) or []
        prefix = netz.get("prefix")

        # 2) Detail-Calls parallel (abhängig von asns/prefix)
        as_call = _ripe(client, "as-overview", f"AS{asns[0]}") if asns else _leer()
        prefix_call = _ripe(client, "prefix-overview", prefix) if prefix else _leer()
        abuse_call = _ripe(client, "abuse-contact-finder", ip)
        as_data, prefix_data, abuse_data = await asyncio.gather(as_call, prefix_call, abuse_call)

    # Aufbereiten
    abuse_kontakte = abuse_data.get("abuse_contacts", []) if abuse_data else []
    prefix_asns = prefix_data.get("asns", []) if prefix_data else []
    prefix_holder = prefix_asns[0].get("holder") if prefix_asns else None

    return {
        "ziel": ziel,
        "ip": ip,
        "eingabe_typ": eingabe_typ,
        "analysiert_am": datetime.utcnow().isoformat() + "Z",
        "routing": {
            "asns": asns,
            "prefix": prefix,
            "prefix_inhaber": prefix_holder,
            "announced": prefix_data.get("announced") if prefix_data else None,
        },
        "as": {
            "asn": asns[0] if asns else None,
            "holder": as_data.get("holder") if as_data else None,
            "typ": as_data.get("type") if as_data else None,
            "announced": as_data.get("announced") if as_data else None,
        },
        "abuse_kontakte": abuse_kontakte,
        "links": {
            "ripestat": f"https://stat.ripe.net/{ip}",
            "bgp_he": f"https://bgp.he.net/ip/{ip}",
        },
        "quelle": "RIPEstat Data API (RIPE NCC, kostenlos, keyless)",
    }


async def _leer() -> dict:
    """Platzhalter-Coroutine, damit asyncio.gather einheitlich bleibt."""
    return {}
