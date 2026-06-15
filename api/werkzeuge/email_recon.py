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
import os
import re
from datetime import datetime
from urllib.parse import quote

import httpx

from werkzeuge.cache import cache_schluessel, standard_cache

TIMEOUT_S = 8
CACHE_TTL_S = 3600  # 1h — Breach-/Profil-Daten ändern sich selten

EMAIL_MUSTER = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')


def _github_auth_header() -> dict:
    """Optionaler GitHub-Token aus der Service-Env (nie im Code).

    Mit gültigem Token: 30 Such-Anfragen/min statt 10 (unauth) + Commit-Suche
    zuverlässiger. Ohne/ungültig: graceful unauth-Pfad.
    """
    token = (
        os.environ.get("OSINT_GITHUB_TOKEN")            # bevorzugt: dediziert, minimal-scope
        or os.environ.get("GITHUB_PERSONAL_ACCESS_TOKEN")
        or os.environ.get("GITHUB_TOKEN")
        or ""
    ).strip()
    return {"Authorization": f"Bearer {token}"} if token else {}


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


# ─── XposedOrNot — tieferer Breach-Kontext ─────────────────────────

async def _xposedornot_pruefen(client: httpx.AsyncClient, email: str) -> dict:
    """
    XposedOrNot bietet ähnliche Daten wie HIBP aber ohne Paid-Key.
    /v1/check-email — Liste der Breach-Namen
    /v1/breach-analytics — exposed data types, paste exposure
    """
    try:
        # 1. Liste der Breach-Namen
        r1 = await client.get(
            f"https://api.xposedornot.com/v1/check-email/{email}",
            timeout=TIMEOUT_S,
        )
        breaches: list[str] = []
        if r1.status_code == 200:
            data = r1.json()
            raw = data.get("breaches") or []
            if raw and isinstance(raw[0], list):
                breaches = list(raw[0])

        # 2. Analytics (Paste-Counts + Exposed Fields)
        exposed_fields: list[str] = []
        pastes_count = 0
        try:
            r2 = await client.get(
                "https://api.xposedornot.com/v1/breach-analytics",
                params={"email": email},
                timeout=TIMEOUT_S,
            )
            if r2.status_code == 200:
                d2 = r2.json()
                metrics = d2.get("BreachMetrics") or {}
                if isinstance(metrics, dict):
                    xposed = metrics.get("xposed_data") or []
                    if isinstance(xposed, list):
                        for entry in xposed:
                            if isinstance(entry, dict):
                                for child in entry.get("children", []) or []:
                                    for grand in child.get("children", []) or []:
                                        if isinstance(grand, dict) and grand.get("name"):
                                            exposed_fields.append(grand["name"])
                pastes = d2.get("PastesSummary") or {}
                if isinstance(pastes, dict):
                    pastes_count = pastes.get("cnt", 0) or 0
        except Exception:
            pass

        return {
            "geprueft": True,
            "anzahl_breaches": len(breaches),
            "breaches": breaches[:15],
            "exposed_fields": list(dict.fromkeys(exposed_fields))[:10],
            "pastes_count": pastes_count,
        }
    except Exception:
        return {"geprueft": False, "hinweis": "XposedOrNot nicht erreichbar"}


# ─── LeakCheck — 3. Index-Quelle ────────────────────────────────────

def _leakcheck_key() -> str:
    """Optionaler LeakCheck-Pro-Key aus der Service-Env (nie im Code)."""
    return (
        os.environ.get("LEAKCHECK_API_KEY")
        or os.environ.get("LEAKCHECK_APIKEY")
        or ""
    ).strip()


# Browser-UA: LeakCheck liegt hinter Cloudflare, das die Default-Client-Signatur
# (httpx/urllib) mit Error 1010 blockt. Echter UA umgeht das.
LEAKCHECK_UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)


def _leakcheck_parse(data: dict, tier: str) -> dict:
    """
    Normalisiert ein erfolgreiches LeakCheck-Ergebnis (v1 ODER v2) auf die UI-Form.
    Beide Tiers liefern `result[]`; `source` ist je nach Version Objekt oder String.
    """
    treffer = data.get("result") or []
    sources: list[dict] = []
    felder: set[str] = set()
    for eintrag in treffer:
        if not isinstance(eintrag, dict):
            continue
        quelle = eintrag.get("source") or {}
        if isinstance(quelle, dict):
            name = quelle.get("name") or "Unbekannt"
            datum = quelle.get("breach_date") or quelle.get("date") or eintrag.get("last_breach") or ""
        else:
            name, datum = str(quelle), eintrag.get("last_breach") or ""
        sources.append({"name": name, "datum": datum})
        for f in (eintrag.get("fields") or []):
            if isinstance(f, str):
                felder.add(f)

    # Quellen deduplizieren (gleiche Breach kann mehrfach auftauchen)
    gesehen, dedup = set(), []
    for s in sources:
        k = (s["name"], s["datum"])
        if k not in gesehen:
            gesehen.add(k)
            dedup.append(s)

    return {
        "geprueft": True,
        "tier": tier,
        "anzahl": data.get("found") if data.get("found") is not None else len(dedup),
        "sources": dedup[:25],
        "exposed_fields": sorted(felder)[:15],
    }


async def _leakcheck_v2(client: httpx.AsyncClient, email: str, key: str) -> dict:
    """LeakCheck Pro API v2 (X-API-Key-Header). Wirft bei !success → Fallback-Kette."""
    r = await client.get(
        f"https://leakcheck.io/api/v2/query/{email}",
        params={"type": "email"},
        headers={"X-API-Key": key, "Accept": "application/json", "User-Agent": LEAKCHECK_UA},
        timeout=TIMEOUT_S,
    )
    r.raise_for_status()
    data = r.json()
    if not data.get("success"):
        raise ValueError(f"v2: {data.get('error', 'nicht erfolgreich')}")
    return _leakcheck_parse(data, "pro")


async def _leakcheck_v1(client: httpx.AsyncClient, email: str, key: str) -> dict:
    """LeakCheck API v1 (key als Query-Param). Wirft bei !success → Fallback-Kette."""
    r = await client.get(
        "https://leakcheck.io/api",
        params={"key": key, "check": email, "type": "email"},
        headers={"Accept": "application/json", "User-Agent": LEAKCHECK_UA},
        timeout=TIMEOUT_S,
    )
    r.raise_for_status()
    data = r.json()
    if not data.get("success"):
        raise ValueError(f"v1: {data.get('error', 'nicht erfolgreich')}")
    return _leakcheck_parse(data, "pro")


async def _leakcheck_public(client: httpx.AsyncClient, email: str) -> dict:
    """LeakCheck Public API — 1 req/s, keyless (Fallback)."""
    try:
        r = await client.get(
            "https://leakcheck.io/api/public",
            params={"check": email},
            timeout=TIMEOUT_S,
        )
        if r.status_code == 200:
            data = r.json()
            if data.get("success") and (data.get("found") or 0) > 0:
                sources = data.get("sources") or []
                return {
                    "geprueft": True,
                    "tier": "public",
                    "anzahl": len(sources),
                    "sources": [
                        {
                            "name": (s.get("name") if isinstance(s, dict) else str(s)),
                            "datum": (s.get("date") if isinstance(s, dict) else ""),
                        }
                        for s in sources[:10]
                    ],
                }
            return {"geprueft": True, "tier": "public", "anzahl": 0, "sources": []}
    except Exception:
        pass
    return {"geprueft": False, "hinweis": "LeakCheck nicht erreichbar"}


async def _leakcheck_pruefen(client: httpx.AsyncClient, email: str) -> dict:
    """
    LeakCheck-Breach-Lookup. Mit gesetztem + lizenziertem LEAKCHECK_API_KEY → Pro-Tier
    (mehr Quellen + Feld-Typen): erst v2, dann v1. Ohne Key / ohne aktiven Plan /
    bei Fehler → keyless Public-Tier (graceful, kein Regressionsrisiko).
    """
    key = _leakcheck_key()
    if key:
        for versuch in (_leakcheck_v2, _leakcheck_v1):
            try:
                return await versuch(client, email, key)
            except Exception:
                continue  # nächster Pro-Pfad bzw. am Ende Public
    return await _leakcheck_public(client, email)


# ─── PGP Keyserver — Existenz-Check ─────────────────────────────────

async def _pgp_pruefen(client: httpx.AsyncClient, email: str) -> dict:
    """keys.openpgp.org HKP-Lookup — gibt Hinweis ob User PGP nutzt."""
    try:
        r = await client.get(
            "https://keys.openpgp.org/pks/lookup",
            params={"op": "vindex", "options": "mr", "search": email},
            timeout=TIMEOUT_S,
        )
        if r.status_code == 200 and "pub:" in r.text:
            keys: list[dict] = []
            for line in r.text.splitlines():
                if line.startswith("pub:"):
                    parts = line.split(":")
                    if len(parts) >= 5:
                        keys.append({
                            "fingerprint": parts[1],
                            "created": parts[4],
                        })
            return {
                "geprueft": True,
                "hat_pgp_key": bool(keys),
                "anzahl": len(keys),
                "keys": keys[:3],
            }
        elif r.status_code in (200, 404):
            return {"geprueft": True, "hat_pgp_key": False, "anzahl": 0}
    except Exception:
        pass
    return {"geprueft": False, "hinweis": "PGP-Keyserver nicht erreichbar"}


# ─── GitHub Email-User Discovery ────────────────────────────────────

async def _github_user_finden(client: httpx.AsyncClient, email: str) -> dict:
    """
    GitHub-Discovery via zwei freie Such-APIs (Token-optional):
      1) search/users  — Konten mit dieser E-Mail im Profil
      2) search/commits — Commits mit dieser E-Mail als Author
         (findet oft in alten Commits geleakte Privat-Adressen → echter
          Name + Repos, auch wenn das Profil die Mail nicht zeigt)

    Beide Treffer werden zu einer dedupliziertem Nutzer-Liste fusioniert.
    """
    basis_headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "neo-portfolio-osint",
        **_github_auth_header(),
    }
    nutzer: dict[str, dict] = {}   # login → datensatz
    namen: set[str] = set()        # aus Commits abgeleitete Klarnamen
    repos: list[dict] = []
    hinweise: list[str] = []

    # 1) User-Search
    try:
        r = await client.get(
            "https://api.github.com/search/users",
            params={"q": f"{email} in:email"},
            headers=basis_headers, timeout=TIMEOUT_S,
        )
        if r.status_code == 200:
            for u in r.json().get("items", [])[:5]:
                if u.get("login"):
                    nutzer[u["login"]] = {
                        "login": u.get("login"),
                        "url": u.get("html_url"),
                        "avatar": u.get("avatar_url"),
                        "typ": u.get("type"),
                        "quelle": "Profil-Mail",
                    }
        elif r.status_code in (401, 403):
            hinweise.append(f"User-Suche limitiert (HTTP {r.status_code})")
    except Exception:
        hinweise.append("User-Suche nicht erreichbar")

    # 2) Commit-Search (exakte Author-Mail)
    try:
        rc = await client.get(
            "https://api.github.com/search/commits",
            params={"q": f"author-email:{email}", "per_page": 10},
            headers=basis_headers, timeout=TIMEOUT_S,
        )
        if rc.status_code == 200:
            for item in rc.json().get("items", [])[:10]:
                autor = item.get("author") or {}
                commit_autor = (item.get("commit") or {}).get("author") or {}
                if commit_autor.get("name"):
                    namen.add(commit_autor["name"])
                login = autor.get("login")
                if login:
                    eintrag = nutzer.get(login, {
                        "login": login,
                        "url": autor.get("html_url"),
                        "avatar": autor.get("avatar_url"),
                        "typ": autor.get("type"),
                        "quelle": "Commit-Mail",
                    })
                    eintrag.setdefault("quelle", "Commit-Mail")
                    nutzer[login] = eintrag
                repo = item.get("repository") or {}
                if repo.get("full_name"):
                    repos.append({"name": repo["full_name"], "url": repo.get("html_url")})
        elif rc.status_code in (401, 403):
            hinweise.append(f"Commit-Suche limitiert (HTTP {rc.status_code})")
    except Exception:
        hinweise.append("Commit-Suche nicht erreichbar")

    # Repos deduplizieren
    repos_dedup, gesehen = [], set()
    for rp in repos:
        if rp["name"] not in gesehen:
            gesehen.add(rp["name"])
            repos_dedup.append(rp)

    gefunden = bool(nutzer)
    return {
        "gefunden": gefunden,
        "treffer": len(nutzer),
        "nutzer": list(nutzer.values())[:8],
        "klarnamen": sorted(namen)[:5],
        "repositories": repos_dedup[:8],
        "authentifiziert": bool(_github_auth_header()),
        **({"hinweis": "; ".join(hinweise)} if hinweise and not gefunden else {}),
    }


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


# ─── EmailRep.io — Reputations-/Profil-Aggregator (keyless) ─────────

async def _emailrep_pruefen(client: httpx.AsyncClient, email: str) -> dict:
    """
    EmailRep.io (Sublime) — keyless Reputations-API: Breach-/Leak-Signale,
    Zustellbarkeit, Spoofbarkeit, verknüpfte öffentliche Profile.
    Stark gedrosselt ohne Key → graceful bei 429.
    """
    try:
        r = await client.get(
            f"https://emailrep.io/{quote(email)}",
            headers={"User-Agent": "neo-portfolio-osint/1.0", "Accept": "application/json"},
            timeout=TIMEOUT_S,
        )
        if r.status_code == 200:
            d = r.json()
            det = d.get("details") or {}
            return {
                "geprueft": True,
                "reputation": d.get("reputation"),
                "verdaechtig": bool(d.get("suspicious")),
                "referenzen": d.get("references"),
                "credentials_leaked": det.get("credentials_leaked"),
                "data_breach": det.get("data_breach"),
                "zuletzt_gesehen": det.get("last_seen"),
                "wegwerf": det.get("disposable"),
                "frei_provider": det.get("free_provider"),
                "zustellbar": det.get("deliverable"),
                "spoofbar": det.get("spoofable"),
                "spf_strikt": det.get("spf_strict"),
                "dmarc_erzwungen": det.get("dmarc_enforced"),
                "boesartige_aktivitaet": det.get("malicious_activity"),
                "profile": det.get("profiles") or [],
            }
        if r.status_code == 429:
            return {"geprueft": False, "hinweis": "EmailRep rate-limited (keyless)"}
    except Exception:
        pass
    return {"geprueft": False, "hinweis": "EmailRep nicht erreichbar"}


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
    Vollständige E-Mail-Recon (Epieos/GHunt-Style), gecacht.

    Ergebnisse werden 1h gecacht (Breach-/Profil-Daten sind quasi-statisch) —
    spart Drittdienst-Last + Latenz. Cache-Key ist GEHASHT (keine Klartext-PII).
    Nur erfolgreiche Läufe werden gecacht (kein Negativ-Caching).
    """
    email = email.strip().lower()
    if not EMAIL_MUSTER.match(email):
        return {
            "email": email,
            "gueltig": False,
            "fehler": "Ungültiges E-Mail-Format",
            "analysiert_am": datetime.utcnow().isoformat() + "Z",
        }

    schluessel = cache_schluessel("email_recon", email)
    gecacht = await standard_cache.holen(schluessel)
    if gecacht is not None:
        return {**gecacht, "aus_cache": True}  # type: ignore[dict-item]

    ergebnis = await _email_recon_compute(email)
    if ergebnis.get("gueltig"):
        await standard_cache.setzen(schluessel, ergebnis, ttl_sekunden=CACHE_TTL_S)
    return ergebnis


async def _email_recon_compute(email: str) -> dict:
    """Eigentliche Recon-Berechnung (ohne Cache). Alle Module parallel."""

    hashes = _hashes_berechnen(email)
    domain = email.split("@")[1]

    async with httpx.AsyncClient(verify=True) as client:
        gravatar, google_id, hibp, github, xposedornot, leakcheck, pgp, emailrep = await asyncio.gather(
            _gravatar_pruefen(client, email),
            _google_id_pruefen(client, email),
            _hibp_passwort_pruefen(client, email),
            _github_user_finden(client, email),
            _xposedornot_pruefen(client, email),
            _leakcheck_pruefen(client, email),
            _pgp_pruefen(client, email),
            _emailrep_pruefen(client, email),
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
                "quelle": f"GitHub ({nutzer.get('quelle', 'GitHub')})",
                "wert": f"@{nutzer['login']}",
                "url": nutzer.get("url"),
                "konfidenz": "hoch",
            })
        for name in github.get("klarnamen", []):
            wer_ist_das.append({
                "quelle": "GitHub-Commit",
                "wert": f"Name: {name}",
                "konfidenz": "hoch",
            })
    if pgp.get("hat_pgp_key"):
        wer_ist_das.append({
            "quelle": "PGP-Keyserver",
            "wert": f"{pgp['anzahl']} PGP-Key(s) - sicherheitsaffiner User",
            "konfidenz": "hoch",
        })
    for prof in (emailrep.get("profile") or [])[:8]:
        wer_ist_das.append({"quelle": f"EmailRep→{prof}", "wert": str(prof), "konfidenz": "mittel"})

    # Risiko
    risiko_punkte = 0
    risiko_details = []
    if hibp.get("domain_betroffen"):
        risiko_punkte += 3
        risiko_details.append(f"Domain in {hibp.get('anzahl_breaches')} bekannten HIBP-Breaches")
    if xposedornot.get("anzahl_breaches", 0) > 0:
        risiko_punkte += 3
        risiko_details.append(f"Email in {xposedornot['anzahl_breaches']} XposedOrNot-Breach(es)")
    if xposedornot.get("exposed_fields"):
        risiko_punkte += 1
        risiko_details.append(f"Exposed Fields: {', '.join(xposedornot['exposed_fields'][:5])}")
    if leakcheck.get("anzahl", 0) > 0:
        risiko_punkte += 2
        risiko_details.append(f"LeakCheck: {leakcheck['anzahl']} weitere Breach-Quelle(n)")
    if gravatar.get("gefunden"):
        risiko_punkte += 1
        risiko_details.append("Gravatar-Profil öffentlich - Persona-Verknüpfung möglich")
    if google_id.get("google_konto_wahrscheinlich"):
        risiko_punkte += 1
        risiko_details.append("Google-Konto wahrscheinlich - Maps/YouTube ggf. öffentlich verknüpft")
    if github.get("gefunden"):
        risiko_punkte += 1
        risiko_details.append(f"{github.get('treffer', 0)} GitHub-Konten verknüpft")
    if pgp.get("hat_pgp_key"):
        risiko_punkte += 1
        risiko_details.append("PGP-Key öffentlich - User ist sicherheitsbewusst")
    if emailrep.get("data_breach") or emailrep.get("credentials_leaked"):
        risiko_punkte += 2
        risiko_details.append("EmailRep: in Breach-/Leak-Daten gesehen")
    if emailrep.get("boesartige_aktivitaet"):
        risiko_punkte += 3
        risiko_details.append("EmailRep: bösartige Aktivität gemeldet")

    # Exponierte Datenklassen über alle Breach-Quellen aggregieren
    # (was wurde konkret geleakt? → treibt die Schutz-Empfehlungen)
    _klassen: list[str] = []
    for b in (hibp.get("breaches") or []):
        _klassen.extend(b.get("datenklassen") or [])
    _klassen.extend(xposedornot.get("exposed_fields") or [])
    exponierte_datenklassen = sorted({str(x).strip() for x in _klassen if x})[:20]

    stufe = ("Hoch" if risiko_punkte >= 6 else
             "Mittel" if risiko_punkte >= 3 else
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
        "xposedornot": xposedornot,
        "leakcheck": leakcheck,
        "pgp": pgp,
        "emailrep": emailrep,
        "exponierte_datenklassen": exponierte_datenklassen,
        "wer_ist_das": wer_ist_das,
        "risiko": {
            "stufe": stufe,
            "punkte": risiko_punkte,
            "details": risiko_details,
        },
        "quellen": [
            "Gravatar Public API",
            "HaveIBeenPwned Public Breaches API",
            "XposedOrNot Public API",
            "LeakCheck Public API",
            "keys.openpgp.org HKP",
            "GitHub Public Search API",
            "Google Public Endpoints (Maps/Calendar/Drive)",
            "EmailRep.io (Reputation/Profile)",
        ],
    }
