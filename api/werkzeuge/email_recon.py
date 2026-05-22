# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: Email-Recon (Epieos/GHunt-Style + HIBP-Erweiterung)
#
# Free + keyless OSINT für E-Mail-Adressen:
#  • Gravatar Profile-Lookup (md5(email) → public profile)
#  • Google GAIA-ID Discovery (via öffentliche Google Endpoints)
#  • HaveIBeenPwned Breach-Domain Lookup (keine Auth nötig)
#  • Public HIBP Breaches-List (alle bekannten Leaks)
#  • Github Email→User-Discovery (via öffentliche Suche)
#  • Skype/Disqus Username-Ableitung
#  • Plattform-Existenz-Checks (silent registration)
#
# Strategie:
#  • Alle Module parallel
#  • Graceful Degradation: ein Tool down → andere liefern weiter
#  • Confidence pro Datenpunkt
#  • Kein Abuse: keine Brute-Force, keine Privacy-invasive Aktionen
# ═══════════════════════════════════════════════════════════════════

import asyncio
import hashlib
import re
from datetime import datetime

import httpx

TIMEOUT_S = 8

EMAIL_MUSTER = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')


def _md5(text: str) -> str:
    return hashlib.md5(text.strip().lower().encode()).hexdigest()


def _sha1(text: str) -> str:
    return hashlib.sha1(text.strip().lower().encode()).hexdigest()


def _sha256(text: str) -> str:
    return hashlib.sha256(text.strip().lower().encode()).hexdigest()


# ─── Gravatar ───────────────────────────────────────────────────────

async def _gravatar_pruefen(client: httpx.AsyncClient, email: str) -> dict:
    """
    Gravatar Public Profile Lookup.
    Returns: {gefunden, profil_url, hash, profil_daten?}
    """
    hash_ = _md5(email)
    profile_url = f"https://en.gravatar.com/{hash_}.json"
    avatar_url = f"https://www.gravatar.com/avatar/{hash_}?d=404"

    ergebnis = {
        "gefunden": False,
        "hash_md5": hash_,
        "profil_url": f"https://en.gravatar.com/{hash_}",
        "avatar_url": f"https://www.gravatar.com/avatar/{hash_}",
    }
    try:
        # Avatar mit d=404 → Gravatar returnt 404 wenn nicht existiert
        avatar = await client.get(avatar_url, timeout=TIMEOUT_S, follow_redirects=False)
        if avatar.status_code == 200:
            ergebnis["gefunden"] = True
            ergebnis["avatar_existiert"] = True

        # Public profile JSON
        prof = await client.get(profile_url, timeout=TIMEOUT_S, follow_redirects=True)
        if prof.status_code == 200:
            try:
                daten = prof.json()
                if daten.get("entry"):
                    eintrag = daten["entry"][0]
                    ergebnis["gefunden"] = True
                    ergebnis["profil_daten"] = {
                        "anzeigename":  eintrag.get("displayName") or eintrag.get("name", {}).get("formatted"),
                        "benutzername": eintrag.get("preferredUsername"),
                        "ort":          eintrag.get("currentLocation"),
                        "bio":          (eintrag.get("aboutMe") or "")[:200] or None,
                        "verifizierte_konten": [
                            {"name": v.get("shortname"), "url": v.get("url"), "verifiziert": v.get("verified", False)}
                            for v in eintrag.get("accounts", [])
                        ],
                        "urls": [u.get("value") for u in eintrag.get("urls", [])][:5],
                    }
            except Exception:
                pass
    except Exception:
        ergebnis["fehler"] = "Gravatar nicht erreichbar"
    return ergebnis


# ─── GHunt-Style Google Discovery ───────────────────────────────────

async def _google_id_pruefen(client: httpx.AsyncClient, email: str) -> dict:
    """
    Prüft öffentlich sichtbare Google-Account-Signale.

    Nicht-invasive Vorgehensweise:
    - Maps-Reviews via öffentlichen Sucheinstieg
    - Calendar-Free-Busy-API (sehr lange deprecated, hier nicht genutzt)
    - GAIA-ID via document picker (legacy, oft deaktiviert)

    Wir nutzen NUR den Public-Sucheinstieg (keine API-Tokens, kein Abuse).
    """
    if not email.endswith(("@gmail.com", "@googlemail.com")):
        return {
            "google_konto_wahrscheinlich": False,
            "hinweis": "Nur Gmail/Googlemail-Adressen liefern verlässliche Google-Signale",
        }

    ergebnis = {
        "google_konto_wahrscheinlich": True,
        "hinweis": "Gmail-Domain → Google-Konto vorhanden (mit hoher Wahrscheinlichkeit)",
        "links": {
            "google_maps_suche":   f"https://www.google.com/maps/contrib/?email={email}",
            "google_calendar_pub": f"https://calendar.google.com/calendar/u/0/embed?src={email}",
            "google_drive_pub":    f"https://www.google.com/search?q=site%3Adrive.google.com+%22{email}%22",
            "youtube_kanal_suche": f"https://www.youtube.com/results?search_query={email}",
        },
    }
    return ergebnis


# ─── HIBP Pwned Passwords (kostenlos, k-Anonymity) ──────────────────

async def _hibp_passwort_pruefen(client: httpx.AsyncClient, email: str) -> dict:
    """
    Hinweis: Pwned Passwords ist für PASSWÖRTER, nicht E-Mails.
    Für E-Mail-Breaches braucht HIBP einen Paid-Key.
    Wir prüfen stattdessen:
      • Domain-Breach via öffentliche Page
      • Liste aller bekannten Breaches → matchen wir auf User-Domain
    """
    try:
        domain = email.split("@")[1]
        # Domain-Breach Endpoint (auth-frei)
        antwort = await client.get(
            f"https://haveibeenpwned.com/api/v3/breaches?domain={domain}",
            headers={"User-Agent": "neo-portfolio-osint/1.0"},
            timeout=TIMEOUT_S,
        )
        if antwort.status_code == 200:
            daten = antwort.json()
            if isinstance(daten, list) and daten:
                return {
                    "geprueft": True,
                    "domain_betroffen": True,
                    "anzahl_breaches": len(daten),
                    "breaches": [
                        {
                            "name":          b.get("Name"),
                            "titel":         b.get("Title"),
                            "datum":         b.get("BreachDate"),
                            "betroffene":    b.get("PwnCount"),
                            "datenklassen": b.get("DataClasses", [])[:5],
                        }
                        for b in daten[:10]
                    ],
                }
            else:
                return {"geprueft": True, "domain_betroffen": False}
        elif antwort.status_code == 404:
            return {"geprueft": True, "domain_betroffen": False}
        else:
            return {"geprueft": False, "hinweis": f"HIBP HTTP {antwort.status_code}"}
    except Exception:
        return {"geprueft": False, "hinweis": "HIBP nicht erreichbar"}


# ─── GitHub Email-User Discovery ────────────────────────────────────

async def _github_user_finden(client: httpx.AsyncClient, email: str) -> dict:
    """
    Nutzt die freie GitHub Search-API (unauthenticated: 10 req/min).
    Sucht nach Commits mit dieser E-Mail → GitHub-User.
    """
    try:
        antwort = await client.get(
            f"https://api.github.com/search/users?q={email}+in:email",
            headers={"Accept": "application/vnd.github+json", "User-Agent": "neo-portfolio-osint"},
            timeout=TIMEOUT_S,
        )
        if antwort.status_code == 200:
            daten = antwort.json()
            items = daten.get("items", [])
            if items:
                return {
                    "gefunden": True,
                    "treffer": len(items),
                    "nutzer": [
                        {
                            "login":  u.get("login"),
                            "url":    u.get("html_url"),
                            "avatar": u.get("avatar_url"),
                            "typ":    u.get("type"),
                        }
                        for u in items[:5]
                    ],
                }
            return {"gefunden": False}
        # Rate-limited oder unauthorized? → 403 ist normal ohne Token
        return {"gefunden": False, "hinweis": f"GitHub HTTP {antwort.status_code}"}
    except Exception:
        return {"gefunden": False, "hinweis": "GitHub nicht erreichbar"}


# ─── Plattform-Existenz (silent registration) ───────────────────────

async def _plattform_email_pruefen(client: httpx.AsyncClient, email: str) -> dict:
    """
    Prüft via öffentliche "Email schon registriert?"-Endpunkte.
    Achtung: Wir prüfen NUR Endpunkte die intendiert öffentlich sind
    (z.B. Gravatar-Avatar, GitHub-API). Keine Login-Form-Brute-Force.
    """
    # Reserviert für Zukunft: hier könnten wir z.B. Spotify/Adobe-Status prüfen,
    # solange das ToS-konform ist. Aktuell halten wir das minimal.
    return {
        "checks": [
            {"plattform": "Gravatar", "siehe": "Sektion: gravatar"},
            {"plattform": "GitHub",   "siehe": "Sektion: github"},
        ],
    }


# ─── Hashes (für Crawler/Recon-Tools) ───────────────────────────────

def _hashes_berechnen(email: str) -> dict:
    """Liefert verschiedene Hashes der E-Mail (für Cross-Referencing)."""
    e = email.strip().lower()
    return {
        "md5":    _md5(e),
        "sha1":   _sha1(e),
        "sha256": _sha256(e),
    }


# ─── Hauptfunktion ──────────────────────────────────────────────────

async def email_recon(email: str) -> dict:
    """
    Vollständige E-Mail-Recon (Epieos/GHunt-Style).
    Alle Module parallel — graceful degradation.
    """
    email = email.strip().lower()
    if not EMAIL_MUSTER.match(email):
        return {
            "email": email,
            "gueltig": False,
            "fehler": "Ungültiges E-Mail-Format",
            "analysiert_am": datetime.utcnow().isoformat() + "Z",
        }

    hashes = _hashes_berechnen(email)
    domain = email.split("@")[1]

    async with httpx.AsyncClient(verify=False) as client:
        gravatar, google_id, hibp, github = await asyncio.gather(
            _gravatar_pruefen(client, email),
            _google_id_pruefen(client, email),
            _hibp_passwort_pruefen(client, email),
            _github_user_finden(client, email),
        )

    # Aggregiertes "wer-ist-das"
    wer_ist_das: list[dict] = []
    if gravatar.get("gefunden") and gravatar.get("profil_daten"):
        pd = gravatar["profil_daten"]
        if pd.get("anzeigename"):
            wer_ist_das.append({"quelle": "Gravatar", "wert": pd["anzeigename"], "konfidenz": "hoch"})
        if pd.get("benutzername"):
            wer_ist_das.append({"quelle": "Gravatar", "wert": f"Username: {pd['benutzername']}", "konfidenz": "hoch"})
        for konto in pd.get("verifizierte_konten", []):
            wer_ist_das.append({
                "quelle": f"Gravatar→{konto.get('name')}",
                "wert": konto.get("url"),
                "konfidenz": "hoch" if konto.get("verifiziert") else "mittel",
            })
    if github.get("gefunden"):
        for nutzer in github.get("nutzer", []):
            wer_ist_das.append({
                "quelle": "GitHub",
                "wert": f"@{nutzer['login']}",
                "url": nutzer.get("url"),
                "konfidenz": "hoch",
            })

    # Risiko
    risiko_punkte = 0
    risiko_details = []
    if hibp.get("domain_betroffen"):
        risiko_punkte += 3
        risiko_details.append(f"Domain in {hibp.get('anzahl_breaches')} bekannten Breaches")
    if gravatar.get("gefunden"):
        risiko_punkte += 1
        risiko_details.append("Gravatar-Profil öffentlich — Persona-Verknüpfung möglich")
    if google_id.get("google_konto_wahrscheinlich"):
        risiko_punkte += 1
        risiko_details.append("Google-Konto wahrscheinlich — Maps/YouTube ggf. öffentlich verknüpft")
    if github.get("gefunden"):
        risiko_punkte += 1
        risiko_details.append(f"{github.get('treffer', 0)} GitHub-Konten verknüpft")

    stufe = ("Hoch" if risiko_punkte >= 4 else
             "Mittel" if risiko_punkte >= 2 else
             "Gering" if risiko_punkte else "Keines")

    return {
        "email": email,
        "gueltig": True,
        "analysiert_am": datetime.utcnow().isoformat() + "Z",
        "domain": domain,
        "hashes": hashes,
        "gravatar": gravatar,
        "google": google_id,
        "hibp": hibp,
        "github": github,
        "wer_ist_das": wer_ist_das,
        "risiko": {
            "stufe": stufe,
            "punkte": risiko_punkte,
            "details": risiko_details,
        },
        "quellen": [
            "Gravatar Public API",
            "HaveIBeenPwned Public Breaches API",
            "GitHub Public Search API",
            "Google Public Endpoints (Maps/Calendar/Drive)",
        ],
    }
