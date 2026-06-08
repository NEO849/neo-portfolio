# ═══════════════════════════════════════════════════════════════════
# WERKZEUG: Transparenz / Datenfluss-Deklaration (Fundament-Welle)
#
# Maschinenlesbare, WAHRHEITSGEMÄSSE Deklaration, welche Drittdienste
# jedes OSINT-Werkzeug SERVERSEITIG kontaktiert (= wohin Nutzerdaten
# tatsächlich fließen) — Grundlage für den DSGVO-Einwilligungs-/
# Transparenz-Layer der Webseite (Art. 13/14 DSGVO).
#
# Zentrale Unterscheidung:
#   · "sendet_an"  → Dienst wird vom Server aufgerufen, die Eingabe
#                    (E-Mail/Domain/Username/Bild-URL) wird übermittelt.
#   · "nur_links"  → Es werden ausschließlich anklickbare Such-Links
#                    erzeugt. Es fließen KEINE Daten, bis der Nutzer
#                    selbst klickt. (Transparenz: trotzdem ausweisen.)
#
# Diese Datei ist die Single Source of Truth. Wird ein Werkzeug um eine
# neue Drittquelle erweitert, MUSS der Eintrag hier mitgepflegt werden.
# Der Test test_transparenz.py erzwingt, dass jedes Werkzeug deklariert ist.
# ═══════════════════════════════════════════════════════════════════

from __future__ import annotations

# Hinweis zur Speicherung gilt global für alle Werkzeuge.
SPEICHER_HINWEIS = (
    "Keine persistente Speicherung der Eingabe oder Ergebnisse. "
    "Verarbeitung nur für die Dauer der Anfrage; Resultate werden "
    "höchstens kurzzeitig (TTL-Cache, im Arbeitsspeicher) vorgehalten."
)


def _dienst(name: str, daten: str, zweck: str, datenschutz: str, region: str = "?") -> dict:
    return {
        "dienst": name,
        "uebermittelte_daten": daten,
        "zweck": zweck,
        "datenschutz_url": datenschutz,
        "region": region,
    }


# ─── Datenfluss pro Werkzeug ─────────────────────────────────────────
# Schlüssel = Endpunkt-Name (wie in den Routen / der UI verwendet).

DATENFLUSS: dict[str, dict] = {

    "domain": {
        "beschreibung": "Analysiert eine Domain (DNS, WHOIS, HTTP-Header, Sicherheit).",
        "sendet_an": [
            _dienst("Öffentliche DNS-Auflösung", "Domainname",
                    "Auflösung von A/MX/NS/TXT-Records", "—", "global"),
            _dienst("WHOIS-Server der TLD", "Domainname",
                    "Registrierungs-/Inhaberdaten (öffentlich)", "—", "global"),
            _dienst("Die Domain selbst", "HTTP-Anfrage an die Domain",
                    "HTTP-Status + Sicherheits-Header prüfen", "—", "Inhaber-abhängig"),
        ],
        "nur_links": [],
        "speicherung": SPEICHER_HINWEIS,
    },

    "email": {
        "beschreibung": "Basis-Analyse einer E-Mail (Syntax, MX/SPF/DMARC, Domain-Breach).",
        "sendet_an": [
            _dienst("Öffentliche DNS-Auflösung", "E-Mail-Domain",
                    "MX/SPF/DMARC-Records prüfen", "—", "global"),
            _dienst("HaveIBeenPwned", "E-Mail-Domain (nicht die volle Adresse)",
                    "Prüfen, ob die Domain in bekannten Daten-Leaks auftaucht",
                    "https://haveibeenpwned.com/Privacy", "AU"),
        ],
        "nur_links": [],
        "speicherung": SPEICHER_HINWEIS,
    },

    "email-recon": {
        "beschreibung": "Tiefen-Recon einer E-Mail (Gravatar, Breach-Quellen, PGP, GitHub).",
        "sendet_an": [
            _dienst("Gravatar", "MD5/SHA-Hash der E-Mail",
                    "Öffentliches Profil/Avatar ermitteln",
                    "https://automattic.com/privacy/", "US"),
            _dienst("HaveIBeenPwned", "E-Mail-Domain",
                    "Bekannte Domain-Breaches", "https://haveibeenpwned.com/Privacy", "AU"),
            _dienst("XposedOrNot", "E-Mail-Adresse",
                    "Breach- und Paste-Treffer", "https://xposedornot.com/privacy_policy", "—"),
            _dienst("LeakCheck (Public)", "E-Mail-Adresse",
                    "Zusätzliche Breach-Quellen", "https://leakcheck.io/privacy", "—"),
            _dienst("keys.openpgp.org", "E-Mail-Adresse",
                    "Vorhandensein eines öffentlichen PGP-Schlüssels",
                    "https://keys.openpgp.org/about/privacy", "EU"),
            _dienst("GitHub", "E-Mail-Adresse",
                    "Verknüpfte GitHub-Konten via öffentliche Such-API",
                    "https://docs.github.com/site-policy/privacy-policies", "US"),
        ],
        "nur_links": [
            "Google Maps/YouTube/Drive (nur Such-Links, falls Gmail-Adresse)",
        ],
        "speicherung": SPEICHER_HINWEIS,
    },

    "benutzername": {
        "beschreibung": "Sucht einen Benutzernamen auf bis zu 600+ Plattformen (WhatsMyName-Fusion).",
        "sendet_an": [
            _dienst("raw.githubusercontent.com", "—",
                    "Laden der WhatsMyName-Plattformliste (ohne den Username)",
                    "https://docs.github.com/site-policy/privacy-policies", "US"),
            _dienst("Alle geprüften Plattformen (z.B. GitHub, GitLab, LinkedIn, "
                    "Keybase, Mastodon, Dev.to, npm, PyPI, …)", "Benutzername (in der Profil-URL)",
                    "Prüfen, ob ein öffentliches Profil mit diesem Namen existiert",
                    "jeweilige Plattform-Datenschutzerklärung", "global"),
        ],
        "nur_links": [],
        "hinweis": "Der Benutzername wird an JEDE geprüfte Plattform gesendet "
                   "(als Teil der aufgerufenen Profil-URL). Das ist technisch "
                   "notwendig für die Existenzprüfung.",
        "speicherung": SPEICHER_HINWEIS,
    },

    "telefon": {
        "beschreibung": "Analysiert eine Telefonnummer (Format, Land, Carrier, Typ).",
        "sendet_an": [],
        "nur_links": [
            "tellows, Truecaller, sync.me, NumLookup, Facebook, LinkedIn, WhatsApp, Telegram "
            "(ausschließlich anklickbare Such-Links — es werden keine Daten automatisch gesendet)",
        ],
        "hinweis": "Die Analyse läuft vollständig LOKAL über die phonenumbers-Bibliothek. "
                   "Es wird serverseitig KEIN Drittdienst kontaktiert.",
        "speicherung": SPEICHER_HINWEIS,
    },

    "bild": {
        "beschreibung": "Analysiert ein Bild von einer URL (EXIF, GPS→Ort, Hashes, Reverse-Links).",
        "sendet_an": [
            _dienst("Der angegebene Bild-Host", "HTTP-Anfrage an die Bild-URL",
                    "Bild temporär laden (SSRF-geschützt) für EXIF/Hash-Analyse",
                    "URL-abhängig", "Anbieter-abhängig"),
            _dienst("Nominatim / OpenStreetMap", "GPS-Koordinaten aus dem Bild (nur falls vorhanden)",
                    "Reverse-Geocoding: Koordinaten → lesbarer Ortsname",
                    "https://wiki.osmfoundation.org/wiki/Privacy_Policy", "EU"),
        ],
        "nur_links": [
            "Google Lens, TinEye, Bing, Yandex, Baidu, SauceNAO, IQDB sowie "
            "Gesichtssuch-Dienste (PimEyes/FaceCheck/…) — ausschließlich Such-Links.",
        ],
        "hinweis": "Das Bild wird nur temporär geladen und NICHT gespeichert oder "
                   "an Reverse-Image-Dienste hochgeladen.",
        "speicherung": SPEICHER_HINWEIS,
    },

    "shodan": {
        "beschreibung": "Fragt offene Ports/CVEs zu einer IP/Domain ab (Shodan InternetDB).",
        "sendet_an": [
            _dienst("Shodan InternetDB", "IP-Adresse (bzw. aufgelöste Domain)",
                    "Bekannte offene Ports, CVEs, Tags abrufen",
                    "https://www.shodan.io/about/privacy", "US"),
            _dienst("Öffentliche DNS-Auflösung", "Domainname (falls Domain übergeben)",
                    "Auflösung zur IP", "—", "global"),
        ],
        "nur_links": [],
        "speicherung": SPEICHER_HINWEIS,
    },

    "subdomains": {
        "beschreibung": "Sammelt Subdomains aus Certificate-Transparency- und Archiv-Quellen.",
        "sendet_an": [
            _dienst("crt.sh", "Domainname",
                    "Certificate-Transparency-Logs", "https://sectigo.com/privacy", "US"),
            _dienst("Wayback Machine", "Domainname",
                    "Historische URLs (CDX-API)", "https://archive.org/about/terms.php", "US"),
            _dienst("CommonCrawl", "Domainname",
                    "Gecrawlte URLs", "https://commoncrawl.org/terms-of-use", "US"),
        ],
        "nur_links": [],
        "speicherung": SPEICHER_HINWEIS,
    },

    "ip-intel": {
        "beschreibung": "Routing-/Ownership-/Abuse-Daten zu einer IP (RIPEstat).",
        "sendet_an": [
            _dienst("RIPEstat (RIPE NCC)", "IP-Adresse (bzw. aufgelöste Domain)",
                    "Autoritative Routing-/ASN-/Abuse-Daten",
                    "https://www.ripe.net/about-us/legal/privacy-statement/", "EU"),
            _dienst("Öffentliche DNS-Auflösung", "Domainname (falls Domain übergeben)",
                    "Auflösung zur IP", "—", "global"),
        ],
        "nur_links": [],
        "speicherung": SPEICHER_HINWEIS,
    },

    "aggregator": {
        "beschreibung": "Erzeugt kuratierte Such-Links für ein Target (IntelTechniques-Stil).",
        "sendet_an": [],
        "nur_links": [
            "Erzeugt ausschließlich anklickbare Such-Links über viele Quellen. "
            "Es wird serverseitig KEIN Dienst kontaktiert und KEINE Daten gesendet, "
            "bis der Nutzer einen Link selbst öffnet.",
        ],
        "speicherung": SPEICHER_HINWEIS,
    },

    "orchestrator": {
        "beschreibung": "Automatische Vollanalyse mit Typ-Erkennung + Pivot-Discovery.",
        "sendet_an": [
            _dienst("Alle Dienste der jeweils ausgeführten Module", "je nach erkanntem Typ",
                    "Der Orchestrator ruft je nach Eingabe (E-Mail/Domain/Username/IP/Telefon) "
                    "die entsprechenden Werkzeuge auf — es gelten deren Datenflüsse.",
                    "siehe jeweiliges Werkzeug", "—"),
        ],
        "nur_links": [],
        "hinweis": "Der Datenfluss entspricht der Summe der ausgeführten Einzel-Werkzeuge "
                   "für den erkannten Eingabe-Typ.",
        "speicherung": SPEICHER_HINWEIS,
    },
}


def transparenz_fuer(werkzeug: str | None = None) -> dict:
    """
    Gibt die Datenfluss-Deklaration zurück.

    · werkzeug=None  → alle Werkzeuge + globaler Hinweis
    · werkzeug="email" → nur dieser Eintrag (oder Fehlermarkierung)
    """
    if werkzeug is None:
        return {
            "hinweis": "Diese Übersicht zeigt, welche Drittdienste pro Werkzeug "
                       "serverseitig kontaktiert werden (Datenfluss) bzw. wo nur "
                       "Such-Links erzeugt werden (kein automatischer Datenfluss).",
            "speicherung": SPEICHER_HINWEIS,
            "werkzeuge": DATENFLUSS,
        }

    schluessel = werkzeug.strip().lower()
    eintrag = DATENFLUSS.get(schluessel)
    if eintrag is None:
        return {"werkzeug": schluessel, "fehler": "Unbekanntes Werkzeug"}
    return {"werkzeug": schluessel, **eintrag}
