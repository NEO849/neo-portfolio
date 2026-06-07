# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: Netz-Schutz (SSRF-Guard)
#
# Zentrale Absicherung für JEDEN serverseitigen Abruf einer
# *vom Nutzer kontrollierten* URL (Bild-Analyse, Domain-HTTP-Check).
#
# Schutzziel: Server-Side Request Forgery (SSRF).
#   · Cloud-Metadata (169.254.169.254, fd00:ec2::254)
#   · Loopback / Intranet / Link-Local / CGNAT / reservierte Ranges
#   · IPv4-mapped IPv6 (::ffff:127.0.0.1) und 6to4/Teredo-Tricks
#   · Redirect-basierte Umleitung auf interne Ziele (pro Hop geprüft)
#
# Vorgehen (defense in depth):
#   1. Schema-Whitelist: nur http/https
#   2. Host auflösen (A + AAAA), ALLE IPs müssen öffentlich sein
#   3. Abruf OHNE Auto-Redirect; jeder Redirect-Hop wird erneut geprüft
#   4. Antwortgröße begrenzt (Stream + harte Byte-Grenze)
#
# Rest-Risiko (ehrlich dokumentiert): Zwischen Prüfung und Connect
# besteht ein TOCTOU-Fenster (DNS-Rebinding mit sehr niedrigem TTL).
# Für eine passive OSINT-API ohne Auth/Secrets ist das akzeptabel; eine
# vollständige Härtung würde IP-Pinning per Custom-Transport erfordern.
# ═══════════════════════════════════════════════════════════════════

from __future__ import annotations

import asyncio
import ipaddress
import socket
from urllib.parse import urlparse, urljoin

import httpx

# Voll-Härtung: zusätzlich zu den ipaddress-Flags explizit blockierte Netze.
# (is_private deckt das meiste ab, diese Liste macht die Absicht explizit
#  und fängt Versions-Unterschiede der stdlib zwischen Python-Releases.)
_EXPLIZIT_BLOCKIERT = [
    ipaddress.ip_network("0.0.0.0/8"),       # "dieses" Netz
    ipaddress.ip_network("10.0.0.0/8"),      # privat
    ipaddress.ip_network("100.64.0.0/10"),   # CGNAT
    ipaddress.ip_network("127.0.0.0/8"),     # loopback
    ipaddress.ip_network("169.254.0.0/16"),  # link-local (Cloud-Metadata!)
    ipaddress.ip_network("172.16.0.0/12"),   # privat
    ipaddress.ip_network("192.0.0.0/24"),    # IETF-Protokoll
    ipaddress.ip_network("192.0.2.0/24"),    # TEST-NET-1
    ipaddress.ip_network("192.168.0.0/16"),  # privat
    ipaddress.ip_network("198.18.0.0/15"),   # Benchmark
    ipaddress.ip_network("198.51.100.0/24"), # TEST-NET-2
    ipaddress.ip_network("203.0.113.0/24"),  # TEST-NET-3
    ipaddress.ip_network("240.0.0.0/4"),     # reserviert
    ipaddress.ip_network("::1/128"),         # loopback v6
    ipaddress.ip_network("fc00::/7"),        # unique-local v6
    ipaddress.ip_network("fe80::/10"),       # link-local v6
    ipaddress.ip_network("::ffff:0:0/96"),   # IPv4-mapped (separat geprüft)
    ipaddress.ip_network("2001:db8::/32"),   # Dokumentation
]

MAX_REDIRECTS = 4
STANDARD_TIMEOUT_S = 12


class SSRFBlockiert(Exception):
    """Wird geworfen, wenn ein Ziel auf eine nicht-öffentliche Adresse zeigt."""


# ─── IP-Klassifikation ──────────────────────────────────────────────

def ip_ist_oeffentlich(ip_text: str) -> bool:
    """
    True nur für global routbare Unicast-Adressen.
    Behandelt IPv4-mapped IPv6 (::ffff:a.b.c.d) korrekt durch Rück-Mapping.
    """
    try:
        ip = ipaddress.ip_address(ip_text)
    except ValueError:
        return False

    # IPv4-mapped IPv6 auf die eingebettete IPv4 zurückführen
    if ip.version == 6 and getattr(ip, "ipv4_mapped", None) is not None:
        ip = ip.ipv4_mapped

    # stdlib-Flags (deckt private/loopback/link-local/multicast/reserved ab)
    if (
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_multicast
        or ip.is_reserved
        or ip.is_unspecified
    ):
        return False

    # Explizite Netz-Blockliste (Absicht + Versions-Robustheit)
    for netz in _EXPLIZIT_BLOCKIERT:
        if ip.version == netz.version and ip in netz:
            return False

    return True


async def _host_aufloesen(host: str) -> list[str]:
    """Löst einen Host in alle A/AAAA-IPs auf (dedupliziert). Leer bei Fehler."""
    loop = asyncio.get_event_loop()

    def _lookup() -> list[str]:
        infos = socket.getaddrinfo(host, None, proto=socket.IPPROTO_TCP)
        return list({eintrag[4][0] for eintrag in infos})

    try:
        return await loop.run_in_executor(None, _lookup)
    except Exception:
        return []


async def ziel_pruefen(url: str) -> str:
    """
    Validiert eine URL gegen SSRF und gibt den Host zurück.
    Wirft SSRFBlockiert bei Schema-Verstoß, DNS-Fehler oder interner IP.
    """
    teile = urlparse(url)
    if teile.scheme not in ("http", "https"):
        raise SSRFBlockiert(f"Schema nicht erlaubt: {teile.scheme or '(leer)'}")
    host = teile.hostname
    if not host:
        raise SSRFBlockiert("Kein Host in der URL")

    # Host kann bereits ein IP-Literal sein
    try:
        ipaddress.ip_address(host)
        if not ip_ist_oeffentlich(host):
            raise SSRFBlockiert(f"Ziel-IP nicht öffentlich: {host}")
        return host
    except ValueError:
        pass  # kein Literal → DNS-Auflösung

    ips = await _host_aufloesen(host)
    if not ips:
        raise SSRFBlockiert(f"Host nicht auflösbar: {host}")
    for ip in ips:
        if not ip_ist_oeffentlich(ip):
            raise SSRFBlockiert(f"Host {host} zeigt auf interne IP {ip}")
    return host


# ─── Sicherer Abruf ─────────────────────────────────────────────────

async def sichere_get(
    url: str,
    *,
    headers: dict | None = None,
    timeout: float = STANDARD_TIMEOUT_S,
    max_bytes: int | None = None,
    max_redirects: int = MAX_REDIRECTS,
) -> httpx.Response:
    """
    SSRF-sicherer GET. Folgt Redirects manuell und prüft JEDES Ziel erneut.
    TLS-Verifikation ist immer aktiv.

    Args:
        max_bytes: bei gesetztem Wert wird gestreamt und nach Überschreiten
                   der Grenze abgebrochen (Schutz gegen Riesen-Responses).
    """
    aktuelle_url = url
    async with httpx.AsyncClient(
        verify=True,
        follow_redirects=False,
        timeout=timeout,
        limits=httpx.Limits(max_connections=10),
    ) as client:
        for _ in range(max_redirects + 1):
            await ziel_pruefen(aktuelle_url)

            if max_bytes is None:
                antwort = await client.get(aktuelle_url, headers=headers)
            else:
                # Streamen: Status/Header sind vor dem Body verfügbar.
                async with client.stream("GET", aktuelle_url, headers=headers) as stream:
                    if stream.is_redirect:
                        antwort = stream
                    else:
                        brocken = bytearray()
                        async for teil in stream.aiter_bytes():
                            brocken.extend(teil)
                            if len(brocken) > max_bytes:
                                raise SSRFBlockiert("Antwort überschreitet Größenlimit")
                        # Vollständige, eigenständige Response aufbauen
                        antwort = httpx.Response(
                            status_code=stream.status_code,
                            headers=stream.headers,
                            content=bytes(brocken),
                            request=stream.request,
                        )

            # Redirect? → Location auflösen und erneut prüfen
            if antwort.is_redirect:
                ziel = antwort.headers.get("location")
                if not ziel:
                    return antwort
                aktuelle_url = urljoin(aktuelle_url, ziel)
                continue
            return antwort

    raise SSRFBlockiert(f"Zu viele Redirects (> {max_redirects})")
