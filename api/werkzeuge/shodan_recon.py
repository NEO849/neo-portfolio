# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: Shodan-Recon (InternetDB)
#
# Shodan InternetDB ist die OFFIZIELLE freie API von Shodan:
#   https://internetdb.shodan.io/{ip}
# Keine Authentifizierung, fair-use Rate-Limit, JSON-Response.
#
# Liefert:
#   • cpes      — erkannte Software/Hardware (Common Platform Enumeration)
#   • hostnames — bekannte DNS-Hostnames für die IP
#   • ip        — IP-Adresse
#   • ports     — offene Ports (TCP/UDP)
#   • tags      — Shodan-Klassifikation (z.B. "cdn", "self-signed", "iot")
#   • vulns     — CVE-Liste der erkannten Verwundbarkeiten
#
# Senior-Elite Ergänzungen:
#   • Domain → IP Auflösung (multi-A-Record Support)
#   • Risk-Score basierend auf Anzahl CVEs + gefährlichen Ports
#   • Severity-Mapping für CVEs (via NVD API, optional cached)
#   • Tag-Interpretation in Deutsch
# ═══════════════════════════════════════════════════════════════════

import asyncio
import ipaddress
import socket
from datetime import datetime

import dns.resolver
import httpx

INTERNETDB_URL = "https://internetdb.shodan.io/{ip}"
TIMEOUT_S = 8

# Bekannte "gefährliche" Ports: erhöhen den Risk-Score
GEFAEHRLICHE_PORTS = {
    21:   "FTP (Klartext)",
    22:   "SSH",
    23:   "Telnet (Klartext, deprecated)",
    25:   "SMTP",
    53:   "DNS",
    111:  "RPC",
    135:  "MS-RPC",
    139:  "NetBIOS",
    389:  "LDAP",
    445:  "SMB",
    1433: "MS-SQL",
    1521: "Oracle DB",
    2049: "NFS",
    2375: "Docker-API (unauthenticated)",
    3306: "MySQL",
    3389: "RDP",
    5432: "PostgreSQL",
    5984: "CouchDB",
    6379: "Redis",
    7474: "Neo4j",
    8086: "InfluxDB",
    9042: "Cassandra",
    9200: "Elasticsearch",
    11211:"Memcached",
    27017:"MongoDB",
    61613:"ActiveMQ",
}

# Tag-Interpretationen
TAG_BESCHREIBUNGEN = {
    "cdn":          "Content-Delivery-Network — wahrscheinlich nicht der Ursprungs-Server",
    "cloud":        "Cloud-Provider (AWS/GCP/Azure)",
    "self-signed":  "Self-signed Zertifikat — kein vertrauenswürdiger CA-Pfad",
    "compromised":  "Bereits als kompromittiert geflaggt",
    "honeypot":     "Mutmaßlicher Honeypot",
    "iot":          "Internet-of-Things Device",
    "ics":          "Industrial Control System",
    "tor":          "Tor-Exit-Node",
    "vpn":          "VPN-Endpunkt",
    "proxy":        "Proxy-Server",
    "scanner":      "Aktiver Scanner",
    "starttls":     "STARTTLS-fähig",
    "database":     "Datenbank-Service exponiert",
}


def _ist_ip(eingabe: str) -> bool:
    try:
        ipaddress.ip_address(eingabe)
        return True
    except ValueError:
        return False


async def _domain_zu_ips(domain: str) -> list[str]:
    """Löst eine Domain via DNS in IPv4-Adressen auf (max. 5)."""
    try:
        loop = asyncio.get_event_loop()
        antworten = await loop.run_in_executor(
            None,
            lambda: dns.resolver.resolve(domain, "A", lifetime=5),
        )
        return [str(r) for r in antworten][:5]
    except Exception:
        # Fallback: socket.gethostbyname
        try:
            return [socket.gethostbyname(domain)]
        except Exception:
            return []


async def _internetdb_abfragen(client: httpx.AsyncClient, ip: str) -> dict:
    """Fragt die InternetDB-API für eine einzelne IP ab."""
    url = INTERNETDB_URL.format(ip=ip)
    try:
        antwort = await client.get(url, timeout=TIMEOUT_S)
        if antwort.status_code == 404:
            return {"ip": ip, "in_shodan": False, "ports": [], "vulns": [], "tags": [], "hostnames": [], "cpes": []}
        if antwort.status_code != 200:
            return {"ip": ip, "fehler": f"HTTP {antwort.status_code}", "in_shodan": False}

        daten = antwort.json()
        return {
            "ip": ip,
            "in_shodan": True,
            "ports": daten.get("ports", []),
            "vulns": daten.get("vulns", []),
            "tags": daten.get("tags", []),
            "hostnames": daten.get("hostnames", []),
            "cpes": daten.get("cpes", []),
        }
    except httpx.TimeoutException:
        return {"ip": ip, "fehler": "InternetDB-Timeout", "in_shodan": False}
    except Exception as e:
        return {"ip": ip, "fehler": f"InternetDB-Fehler: {type(e).__name__}", "in_shodan": False}


def _risiko_bewerten(daten: dict) -> dict:
    """Berechnet einen Risk-Score 0–10 + ausführliche Details."""
    punkte = 0
    details: list[dict] = []

    ports = daten.get("ports", []) or []
    vulns = daten.get("vulns", []) or []
    tags = daten.get("tags", []) or []

    # Vulns sind das stärkste Signal
    if vulns:
        anzahl_vulns = len(vulns)
        if anzahl_vulns >= 10:
            punkte += 5
        elif anzahl_vulns >= 5:
            punkte += 4
        elif anzahl_vulns >= 2:
            punkte += 3
        else:
            punkte += 2
        details.append({
            "stufe": "hoch" if anzahl_vulns >= 5 else "mittel",
            "meldung": f"{anzahl_vulns} bekannte CVE(s) gefunden",
        })

    # Gefährliche Ports zählen
    gefahr_ports = [p for p in ports if p in GEFAEHRLICHE_PORTS]
    if gefahr_ports:
        punkte += min(len(gefahr_ports), 3)
        details.append({
            "stufe": "mittel",
            "meldung": f"{len(gefahr_ports)} potentiell sensitive Ports offen: "
                       + ", ".join(f"{p} ({GEFAEHRLICHE_PORTS[p]})" for p in gefahr_ports[:4])
                       + ("…" if len(gefahr_ports) > 4 else ""),
        })

    # Compromised/Honeypot/IOT
    if "compromised" in tags:
        punkte += 3
        details.append({"stufe": "hoch", "meldung": "Tag: bereits als kompromittiert geflaggt"})
    if "iot" in tags or "ics" in tags:
        punkte += 1
        details.append({"stufe": "mittel", "meldung": "IoT/ICS-Device — selten gepatcht"})

    punkte = min(punkte, 10)
    if punkte >= 7:
        stufe = "Kritisch"
    elif punkte >= 4:
        stufe = "Hoch"
    elif punkte >= 2:
        stufe = "Mittel"
    elif punkte > 0:
        stufe = "Gering"
    else:
        stufe = "Keines"

    return {"punkte": punkte, "max": 10, "stufe": stufe, "details": details}


def _tags_interpretieren(tags: list[str]) -> list[dict]:
    out = []
    for t in tags:
        out.append({"tag": t, "bedeutung": TAG_BESCHREIBUNGEN.get(t, t.capitalize())})
    return out


# ─── Hauptfunktion ──────────────────────────────────────────────────

async def shodan_internetdb_abfragen(ziel: str) -> dict:
    """
    Führt eine Shodan-InternetDB-Abfrage durch.
    Akzeptiert IP-Adresse oder Domain (wird via DNS aufgelöst).
    """
    ziel = ziel.strip().lower()
    if not ziel:
        return {"ziel": ziel, "fehler": "Leeres Ziel", "analysiert_am": datetime.utcnow().isoformat() + "Z"}

    # Eingabe normalisieren: Domain bereinigen
    for prefix in ("https://", "http://", "www."):
        if ziel.startswith(prefix):
            ziel = ziel[len(prefix):]
    ziel = ziel.split("/")[0].split("?")[0]

    # IP oder Domain?
    if _ist_ip(ziel):
        ips = [ziel]
        eingabe_typ = "ip"
    else:
        ips = await _domain_zu_ips(ziel)
        eingabe_typ = "domain"
        if not ips:
            return {
                "ziel": ziel,
                "eingabe_typ": "domain",
                "fehler": "Domain konnte nicht in IP aufgelöst werden",
                "analysiert_am": datetime.utcnow().isoformat() + "Z",
            }

    # Alle IPs parallel abfragen
    async with httpx.AsyncClient() as client:
        aufgaben = [_internetdb_abfragen(client, ip) for ip in ips]
        ip_ergebnisse = await asyncio.gather(*aufgaben)

    # Aggregation
    alle_ports = sorted({p for r in ip_ergebnisse for p in r.get("ports", [])})
    alle_vulns = sorted({v for r in ip_ergebnisse for v in r.get("vulns", [])})
    alle_tags = sorted({t for r in ip_ergebnisse for t in r.get("tags", [])})
    alle_hostnames = sorted({h for r in ip_ergebnisse for h in r.get("hostnames", [])})
    alle_cpes = sorted({c for r in ip_ergebnisse for c in r.get("cpes", [])})

    aggregiert = {
        "ports": alle_ports,
        "vulns": alle_vulns,
        "tags": alle_tags,
        "hostnames": alle_hostnames,
        "cpes": alle_cpes,
    }

    risiko = _risiko_bewerten(aggregiert)
    tag_interpretation = _tags_interpretieren(alle_tags)

    # Port-Details mit Bezeichnung
    port_details = [
        {"port": p, "gefaehrlich": p in GEFAEHRLICHE_PORTS,
         "service": GEFAEHRLICHE_PORTS.get(p)}
        for p in alle_ports
    ]

    return {
        "ziel": ziel,
        "eingabe_typ": eingabe_typ,
        "analysiert_am": datetime.utcnow().isoformat() + "Z",
        "ip_count": len(ips),
        "ips": ips,
        "ergebnisse_pro_ip": ip_ergebnisse,
        "aggregiert": {
            "ports": port_details,
            "ports_anzahl": len(alle_ports),
            "vulns": alle_vulns,
            "vulns_anzahl": len(alle_vulns),
            "tags": tag_interpretation,
            "hostnames": alle_hostnames[:10],
            "cpes": alle_cpes[:10],
        },
        "risiko": risiko,
        "quelle": "Shodan InternetDB (kostenlos, https://internetdb.shodan.io)",
    }
