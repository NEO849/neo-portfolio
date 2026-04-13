# ═══════════════════════════════════════════════════════════════════
# ROUTEN: OSINT-Werkzeuge
# FastAPI Router mit Rate-Limiting und Eingabevalidierung.
# Alle Endpunkte sind öffentlich — nur legale, passive Analyse.
# ═══════════════════════════════════════════════════════════════════

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator
from slowapi import Limiter
from slowapi.util import get_remote_address
import re

from werkzeuge.domain_analyse import domain_analysieren
from werkzeuge.email_analyse import email_analysieren
from werkzeuge.benutzername_suche import benutzername_suchen

router = APIRouter(prefix="/osint", tags=["OSINT-Werkzeuge"])
limiter = Limiter(key_func=get_remote_address)


# ─── Request-Modelle ────────────────────────────────────────────────

class DomainAnfrage(BaseModel):
    domain: str

    @field_validator("domain")
    @classmethod
    def domain_pruefen(cls, v: str) -> str:
        v = v.strip().lower()
        # Protokoll entfernen für Validierung
        bereinigt = v.replace("https://", "").replace("http://", "").replace("www.", "")
        bereinigt = bereinigt.split("/")[0].split("?")[0]
        if not bereinigt or len(bereinigt) < 3:
            raise ValueError("Domain zu kurz")
        if len(bereinigt) > 253:
            raise ValueError("Domain zu lang")
        # Einfache Domain-Validierung
        if not re.match(r'^[a-zA-Z0-9]([a-zA-Z0-9\-\.]*[a-zA-Z0-9])?$', bereinigt):
            raise ValueError("Ungültiges Domain-Format")
        if "." not in bereinigt:
            raise ValueError("Domain benötigt eine TLD (z.B. .de, .com)")
        return v


class EmailAnfrage(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def email_pruefen(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$', v):
            raise ValueError("Ungültiges E-Mail-Format")
        if len(v) > 254:
            raise ValueError("E-Mail-Adresse zu lang")
        return v


class BenutzerAnfrage(BaseModel):
    benutzername: str

    @field_validator("benutzername")
    @classmethod
    def benutzername_pruefen(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Benutzername zu kurz (min. 2 Zeichen)")
        if len(v) > 50:
            raise ValueError("Benutzername zu lang (max. 50 Zeichen)")
        if not re.match(r'^[a-zA-Z0-9_\-\.]+$', v):
            raise ValueError("Benutzername darf nur Buchstaben, Zahlen, _, - und . enthalten")
        return v


# ─── Endpunkte ──────────────────────────────────────────────────────

@router.post("/domain", summary="Domain analysieren")
@limiter.limit("10/minute")
async def domain_analyse(anfrage: DomainAnfrage, request: Request):
    """
    Analysiert eine Domain: DNS-Records, WHOIS, ASN, HTTP-Headers, Sicherheitsbewertung.

    **Rate-Limit:** 10 Anfragen pro Minute pro IP.

    **Rückgabe:**
    - DNS-Records (A, AAAA, MX, NS, TXT, SPF, DMARC)
    - WHOIS-Daten (Registrar, Registrant, Datum)
    - ASN-Information (Provider, Netzwerk)
    - HTTP-Status und Sicherheits-Header
    - Sicherheitsbewertung (0–6 Punkte)
    """
    try:
        ergebnis = await domain_analysieren(anfrage.domain)
        return JSONResponse(content=ergebnis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analyse fehlgeschlagen: {str(e)}")


@router.post("/email", summary="E-Mail analysieren")
@limiter.limit("5/minute")
async def email_analyse(anfrage: EmailAnfrage, request: Request):
    """
    Analysiert eine E-Mail-Adresse: Syntax, MX-Records, SPF/DMARC, Datenleck-Check.

    **Rate-Limit:** 5 Anfragen pro Minute pro IP.

    **Rückgabe:**
    - Syntaxvalidierung
    - Domain-DNS-Checks (MX, SPF, DMARC)
    - Wegwerf-Adresse Erkennung
    - HaveIBeenPwned Domain-Check
    - Risikobewertung
    """
    try:
        ergebnis = await email_analysieren(anfrage.email)
        return JSONResponse(content=ergebnis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analyse fehlgeschlagen: {str(e)}")


@router.post("/benutzername", summary="Benutzername suchen")
@limiter.limit("3/minute")
async def benutzername_analyse(anfrage: BenutzerAnfrage, request: Request):
    """
    Sucht einen Benutzernamen auf bekannten Plattformen (passiv, nur öffentliche Profile).

    **Rate-Limit:** 3 Anfragen pro Minute pro IP.

    **Rückgabe:**
    - Gefundene Profile mit direkten URLs
    - Kategorisierung (Entwicklung, Security, Social, Gaming, ...)
    - Trefferrate und Zusammenfassung
    """
    try:
        ergebnis = await benutzername_suchen(anfrage.benutzername)
        return JSONResponse(content=ergebnis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Suche fehlgeschlagen: {str(e)}")


@router.get("/gesundheit", summary="API-Status prüfen")
async def gesundheitscheck():
    """Einfacher Liveness-Check für Monitoring."""
    return {"status": "ok", "werkzeuge": ["domain", "email", "benutzername"]}
