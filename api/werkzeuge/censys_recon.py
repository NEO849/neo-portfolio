# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: Censys-Recon (Censys Platform API)
#
# Censys Platform Host-Lookup via Personal Access Token (Bearer):
#   GET https://api.platform.censys.io/v3/global/asset/host/{ip}
#
# Komplement zu Shodan InternetDB:
#   · Shodan  → offene Ports + CVEs + Tags (keyless)
#   · Censys  → Service-Detail (Port/Protokoll/Transport), autoritativer
#               Standort, Autonomous-System, WHOIS-Organisation inkl.
#               Abuse-Kontakten, Reverse-DNS
#
# Key-gated + graceful: ohne CENSYS_PAT liefert das Modul einen klaren
# "nicht aktiviert"-Hinweis statt zu crashen (wie virustotal/numverify/hlr).
# ═══════════════════════════════════════════════════════════════════

import asyncio
import os
from datetime import datetime

import httpx

# DRY: IP-Erkennung, Domain-Auflösung und Port-Gefährlichkeit aus shodan_recon
# wiederverwenden — eine Single Source of Truth für beide Recon-Module.
from werkzeuge.shodan_recon import _ist_ip, _domain_zu_ips, GEFAEHRLICHE_PORTS

PLATFORM_HOST_URL = "https://api.platform.censys.io/v3/global/asset/host/{ip}"
TIMEOUT_S = 12
# Censys-Queries kosten Credits → Domains mit mehreren A-Records gedeckelt.
MAX_IPS = 2
# Censys liegt hinter Bot-Management; echter UA vermeidet Block.
UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)


def _censys_pat() -> str:
    """Optionaler Censys-Platform-PAT aus der Service-Env (nie im Code)."""
    return (
        os.environ.get("CENSYS_PAT")
        or os.environ.get("CENSYS_API_TOKEN")
        or ""
    ).strip()


def _host_parsen(resource: dict) -> dict:
    """Normalisiert ein result.resource-Objekt der Platform-API auf die UI-Form."""
    loc = resource.get("location") or {}
    coords = loc.get("coordinates") or {}
    as_ = resource.get("autonomous_system") or {}
    whois = resource.get("whois") or {}
    org = whois.get("organization") or {}
    services = resource.get("services") or []
    dns_ = resource.get("dns") or {}
    rdns = (dns_.get("reverse_dns") or {}).get("names") or []

    ports = sorted({s.get("port") for s in services if isinstance(s, dict) and s.get("port")})
    dienste = [
        {
            "port": s.get("port"),
            "protokoll": s.get("protocol"),
            "transport": s.get("transport_protocol"),
            "gefaehrlich": s.get("port") in GEFAEHRLICHE_PORTS,
            "service": GEFAEHRLICHE_PORTS.get(s.get("port")),
        }
        for s in services if isinstance(s, dict) and s.get("port")
    ]

    koordinaten = None
    if coords.get("latitude") is not None and coords.get("longitude") is not None:
        koordinaten = {"lat": coords.get("latitude"), "lon": coords.get("longitude")}

    return {
        "ip": resource.get("ip"),
        "standort": {
            "stadt": loc.get("city"),
            "provinz": loc.get("province"),
            "land": loc.get("country"),
            "land_code": loc.get("country_code"),
            "kontinent": loc.get("continent"),
            "zeitzone": loc.get("timezone"),
            "koordinaten": koordinaten,
        },
        "autonomes_system": {
            "asn": as_.get("asn"),
            "name": as_.get("name"),
            "beschreibung": as_.get("description"),
            "bgp_prefix": as_.get("bgp_prefix"),
            "land_code": as_.get("country_code"),
        },
        "whois_organisation": {
            "name": org.get("name"),
            "land": org.get("country"),
            "abuse_kontakte": org.get("abuse_contacts") or [],
        },
        "ports": ports,
        "ports_anzahl": resource.get("service_count") if resource.get("service_count") is not None else len(ports),
        "dienste": dienste[:30],
        "reverse_dns": list(rdns)[:10] if isinstance(rdns, list) else [],
    }


async def _host_abfragen(client: httpx.AsyncClient, ip: str, pat: str) -> dict:
    """Fragt einen einzelnen Host bei der Censys Platform API ab."""
    url = PLATFORM_HOST_URL.format(ip=ip)
    try:
        antwort = await client.get(
            url,
            headers={"Authorization": f"Bearer {pat}", "User-Agent": UA, "Accept": "application/json"},
            timeout=TIMEOUT_S,
        )
        if antwort.status_code == 404:
            return {"ip": ip, "in_censys": False}
        if antwort.status_code in (401, 403):
            return {"ip": ip, "fehler": "Censys-Authentifizierung/Plan abgelehnt", "in_censys": False}
        if antwort.status_code != 200:
            return {"ip": ip, "fehler": f"HTTP {antwort.status_code}", "in_censys": False}

        resource = (antwort.json().get("result") or {}).get("resource") or {}
        if not resource:
            return {"ip": ip, "in_censys": False}
        parsed = _host_parsen(resource)
        parsed["in_censys"] = True
        return parsed
    except httpx.TimeoutException:
        return {"ip": ip, "fehler": "Censys-Timeout", "in_censys": False}
    except Exception as e:
        return {"ip": ip, "fehler": f"Censys-Fehler: {type(e).__name__}", "in_censys": False}


# ─── Hauptfunktion ──────────────────────────────────────────────────

async def censys_abfragen(ziel: str) -> dict:
    """
    Censys Platform Host-Recon. Akzeptiert IP oder Domain (DNS-Auflösung).
    Key-gated: ohne CENSYS_PAT → klarer Hinweis statt Fehler.
    """
    jetzt = datetime.utcnow().isoformat() + "Z"
    ziel = (ziel or "").strip().lower()
    if not ziel:
        return {"ziel": ziel, "fehler": "Leeres Ziel", "analysiert_am": jetzt}

    pat = _censys_pat()
    if not pat:
        return {
            "ziel": ziel,
            "verfuegbar": False,
            "hinweis": "Censys ist nicht aktiviert (kein CENSYS_PAT in der Server-Env).",
            "analysiert_am": jetzt,
        }

    for prefix in ("https://", "http://", "www."):
        if ziel.startswith(prefix):
            ziel = ziel[len(prefix):]
    ziel = ziel.split("/")[0].split("?")[0]

    if _ist_ip(ziel):
        ips, eingabe_typ = [ziel], "ip"
    else:
        ips = (await _domain_zu_ips(ziel))[:MAX_IPS]
        eingabe_typ = "domain"
        if not ips:
            return {
                "ziel": ziel,
                "eingabe_typ": "domain",
                "fehler": "Domain konnte nicht in IP aufgelöst werden",
                "analysiert_am": jetzt,
            }

    async with httpx.AsyncClient() as client:
        hosts = await asyncio.gather(*[_host_abfragen(client, ip, pat) for ip in ips])

    treffer = [h for h in hosts if h.get("in_censys")]
    alle_ports = sorted({p for h in treffer for p in (h.get("ports") or [])})
    gefaehrliche = [p for p in alle_ports if p in GEFAEHRLICHE_PORTS]
    laender = sorted({(h.get("standort") or {}).get("land") for h in treffer if (h.get("standort") or {}).get("land")})
    as_liste = sorted({
        f"AS{(h.get('autonomes_system') or {}).get('asn')} {(h.get('autonomes_system') or {}).get('name') or ''}".strip()
        for h in treffer if (h.get("autonomes_system") or {}).get("asn")
    })

    return {
        "ziel": ziel,
        "eingabe_typ": eingabe_typ,
        "analysiert_am": jetzt,
        "verfuegbar": True,
        "ip_count": len(ips),
        "ips": ips,
        "hosts": hosts,
        "aggregiert": {
            "ports": alle_ports,
            "ports_anzahl": len(alle_ports),
            "gefaehrliche_ports": [
                {"port": p, "service": GEFAEHRLICHE_PORTS[p]} for p in gefaehrliche
            ],
            "laender": laender,
            "autonome_systeme": as_liste,
        },
        "quelle": "Censys Platform API (api.platform.censys.io)",
    }
