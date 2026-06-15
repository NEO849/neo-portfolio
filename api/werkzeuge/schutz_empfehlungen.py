# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: Schutz-Empfehlungen (Härtungs-Layer)
#
# Der DEFENSIVE Kern der OSINT-Demo: leitet aus den Funden eines jeden
# Werkzeugs KONKRETE, priorisierte Gegenmaßnahmen ab — „was kann ich
# dagegen tun?". Damit wird aus der Exposition ein echter Datenschutz-
# Mehrwert (Awareness statt Angst).
#
# Reiner, seiteneffektfreier Transformator (KEIN Netzwerk, keine PII-
# Speicherung). Tolerant gegenüber fehlenden Feldern. Wird — wie pivots —
# additiv an ein Ergebnis gehängt (`schutz`), nie blockierend.
#
# Eine Empfehlung:
#   {
#     "titel":      kurze Überschrift,
#     "was":        konkrete Handlung (Imperativ),
#     "warum":      das Risiko / der Grund,
#     "prioritaet": "hoch" | "mittel" | "niedrig",
#     "kategorie":  Themen-Label (Passwörter, Privatsphäre, E-Mail, …)
#   }
# ═══════════════════════════════════════════════════════════════════

from __future__ import annotations


def _e(titel: str, was: str, warum: str,
       prioritaet: str = "mittel", kategorie: str = "Allgemein") -> dict:
    return {"titel": titel, "was": was, "warum": warum,
            "prioritaet": prioritaet, "kategorie": kategorie}


_RANG = {"hoch": 0, "mittel": 1, "niedrig": 2}


def _dedup_sort(empf: list[dict]) -> list[dict]:
    """Entfernt Titel-Duplikate (erster gewinnt) und sortiert nach Priorität."""
    gesehen: set[str] = set()
    eindeutig: list[dict] = []
    for e in empf:
        if not e or e["titel"] in gesehen:
            continue
        gesehen.add(e["titel"])
        eindeutig.append(e)
    return sorted(eindeutig, key=lambda e: _RANG.get(e["prioritaet"], 1))


# ─── Wiederverwendbare Bausteine ────────────────────────────────────

def _basis_kontohygiene() -> list[dict]:
    return [
        _e("Passwort-Manager nutzen",
           "Für jeden Dienst ein langes, einzigartiges Passwort über einen Passwort-Manager (z. B. Bitwarden, KeePassXC).",
           "Ein geleaktes Passwort kompromittiert sonst alle Konten mit demselben Passwort (Credential-Stuffing).",
           "hoch", "Passwörter"),
        _e("Zwei-Faktor / Passkeys aktivieren",
           "2FA per App (TOTP) oder Passkeys überall aktivieren, wo möglich — SMS-2FA nur als Notlösung.",
           "Selbst ein bekanntes Passwort reicht Angreifern dann nicht mehr aus.",
           "hoch", "Konten-Schutz"),
    ]


# ─── Generatoren je Werkzeug ────────────────────────────────────────

def _aus_email(erg: dict, recon: dict | None = None) -> list[dict]:
    """E-Mail (Basis + optional Recon)."""
    empf: list[dict] = []
    r = recon or {}

    leaks = (
        (r.get("hibp") or {}).get("anzahl_breaches", 0)
        + (r.get("xposedornot") or {}).get("anzahl_breaches", 0)
        + (r.get("leakcheck") or {}).get("anzahl", 0)
    )
    basis_leak = (erg.get("datenleck") or {}).get("domain_betroffen")
    if leaks or basis_leak:
        empf += _basis_kontohygiene()
        empf.append(_e(
            "Geleakte Passwörter sofort ändern",
            "Ändere die Passwörter aller Dienste, die in den gefundenen Leaks auftauchen — beginne mit E-Mail- und Bank-Konten.",
            f"Diese Adresse erscheint in {leaks or 'bekannten'} Daten-Leak(s); die alten Zugangsdaten gelten als kompromittiert.",
            "hoch", "Datenlecks"))
        empf.append(_e(
            "Leak-Frühwarnung einrichten",
            "Trage die Adresse bei einem Monitoring-Dienst (z. B. HaveIBeenPwned-Benachrichtigung) ein.",
            "Du wirst dann automatisch gewarnt, sobald sie in einem neuen Leak auftaucht.",
            "mittel", "Datenlecks"))

    exposed = (r.get("xposedornot") or {}).get("exposed_fields") or []
    klassen = [str(k).lower() for k in (r.get("exponierte_datenklassen") or [])]
    if any("password" in str(f).lower() for f in exposed) or any("password" in k for k in klassen):
        empf.append(_e(
            "Wiederverwendete Passwörter ersetzen",
            "Wenn das geleakte Passwort noch irgendwo aktiv ist: überall ersetzen.",
            "In den Leaks wurden Passwort-Daten exponiert — diese kursieren in Angreifer-Listen.",
            "hoch", "Passwörter"))
    if any(any(t in k for t in ("credit", "bank", "payment", "iban", "financial")) for k in klassen):
        empf.append(_e(
            "Zahlungsdaten überwachen",
            "Karten-/Kontoumsätze prüfen, Benachrichtigungen aktivieren, im Zweifel Karte sperren lassen.",
            "In den Leaks wurden Zahlungs-/Finanzdaten exponiert — direktes Betrugsrisiko.",
            "hoch", "Finanzen"))
    if any(any(t in k for t in ("address", "phone", "geo", "physical")) for k in klassen):
        empf.append(_e(
            "Identitäts-/Adressdaten als kompromittiert behandeln",
            "Wachsam bei gezieltem Phishing/Vishing sein; Adresse/Telefon nicht erneut breit streuen.",
            "Geleakte Adress-/Kontaktdaten ermöglichen glaubwürdiges, personalisiertes Social-Engineering.",
            "mittel", "Identität"))

    if (r.get("gravatar") or {}).get("gefunden"):
        empf.append(_e(
            "Gravatar-Profil prüfen",
            "Gravatar-Profil minimieren oder für Anmeldungen eine separate Adresse verwenden.",
            "Gravatar verknüpft den MD5-Hash deiner E-Mail site-übergreifend — so wird dieselbe Person über viele Seiten hinweg erkennbar.",
            "mittel", "Verkettung"))

    if (r.get("github") or {}).get("gefunden"):
        empf.append(_e(
            "Commit-E-Mail in Git verbergen",
            "Aktiviere GitHubs „Keep my email private“ + die noreply-Commit-Adresse und entferne Klartext-Mails aus alten Commits.",
            "Deine private Adresse wurde in öffentlichen Commits gefunden — sie verknüpft Konto, Klarnamen und Repos.",
            "mittel", "Verkettung"))

    # Immer hilfreich
    empf.append(_e(
        "E-Mail-Aliase pro Dienst",
        "Nutze Plus-Adressen (name+dienst@…) oder einen Alias-Dienst (z. B. SimpleLogin) je Anmeldung.",
        "So lässt sich nachvollziehen, welcher Dienst geleakt hat, und Spam/Tracking gezielt abschalten.",
        "niedrig", "E-Mail"))
    return empf


def _aus_domain(erg: dict, shodan: dict | None = None) -> list[dict]:
    empf: list[dict] = []
    bewertung = erg.get("sicherheits_bewertung") or {}
    for det in bewertung.get("details", []) or []:
        if det.get("ok"):
            continue
        check = (det.get("check") or "").lower()
        if "spf" in check:
            empf.append(_e("SPF-Record setzen",
                           "Veröffentliche einen SPF-TXT-Record für die Domain.",
                           "Ohne SPF kann die Domain leichter für gefälschte Absender (Spoofing/Phishing) missbraucht werden.",
                           "hoch", "E-Mail-Sicherheit"))
        elif "dmarc" in check:
            empf.append(_e("DMARC-Policy einführen",
                           "Setze einen DMARC-Record (zunächst p=none zum Monitoring, dann p=quarantine/reject).",
                           "DMARC verhindert, dass Angreifer in deinem Namen mailen, und liefert Reports.",
                           "hoch", "E-Mail-Sicherheit"))
        elif "hsts" in check or "strict-transport" in check:
            empf.append(_e("HSTS aktivieren",
                           "Sende den Strict-Transport-Security-Header (inkl. includeSubDomains).",
                           "Erzwingt HTTPS und schützt vor SSL-Stripping / Downgrade-Angriffen.",
                           "mittel", "Web-Härtung"))
        elif "content-security" in check or "csp" in check:
            empf.append(_e("Content-Security-Policy setzen",
                           "Definiere eine restriktive CSP.",
                           "CSP ist die wirksamste Bremse gegen Cross-Site-Scripting (XSS).",
                           "mittel", "Web-Härtung"))
        else:
            empf.append(_e(f"Sicherheits-Header ergänzen: {det.get('check')}",
                           "Fehlenden Header in der Server-/Reverse-Proxy-Konfig nachrüsten.",
                           "Fehlende Header vergrößern die Angriffsfläche der Web-Anwendung.",
                           "niedrig", "Web-Härtung"))

    agg = (shodan or {}).get("aggregiert") or {}
    if (agg.get("vulns_anzahl") or 0) > 0:
        empf.append(_e("Bekannte CVEs patchen",
                       "Aktualisiere die betroffenen Dienste/Versionen umgehend.",
                       f"Shodan listet {agg['vulns_anzahl']} öffentlich bekannte Schwachstelle(n) — sie sind aus dem Internet auffindbar.",
                       "hoch", "Patch-Management"))
    if (agg.get("ports_anzahl") or 0) > 0:
        empf.append(_e("Offene Ports einschränken",
                       "Schließe nicht benötigte Ports per Firewall; binde Verwaltungsdienste (SSH/DB) nur intern/VPN.",
                       f"{agg['ports_anzahl']} offene Port(s) sind nach außen sichtbar und scanbar.",
                       "mittel", "Netzwerk"))
    return empf


def _aus_bild(erg: dict) -> list[dict]:
    empf: list[dict] = []
    exif = erg.get("exif") or {}
    if exif.get("gps"):
        empf.append(_e("GPS-Standort aus Bildern entfernen",
                       "Metadaten vor dem Teilen strippen (z. B. exiftool, oder Geräte-Einstellung „Standort nicht einbetten“).",
                       "Das Bild enthält GPS-Koordinaten — der genaue Aufnahmeort (Wohnort?) ist rekonstruierbar.",
                       "hoch", "Metadaten"))
    if exif.get("seriennummer"):
        empf.append(_e("Kamera-Seriennummer entfernen",
                       "EXIF-Seriennummer vor Veröffentlichung löschen.",
                       "Die Seriennummer verkettet alle Fotos derselben Kamera — auch über verschiedene Accounts hinweg.",
                       "mittel", "Metadaten"))
    if exif.get("software") or exif.get("kamera"):
        empf.append(_e("Metadaten generell minimieren",
                       "Vor dem Hochladen EXIF entfernen (viele Plattformen tun das NICHT zuverlässig).",
                       "Aufnahmezeit, Gerät und Software erlauben Profilbildung und Zeitlinien-Rekonstruktion.",
                       "niedrig", "Metadaten"))
    if not empf:
        empf.append(_e("Metadaten-Hygiene beibehalten",
                       "Weiter Metadaten vor dem Teilen prüfen/strippen.",
                       "Dieses Bild war sauber — bei anderen Quellen ist das oft nicht der Fall.",
                       "niedrig", "Metadaten"))
    return empf


def _aus_telefon(erg: dict) -> list[dict]:
    return [
        _e("Nummer nicht öffentlich streuen",
           "Verwende für Anmeldungen/Inserate eine Zweitnummer (eSIM/VoIP) statt der Hauptnummer.",
           "Über die Nummer lassen sich (siehe Such-Links) Profile, Messenger-Konten und Inserate verknüpfen.",
           "mittel", "Privatsphäre"),
        _e("Messenger-Sichtbarkeit prüfen",
           "In WhatsApp/Telegram/Signal: „Wer sieht meine Nummer/Profilbild/zuletzt online“ einschränken.",
           "Standardmäßig ist oft mehr sichtbar, als nötig — z. B. dass die Nummer überhaupt registriert ist.",
           "mittel", "Privatsphäre"),
    ]


def _aus_username(erg: dict) -> list[dict]:
    """Username-Vollscan."""
    gefunden = ((erg.get("plattformen") or {}).get("gefunden") or [])
    empf: list[dict] = []
    if gefunden:
        empf.append(_e("Nicht überall denselben Username",
                       "Verwende für sensible Konten unterschiedliche, nicht zusammenhängende Benutzernamen.",
                       f"Der Name wurde auf {len(gefunden)} Plattform(en) gefunden — ein einheitlicher Username verkettet alle Profile zu einer Identität.",
                       "hoch", "Verkettung"))
        empf.append(_e("Alte/ungenutzte Konten löschen",
                       "Schließe Profile, die du nicht mehr brauchst (justdeleteme.xyz hilft beim Finden der Löschwege).",
                       "Verwaiste Konten bleiben durchsuchbar und sind ein bevorzugtes Ziel für Übernahmen.",
                       "mittel", "Konten-Hygiene"))
    return empf


def _aus_soziale_praesenz(erg: dict) -> list[dict]:
    empf: list[dict] = []
    offen = [p for p in (erg.get("offene_plattformen") or []) if p.get("gefunden")]
    walled = [w for w in (erg.get("walled_gardens") or []) if w.get("existenz") is True]

    if offen or walled:
        empf.append(_e("Privatsphäre-Einstellungen durchgehen",
                       "Prüfe je gefundenem Profil, was öffentlich sichtbar ist (Posts, Freundeslisten, Standort, Geburtsdatum).",
                       "Öffentliche Profilfelder sind die Hauptquelle für Social-Engineering und Identitätsdiebstahl.",
                       "hoch", "Privatsphäre"))
        empf.append(_e("Identitäts-Verkettung vermeiden",
                       "Nutze nicht überall denselben Username/dasselbe Profilbild/dieselbe Bio.",
                       "Genau diese Wiederholung erlaubt es, getrennte Profile zu einer Person zusammenzuführen.",
                       "hoch", "Verkettung"))
    if any((p.get("extra") or {}).get("verknuepfte_konten") for p in offen):
        empf.append(_e("Öffentliche Konto-Verknüpfungen prüfen",
                       "Überlege, welche Konten du öffentlich (z. B. via Keybase/Profil-Links) miteinander verknüpfst.",
                       "Verifizierte Verknüpfungen machen das Aggregieren deiner Identität trivial.",
                       "mittel", "Verkettung"))

    weitere = erg.get("weitere_plattformen") or []
    gesamt_treffer = len(offen) + len(walled) + len(weitere)
    if gesamt_treffer >= 6 or len(weitere) >= 3:
        empf.append(_e("Alte/ungenutzte Konten löschen",
                       "Schließe Profile, die du nicht mehr brauchst (justdeleteme.xyz hilft beim Finden der Löschwege).",
                       f"Der Name wurde auf {gesamt_treffer} Plattform(en) gefunden — verwaiste Konten bleiben durchsuchbar und sind ein bevorzugtes Übernahme-Ziel.",
                       "mittel", "Konten-Hygiene"))
    empf.append(_e("Bio & Standort minimieren",
                   "Entferne Klarnamen, Arbeitgeber, Heimatort und Geburtsdatum aus öffentlichen Bios, wo nicht nötig.",
                   "Diese Felder sind oft Antworten auf Sicherheitsfragen oder Bausteine für gezieltes Phishing.",
                   "niedrig", "Privatsphäre"))
    return empf


def _aus_ip(erg: dict) -> list[dict]:
    return [
        _e("Heim-IP nicht exponieren",
           "Nutze ein VPN/Reverse-Proxy für selbst gehostete Dienste; gib die Roh-IP nicht öffentlich an.",
           "Über die IP lassen sich Standort (grob), Provider und der Abuse-Kontakt ermitteln.",
           "niedrig", "Netzwerk"),
    ]


# Registry: Werkzeug-Typ → Generator (Signatur kann (erg) oder (erg, extra) sein)
def schutz_empfehlungen(typ: str, ergebnis: dict, *, zusatz: dict | None = None) -> list[dict]:
    """
    Leitet priorisierte Schutz-Empfehlungen aus einem Werkzeug-Ergebnis ab.

    Args:
        typ:     Werkzeug-Kennung ("email", "email-recon", "domain", "bild", …)
        ergebnis: das Haupt-Ergebnis-Dict
        zusatz:  optionaler Zweit-Datensatz (z. B. Recon zu Basis-E-Mail,
                 Shodan zu Domain)
    """
    if not isinstance(ergebnis, dict) or ergebnis.get("fehler"):
        return []
    t = (typ or "").strip().lower()
    try:
        if t == "email":
            empf = _aus_email(ergebnis, zusatz)
        elif t == "email-recon":
            empf = _aus_email({}, ergebnis)
        elif t == "domain":
            empf = _aus_domain(ergebnis, zusatz)
        elif t == "bild":
            empf = _aus_bild(ergebnis)
        elif t == "telefon":
            empf = _aus_telefon(ergebnis)
        elif t == "benutzername":
            empf = _aus_username(ergebnis)
        elif t == "soziale-praesenz":
            empf = _aus_soziale_praesenz(ergebnis)
        elif t in ("ip-intel", "ip"):
            empf = _aus_ip(ergebnis)
        else:
            return []
        return _dedup_sort(empf)
    except Exception:
        # Der Härtungs-Layer darf das Hauptergebnis NIE zum Absturz bringen.
        return []
