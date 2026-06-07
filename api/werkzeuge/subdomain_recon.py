# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: Subdomain-Recon (keyless, multi-source)
#
# Sammelt Subdomains aus drei unabhängigen, kostenlosen Quellen und
# führt sie dedupliziert zusammen:
#   • crt.sh           — Certificate-Transparency-Logs (SANs)
#   • Wayback Machine  — CDX-API (historische URLs)
#   • CommonCrawl      — Index-API (gecrawlte URLs, neuester Index)
#
# Strategie (Senior-Elite):
#   • Alle Quellen parallel, jede mit eigener Fehler-Isolation
#     (eine Quelle down → die anderen liefern weiter)
#   • Strenge Scope-Filterung: nur Hostnamen, die wirklich auf die
#     abgefragte Domain enden (verhindert SAN-/Cross-Domain-Rauschen)
#   • Optionales Live-Resolve (gebündelt, Semaphor-begrenzt): markiert,
#     welche Subdomains aktuell einen A-Record haben
#   • Antwortgröße hart begrenzt; Gesamt-Count bleibt vollständig
# ═══════════════════════════════════════════════════════════════════

from __future__ import annotations

import asyncio
import json
import re
import socket
from datetime import datetime
from urllib.parse import urlparse

import httpx

TIMEOUT_S = 20
MAX_PRO_QUELLE = 5000          # Rohzeilen-Limit pro Quelle (Schutz)
MAX_RUECKGABE = 1000           # max. Subdomains in der Antwort
MAX_RESOLVE = 75               # max. Live-Resolves (Latenz-Schutz)
RESOLVE_PARALLEL = 40

_HOST_MUSTER = re.compile(r"^[a-z0-9_]([a-z0-9\-_\.]{0,253})[a-z0-9]$")


def _domain_bereinigen(eingabe: str) -> str:
    bereinigt = eingabe.strip().lower()
    for prefix in ("https://", "http://", "www."):
        if bereinigt.startswith(prefix):
            bereinigt = bereinigt[len(prefix):]
    return bereinigt.split("/")[0].split("?")[0].rstrip(".")


def _host_normalisieren(roh: str, domain: str) -> str | None:
    """Bereinigt einen rohen Host-String und prüft Scope-Zugehörigkeit."""
    if not roh:
        return None
    host = roh.strip().lower().lstrip("*.").rstrip(".")
    # evtl. enthaltenen Pfad/Port entfernen
    host = host.split("/")[0].split(":")[0]
    if not host or " " in host:
        return None
    # Scope: muss die Domain sein oder echt darauf enden
    if host != domain and not host.endswith("." + domain):
        return None
    if not _HOST_MUSTER.match(host):
        return None
    return host


# ─── Quelle 1: crt.sh (Certificate Transparency) ────────────────────

async def _crtsh(client: httpx.AsyncClient, domain: str) -> tuple[set[str], dict]:
    funde: set[str] = set()
    try:
        r = await client.get(
            "https://crt.sh/",
            params={"q": f"%.{domain}", "output": "json"},
            timeout=TIMEOUT_S,
        )
        if r.status_code != 200:
            return funde, {"ok": False, "hinweis": f"HTTP {r.status_code}"}
        # crt.sh liefert teils nicht-strikt-JSON (verkettete Objekte) — robust parsen
        try:
            eintraege = r.json()
        except Exception:
            text = "[" + r.text.replace("}\n{", "},{").strip() + "]"
            eintraege = json.loads(text)
        for eintrag in eintraege[:MAX_PRO_QUELLE]:
            name_value = eintrag.get("name_value", "") if isinstance(eintrag, dict) else ""
            for zeile in name_value.splitlines():
                host = _host_normalisieren(zeile, domain)
                if host:
                    funde.add(host)
        return funde, {"ok": True, "anzahl": len(funde)}
    except Exception as e:
        return funde, {"ok": False, "hinweis": f"{type(e).__name__}"}


# ─── Quelle 2: Wayback Machine (CDX) ────────────────────────────────

async def _wayback(client: httpx.AsyncClient, domain: str) -> tuple[set[str], dict]:
    funde: set[str] = set()
    try:
        r = await client.get(
            "https://web.archive.org/cdx/search/cdx",
            params={
                "url": f"*.{domain}/*",
                "output": "json",
                "fl": "original",
                "collapse": "urlkey",
                "limit": MAX_PRO_QUELLE,
            },
            timeout=TIMEOUT_S,
        )
        if r.status_code != 200:
            return funde, {"ok": False, "hinweis": f"HTTP {r.status_code}"}
        zeilen = r.json()
        # Erste Zeile ist der Header ["original"]
        for zeile in zeilen[1:] if zeilen and zeilen[0] == ["original"] else zeilen:
            url = zeile[0] if isinstance(zeile, list) and zeile else ""
            host = urlparse(url if "//" in url else "//" + url).hostname or ""
            norm = _host_normalisieren(host, domain)
            if norm:
                funde.add(norm)
        return funde, {"ok": True, "anzahl": len(funde)}
    except Exception as e:
        return funde, {"ok": False, "hinweis": f"{type(e).__name__}"}


# ─── Quelle 3: CommonCrawl (neuester Index) ─────────────────────────

async def _commoncrawl_neuester_index(client: httpx.AsyncClient) -> str | None:
    """Ermittelt den aktuellsten CommonCrawl-Index (cdx-api-Endpunkt)."""
    try:
        r = await client.get("https://index.commoncrawl.org/collinfo.json", timeout=TIMEOUT_S)
        if r.status_code == 200:
            indizes = r.json()
            if indizes and isinstance(indizes, list):
                return indizes[0].get("cdx-api")
    except Exception:
        pass
    return None


async def _commoncrawl(client: httpx.AsyncClient, domain: str) -> tuple[set[str], dict]:
    funde: set[str] = set()
    try:
        api = await _commoncrawl_neuester_index(client)
        if not api:
            # Fallback auf einen bekannten, stabilen Index
            api = "https://index.commoncrawl.org/CC-MAIN-2024-51-index"
        r = await client.get(
            api,
            params={"url": f"*.{domain}", "output": "json", "fl": "url", "limit": MAX_PRO_QUELLE},
            timeout=TIMEOUT_S,
        )
        if r.status_code != 200:
            return funde, {"ok": False, "hinweis": f"HTTP {r.status_code}"}
        # JSONL: eine JSON-Zeile pro Treffer
        for zeile in r.text.splitlines()[:MAX_PRO_QUELLE]:
            zeile = zeile.strip()
            if not zeile:
                continue
            try:
                obj = json.loads(zeile)
            except Exception:
                continue
            host = urlparse(obj.get("url", "")).hostname or ""
            norm = _host_normalisieren(host, domain)
            if norm:
                funde.add(norm)
        return funde, {"ok": True, "anzahl": len(funde)}
    except Exception as e:
        return funde, {"ok": False, "hinweis": f"{type(e).__name__}"}


# ─── Optionales Live-Resolve ────────────────────────────────────────

async def _resolve_einer(host: str, sem: asyncio.Semaphore) -> tuple[str, str | None]:
    async with sem:
        loop = asyncio.get_event_loop()
        try:
            ip = await loop.run_in_executor(None, socket.gethostbyname, host)
            return host, ip
        except Exception:
            return host, None


# ─── Hauptfunktion ──────────────────────────────────────────────────

async def subdomains_finden(domain_eingabe: str, aufloesen: bool = False) -> dict:
    """
    Sammelt Subdomains aus crt.sh + Wayback + CommonCrawl.

    Args:
        domain_eingabe: Zieldomain (mit/ohne Schema)
        aufloesen: wenn True, werden bis zu MAX_RESOLVE Subdomains live
                   aufgelöst (A-Record) und als aktiv/inaktiv markiert.
    """
    domain = _domain_bereinigen(domain_eingabe)
    if not domain or "." not in domain:
        return {
            "domain": domain,
            "fehler": "Ungültige Domain",
            "analysiert_am": datetime.utcnow().isoformat() + "Z",
        }

    async with httpx.AsyncClient(verify=True, follow_redirects=True,
                                 headers={"User-Agent": "neo-portfolio-osint/1.0"}) as client:
        (crt_set, crt_meta), (wb_set, wb_meta), (cc_set, cc_meta) = await asyncio.gather(
            _crtsh(client, domain),
            _wayback(client, domain),
            _commoncrawl(client, domain),
        )

        # Merge mit Quellen-Herkunft pro Subdomain
        herkunft: dict[str, set[str]] = {}
        for host in crt_set:
            herkunft.setdefault(host, set()).add("crt.sh")
        for host in wb_set:
            herkunft.setdefault(host, set()).add("wayback")
        for host in cc_set:
            herkunft.setdefault(host, set()).add("commoncrawl")

        alle = sorted(herkunft.keys())
        gesamt = len(alle)

        # Optionales Live-Resolve (gebündelt)
        aktiv_map: dict[str, str] = {}
        if aufloesen and alle:
            sem = asyncio.Semaphore(RESOLVE_PARALLEL)
            ziele = alle[:MAX_RESOLVE]
            ergebnisse = await asyncio.gather(*[_resolve_einer(h, sem) for h in ziele])
            aktiv_map = {h: ip for h, ip in ergebnisse if ip}

    # Antwort aufbauen (auf MAX_RUECKGABE begrenzt, aktive zuerst)
    def _sortkey(h: str) -> tuple:
        return (0 if h in aktiv_map else 1, h)

    sichtbare = sorted(alle, key=_sortkey)[:MAX_RUECKGABE]
    subdomains = [
        {
            "host": h,
            "quellen": sorted(herkunft[h]),
            "aktiv": h in aktiv_map if aufloesen else None,
            "ip": aktiv_map.get(h),
        }
        for h in sichtbare
    ]

    return {
        "domain": domain,
        "analysiert_am": datetime.utcnow().isoformat() + "Z",
        "zusammenfassung": {
            "gesamt_eindeutig": gesamt,
            "angezeigt": len(subdomains),
            "live_aufgeloest": len(aktiv_map) if aufloesen else None,
            "limit_erreicht": gesamt > MAX_RUECKGABE,
        },
        "quellen": {
            "crt.sh": crt_meta,
            "wayback": wb_meta,
            "commoncrawl": cc_meta,
        },
        "subdomains": subdomains,
    }
