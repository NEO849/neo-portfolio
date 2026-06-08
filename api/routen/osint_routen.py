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
from werkzeuge.email_recon import email_recon
from werkzeuge.benutzername_suche import benutzername_suchen
from werkzeuge.telefon_analyse import telefon_analysieren
from werkzeuge.bild_analyse import bild_analysieren
from werkzeuge.shodan_recon import shodan_internetdb_abfragen
from werkzeuge.intel_aggregator import links_generieren
from werkzeuge.orchestrator import orchestrieren
from werkzeuge.subdomain_recon import subdomains_finden
from werkzeuge.ip_recon import ip_intel
from werkzeuge.passwort_recon import passwort_pruefen
from werkzeuge.transparenz import transparenz_fuer

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


class BenutzerVollscanAnfrage(BaseModel):
    benutzername: str
    vollscan: bool = False  # False = Tier-1 (~12 Plattformen), True = WMN-Vollscan (600+)

    @field_validator("benutzername")
    @classmethod
    def benutzername_pruefen(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2 or len(v) > 50:
            raise ValueError("Benutzername muss 2-50 Zeichen lang sein")
        if not re.match(r'^[a-zA-Z0-9_\-\.]+$', v):
            raise ValueError("Benutzername darf nur Buchstaben, Zahlen, _, - und . enthalten")
        return v


@router.post("/benutzername", summary="Benutzername suchen (Sherlock + WhatsMyName Fusion)")
@limiter.limit("3/minute")
async def benutzername_analyse(anfrage: BenutzerVollscanAnfrage, request: Request):
    """
    Sucht einen Benutzernamen auf bis zu 600+ Plattformen.

    **Modi:**
    - `vollscan=false` (Standard): ~12 kuratierte Hochpriorität-Plattformen, ~5-10 Sekunden
    - `vollscan=true`: WhatsMyName-DB-Vollscan (600+ Sites), ~30-60 Sekunden

    **Detection:**
    - String-Pattern-Match (false-positive-resistent) für WMN-Plattformen
    - Konfidenz-Score pro Treffer (hoch/mittel/niedrig)

    **Rate-Limit:** 3 Anfragen pro Minute pro IP.
    """
    try:
        ergebnis = await benutzername_suchen(anfrage.benutzername, nur_tier1=not anfrage.vollscan)
        return JSONResponse(content=ergebnis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Suche fehlgeschlagen: {str(e)}")


class TelefonAnfrage(BaseModel):
    nummer: str

    @field_validator("nummer")
    @classmethod
    def nummer_pruefen(cls, v: str) -> str:
        v = v.strip()
        # Erlaubt: +, Zahlen, Leerzeichen, -, (, )
        bereinigt = re.sub(r'[\s\-\(\)]', '', v)
        if not re.match(r'^\+?[0-9]{6,15}$', bereinigt):
            raise ValueError("Ungültiges Telefonnummer-Format. Beispiel: +491701234567")
        return v


class BildAnfrage(BaseModel):
    url: str

    @field_validator("url")
    @classmethod
    def url_pruefen(cls, v: str) -> str:
        v = v.strip()
        if not re.match(r'^https?://', v):
            raise ValueError("Bitte eine vollständige URL angeben (https://...)")
        if len(v) > 2048:
            raise ValueError("URL zu lang")
        # Nur Bild-Endungen erlauben
        erlaubte_endungen = ('.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif')
        url_ohne_params = v.split('?')[0].lower()
        if not any(url_ohne_params.endswith(e) for e in erlaubte_endungen):
            # Kein harter Fehler — manche URLs haben keine Endung (CDNs etc.)
            pass
        return v


@router.post("/telefon", summary="Telefonnummer analysieren")
@limiter.limit("5/minute")
async def telefon_analyse(anfrage: TelefonAnfrage, request: Request):
    """
    Analysiert eine Telefonnummer: Format, Land, Carrier, Typ, Suchlinks.

    **Rate-Limit:** 5 Anfragen pro Minute pro IP.
    **Datenschutzhinweis:** Nur passive Analyse — keine aktiven Abfragen bei Drittdiensten.
    """
    try:
        ergebnis = await telefon_analysieren(anfrage.nummer)
        return JSONResponse(content=ergebnis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analyse fehlgeschlagen: {str(e)}")


@router.post("/bild", summary="Bild analysieren (EXIF + Reverse Search)")
@limiter.limit("3/minute")
async def bild_analyse(anfrage: BildAnfrage, request: Request):
    """
    Analysiert ein Bild von einer URL: EXIF-Metadaten, Hashes, Reverse-Image-Links.

    **Rate-Limit:** 3 Anfragen pro Minute pro IP.
    **Datenschutzhinweis:** Das Bild wird temporär heruntergeladen, nicht gespeichert.
    """
    try:
        ergebnis = await bild_analysieren(anfrage.url)
        return JSONResponse(content=ergebnis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analyse fehlgeschlagen: {str(e)}")


# ─── Senior-Elite Erweiterungen ──────────────────────────────────────

class ShodanAnfrage(BaseModel):
    ziel: str  # IP oder Domain

    @field_validator("ziel")
    @classmethod
    def ziel_pruefen(cls, v: str) -> str:
        v = v.strip().lower()
        for prefix in ("https://", "http://", "www."):
            if v.startswith(prefix):
                v = v[len(prefix):]
        v = v.split("/")[0].split("?")[0]
        if not v or len(v) < 3 or len(v) > 253:
            raise ValueError("Ziel muss 3-253 Zeichen lang sein")
        if not re.match(r'^[a-zA-Z0-9\.\-:]+$', v):
            raise ValueError("Ziel enthält ungültige Zeichen")
        return v


@router.post("/shodan", summary="Shodan InternetDB Recon (free, keyless)")
@limiter.limit("10/minute")
async def shodan_route(anfrage: ShodanAnfrage, request: Request):
    """
    Fragt Shodan InternetDB ab — die kostenlose Public-API von Shodan.

    **Rückgabe:**
    - Offene Ports (mit Bezeichnung gefährlicher Services)
    - Bekannte CVEs (Vulnerability-Liste)
    - Hostnames (rDNS)
    - Tags (cdn, iot, compromised, ...)
    - CPEs (Common Platform Enumeration)
    - Risk-Score (0-10)

    **Akzeptiert:** IP-Adresse ODER Domain (wird via DNS aufgelöst).
    **Rate-Limit:** 10 Anfragen pro Minute pro IP.
    """
    try:
        ergebnis = await shodan_internetdb_abfragen(anfrage.ziel)
        return JSONResponse(content=ergebnis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Shodan-Abfrage fehlgeschlagen: {str(e)}")


class EmailReconAnfrage(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def email_pruefen(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$', v):
            raise ValueError("Ungültiges E-Mail-Format")
        if len(v) > 254:
            raise ValueError("E-Mail zu lang")
        return v


@router.post("/email-recon", summary="E-Mail Tiefen-Recon (Epieos/GHunt-Style)")
@limiter.limit("5/minute")
async def email_recon_route(anfrage: EmailReconAnfrage, request: Request):
    """
    Tiefen-Recon einer E-Mail-Adresse — alle Module parallel:

    - **Gravatar**: Public Profile, verifizierte Konten, Anzeigename, Avatar
    - **Google**: GAIA-Discovery (Maps/Calendar/Drive Sichtbarkeit)
    - **HIBP**: Domain-Breaches (alle bekannten Leaks für die Domain)
    - **GitHub**: User-Discovery via öffentliche Search-API
    - **Hashes**: MD5/SHA-1/SHA-256 für Cross-Referencing

    **Datenschutz:** Nur passive Public-Endpoint-Abfragen. Kein Stalking,
    keine ToS-Verletzung.

    **Rate-Limit:** 5 Anfragen pro Minute pro IP.
    """
    try:
        ergebnis = await email_recon(anfrage.email)
        return JSONResponse(content=ergebnis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email-Recon fehlgeschlagen: {str(e)}")


class AggregatorAnfrage(BaseModel):
    typ: str  # email|username|domain|phone|image|ip
    wert: str

    @field_validator("typ")
    @classmethod
    def typ_pruefen(cls, v: str) -> str:
        v = v.strip().lower()
        if v not in {"email", "username", "domain", "phone", "image", "ip"}:
            raise ValueError("Typ muss email, username, domain, phone, image oder ip sein")
        return v

    @field_validator("wert")
    @classmethod
    def wert_pruefen(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) > 500:
            raise ValueError("Wert muss 1-500 Zeichen lang sein")
        return v


@router.post("/aggregator", summary="IntelTechniques-Style Search-Link-Aggregator")
@limiter.limit("20/minute")
async def aggregator_route(anfrage: AggregatorAnfrage, request: Request):
    """
    Generiert 50-60 kuratierte Search-Links für ein Target.

    **Typen:** email, username, domain, phone, image, ip

    **Kategorien:** Breach DBs, Identity Aggregators, Search Engines,
    Public Records, Threat Intel, Archive, Code-Suche, ...

    **Wichtig:** Keine URL wird automatisch aufgerufen. Du entscheidest,
    welche Quelle du öffnest.

    **Rate-Limit:** 20 Anfragen pro Minute pro IP.
    """
    try:
        ergebnis = links_generieren(anfrage.typ, anfrage.wert)  # type: ignore
        return JSONResponse(content=ergebnis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Aggregator fehlgeschlagen: {str(e)}")


class OrchestratorAnfrage(BaseModel):
    eingabe: str
    tiefe: int = 2  # 1=Basis, 2=Pivot-Discovery, 3=Maximum

    @field_validator("eingabe")
    @classmethod
    def eingabe_pruefen(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) > 254:
            raise ValueError("Eingabe muss 1-254 Zeichen lang sein")
        return v

    @field_validator("tiefe")
    @classmethod
    def tiefe_pruefen(cls, v: int) -> int:
        if v < 1 or v > 3:
            raise ValueError("Tiefe muss 1, 2 oder 3 sein")
        return v


@router.post("/orchestrator", summary="SpiderFoot-Style Vollanalyse mit Graph")
@limiter.limit("3/minute")
async def orchestrator_route(anfrage: OrchestratorAnfrage, request: Request):
    """
    Automatische Vollanalyse mit Typ-Erkennung + Pivot-Discovery.

    **Akzeptiert:** E-Mail, Domain, Username, IP, Telefonnummer
    (Typ wird automatisch erkannt)

    **Tiefe:**
    - 1 = nur Basis-Modul für den erkannten Typ
    - 2 = Pivot-Discovery (Standard) — verknüpfte Datenpunkte werden mit-analysiert
    - 3 = Maximum (auch große Username-Vollscans inkl.)

    **Rückgabe:**
    - Module-Ergebnisse (typ-spezifisch)
    - Graph (Nodes + Edges) für Maltego-Style Visualisierung
    - Statistik (Knoten/Kanten/Pivots)

    **Rate-Limit:** 3 Anfragen pro Minute pro IP (rechenintensiv).
    """
    try:
        ergebnis = await orchestrieren(anfrage.eingabe, anfrage.tiefe)
        return JSONResponse(content=ergebnis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Orchestrator fehlgeschlagen: {str(e)}")


class SubdomainAnfrage(BaseModel):
    domain: str
    aufloesen: bool = False  # True = bis zu 75 Subdomains live A-Record-Resolve

    @field_validator("domain")
    @classmethod
    def domain_pruefen(cls, v: str) -> str:
        v = v.strip().lower()
        bereinigt = v.replace("https://", "").replace("http://", "").replace("www.", "")
        bereinigt = bereinigt.split("/")[0].split("?")[0]
        if not bereinigt or len(bereinigt) < 3 or len(bereinigt) > 253:
            raise ValueError("Domain muss 3-253 Zeichen lang sein")
        if not re.match(r'^[a-zA-Z0-9]([a-zA-Z0-9\-\.]*[a-zA-Z0-9])?$', bereinigt):
            raise ValueError("Ungültiges Domain-Format")
        if "." not in bereinigt:
            raise ValueError("Domain benötigt eine TLD")
        return v


@router.post("/subdomains", summary="Subdomain-Recon (crt.sh + Wayback + CommonCrawl)")
@limiter.limit("5/minute")
async def subdomain_route(anfrage: SubdomainAnfrage, request: Request):
    """
    Sammelt Subdomains aus drei keyless-Quellen und führt sie dedupliziert
    zusammen — mit Quellen-Herkunft pro Treffer.

    - **crt.sh**: Certificate-Transparency-Logs
    - **Wayback Machine**: historische URLs (CDX-API)
    - **CommonCrawl**: gecrawlte URLs (neuester Index)

    Mit `aufloesen=true` werden bis zu 75 Subdomains live aufgelöst und als
    aktiv/inaktiv markiert.

    **Rate-Limit:** 5 Anfragen pro Minute pro IP.
    """
    try:
        ergebnis = await subdomains_finden(anfrage.domain, aufloesen=anfrage.aufloesen)
        return JSONResponse(content=ergebnis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Subdomain-Recon fehlgeschlagen: {str(e)}")


@router.post("/ip-intel", summary="IP-Intel via RIPEstat (Routing/Owner/Abuse, keyless)")
@limiter.limit("10/minute")
async def ip_intel_route(anfrage: ShodanAnfrage, request: Request):
    """
    Autoritative Routing-/Ownership-/Abuse-Daten zu einer IP via RIPEstat.

    **Rückgabe:**
    - Routing: ASN(s), announced Prefix, Prefix-Inhaber
    - AS: Holder (Betreiber), Typ, Routing-Status
    - Abuse-Kontakte (für Missbrauchsmeldungen)

    **Akzeptiert:** IP-Adresse ODER Domain (wird via DNS aufgelöst).
    **Rate-Limit:** 10 Anfragen pro Minute pro IP.
    """
    try:
        ergebnis = await ip_intel(anfrage.ziel)
        return JSONResponse(content=ergebnis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"IP-Intel fehlgeschlagen: {str(e)}")


class PasswortAnfrage(BaseModel):
    passwort: str

    @field_validator("passwort")
    @classmethod
    def passwort_pruefen_feld(cls, v: str) -> str:
        if not v:
            raise ValueError("Kein Passwort angegeben")
        if len(v) > 256:
            raise ValueError("Passwort zu lang (max. 256 Zeichen)")
        return v


@router.post("/passwort", summary="Passwort-Exposure-Check (HIBP, k-Anonymität)")
@limiter.limit("10/minute")
async def passwort_route(anfrage: PasswortAnfrage, request: Request):
    """
    Prüft, ob ein Passwort in bekannten Daten-Leaks auftaucht — **ohne das
    Passwort preiszugeben** (k-Anonymität: nur die ersten 5 Zeichen des
    SHA-1-Hashes werden gesendet, der Abgleich erfolgt lokal).

    **Datenschutz:** Das Passwort wird nie gespeichert, geloggt oder gecacht.
    **Rate-Limit:** 10 Anfragen pro Minute pro IP.
    """
    try:
        ergebnis = await passwort_pruefen(anfrage.passwort)
        return JSONResponse(content=ergebnis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Passwort-Check fehlgeschlagen: {str(e)}")


@router.get("/transparenz", summary="Datenfluss-Transparenz (DSGVO Art. 13/14)")
async def transparenz_route(werkzeug: str | None = None):
    """
    Liefert die maschinenlesbare Datenfluss-Deklaration: welche Drittdienste
    pro Werkzeug **serverseitig** kontaktiert werden (= wohin Nutzerdaten
    fließen) bzw. wo nur **Such-Links** erzeugt werden (kein automatischer
    Datenfluss). Grundlage für den Einwilligungs-/Transparenz-Layer der UI.

    - **ohne Parameter**: Gesamtübersicht aller Werkzeuge
    - **?werkzeug=email-recon**: nur dieser Eintrag

    Read-only, kein Rate-Limit (statische Deklaration, keine Drittdienst-Last).
    """
    return JSONResponse(content=transparenz_fuer(werkzeug))


@router.get("/gesundheit", summary="API-Status prüfen")
async def gesundheitscheck():
    """Einfacher Liveness-Check für Monitoring."""
    return {
        "status": "ok",
        "werkzeuge": [
            "domain", "email", "email-recon", "benutzername", "telefon",
            "bild", "passwort", "shodan", "subdomains", "ip-intel",
            "aggregator", "orchestrator",
        ],
        "fundament": ["cache", "transparenz", "pivots", "geocoding", "hlr_lookup"],
        "version": "2.4-welle4",
    }
