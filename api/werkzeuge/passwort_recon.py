# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: Passwort-Exposure-Check (Welle 2 — E-Mail/Account-Exposure)
#
# Prüft via HaveIBeenPwned "Pwned Passwords", ob ein Passwort in
# bekannten Daten-Leaks auftaucht — OHNE das Passwort preiszugeben.
#
# k-Anonymität (Datenschutz-Kern):
#   1. SHA-1 des Passworts lokal berechnen.
#   2. NUR die ersten 5 Hex-Zeichen ("Range-Präfix") an die API senden.
#   3. Die API liefert ALLE Suffixe zu diesem Präfix (~hunderte) zurück.
#   4. Der Abgleich, ob unser Suffix dabei ist, passiert LOKAL.
#   → Der Server von HIBP sieht weder das Passwort noch den vollen Hash.
#
# Zusätzlich "Add-Padding: true" → die Antwortgröße verrät nichts über
# einen Treffer (Schutz gegen Größen-Seitenkanal).
#
# Hard-Rules:
#   · Das Passwort wird NIE gespeichert, geloggt oder gecacht.
#   · Kein API-Key nötig, kostenlos, unbegrenzt.
# ═══════════════════════════════════════════════════════════════════

from __future__ import annotations

import hashlib
from datetime import datetime
from typing import Awaitable, Callable

import httpx

API_RANGE_URL = "https://api.pwnedpasswords.com/range/"
TIMEOUT_S = 8


def _sha1_upper(passwort: str) -> str:
    return hashlib.sha1(passwort.encode("utf-8")).hexdigest().upper()


def _suffix_zaehlen(text: str, gesuchtes_suffix: str) -> int:
    """Durchsucht die HIBP-Range-Antwort (Zeilen 'SUFFIX:COUNT') lokal."""
    for zeile in text.splitlines():
        if ":" not in zeile:
            continue
        suffix, _, anzahl = zeile.partition(":")
        if suffix.strip().upper() == gesuchtes_suffix:
            try:
                return int(anzahl.strip())
            except ValueError:
                return 0
    return 0


def _bewertung(anzahl: int) -> dict:
    if anzahl == 0:
        return {
            "kompromittiert": False,
            "stufe": "Unkritisch",
            "zusammenfassung": "Dieses Passwort taucht in keinem bekannten Leak auf.",
            "empfehlungen": [],
        }
    if anzahl >= 1000:
        stufe = "Kritisch"
        zus = (f"Dieses Passwort wurde {anzahl:,}× in Daten-Leaks gefunden — "
               "es steht auf jeder Angreifer-Wortliste.").replace(",", ".")
    elif anzahl >= 10:
        stufe = "Hoch"
        zus = f"Dieses Passwort wurde {anzahl}× in Daten-Leaks gefunden."
    else:
        stufe = "Mittel"
        zus = f"Dieses Passwort wurde {anzahl}× in Daten-Leaks gefunden."
    return {
        "kompromittiert": True,
        "stufe": stufe,
        "zusammenfassung": zus,
        "empfehlungen": [
            "Dieses Passwort NICHT (mehr) verwenden.",
            "Überall wo es genutzt wurde sofort ändern.",
            "Einzigartige Passwörter pro Dienst + Passwort-Manager verwenden.",
            "Wo möglich Zwei-Faktor-Authentifizierung (2FA) aktivieren.",
        ],
    }


async def _standard_fetch(url: str) -> tuple[int, str]:
    async with httpx.AsyncClient(verify=True) as client:
        r = await client.get(
            url,
            headers={"Add-Padding": "true", "User-Agent": "f3-data-solutions-osint/1.0"},
            timeout=TIMEOUT_S,
        )
        return r.status_code, r.text


async def passwort_pruefen(
    passwort: str,
    *,
    fetch: Callable[[str], Awaitable[tuple[int, str]]] | None = None,
) -> dict:
    """
    Prüft ein Passwort gegen HIBP Pwned Passwords (k-Anonymität).

    Gibt NIE das Passwort oder den vollen Hash zurück. Wirft nicht —
    bei Dienst-Fehler graceful {geprueft: False}.
    """
    if not passwort:
        return {"geprueft": False, "fehler": "Kein Passwort angegeben",
                "analysiert_am": datetime.utcnow().isoformat() + "Z"}

    voll_hash = _sha1_upper(passwort)
    praefix, suffix = voll_hash[:5], voll_hash[5:]
    fetcher = fetch or _standard_fetch

    try:
        status, text = await fetcher(f"{API_RANGE_URL}{praefix}")
        if status != 200:
            return {"geprueft": False, "hinweis": f"HIBP HTTP {status}",
                    "analysiert_am": datetime.utcnow().isoformat() + "Z"}
        anzahl = _suffix_zaehlen(text, suffix)
    except Exception:
        return {"geprueft": False, "hinweis": "Pwned-Passwords-Dienst nicht erreichbar",
                "analysiert_am": datetime.utcnow().isoformat() + "Z"}

    bewertung = _bewertung(anzahl)
    return {
        "geprueft": True,
        "analysiert_am": datetime.utcnow().isoformat() + "Z",
        "anzahl_leaks": anzahl,
        "hash_praefix": praefix,   # nur das, was gesendet wurde (5 Zeichen) — kein Geheimnis
        **bewertung,
        "methode": "k-Anonymität (nur SHA-1-Präfix gesendet, Abgleich lokal)",
        "quelle": "HaveIBeenPwned — Pwned Passwords",
    }
