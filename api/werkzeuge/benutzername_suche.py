# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: Benutzername-Suche
# Prüft ob ein Benutzername auf bekannten Plattformen existiert.
# Nur öffentliche Profilseiten — kein Login, kein Scraping.
# ═══════════════════════════════════════════════════════════════════

import asyncio
import httpx
from datetime import datetime


# Plattformen mit URL-Template und Erkennungslogik
PLATTFORMEN: list[dict] = [
    {
        "name": "GitHub",
        "kategorie": "entwicklung",
        "url": "https://github.com/{username}",
        "fehler_indikator": "Not Found",
        "methode": "status",  # 200 = gefunden, 404 = nicht gefunden
        "symbol": "⚙",
    },
    {
        "name": "GitLab",
        "kategorie": "entwicklung",
        "url": "https://gitlab.com/{username}",
        "methode": "status",
        "symbol": "⚙",
    },
    {
        "name": "HackerOne",
        "kategorie": "sicherheit",
        "url": "https://hackerone.com/{username}",
        "methode": "status",
        "symbol": "🛡",
    },
    {
        "name": "Bugcrowd",
        "kategorie": "sicherheit",
        "url": "https://bugcrowd.com/{username}",
        "methode": "status",
        "symbol": "🛡",
    },
    {
        "name": "Twitter/X",
        "kategorie": "social",
        "url": "https://x.com/{username}",
        "methode": "status",
        "symbol": "✗",
    },
    {
        "name": "Reddit",
        "kategorie": "social",
        "url": "https://www.reddit.com/user/{username}",
        "fehler_text": "Sorry, nobody on Reddit goes by that name.",
        "methode": "inhalt",
        "symbol": "◉",
    },
    {
        "name": "LinkedIn",
        "kategorie": "beruf",
        "url": "https://www.linkedin.com/in/{username}",
        "methode": "status",
        "symbol": "in",
    },
    {
        "name": "Dev.to",
        "kategorie": "entwicklung",
        "url": "https://dev.to/{username}",
        "methode": "status",
        "symbol": "▲",
    },
    {
        "name": "Mastodon (infosec.exchange)",
        "kategorie": "sicherheit",
        "url": "https://infosec.exchange/@{username}",
        "methode": "status",
        "symbol": "◈",
    },
    {
        "name": "Keybase",
        "kategorie": "sicherheit",
        "url": "https://keybase.io/{username}",
        "methode": "status",
        "symbol": "🔑",
    },
    {
        "name": "Instagram",
        "kategorie": "social",
        "url": "https://www.instagram.com/{username}/",
        "fehler_text": "Sorry, this page",
        "methode": "inhalt",
        "symbol": "◈",
    },
    {
        "name": "TikTok",
        "kategorie": "social",
        "url": "https://www.tiktok.com/@{username}",
        "methode": "status",
        "symbol": "♪",
    },
    {
        "name": "YouTube",
        "kategorie": "social",
        "url": "https://www.youtube.com/@{username}",
        "methode": "status",
        "symbol": "▶",
    },
    {
        "name": "Twitch",
        "kategorie": "social",
        "url": "https://www.twitch.tv/{username}",
        "methode": "status",
        "symbol": "◈",
    },
    {
        "name": "Steam",
        "kategorie": "gaming",
        "url": "https://steamcommunity.com/id/{username}",
        "fehler_text": "The specified profile could not be found",
        "methode": "inhalt",
        "symbol": "◉",
    },
    {
        "name": "Hackthebox",
        "kategorie": "sicherheit",
        "url": "https://app.hackthebox.com/profile/overview",
        "methode": "ignorieren",  # Benötigt Login
        "symbol": "◈",
    },
    {
        "name": "DockerHub",
        "kategorie": "entwicklung",
        "url": "https://hub.docker.com/u/{username}",
        "methode": "status",
        "symbol": "◈",
    },
    {
        "name": "npm",
        "kategorie": "entwicklung",
        "url": "https://www.npmjs.com/~{username}",
        "methode": "status",
        "symbol": "◈",
    },
    {
        "name": "PyPI",
        "kategorie": "entwicklung",
        "url": "https://pypi.org/user/{username}/",
        "methode": "status",
        "symbol": "◈",
    },
    {
        "name": "Codepen",
        "kategorie": "entwicklung",
        "url": "https://codepen.io/{username}",
        "methode": "status",
        "symbol": "✏",
    },
]


async def _plattform_pruefen(
    client: httpx.AsyncClient,
    plattform: dict,
    benutzername: str,
) -> dict:
    """Prüft eine einzelne Plattform auf den Benutzernamen."""
    if plattform.get("methode") == "ignorieren":
        return {
            "plattform": plattform["name"],
            "kategorie": plattform.get("kategorie", "sonstige"),
            "url": plattform["url"].format(username=benutzername),
            "gefunden": None,
            "hinweis": "Login erforderlich",
        }

    url = plattform["url"].format(username=benutzername)
    try:
        antwort = await client.get(url, follow_redirects=True, timeout=8)

        if plattform.get("methode") == "inhalt":
            fehler_text = plattform.get("fehler_text", "")
            gefunden = fehler_text not in antwort.text and antwort.status_code < 400
        else:
            gefunden = antwort.status_code == 200

        return {
            "plattform": plattform["name"],
            "kategorie": plattform.get("kategorie", "sonstige"),
            "url": url,
            "gefunden": gefunden,
            "status": antwort.status_code,
        }
    except Exception as e:
        return {
            "plattform": plattform["name"],
            "kategorie": plattform.get("kategorie", "sonstige"),
            "url": url,
            "gefunden": None,
            "fehler": "Timeout oder nicht erreichbar",
        }


async def benutzername_suchen(benutzername: str) -> dict:
    """
    Hauptfunktion: Sucht Benutzernamen auf allen bekannten Plattformen.
    Gibt strukturiertes Ergebnis-Dict zurück.
    """
    benutzername = benutzername.strip()

    # Basisvalidierung
    if not benutzername or len(benutzername) < 2:
        return {
            "benutzername": benutzername,
            "fehler": "Benutzername zu kurz",
            "analysiert_am": datetime.utcnow().isoformat() + "Z",
        }
    if len(benutzername) > 50:
        return {
            "benutzername": benutzername,
            "fehler": "Benutzername zu lang",
            "analysiert_am": datetime.utcnow().isoformat() + "Z",
        }

    # Nur aktive Plattformen prüfen
    aktive_plattformen = [p for p in PLATTFORMEN if p.get("methode") != "ignorieren"]

    headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
    }

    async with httpx.AsyncClient(headers=headers, verify=False) as client:
        aufgaben = [
            _plattform_pruefen(client, plattform, benutzername)
            for plattform in aktive_plattformen
        ]
        ergebnisse = await asyncio.gather(*aufgaben)

    # Auswertung
    gefunden = [e for e in ergebnisse if e.get("gefunden") is True]
    nicht_gefunden = [e for e in ergebnisse if e.get("gefunden") is False]
    fehler = [e for e in ergebnisse if e.get("gefunden") is None]

    # Nach Kategorien gruppieren
    nach_kategorie: dict[str, list] = {}
    for eintrag in gefunden:
        kat = eintrag.get("kategorie", "sonstige")
        if kat not in nach_kategorie:
            nach_kategorie[kat] = []
        nach_kategorie[kat].append(eintrag)

    return {
        "benutzername": benutzername,
        "analysiert_am": datetime.utcnow().isoformat() + "Z",
        "zusammenfassung": {
            "geprueft": len(ergebnisse),
            "gefunden": len(gefunden),
            "nicht_gefunden": len(nicht_gefunden),
            "fehler": len(fehler),
            "treffer_rate": round(len(gefunden) / max(len(ergebnisse) - len(fehler), 1) * 100),
        },
        "plattformen": {
            "gefunden": gefunden,
            "nicht_gefunden": [{"plattform": e["plattform"], "kategorie": e.get("kategorie"), "url": e["url"]} for e in nicht_gefunden],
            "fehler": fehler,
        },
        "nach_kategorie": nach_kategorie,
    }
