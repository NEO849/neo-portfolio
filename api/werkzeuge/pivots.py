# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: Pivot-Extraktion (Fundament-Welle)
#
# Wandelt das Ergebnis eines beliebigen Werkzeugs in eine Liste
# VERKNÜPFBARER Entitäten um ("Pivots"). Damit kann die Webseite dem
# Nutzer anbieten, von einem Treffer direkt weiterzusuchen — z.B.:
#   E-Mail-Recon findet Gravatar-Username  →  "→ Username analysieren"
#   Username-Suche findet GitHub-Profil    →  "→ Profil öffnen"
#   Domain-Analyse findet IP               →  "→ IP-Intel"
#
# Reiner, seiteneffektfreier Transformator (kein Netzwerk). Tolerant
# gegenüber fehlenden Feldern (graceful) — jede Quelle kann ein anders
# geformtes Dict liefern.
#
# Ein Pivot:
#   {
#     "typ":       "username" | "email" | "domain" | "ip" | "account" | "image",
#     "wert":      "<der konkrete Wert>",
#     "quelle":    "<woher der Pivot stammt>",
#     "konfidenz": "hoch" | "mittel" | "niedrig",
#     "analysierbar": True/False,   # True = eigenes Werkzeug existiert dafür
#     "url":       "<optionaler Direktlink>"
#   }
# ═══════════════════════════════════════════════════════════════════

from __future__ import annotations

# Typen, für die ein eigenes Analyse-Werkzeug existiert (UI kann verlinken).
ANALYSIERBARE_TYPEN = {"username", "email", "domain", "ip", "image"}


def _pivot(typ: str, wert: object, quelle: str,
           konfidenz: str = "mittel", url: str | None = None) -> dict | None:
    """Baut einen Pivot — oder None, wenn der Wert leer/unbrauchbar ist."""
    if not wert:
        return None
    wert_str = str(wert).strip()
    if not wert_str:
        return None
    return {
        "typ": typ,
        "wert": wert_str,
        "quelle": quelle,
        "konfidenz": konfidenz,
        "analysierbar": typ in ANALYSIERBARE_TYPEN,
        "url": url,
    }


def _dedup(pivots: list[dict | None]) -> list[dict]:
    """Entfernt None + Duplikate (gleicher typ+wert), behält den ersten."""
    gesehen: set[tuple[str, str]] = set()
    ergebnis: list[dict] = []
    for p in pivots:
        if not p:
            continue
        schluessel = (p["typ"], p["wert"].lower())
        if schluessel in gesehen:
            continue
        gesehen.add(schluessel)
        ergebnis.append(p)
    return ergebnis


# ─── Quellen-spezifische Extraktoren ─────────────────────────────────

def _aus_email_recon(erg: dict) -> list[dict | None]:
    pivots: list[dict | None] = []
    domain = erg.get("domain")
    pivots.append(_pivot("domain", domain, "E-Mail-Domain", "hoch"))

    grav = erg.get("gravatar") or {}
    pd = grav.get("profil_daten") or {}
    if pd.get("benutzername"):
        pivots.append(_pivot("username", pd["benutzername"], "Gravatar-Profil", "hoch"))
    if grav.get("avatar_url") and grav.get("gefunden"):
        pivots.append(_pivot("image", grav["avatar_url"], "Gravatar-Avatar", "hoch",
                             url=grav["avatar_url"]))
    for konto in pd.get("verifizierte_konten", []) or []:
        if konto.get("url"):
            pivots.append(_pivot("account", konto.get("url"),
                                 f"Gravatar→{konto.get('name', 'Konto')}",
                                 "hoch" if konto.get("verifiziert") else "mittel",
                                 url=konto["url"]))

    for nutzer in (erg.get("github") or {}).get("nutzer", []) or []:
        if nutzer.get("login"):
            pivots.append(_pivot("username", nutzer["login"], "GitHub-Commit", "hoch",
                                 url=nutzer.get("url")))
            if nutzer.get("avatar"):
                pivots.append(_pivot("image", nutzer["avatar"], "GitHub-Avatar", "mittel",
                                     url=nutzer["avatar"]))
    return pivots


def _aus_email_basis(erg: dict) -> list[dict | None]:
    adresse = erg.get("email") or erg.get("adresse")
    domain = None
    if isinstance(adresse, str) and "@" in adresse:
        domain = adresse.split("@")[1]
    return [_pivot("domain", domain or (erg.get("domain") or {}).get("domain"),
                   "E-Mail-Domain", "hoch")]


def _aus_benutzername(erg: dict) -> list[dict | None]:
    pivots: list[dict | None] = []
    gefunden = (erg.get("plattformen") or {}).get("gefunden", []) or []
    for treffer in gefunden:
        if treffer.get("url"):
            pivots.append(_pivot("account", treffer["url"],
                                 f"{treffer.get('plattform', 'Plattform')}",
                                 treffer.get("konfidenz", "mittel"),
                                 url=treffer["url"]))
    return pivots


def _aus_domain(erg: dict) -> list[dict | None]:
    pivots: list[dict | None] = []
    dns = erg.get("dns") or {}
    for ip in (dns.get("a") or [])[:5]:
        pivots.append(_pivot("ip", ip, "A-Record", "hoch"))
    for ip in (dns.get("aaaa") or [])[:3]:
        pivots.append(_pivot("ip", ip, "AAAA-Record", "hoch"))
    return pivots


def _aus_bild(erg: dict) -> list[dict | None]:
    # Aus einem Bild lässt sich (datenschutzkonform) kein neues
    # analysierbares Subjekt ableiten — GPS ist ein Ort, kein Pivot-Subjekt.
    return []


# Registry: Werkzeug-/Ergebnis-Typ → Extraktor
_EXTRAKTOREN = {
    "email-recon": _aus_email_recon,
    "email": _aus_email_basis,
    "benutzername": _aus_benutzername,
    "domain": _aus_domain,
    "bild": _aus_bild,
}


def extrahiere_pivots(typ: str, ergebnis: dict) -> list[dict]:
    """
    Extrahiert verknüpfbare Pivots aus einem Werkzeug-Ergebnis.

    Args:
        typ: Werkzeug-/Ergebnis-Kennung ("email-recon", "benutzername", "domain", …)
        ergebnis: das Ergebnis-Dict des Werkzeugs

    Gibt eine deduplizierte Pivot-Liste zurück (leer, wenn nichts ableitbar).
    """
    if not isinstance(ergebnis, dict) or ergebnis.get("fehler"):
        return []
    extraktor = _EXTRAKTOREN.get((typ or "").strip().lower())
    if extraktor is None:
        return []
    try:
        return _dedup(extraktor(ergebnis))
    except Exception:
        # Pivot-Extraktion darf das Hauptergebnis NIE zum Absturz bringen.
        return []
