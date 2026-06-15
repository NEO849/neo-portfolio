# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: Soziale Präsenz (Social-Media-Recon, free + keyless)
#
# Zeichnet die öffentliche soziale Präsenz zu einem Benutzernamen über
# die großen Plattformen — bewusst in ZWEI sauber getrennten Klassen:
#
#   1) OFFENE PLATTFORMEN (echte freie APIs → strukturierte Daten):
#      Bluesky, GitHub, GitLab, Reddit, Mastodon (mastodon.social),
#      Keybase, Hacker News, Dev.to.
#      → Anzeigename, Bio, Follower, Avatar, verknüpfte Konten.
#
#   2) WALLED GARDENS (Login-/Anti-Bot-Wand → KEIN Scraping):
#      X/Twitter, LinkedIn, Facebook, Instagram, TikTok, YouTube.
#      → Nur ToS-saubere Signale:
#         • Existenz + Anzeigename via INTENDIERT öffentliche oEmbed-
#           Endpunkte (YouTube, TikTok),
#         • sonst: Profil-Direktlink + Google-/Bing-Dork-Links.
#      Klar als „login-geschützt" markiert. Keine Umgehung von Schutz-
#      mechanismen, kein Profil-Scrape — rechtssicher & blockier-resistent.
#
# Strategie (wie email_recon): alle Quellen parallel, Graceful Degradation
# (eine Quelle down → die anderen liefern weiter), Ergebnis 1h gecacht.
# ═══════════════════════════════════════════════════════════════════

from __future__ import annotations

import asyncio
from datetime import datetime
from urllib.parse import quote

import httpx

from werkzeuge.cache import cache_schluessel, standard_cache

TIMEOUT_S = 8
CACHE_TTL_S = 3600  # 1h — Profil-Daten ändern sich selten

# Echter Browser-UA: einige Hosts (Reddit, TikTok) blocken Default-Client-
# Signaturen. Nur für die Existenz-/Profil-Abfrage, kein Scraping.
_UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)


def _treffer(plattform: str, profil_url: str, *, anzeigename: str | None = None,
             bio: str | None = None, follower: int | None = None,
             avatar: str | None = None, extra: dict | None = None) -> dict:
    """Baut einen positiven Treffer für eine offene Plattform."""
    eintrag = {
        "plattform": plattform,
        "kategorie": "offen",
        "gefunden": True,
        "profil_url": profil_url,
    }
    if anzeigename:
        eintrag["anzeigename"] = anzeigename[:120]
    if bio:
        eintrag["bio"] = bio.strip()[:240]
    if follower is not None:
        eintrag["follower"] = follower
    if avatar:
        eintrag["avatar"] = avatar
    if extra:
        eintrag["extra"] = extra
    return eintrag


def _kein_treffer(plattform: str, profil_url: str) -> dict:
    return {"plattform": plattform, "kategorie": "offen",
            "gefunden": False, "profil_url": profil_url}


# ═══════════════════════════════════════════════════════════════════
# OFFENE PLATTFORMEN — echte freie APIs, strukturierte Daten
# ═══════════════════════════════════════════════════════════════════

async def _bluesky(client: httpx.AsyncClient, name: str) -> dict:
    """Bluesky (AT-Protocol) — public.api.bsky.app, keyless."""
    # Bare Username → kanonisches Handle <name>.bsky.social; eigene Handles
    # (enthalten Punkt) werden direkt verwendet.
    handle = name if "." in name else f"{name}.bsky.social"
    profil_url = f"https://bsky.app/profile/{handle}"
    try:
        r = await client.get(
            "https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile",
            params={"actor": handle}, timeout=TIMEOUT_S,
        )
        if r.status_code == 200:
            d = r.json()
            return _treffer(
                "Bluesky", profil_url,
                anzeigename=d.get("displayName"),
                bio=d.get("description"),
                follower=d.get("followersCount"),
                avatar=d.get("avatar"),
                extra={"handle": d.get("handle"), "did": d.get("did")},
            )
    except Exception:
        pass
    return _kein_treffer("Bluesky", profil_url)


async def _github(client: httpx.AsyncClient, name: str) -> dict:
    """GitHub — öffentliche User-API (keyless; Token optional via Env)."""
    import os
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "neo-portfolio-osint"}
    token = (os.environ.get("OSINT_GITHUB_TOKEN") or os.environ.get("GITHUB_TOKEN") or "").strip()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    profil_url = f"https://github.com/{name}"
    try:
        r = await client.get(f"https://api.github.com/users/{quote(name)}",
                             headers=headers, timeout=TIMEOUT_S)
        if r.status_code == 200:
            d = r.json()
            return _treffer(
                "GitHub", d.get("html_url") or profil_url,
                anzeigename=d.get("name"),
                bio=d.get("bio"),
                follower=d.get("followers"),
                avatar=d.get("avatar_url"),
                extra={k: d.get(k) for k in ("company", "location", "blog", "public_repos") if d.get(k)},
            )
    except Exception:
        pass
    return _kein_treffer("GitHub", profil_url)


async def _gitlab(client: httpx.AsyncClient, name: str) -> dict:
    """GitLab — öffentliche User-Lookup-API, keyless."""
    profil_url = f"https://gitlab.com/{name}"
    try:
        r = await client.get("https://gitlab.com/api/v4/users",
                             params={"username": name}, timeout=TIMEOUT_S)
        if r.status_code == 200:
            arr = r.json()
            if isinstance(arr, list) and arr:
                d = arr[0]
                return _treffer(
                    "GitLab", d.get("web_url") or profil_url,
                    anzeigename=d.get("name"),
                    avatar=d.get("avatar_url"),
                    extra={"id": d.get("id")},
                )
    except Exception:
        pass
    return _kein_treffer("GitLab", profil_url)


async def _reddit(client: httpx.AsyncClient, name: str) -> dict:
    """Reddit — öffentliches about.json (Browser-UA nötig)."""
    profil_url = f"https://www.reddit.com/user/{name}"
    try:
        r = await client.get(f"https://www.reddit.com/user/{quote(name)}/about.json",
                             headers={"User-Agent": _UA}, timeout=TIMEOUT_S)
        if r.status_code == 200:
            d = (r.json() or {}).get("data") or {}
            if d:
                sub = d.get("subreddit") or {}
                return _treffer(
                    "Reddit", profil_url,
                    anzeigename=sub.get("title") or d.get("name"),
                    bio=sub.get("public_description"),
                    follower=d.get("total_karma"),
                    avatar=(d.get("icon_img") or "").split("?")[0] or None,
                    extra={"karma": d.get("total_karma")},
                )
    except Exception:
        pass
    return _kein_treffer("Reddit", profil_url)


async def _mastodon(client: httpx.AsyncClient, name: str) -> dict:
    """Mastodon — Lookup auf der größten Instanz (mastodon.social)."""
    profil_url = f"https://mastodon.social/@{name}"
    try:
        r = await client.get("https://mastodon.social/api/v1/accounts/lookup",
                             params={"acct": name}, timeout=TIMEOUT_S)
        if r.status_code == 200:
            d = r.json()
            return _treffer(
                "Mastodon", d.get("url") or profil_url,
                anzeigename=d.get("display_name"),
                bio=_html_strip(d.get("note")),
                follower=d.get("followers_count"),
                avatar=d.get("avatar_static") or d.get("avatar"),
                extra={"instanz": "mastodon.social"},
            )
    except Exception:
        pass
    return _kein_treffer("Mastodon", profil_url)


async def _keybase(client: httpx.AsyncClient, name: str) -> dict:
    """Keybase — Lookup inkl. verifizierter verknüpfter Konten (proofs)."""
    profil_url = f"https://keybase.io/{name}"
    try:
        r = await client.get("https://keybase.io/_/api/1.0/user/lookup.json",
                             params={"usernames": name}, timeout=TIMEOUT_S)
        if r.status_code == 200:
            them = (r.json() or {}).get("them") or []
            if them:
                d = them[0] or {}
                profil = d.get("profile") or {}
                proofs = (d.get("proofs_summary") or {}).get("all") or []
                verknuepft = [
                    {"dienst": p.get("proof_type"), "name": p.get("nametag"),
                     "url": p.get("service_url")}
                    for p in proofs if p.get("proof_type")
                ][:8]
                return _treffer(
                    "Keybase", profil_url,
                    anzeigename=profil.get("full_name"),
                    bio=profil.get("bio"),
                    avatar=((d.get("pictures") or {}).get("primary") or {}).get("url"),
                    extra={"verknuepfte_konten": verknuepft} if verknuepft else None,
                )
    except Exception:
        pass
    return _kein_treffer("Keybase", profil_url)


async def _hackernews(client: httpx.AsyncClient, name: str) -> dict:
    """Hacker News — öffentliche Firebase-API."""
    profil_url = f"https://news.ycombinator.com/user?id={name}"
    try:
        r = await client.get(f"https://hacker-news.firebaseio.com/v0/user/{quote(name)}.json",
                             timeout=TIMEOUT_S)
        if r.status_code == 200 and r.json():
            d = r.json()
            return _treffer(
                "Hacker News", profil_url,
                bio=_html_strip(d.get("about")),
                follower=d.get("karma"),
                extra={"erstellt": d.get("created")},
            )
    except Exception:
        pass
    return _kein_treffer("Hacker News", profil_url)


async def _devto(client: httpx.AsyncClient, name: str) -> dict:
    """Dev.to — öffentliche User-API."""
    profil_url = f"https://dev.to/{name}"
    try:
        r = await client.get("https://dev.to/api/users/by_username",
                             params={"url": name}, timeout=TIMEOUT_S)
        if r.status_code == 200:
            d = r.json()
            return _treffer(
                "Dev.to", profil_url,
                anzeigename=d.get("name"),
                bio=d.get("summary"),
                avatar=d.get("profile_image"),
            )
    except Exception:
        pass
    return _kein_treffer("Dev.to", profil_url)


# ═══════════════════════════════════════════════════════════════════
# WALLED GARDENS — nur ToS-saubere Signale (kein Scraping)
# ═══════════════════════════════════════════════════════════════════

def _dorks(name: str, host: str) -> list[dict]:
    """Erzeugt Google-/Bing-Dork-Links (es fließen KEINE Daten bis zum Klick)."""
    q = quote(f'site:{host} "{name}"')
    return [
        {"name": "Google-Dork", "url": f"https://www.google.com/search?q={q}"},
        {"name": "Bing-Dork", "url": f"https://www.bing.com/search?q={q}"},
    ]


def _walled(plattform: str, profil_url: str, host: str, name: str, *,
            existenz: bool | None = None, anzeigename: str | None = None,
            hinweis: str = "Login-geschützt — nur öffentliche Vorschau/Link") -> dict:
    eintrag = {
        "plattform": plattform,
        "kategorie": "walled",
        "login_geschuetzt": True,
        "profil_url": profil_url,
        "existenz": existenz,           # True/False (via oEmbed) oder None (nur Link)
        "dork_links": _dorks(name, host),
        "hinweis": hinweis,
    }
    if anzeigename:
        eintrag["anzeigename"] = anzeigename[:120]
    return eintrag


async def _youtube(client: httpx.AsyncClient, name: str) -> dict:
    """YouTube — Existenz + Kanalname via INTENDIERT öffentlichen oEmbed-Endpunkt."""
    kanal_url = f"https://www.youtube.com/@{name}"
    try:
        r = await client.get("https://www.youtube.com/oembed",
                             params={"url": kanal_url, "format": "json"}, timeout=TIMEOUT_S)
        if r.status_code == 200:
            d = r.json()
            return _walled("YouTube", d.get("author_url") or kanal_url, "youtube.com", name,
                           existenz=True, anzeigename=d.get("author_name"),
                           hinweis="Öffentlicher Kanal (via oEmbed bestätigt)")
        if r.status_code == 404:
            return _walled("YouTube", kanal_url, "youtube.com", name, existenz=False)
    except Exception:
        pass
    return _walled("YouTube", kanal_url, "youtube.com", name, existenz=None)


async def _tiktok(client: httpx.AsyncClient, name: str) -> dict:
    """TikTok — Existenz + Anzeigename via öffentlichen oEmbed-Endpunkt."""
    profil_url = f"https://www.tiktok.com/@{name}"
    try:
        r = await client.get("https://www.tiktok.com/oembed",
                             params={"url": profil_url},
                             headers={"User-Agent": _UA}, timeout=TIMEOUT_S)
        if r.status_code == 200:
            d = r.json()
            return _walled("TikTok", profil_url, "tiktok.com", name,
                           existenz=True, anzeigename=d.get("author_name"),
                           hinweis="Öffentliches Profil (via oEmbed bestätigt)")
        if r.status_code in (400, 404):
            return _walled("TikTok", profil_url, "tiktok.com", name, existenz=False)
    except Exception:
        pass
    return _walled("TikTok", profil_url, "tiktok.com", name, existenz=None)


def _x_twitter(name: str) -> dict:
    """X/Twitter — kein verlässlicher freier Existenz-Check → Link + Dork."""
    return _walled("X / Twitter", f"https://x.com/{name}", "x.com", name,
                   hinweis="Login-/Anti-Bot-Wand — nur Profil-Link + Dork (kein freier Check)")


def _linkedin(name: str) -> dict:
    """LinkedIn — kein freier, rechtssicherer People-Zugriff → Dork-first."""
    return _walled("LinkedIn", f"https://www.linkedin.com/in/{name}",
                   "linkedin.com/in", name,
                   hinweis="Login-Wand + rechtlich geschützt — Profil via Dork suchen, nicht scrapen")


def _facebook(name: str) -> dict:
    return _walled("Facebook", f"https://www.facebook.com/{name}", "facebook.com", name,
                   hinweis="Login-geschützt — nur Profil-Link + Dork")


def _instagram(name: str) -> dict:
    return _walled("Instagram", f"https://www.instagram.com/{name}", "instagram.com", name,
                   hinweis="Login-/Anti-Bot-Wand — nur Profil-Link + Dork")


# ─── Hilfen ─────────────────────────────────────────────────────────

def _html_strip(text: str | None) -> str | None:
    """Entfernt einfache HTML-Tags aus Bio-Feldern (Mastodon/HN liefern HTML)."""
    if not text:
        return None
    import re
    return re.sub(r"<[^>]+>", "", text).strip() or None


# ─── Hauptfunktion ──────────────────────────────────────────────────

async def soziale_praesenz(benutzername: str) -> dict:
    """Zeichnet die öffentliche soziale Präsenz zu einem Benutzernamen (gecacht)."""
    name = benutzername.strip()
    if not name:
        return {"benutzername": name, "fehler": "Leerer Benutzername",
                "analysiert_am": datetime.utcnow().isoformat() + "Z"}

    schluessel = cache_schluessel("soziale_praesenz", name.lower())
    gecacht = await standard_cache.holen(schluessel)
    if gecacht is not None:
        return {**gecacht, "aus_cache": True}  # type: ignore[dict-item]

    ergebnis = await _berechnen(name)
    await standard_cache.setzen(schluessel, ergebnis, ttl_sekunden=CACHE_TTL_S)
    return ergebnis


async def _berechnen(name: str) -> dict:
    async with httpx.AsyncClient(verify=True, follow_redirects=True,
                                 limits=httpx.Limits(max_connections=12)) as client:
        offen_aufgaben = [
            _bluesky(client, name), _github(client, name), _gitlab(client, name),
            _reddit(client, name), _mastodon(client, name), _keybase(client, name),
            _hackernews(client, name), _devto(client, name),
        ]
        walled_aufgaben = [_youtube(client, name), _tiktok(client, name)]
        offen, walled_live = await asyncio.gather(
            asyncio.gather(*offen_aufgaben),
            asyncio.gather(*walled_aufgaben),
        )

    # Walled Gardens ohne freien Check → reine Link-/Dork-Einträge
    walled = list(walled_live) + [
        _x_twitter(name), _linkedin(name), _instagram(name), _facebook(name),
    ]

    offen_gefunden = [e for e in offen if e.get("gefunden")]

    # „Wer ist das?" — Anzeigenamen + verknüpfte Konten aus offenen Quellen
    wer_ist_das: list[dict] = []
    for e in offen_gefunden:
        if e.get("anzeigename"):
            wer_ist_das.append({"quelle": e["plattform"], "wert": e["anzeigename"], "konfidenz": "hoch"})
        for vk in (e.get("extra") or {}).get("verknuepfte_konten", []) or []:
            if vk.get("name"):
                wer_ist_das.append({
                    "quelle": f"{e['plattform']}→{vk.get('dienst', 'Konto')}",
                    "wert": vk["name"], "konfidenz": "hoch", "url": vk.get("url"),
                })
    for e in walled_live:
        if e.get("existenz") and e.get("anzeigename"):
            wer_ist_das.append({"quelle": e["plattform"], "wert": e["anzeigename"], "konfidenz": "mittel"})

    return {
        "benutzername": name,
        "analysiert_am": datetime.utcnow().isoformat() + "Z",
        "zusammenfassung": {
            "offen_gefunden": len(offen_gefunden),
            "geprueft_offen": len(offen),
            "walled_geprueft": sum(1 for e in walled if e.get("existenz") is not None),
            "walled_gesamt": len(walled),
        },
        "offene_plattformen": offen,
        "walled_gardens": walled,
        "wer_ist_das": wer_ist_das,
        "quellen": [
            "Bluesky (AT-Protocol public API)", "GitHub Public API", "GitLab Public API",
            "Reddit about.json", "Mastodon (mastodon.social) API", "Keybase API",
            "Hacker News Firebase API", "Dev.to API",
            "YouTube/TikTok oEmbed (öffentlich)",
        ],
    }
