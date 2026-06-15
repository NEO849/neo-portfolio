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
            _dienst("VirusTotal", "Domainname — NUR wenn VirusTotal aktiviert",
                    "Reputations-Check (wie viele Engines die Domain als schädlich melden)",
                    "https://docs.virustotal.com/docs/privacy-policy", "US"),
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
            _dienst("LeakCheck (Public/Pro)", "E-Mail-Adresse",
                    "Zusätzliche Breach-Quellen — Pro-Tier (mehr Quellen) nur wenn "
                    "LEAKCHECK_API_KEY gesetzt ist, sonst keyless Public-Tier",
                    "https://leakcheck.io/privacy", "—"),
            _dienst("keys.openpgp.org", "E-Mail-Adresse",
                    "Vorhandensein eines öffentlichen PGP-Schlüssels",
                    "https://keys.openpgp.org/about/privacy", "EU"),
            _dienst("GitHub", "E-Mail-Adresse",
                    "Verknüpfte GitHub-Konten via öffentliche User- UND Commit-Such-API "
                    "(findet in alten Commits hinterlegte Adressen → Konto, Klarname, Repos)",
                    "https://docs.github.com/site-policy/privacy-policies", "US"),
            _dienst("EmailRep.io (Sublime Security)", "E-Mail-Adresse",
                    "Reputations-/Risiko-Signale (Breach/Leak gesehen, Zustellbarkeit, "
                    "Spoofbarkeit) + verknüpfte öffentliche Profile",
                    "https://emailrep.io/key", "US"),
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
        "beschreibung": "Analysiert eine Telefonnummer (Format, Land, Carrier, Typ) "
                        "+ optionaler HLR-Live-Status.",
        "sendet_an": [
            _dienst("hlr-lookups.com", "Telefonnummer (E.164) — NUR wenn HLR aktiviert",
                    "Live-Status (erreichbar/Roaming/Carrier/Portierung) via HLR-Abfrage",
                    "https://www.hlr-lookups.com/en/privacy-policy", "EU"),
            _dienst("NumVerify (apilayer)", "Telefonnummer (E.164) — NUR wenn NumVerify aktiviert",
                    "Validierung + Live-Carrier, Leitungstyp (mobile/landline), Ort",
                    "https://apilayer.com/privacy", "US"),
        ],
        "nur_links": [
            "tellows, Truecaller, sync.me, NumLookup, Facebook, LinkedIn, WhatsApp, Telegram "
            "(ausschließlich anklickbare Such-Links — es werden keine Daten automatisch gesendet)",
        ],
        "hinweis": "Die Basis-Analyse läuft vollständig LOKAL (phonenumbers-Bibliothek). "
                   "Drittdienste (hlr-lookups.com bzw. NumVerify) werden NUR kontaktiert, "
                   "wenn der jeweilige Live-Dienst aktiviert (API-Key gesetzt) ist.",
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

    "censys": {
        "beschreibung": "Host-Intel zu einer IP/Domain via Censys Platform "
                        "(Services, Standort, AS, WHOIS, Reverse-DNS).",
        "sendet_an": [
            _dienst("Censys Platform", "IP-Adresse (bzw. aufgelöste Domain) — NUR wenn Censys aktiviert",
                    "Abruf von Services/Ports, Standort, Autonomous System, "
                    "WHOIS-Organisation und Reverse-DNS",
                    "https://censys.com/privacy-policy", "US"),
            _dienst("Öffentliche DNS-Auflösung", "Domainname (falls Domain übergeben)",
                    "Auflösung zur IP", "—", "global"),
        ],
        "nur_links": [],
        "hinweis": "Censys wird NUR kontaktiert, wenn der Dienst aktiviert ist "
                   "(CENSYS_PAT gesetzt). Ohne Key erfolgt keine Abfrage.",
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
            _dienst("VirusTotal", "IP-Adresse — NUR wenn VirusTotal aktiviert",
                    "Reputations-Check (wie viele Engines die IP als schädlich melden)",
                    "https://docs.virustotal.com/docs/privacy-policy", "US"),
            _dienst("IPinfo", "IP-Adresse — NUR wenn IPinfo aktiviert",
                    "Geo (Stadt/Region/Land), Org/ASN, Firma, Abuse-Kontakt und "
                    "Anonymitäts-Flags (VPN/Proxy/Tor/Hosting)",
                    "https://ipinfo.io/privacy-policy", "US"),
        ],
        "nur_links": [],
        "speicherung": SPEICHER_HINWEIS,
    },

    "soziale-praesenz": {
        "beschreibung": "Zeichnet die öffentliche soziale Präsenz zu einem Benutzernamen "
                        "(offene Plattformen mit echten Daten + Walled Gardens nur als Link/Existenz).",
        "sendet_an": [
            _dienst("Bluesky (public.api.bsky.app)", "Benutzername (als Handle in der Abfrage)",
                    "Öffentliches Profil (Name, Bio, Follower, Avatar)",
                    "https://bsky.social/about/support/privacy-policy", "US"),
            _dienst("GitHub", "Benutzername", "Öffentliches Profil via User-API",
                    "https://docs.github.com/site-policy/privacy-policies", "US"),
            _dienst("GitLab", "Benutzername", "Öffentliches Profil via User-API",
                    "https://about.gitlab.com/privacy/", "US"),
            _dienst("Reddit", "Benutzername", "Öffentliches Profil (about.json)",
                    "https://www.reddit.com/policies/privacy-policy", "US"),
            _dienst("Mastodon (mastodon.social)", "Benutzername",
                    "Öffentliches Profil via Account-Lookup",
                    "https://mastodon.social/privacy-policy", "EU"),
            _dienst("Keybase", "Benutzername",
                    "Öffentliches Profil inkl. verifizierter verknüpfter Konten",
                    "https://keybase.io/docs/privacypolicy", "US"),
            _dienst("Hacker News (Firebase)", "Benutzername", "Öffentliches Profil (Karma, About)",
                    "https://www.ycombinator.com/legal/", "US"),
            _dienst("Dev.to", "Benutzername", "Öffentliches Profil via User-API",
                    "https://dev.to/privacy", "US"),
            _dienst("YouTube / TikTok (oEmbed)", "Benutzername (in der oEmbed-URL)",
                    "Existenz + Anzeigename via INTENDIERT öffentlichen oEmbed-Endpunkt "
                    "(kein Scraping, keine Umgehung von Schutzmechanismen)",
                    "https://policies.google.com/privacy", "US"),
            _dienst("Alle geprüften WhatsMyName-Plattformen (Breitenscan: GitHub, GitLab, "
                    "Keybase, Dev.to, Steam, Telegram, … je nach Schnell/Vollscan)",
                    "Benutzername (in der jeweiligen Profil-URL)",
                    "Existenzprüfung eines öffentlichen Profils mit diesem Namen",
                    "jeweilige Plattform-Datenschutzerklärung", "global"),
        ],
        "nur_links": [
            "X/Twitter, LinkedIn, Facebook, Instagram (Login-/Anti-Bot-Wand): es werden "
            "ausschließlich Profil-Direktlinks und Google-/Bing-Dork-Links erzeugt — "
            "es fließen KEINE Daten an diese Plattformen, bis der Nutzer selbst klickt.",
        ],
        "hinweis": "Bewusste Trennung: offene Plattformen liefern echte Profildaten über "
                   "ihre freien APIs; Walled Gardens werden NICHT gescraped, sondern nur "
                   "verlinkt bzw. (YouTube/TikTok) über öffentliche oEmbed-Endpunkte auf "
                   "Existenz geprüft. Rechtssicher & ToS-konform.",
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
