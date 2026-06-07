# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: E-Mail-Analyse
# Prüft E-Mail-Adressen auf Gültigkeit, Domain-Reputation und
# bekannte Datenlecks (HaveIBeenPwned öffentliche API).
# Nur öffentlich verfügbare Daten — kein Datenschutzproblem.
# ═══════════════════════════════════════════════════════════════════

import re
import httpx
import asyncio
import dns.resolver
from datetime import datetime


_EMAIL_MUSTER = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')

# Bekannte Wegwerf-E-Mail-Anbieter
WEGWERF_ANBIETER = {
    "mailinator.com", "guerrillamail.com", "tempmail.com", "10minutemail.com",
    "throwam.com", "yopmail.com", "sharklasers.com", "guerrillamailblock.com",
    "grr.la", "guerrillamail.info", "guerrillamail.biz", "guerrillamail.de",
    "guerrillamail.net", "guerrillamail.org", "spam4.me", "trashmail.com",
    "trashmail.me", "trashmail.net", "dispostable.com", "mailnull.com",
    "spamgourmet.com", "spamgourmet.net", "spamgourmet.org",
}


def _email_validieren(adresse: str) -> dict:
    """Syntaktische Validierung der E-Mail-Adresse."""
    adresse = adresse.strip().lower()
    if not _EMAIL_MUSTER.match(adresse):
        return {"gueltig": False, "grund": "Ungültiges Format"}
    teile = adresse.split("@")
    if len(teile) != 2:
        return {"gueltig": False, "grund": "Kein @ gefunden"}
    return {"gueltig": True, "lokal": teile[0], "domain": teile[1]}


def _dns_records_holen(domain: str, typ: str) -> list[str]:
    """DNS-Records abrufen."""
    try:
        antworten = dns.resolver.resolve(domain, typ, lifetime=5)
        return [str(r) for r in antworten]
    except Exception:
        return []


async def _hibp_pruefen(adresse: str) -> dict:
    """
    Prüft via HaveIBeenPwned, ob die *Domain* der Adresse in bekannten
    Breaches vorkommt. Nutzt den keyless-Endpoint /api/v3/breaches?domain=
    (öffentliche Breach-Liste, kein API-Key nötig).

    Hinweis: Ein E-Mail-*spezifischer* Breach-Check (account/{email}) braucht
    bei HIBP einen bezahlten Key — dafür nutzt das Tool die keylosen Quellen
    XposedOrNot/LeakCheck (siehe email_recon).
    """
    try:
        domain = adresse.split("@")[1]
        async with httpx.AsyncClient(timeout=8, verify=True) as client:
            antwort = await client.get(
                "https://haveibeenpwned.com/api/v3/breaches",
                params={"domain": domain},
                headers={"User-Agent": "neo-portfolio-osint/1.0"},
            )
            if antwort.status_code == 200:
                daten = antwort.json()
                if isinstance(daten, list) and daten:
                    return {
                        "geprueft": True,
                        "domain_betroffen": True,
                        "anzahl_breaches": len(daten),
                        "breaches": [b.get("Name") for b in daten[:10]],
                        "hinweis": "Domain in öffentlichen Datenlecks gefunden",
                    }
                return {"geprueft": True, "domain_betroffen": False}
            elif antwort.status_code == 404:
                return {"geprueft": True, "domain_betroffen": False}
            return {"geprueft": False, "hinweis": f"HIBP HTTP {antwort.status_code}"}
    except Exception:
        return {"geprueft": False, "hinweis": "HIBP nicht erreichbar"}


async def email_analysieren(adresse: str) -> dict:
    """
    Hauptfunktion: Führt vollständige E-Mail-Analyse durch.
    Gibt strukturiertes Ergebnis-Dict zurück.
    """
    adresse = adresse.strip().lower()

    # Syntaxprüfung
    validierung = _email_validieren(adresse)
    if not validierung["gueltig"]:
        return {
            "adresse": adresse,
            "gueltig": False,
            "fehler": validierung["grund"],
            "analysiert_am": datetime.utcnow().isoformat() + "Z",
        }

    domain = validierung["domain"]
    lokal = validierung["lokal"]

    # DNS-Checks parallel
    loop = asyncio.get_event_loop()
    mx_records, a_records, spf_records = await asyncio.gather(
        loop.run_in_executor(None, _dns_records_holen, domain, "MX"),
        loop.run_in_executor(None, _dns_records_holen, domain, "A"),
        loop.run_in_executor(None, _dns_records_holen, domain, "TXT"),
    )

    spf = next((t for t in spf_records if "v=spf" in t), None)
    dmarc_records = await loop.run_in_executor(None, _dns_records_holen, f"_dmarc.{domain}", "TXT")
    dmarc = dmarc_records[0] if dmarc_records else None

    hat_mx = bool(mx_records)
    ist_wegwerf = domain in WEGWERF_ANBIETER

    # HIBP-Check (async)
    hibp = await _hibp_pruefen(adresse)

    # Risiko-Bewertung
    risiko_punkte = 0
    risiko_details = []

    if not hat_mx:
        risiko_punkte += 3
        risiko_details.append("Keine MX-Records — Domain empfängt keine E-Mails")
    if ist_wegwerf:
        risiko_punkte += 4
        risiko_details.append("Bekannter Wegwerf-E-Mail-Anbieter")
    if not spf:
        risiko_punkte += 1
        risiko_details.append("Kein SPF-Record — Spoofing-Risiko erhöht")
    if not dmarc:
        risiko_punkte += 1
        risiko_details.append("Kein DMARC-Record — E-Mail-Authentifizierung fehlt")
    if hibp.get("domain_betroffen"):
        risiko_punkte += 2
        risiko_details.append("Domain in öffentlichen Datenlecks gefunden")

    if risiko_punkte >= 6:
        risiko_stufe = "Hoch"
    elif risiko_punkte >= 3:
        risiko_stufe = "Mittel"
    elif risiko_punkte >= 1:
        risiko_stufe = "Gering"
    else:
        risiko_stufe = "Keines"

    return {
        "adresse": adresse,
        "gueltig": True,
        "analysiert_am": datetime.utcnow().isoformat() + "Z",
        "syntax": {
            "lokal_teil": lokal,
            "domain": domain,
        },
        "domain": {
            "mx_records": mx_records[:3],
            "hat_mx": hat_mx,
            "a_records": a_records[:2],
            "spf": spf,
            "dmarc": dmarc,
        },
        "klassifikation": {
            "wegwerf": ist_wegwerf,
            "zustellbar": hat_mx and not ist_wegwerf,
        },
        "datenleck": hibp,
        "risiko": {
            "stufe": risiko_stufe,
            "punkte": risiko_punkte,
            "details": risiko_details,
        },
    }
