# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: Domain-Analyse
# Führt DNS-Lookups, WHOIS und HTTP-Checks durch.
# Nur öffentlich verfügbare Daten — kein Datenschutzproblem.
# ═══════════════════════════════════════════════════════════════════

import dns.resolver
import dns.reversename
import whois
import httpx
import asyncio
import socket
from datetime import datetime


def _domain_bereinigen(eingabe: str) -> str:
    """Entfernt Protokoll und Pfad aus einer Domain-Eingabe."""
    bereinigt = eingabe.strip().lower()
    for prefix in ("https://", "http://", "www."):
        if bereinigt.startswith(prefix):
            bereinigt = bereinigt[len(prefix):]
    return bereinigt.split("/")[0].split("?")[0]


def _dns_records_holen(domain: str, typ: str) -> list[str]:
    """Holt DNS-Records eines bestimmten Typs — gibt leere Liste bei Fehler zurück."""
    try:
        antworten = dns.resolver.resolve(domain, typ, lifetime=5)
        return [str(r) for r in antworten]
    except Exception:
        return []


def _ip_zu_asn(ip: str) -> str:
    """Fragt ASN-Info für eine IP ab (Team Cymru DNS Methode)."""
    try:
        teile = ip.split(".")
        umgekehrt = ".".join(reversed(teile))
        antwort = dns.resolver.resolve(f"{umgekehrt}.origin.asn.cymru.com", "TXT", lifetime=5)
        roh = str(antwort[0]).strip('"')
        felder = [f.strip() for f in roh.split("|")]
        asn = felder[0] if felder else "unbekannt"
        organisation = felder[2] if len(felder) > 2 else ""
        return f"AS{asn} {organisation}".strip()
    except Exception:
        return "unbekannt"


async def _http_info_holen(domain: str) -> dict:
    """Prüft HTTP/HTTPS-Erreichbarkeit und liest Header."""
    ergebnis = {"erreichbar": False, "status": None, "server": None,
                "sicherheit": [], "weiterleitungsziel": None}
    try:
        async with httpx.AsyncClient(timeout=8, follow_redirects=True,
                                     verify=False) as client:
            antwort = await client.get(f"https://{domain}")
            ergebnis["erreichbar"] = True
            ergebnis["status"] = antwort.status_code
            ergebnis["server"] = antwort.headers.get("server", "unbekannt")
            # Sicherheits-Header prüfen
            sicherheits_header = [
                "strict-transport-security", "content-security-policy",
                "x-frame-options", "x-content-type-options",
            ]
            ergebnis["sicherheit"] = [
                h for h in sicherheits_header if h in antwort.headers
            ]
            if str(antwort.url) != f"https://{domain}":
                ergebnis["weiterleitungsziel"] = str(antwort.url)
    except Exception:
        pass
    return ergebnis


async def domain_analysieren(domain_eingabe: str) -> dict:
    """
    Hauptfunktion: Führt vollständige Domain-Analyse durch.
    Gibt strukturiertes Ergebnis-Dict zurück.
    """
    domain = _domain_bereinigen(domain_eingabe)

    # DNS-Records parallel holen
    loop = asyncio.get_event_loop()
    a_records, mx_records, ns_records, txt_records, aaaa_records = await asyncio.gather(
        loop.run_in_executor(None, _dns_records_holen, domain, "A"),
        loop.run_in_executor(None, _dns_records_holen, domain, "MX"),
        loop.run_in_executor(None, _dns_records_holen, domain, "NS"),
        loop.run_in_executor(None, _dns_records_holen, domain, "TXT"),
        loop.run_in_executor(None, _dns_records_holen, domain, "AAAA"),
    )

    # WHOIS (synchron, in Executor)
    whois_daten = {}
    try:
        def _whois_holen():
            w = whois.whois(domain)
            return w
        w = await loop.run_in_executor(None, _whois_holen)
        # Daten normalisieren (whois gibt manchmal Listen zurück)
        def _normalisiere(wert):
            if isinstance(wert, list):
                return [str(v) for v in wert[:3]]  # Max 3 Einträge
            return str(wert) if wert else None

        registriert_am = w.creation_date
        ablauf_am = w.expiration_date
        if isinstance(registriert_am, list):
            registriert_am = registriert_am[0]
        if isinstance(ablauf_am, list):
            ablauf_am = ablauf_am[0]

        whois_daten = {
            "registrar":     _normalisiere(w.registrar),
            "registrant":    _normalisiere(w.org or w.registrant_country),
            "registriert_am": str(registriert_am)[:10] if registriert_am else None,
            "ablauf_am":     str(ablauf_am)[:10] if ablauf_am else None,
            "nameserver":    [str(ns).lower() for ns in (w.name_servers or [])[:4]],
            "land":          _normalisiere(w.country),
            "status":        _normalisiere(w.status),
        }
    except Exception as e:
        whois_daten = {"fehler": "WHOIS nicht verfügbar"}

    # ASN für erste IP
    asn_info = "unbekannt"
    if a_records:
        asn_info = await loop.run_in_executor(None, _ip_zu_asn, a_records[0])

    # HTTP-Check
    http_info = await _http_info_holen(domain)

    # SPF aus TXT-Records extrahieren
    spf = next((t for t in txt_records if t.startswith('"v=spf')), None)
    dmarc_records = await loop.run_in_executor(None, _dns_records_holen, f"_dmarc.{domain}", "TXT")
    dmarc = dmarc_records[0] if dmarc_records else None

    return {
        "domain": domain,
        "analysiert_am": datetime.utcnow().isoformat() + "Z",
        "dns": {
            "a":    a_records,
            "aaaa": aaaa_records,
            "mx":   mx_records,
            "ns":   ns_records,
            "txt":  [t for t in txt_records if not t.startswith('"v=spf')][:5],
            "spf":  spf,
            "dmarc": dmarc,
        },
        "asn":      asn_info,
        "whois":    whois_daten,
        "http":     http_info,
        "sicherheits_bewertung": _sicherheit_bewerten(http_info, spf, dmarc),
    }


def _sicherheit_bewerten(http: dict, spf: str | None, dmarc: str | None) -> dict:
    """Bewertet die Sicherheitskonfiguration der Domain."""
    punkte = 0
    max_punkte = 6
    details = []

    if http.get("erreichbar"):
        punkte += 1
        details.append({"check": "HTTPS erreichbar", "ok": True})
    else:
        details.append({"check": "HTTPS erreichbar", "ok": False})

    hsts = "strict-transport-security" in http.get("sicherheit", [])
    if hsts:
        punkte += 1
    details.append({"check": "HSTS Header", "ok": hsts})

    csp = "content-security-policy" in http.get("sicherheit", [])
    if csp:
        punkte += 1
    details.append({"check": "Content-Security-Policy", "ok": csp})

    if "x-frame-options" in http.get("sicherheit", []):
        punkte += 1
        details.append({"check": "X-Frame-Options", "ok": True})
    else:
        details.append({"check": "X-Frame-Options", "ok": False})

    if spf:
        punkte += 1
    details.append({"check": "SPF Record", "ok": bool(spf)})

    if dmarc:
        punkte += 1
    details.append({"check": "DMARC Record", "ok": bool(dmarc)})

    prozent = round((punkte / max_punkte) * 100)
    if prozent >= 80:
        note = "Gut"
    elif prozent >= 50:
        note = "Mittel"
    else:
        note = "Schwach"

    return {"punkte": punkte, "max": max_punkte, "prozent": prozent, "note": note, "details": details}
