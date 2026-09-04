import type { ProjektModel, SkillModel, ZeitstrahlModel, SecurityStatModel, NavigationModel } from "./typen";

// ═══════════════════════════════════════════════════════
// MODEL: Alle Portfolio-Daten (Single Source of Truth)
// ═══════════════════════════════════════════════════════

export const NAVIGATION: NavigationModel[] = [
  { pfad: "#hero",       label: "Start",      abschnitt: "hero" },
  { pfad: "#ueber",      label: "Über mich",  abschnitt: "ueber" },
  { pfad: "#projekte",   label: "Projekte",   abschnitt: "projekte" },
  { pfad: "#security",   label: "Security",   abschnitt: "security" },
  { pfad: "#labor",      label: "Labor",      abschnitt: "labor" },
  { pfad: "#osint",      label: "OSINT Lab",  abschnitt: "osint" },
  { pfad: "#zeugnisse",  label: "Dokumente",  abschnitt: "zeugnisse" },
  { pfad: "#skills",     label: "Skills",     abschnitt: "skills" },
  { pfad: "#kontakt",    label: "Kontakt",    abschnitt: "kontakt" },
];

export const PROJEKTE: ProjektModel[] = [
  {
    titel: "Neo Dev Stack - AI-Augmented Security Workstation",
    kurzbeschreibung: "Eine selbst gebaute, KI-gesteuerte Arbeitsumgebung, die wiederkehrende Sicherheits- und Recherche-Aufgaben automatisiert: spezialisierte KI-Agenten, kostenlose lokale KI-Modelle und über 80 Werkzeuge greifen nahtlos ineinander.",
    langbeschreibung: "Der Gewinn liegt im Zusammenspiel: Ein Auftrag läuft durchgehend an einem Ort (von der ersten Recherche über die Analyse bis zum fertigen Report), statt zwischen Dutzenden Programmen zu springen. Jeder Schritt bleibt dabei nachvollziehbar dokumentiert und lässt sich jederzeit identisch wiederholen.",
    kategorie: "tooling",
    technologien: ["Claude Code", "MCP Protocol", "Ollama", "Milvus", "Docker", "tmux", "Python", "Bash", "Chrome DevTools", "Firecrawl", "Censys", "Shodan"],
    highlights: [
      "32 spezialisierte Pentest-Agenten für Recon, Web, Cloud, Mobile, Forensik und Exploit-Chaining",
      "25 angebundene MCP-Server, darunter zwei selbst gebaute (Censys-API und Caido-Bridge)",
      "11 eigene Skills und 11 Slash-Commands automatisieren die komplette Research-Pipeline",
      "Lokale KI-Inferenz über Ollama und Milvus, semantische Code-Suche über neun Codebases",
      "Eigene Status-Zeile mit Reputations-Stand und ein Hook, der vor riskanten Aktionen warnt",
      "Zentrale Funddatenbank (SQLite), die Muster über Engagements hinweg per SQL abrufbar macht",
    ],
    zeitraum: "2025 - heute",
    status: "aktiv",
  },
  {
    titel: "markmem - Selbst-lernendes KI-Gedächtnis (Open Source)",
    kurzbeschreibung: "Ein KI-Gedächtnis auf Markdown + git: es ruft semantisch ab, lernt aus Korrekturen, verdichtet sich selbst und tunt seine eigene Suche, sichtbar gemacht durch ein responsives Terminal-Dashboard (memDash). Öffentlich auf GitHub.",
    langbeschreibung: "markmem macht aus einem gewachsenen Markdown-Notizsystem ein Gedächtnis, das nichts vergisst und seine eigene Qualität misst. Der Abruf ist HybridRAG: Volltext (BM25), Wissens-Graph und semantische Vektor-Embeddings (Ollama / bge-m3) werden per gewichtetem Reciprocal Rank Fusion zusammengeführt. Markdown + git bleiben die einzige Quelle der Wahrheit. Keine schwere Vektor-Datenbank, nur SQLite + NumPy, jeder Index ist daraus neu baubar. Eine echte Lern-Schleife (Korrektur, Überraschung, Confidence-Kalibrierung, aktive Sackgassen-Hemmung) und ein Self-Tuning-Eval-Harness (misst Recall@1, optimiert die Such-Gewichte per Grid-Search) halten das System ehrlich. Fail-open im Kern (pure Python-stdlib), getestet via GitHub Actions über Python 3.11-3.13, MIT-lizenziert.",
    kategorie: "tooling",
    technologien: ["Python", "HybridRAG", "Ollama / bge-m3", "SQLite", "NumPy", "Reciprocal Rank Fusion", "Markdown", "git", "GitHub Actions", "MIT"],
    highlights: [
      "HybridRAG-Abruf: BM25 + Wissens-Graph + Vektor-Embeddings, fusioniert per gewichtetem Reciprocal Rank Fusion (plus optionalem Cross-Encoder-Rerank).",
      "Markdown + git als alleinige Quelle der Wahrheit. Keine schwere Vektor-DB, nur SQLite + NumPy; jeder Index ist jederzeit neu baubar.",
      "Echte Lern-Schleife: lernt aus stillen Korrekturen, kalibriert die eigene Zuversicht, hemmt aktiv bekannte Sackgassen.",
      "Selbst-tunend: ein Eval-Harness misst die Trefferquote (Recall@1), eine Grid-Search optimiert die Such-Gewichte automatisch.",
      "memDash: responsives Terminal-Dashboard (Mac-Querformat bis iPhone-Hochformat), Unicode-korrekt, mit Klartext-Erklärungen, auch für Laien lesbar.",
      "Zwei-Kanal-Kontext-Laden: kritische Regeln umgehen das harte Lade-Limit und werden nie abgeschnitten.",
      "Fail-open-Design, stdlib-Kern, MIT, öffentlich auf GitHub, CI grün über Python 3.11-3.13.",
    ],
    linkGithub: "https://github.com/NEO849/markmem",
    galerieSlug: "markmem",
    bilder: [
      // Echte Screenshots (iPhone über SSH)
      { quelle: "/projekte/markmem/markmem_real_0.png", titel: "Start-Animation", text: "Echter Screenshot (iPhone über SSH): der animierte Auftakt des Live-Dashboards beim Start." },
      { quelle: "/projekte/markmem/markmem_real_1.png", titel: "Live-Zustand", text: "Korpus nach Typ, Transformation, Tiers gegen das Lade-Limit und die Recall-Qualität auf einen Blick." },
      { quelle: "/projekte/markmem/markmem_real_2.png", titel: "Engine, Lern-Schicht & Verdichtung", text: "Such-Gewichte (BM25/Vektor/Entity), die Lern-Schicht und die Verdichtungs-Inbox. Die Karten-Namen sind aus Vertraulichkeitsgründen unkenntlich gemacht." },
      // Synthetischer Demo-Korpus — dieselbe Oberfläche, responsiv über drei Fensterbreiten
      { quelle: "/projekte/markmem/markmem_memdash_0.webp", titel: "Demo - Breit-Modus", text: "Synthetischer Demo-Korpus, Breit-Modus (Desktop): voller Live-Zustand mit allen Panels." },
      { quelle: "/projekte/markmem/markmem_memdash_1.webp", titel: "Demo - Mittel-Modus", text: "Dieselben Demo-Daten in kompakterem Layout für schmalere Fenster." },
      { quelle: "/projekte/markmem/markmem_memdash_2.webp", titel: "Demo - Schmal-Modus", text: "Schmal-Modus (Mobil): gestapelt, ohne Rahmen. Jede Zeile bleibt im Fenster." },
    ],
    zeitraum: "2026 - heute",
    status: "aktiv",
  },
  {
    titel: "claude-bus - Mac↔Server↔iPhone Mailbox-Bridge",
    kurzbeschreibung: "Eine sichere Brücke zwischen meinen Geräten (Mac, Server und iPhone): Aufgaben und Ergebnisse wandern verschlüsselt hin und her, mit strengen Zugriffsgrenzen und durchgehender Überwachung.",
    langbeschreibung: "In der Praxis heißt das: Ich starte eine Aufgabe unterwegs am iPhone und führe sie nahtlos am Rechner weiter. Das mobile Gerät darf dabei bewusst nur das Nötigste. Komfort geht so nicht auf Kosten der Sicherheit.",
    kategorie: "tooling",
    technologien: ["FastMCP", "Streamable HTTP", "Tailscale WireGuard", "Cloudflare Tunnel", "Cloudflare Workers", "OAuth 2.1", "PKCE", "SQLite", "systemd", "Python"],
    highlights: [
      "Zwei Ebenen: ein abgesicherter Server-Zugang für den Mac, ein getrennter fürs iPhone",
      "Selbst gebauter OAuth-2.1-Worker mit PKCE und kurzlebigen, gehashten Tokens",
      "Das iPhone darf nur an einen Empfänger senden und nur in einen festgelegten Ordner schreiben",
      "Sensible Pfade wie /etc/shadow oder SSH-Schlüssel sind fest im Code gesperrt",
      "Ein Watcher meldet ungewöhnliche Zugriffe (Off-Hours, Bursts, Fehlversuche) in Echtzeit",
      "Zugangs-Tokens rotieren automatisch jede Woche",
      "End-to-End live verifiziert: Mac → Server → iPhone",
    ],
    zeitraum: "2025 - heute",
    status: "aktiv",
  },
  {
    titel: "voice-bridge - Lokaler Whisper-Voice-Daemon mit Apple-UI",
    kurzbeschreibung: "Sprachsteuerung fürs Smartphone: Eingesprochene Aufgaben werden direkt auf dem eigenen Server (ohne Cloud-Kosten) in Text umgewandelt und landen sofort in der Arbeitssitzung. Mit einer Oberfläche auf Apple-Niveau.",
    langbeschreibung: "Der eigentliche Gewinn: Gedanken werden zum Befehl, ohne die Hände an der Tastatur, gerade bei langen oder umständlichen Anweisungen oft schneller als Tippen. Und weil alles auf eigener Hardware verarbeitet wird, bleiben die Inhalte vollständig privat.",
    kategorie: "tooling",
    technologien: ["whisper.cpp", "FastAPI", "ffmpeg", "Cloudflare Tunnel", "tmux", "Web Audio API", "AnalyserNode", "MediaRecorder", "systemd-hardening", "PWA"],
    highlights: [
      "Spracherkennung läuft lokal über whisper.cpp, mehrsprachig und ohne API-Kosten",
      "Oberfläche auf Apple-Niveau mit Live-Visualizer im Mikrofon-Orb",
      "Findet automatisch die richtige Arbeitssitzung, in die das Transkript geschrieben wird",
      "Fällt die Sitzung aus, wird gepuffert und bei Rückkehr automatisch nachgereicht",
      "Audio bleibt nur im Arbeitsspeicher und wird direkt nach der Verarbeitung gelöscht",
      "Als Dienst gehärtet, mit eingeschränkten Rechten sowie Speicher- und CPU-Limits",
      "Als App installierbar, Aufnahme startet per Leertaste",
    ],
    linkDemo: "/voice-demo",
    galerieSlug: "voice-bridge",
    bilder: [
      { quelle: "/projekte/voice-bridge/voice_sprechen.webp", titel: "Sprechen & Transkribieren", text: "Tippen, sprechen, nochmal tippen zum Senden. Der Live-Ring zeigt die Aufnahme, danach läuft die lokale Transkription." },
      { quelle: "/projekte/voice-bridge/voice_eingefuegt.webp", titel: "Direkt in Claude eingefügt", text: "Das Transkript landet sofort in der gewählten Arbeitssitzung, mit Bestätigung und Latenz-Anzeige." },
      { quelle: "/projekte/voice-bridge/voice_session.webp", titel: "Session-Routing", text: "Per Auswahl landet der Befehl in der richtigen Sitzung, mehrere Sessions parallel, eine Stimme." },
      { quelle: "/projekte/voice-bridge/voice_server.webp", titel: "Auf dem Server", text: "Die Gegenseite: Claude Code auf dem eigenen Server empfängt den eingesprochenen Befehl (Inhalt unkenntlich gemacht)." },
    ],
    zeitraum: "2025 - heute",
    status: "aktiv",
  },
  {
    titel: "bb_recon - Research OSINT-Toolkit",
    kurzbeschreibung: "Ein Recherche-Werkzeug, das öffentlich verfügbare Informationen zu einem Ziel aus über 30 Quellen in Sekunden zusammenträgt und übersichtlich aufbereitet, komplett ohne kostenpflichtige Schnittstellen.",
    langbeschreibung: "Alle Quellen laufen parallel; fällt eine aus, stört das die anderen nicht. Am Ende steht ein sauber sortiertes Gesamtbild mit einer Verlässlichkeits-Einstufung pro Fund, statt einer Handvoll verstreuter Einzeltreffer.",
    kategorie: "security",
    technologien: ["Python asyncio", "httpx[socks]", "aiosqlite", "dnspython", "rich", "Tor SOCKS5", "CommonCrawl CDX", "Wayback Machine"],
    highlights: [
      "Über 30 schlüssellose OSINT-Quellen, parallel abgefragt und ohne API-Kosten",
      "Asynchrone Architektur, rund 510 Treffer in einer Sekunde im IP-Test",
      "Optionaler Tor-Modus für anonyme Recherche bei sensiblen Zielen",
      "Speichert Funde automatisch strukturiert pro Ziel und Zeitpunkt",
      "Ergebnisse als JSON, Markdown und direkt im Terminal nutzbar",
      "Verlässlichkeits-Einstufung pro Treffer, Mehrfach-Funde zusammengeführt",
      "Ein Befehl deckt die ganze Kette ab: Domain, Subdomains und IP-Anreicherung",
    ],
    zeitraum: "2025 - heute",
    status: "aktiv",
  },
  {
    titel: "NeoRecon - Research Exploit Engine",
    kurzbeschreibung: "Eine durchgängige Pipeline für autorisierte Sicherheits-Recherche: Sie sammelt Angriffsflächen, bewertet sie automatisch und liefert am Ende eine konkrete, priorisierte Prüf-Liste, aus Hunderttausenden Adressen in Sekunden.",
    langbeschreibung: "So fließt die Zeit in die eigentliche Analyse statt ins Sortieren riesiger Datenmengen. Jeder Lauf ist wiederholbar und an jeder Stelle nachvollziehbar, was wie bewertet wurde.",
    kategorie: "security",
    technologien: ["Bash", "awk", "httpx", "Subfinder", "Amass", "ParamSpider", "gf", "Nuclei", "dalfox", "sqlmap", "GraphQL", "Brave Search API"],
    highlights: [
      "Durchgängige Pipeline in sieben Schritten, wiederaufnehmbar, überspringbar, mit Lauf-Schutz",
      "Bewertet 500.000 Adressen in 15 Sekunden anhand von zwölf Sicherheits-Kategorien",
      "Sortiert erreichbare Ziele automatisch in acht Klassen nach Prüf-Potenzial",
      "Erzeugt pro Kandidat eine kompakte Karte mit konkreten Prüfschritten",
      "Eigene GraphQL-Werkzeugkette für tiefe API-Analysen",
      "Gezielte Web-Suche nach exponierten Configs, Backups, Admin-Panels und Tokens",
      "Wählt aus mehreren Läufen automatisch den ergiebigsten aus",
      "Durchgehend in vier Phasen dokumentiert, von Setup bis Auswertung"
    ],
    zeitraum: "2025 - heute",
    status: "aktiv",
  },
  {
    titel: "Exploit Dashboard - Vulnerability Testing Interface",
    kurzbeschreibung: "Ein Browser-Dashboard, das Sicherheitstests übersichtlich und nachvollziehbar macht: priorisierte Ziele, Wiederhol-Tests per Klick und eine visuelle Darstellung verketteter Angriffspfade.",
    langbeschreibung: "Es hängt direkt an meiner Recon-Pipeline, sodass die spannendsten Ziele schon vorsortiert ankommen. Was sonst in verstreuten Terminal-Ausgaben untergeht, wird hier zu einem klaren, vergleichbaren Bild.",
    kategorie: "tooling",
    technologien: ["Node.js", "Express", "JavaScript", "Caido", "Axios", "vis-network", "HTML5"],
    highlights: [
      "Schickt Anfragen live durch den Proxy und wertet Status und Antwortlänge aus",
      "Vergleicht gegen eine saubere Baseline und markiert jede relevante Abweichung",
      "Sortiert und färbt gefundene URLs nach Typ: OAuth, Admin, Auth, API, JS",
      "Zeichnet verkettete Angriffspfade als interaktives Diagramm",
      "Schlägt passende Test-Vorlagen je nach URL-Typ vor",
      "Direkt an die Recon-Pipeline angebunden, Ziele kommen vorsortiert an",
      "Merkt sich interessante Ziele pro Sitzung",
    ],
    zeitraum: "2025 - heute",
    status: "aktiv",
  },
  {
    titel: "ONE - Multi-Agent AI Chat",
    kurzbeschreibung: "Eine iOS-App, die mehrere KI-Modelle (Claude, GPT und Gemini) in einer einzigen, aufgeräumten Oberfläche vereint.",
    langbeschreibung: "So lässt sich für jede Frage das passende Modell wählen, ohne die App zu wechseln. Unter der Oberfläche sorgt eine saubere Architektur dafür, dass Zugangsschlüssel sicher auf dem Gerät bleiben und der Stand über alle Geräte synchron ist.",
    kategorie: "development",
    technologien: ["SwiftUI", "MVVM", "Combine", "Firestore", "Keychain", "REST API"],
    highlights: [
      "Vereint Claude, GPT und Gemini in einer nativen iOS-App",
      "Zugangsschlüssel liegen sicher in der iOS-Keychain",
      "Saubere MVVM-Architektur mit klar getrennter Datenschicht",
      "Reaktive Oberfläche mit Combine und async/await"
    ],
    zeitraum: "2024 - 2025",
    status: "aktiv",
  },
  {
    titel: "Sports Almanach - Smart Betting App",
    kurzbeschreibung: "Eine iOS-App rund um Sportwetten mit Spielgeld: Ein selbst entwickelter Algorithmus errechnet Quoten aus historischen Ergebnissen und dem Austragungsort, dazu Team- und Spielervergleiche und ein Sportkalender.",
    langbeschreibung: "Aus nüchternen Zahlen werden so greifbare Einschätzungen, und weil ausschließlich mit virtuellem Guthaben getippt wird, ganz ohne finanzielles Risiko. Je mehr Ergebnisse einfließen, desto treffsicherer werden die berechneten Quoten.",
    kategorie: "development",
    technologien: ["Swift", "SwiftUI", "MVVM", "Firebase Auth", "Firestore", "Charts", "Repository Pattern"],
    highlights: [
      "Eigener Quoten-Algorithmus aus historischen Ergebnissen und Heim-/Auswärtsvorteil",
      "Wetten mit virtuellem Guthaben, Kontostand in Echtzeit",
      "Anmeldung und Cloud-Synchronisation über Firebase (Auth und Firestore)",
      "Team- und Spielervergleiche nach Form, Saison und Heim-/Auswärtsbilanz",
      "Kalender für kommende Spiele, Spieltage und persönliche Favoriten",
      "Formkurven und Trends als Diagramme mit Swift Charts",
      "Datenschicht tauscht echte und Test-Daten nahtlos aus",
    ],
    linkGithub: "https://github.com/NEO849/Sports-Almanach",
    galerieSlug: "sports-almanach",
    bilder: [
      { quelle: "/projekte/sports-almanach/sport_splash_0.webp",        titel: "Splash",           text: "Einstieg ins Sports-Almanach-Universum." },
      { quelle: "/projekte/sports-almanach/sport_login_1.webp",         titel: "Login",            text: "Sicherer Einstieg über Firebase Authentication." },
      { quelle: "/projekte/sports-almanach/sport_register_2.webp",      titel: "Registrierung",    text: "Konto anlegen mit Cloud-Synchronisation." },
      { quelle: "/projekte/sports-almanach/sport_home_3.webp",          titel: "Home",             text: "Kontostand und Übersicht in Echtzeit." },
      { quelle: "/projekte/sports-almanach/sport_events_4.webp",        titel: "Spielplan",        text: "Kommende Events, Spieltage und Favoriten." },
      { quelle: "/projekte/sports-almanach/sport_events_detail_5.webp", titel: "Event-Detail",     text: "Team-Vergleich und berechnete Quoten." },
      { quelle: "/projekte/sports-almanach/sport_bet_6.webp",           titel: "Wette platzieren", text: "Tipp abgeben mit virtuellem Guthaben." },
      { quelle: "/projekte/sports-almanach/sport_betSlip_7.webp",       titel: "Wettschein",       text: "Alle laufenden Tipps auf einen Blick." },
      { quelle: "/projekte/sports-almanach/sport_historie_8.webp",      titel: "Historie",         text: "Formkurven und Trends als Swift Charts." },
    ],
    zeitraum: "2024 - 2025",
  },
  {
    titel: "Z Almanach - Dragon Ball Z Kompendium",
    kurzbeschreibung: "Eine Android-App als Nachschlagewerk zum Dragon-Ball-Z-Universum: Charaktere, Verwandlungsstufen und Fraktionen im Retro-Arcade-Look. Die Daten werden automatisch ins Deutsche übersetzt.",
    langbeschreibung: "Das Besondere steckt in der Datenpipeline: Die Inhalte stammen aus einer rein spanischsprachigen Quelle und werden im Hintergrund automatisch übersetzt, bevor sie erscheinen. So ist das ganze Universum auf Deutsch durchsuchbar, ohne dass jemand manuell nachhelfen müsste.",
    kategorie: "development",
    technologien: ["Kotlin", "Android SDK", "REST API", "RecyclerView", "SharedPreferences", "Repository Pattern", "ViewHolder Pattern", "XML Layouts"],
    highlights: [
      "Das komplette DBZ-Universum: Charaktere, Verwandlungsstufen, Fraktionen und Planeten",
      "Übersetzt Inhalte automatisch aus einer spanischen Quelle ins Deutsche",
      "Retro-Arcade-Design im Stil klassischer Street-Fighter-Automaten",
      "Datenzugriff, Oberfläche und Logik sauber voneinander getrennt",
      "Flüssige Listen auch bei sehr vielen Einträgen",
      "Merkt sich Einstellungen und Zustand zwischen App-Starts",
    ],
    linkGithub: "https://github.com/NEO849/ZAlmanach",
    galerieSlug: "z-almanach",
    bilder: [
      { quelle: "/projekte/z-almanach/01-splash.webp",    titel: "Splash",    text: "Retro-Arcade-Einstieg ins DBZ-Universum." },
      { quelle: "/projekte/z-almanach/00-login.webp",     titel: "Login",     text: "Anmeldung im Retro-Arcade-Look." },
      { quelle: "/projekte/z-almanach/02-home.webp",      titel: "Home",      text: "Charaktere und Fraktionen im Überblick." },
      { quelle: "/projekte/z-almanach/03-explore.webp",   titel: "Explore",   text: "Das ganze Universum durchstöbern." },
      { quelle: "/projekte/z-almanach/04-detail.webp",    titel: "Detail",    text: "Werte, Verwandlungsstufen und Fraktion." },
      { quelle: "/projekte/z-almanach/05-favorites.webp", titel: "Favoriten", text: "Persönliche Sammlung, lokal gemerkt." },
      { quelle: "/projekte/z-almanach/06-search.webp",    titel: "Suche",     text: "Volltextsuche über alle Einträge." },
      { quelle: "/projekte/z-almanach/07-play.webp",      titel: "Arcade",    text: "Spielerische Interaktion im Retro-Look." },
    ],
    zeitraum: "2023",
    status: "abgeschlossen",
  },
  {
    titel: "OSINT Toolkit - Modulares Analyse-Framework",
    kurzbeschreibung: "Ein modulares Recherche-Tool mit sieben Bausteinen (E-Mail, Benutzername, Telefon, Domain, Bildersuche und mehr), das öffentliche Online-Spuren strukturiert auswertet und als Report ausgibt.",
    langbeschreibung: "Statt sieben Programme nacheinander zu bedienen, laufen alle Bausteine über eine Oberfläche zusammen. Jede Analyse wird am Ende automatisch dokumentiert, als Text- und JSON-Datei, direkt weiterverwendbar.",
    kategorie: "security",
    technologien: ["Python", "holehe", "sherlock", "phoneinfoga", "LeakCheck API", "NumVerify API", "EXIF", "Selenium"],
    highlights: [
      "Sieben Module unter einer einheitlichen Architektur",
      "Bindet mehrere Daten-APIs für automatische Abfragen ein",
      "Bildersuche mit Hash, Varianten, EXIF-Auswertung und HTML-Report",
      "Automatische Leak-Prüfung für E-Mail und Telefonnummer",
      "Strukturierte Reports als TXT und JSON, je mit Bewertung",
      "Plattform-Treffer gruppiert nach Social Media, Gaming, Dev und mehr"
    ],
    zeitraum: "2025 - heute",
    status: "aktiv",
  },
];

// ═══════════════════════════════════════════════════════
// PIPELINE-ARCHITEKTUR (für die Security-Sektion)
// ═══════════════════════════════════════════════════════

export interface PipelineSchritt {
  readonly nummer: number;
  readonly name: string;
  readonly skript: string;
  readonly beschreibung: string;
  readonly output: string;
}

export const PIPELINE_SCHRITTE: PipelineSchritt[] = [
  { nummer: 1, name: "Scope Recon",        skript: "run_scope_full_pipeline.sh",       beschreibung: "Subdomains, URLs, JS-Dateien, Parameter",            output: "subdomains/, alive/, urls/, js/, params/" },
  { nummer: 2, name: "Post-Pipeline",      skript: "run_post_pipeline.sh",             beschreibung: "XSS, 403-Bypass, JS-Deep-Dive, Cache, GraphQL, CVE", output: "Nuclei-Results, gf-Pattern-Matches" },
  { nummer: 3, name: "Merge Best Recon",   skript: "merge_best_recon.sh",              beschreibung: "Alle Runs zusammenführen, neue Funde erkennen",       output: "best_recon_run/ mit Delta-Analyse" },
  { nummer: 4, name: "Hunt Sheet",         skript: "after_merge_build_hunt_sheet.sh",  beschreibung: "Focus5-Karten, Test-Playbook, priorisierte Targets",  output: "focus5.tsv, test_playbook.tsv" },
  { nummer: 5, name: "SQLi Test",          skript: "after_merge_sqli_test.sh",         beschreibung: "Error-Based SQL Injection + sqlmap Validierung",      output: "sqlmap_results/" },
  { nummer: 6, name: "SSRF + Redirect",    skript: "after_merge_ssrf_redirect_test.sh",beschreibung: "SSRF-Payloads + Open Redirect Bestätigung",           output: "ssrf_payload.txt, redirect_confirmed.txt" },
  { nummer: 7, name: "Finaler Check",      skript: "after_merge_check_results.sh",     beschreibung: "Vollständigkeits-Check aller Ergebnisdateien",        output: "Statusbericht" },
];

export interface ScoringKategorie {
  readonly name: string;
  readonly score: number;
  readonly grund: string;
}

export const SCORING_KATEGORIEN: ScoringKategorie[] = [
  { name: "REDIRECT_PARAM",  score: 10, grund: "Open Redirect / SSRF / OAuth-Theft" },
  { name: "OAUTH_FLOW",      score: 9,  grund: "Token-Theft, State-Fixation" },
  { name: "SSO_SAML",        score: 8,  grund: "SAML-Injection, IdP-Spoofing" },
  { name: "GRAPHQL",         score: 8,  grund: "BOLA, Schema-Exposition" },
  { name: "ADMIN_DEBUG",     score: 7,  grund: "Exposition, Info-Leak" },
  { name: "AUTH_FLOW",       score: 7,  grund: "Session-Logik, Recovery-Tokens" },
  { name: "FILE_OPS",        score: 6,  grund: "Path Traversal, SSRF via Import" },
  { name: "API_VERSIONED",   score: 6,  grund: "Version-Bypass, fehlende Auth" },
  { name: "WEBHOOK",         score: 5,  grund: "SSRF, Replay, Signatur-Bypass" },
  { name: "API_DOC",         score: 5,  grund: "Vergessene Endpunkte" },
  { name: "CLOUD_STORAGE",   score: 4,  grund: "Öffentliche Buckets, CORS" },
  { name: "API_GENERIC",     score: 3,  grund: "Allgemeine API-Fläche" },
];

export const ASSET_TIERS = [
  { tier: "Tier 1", klassen: ["Payment/Purchase", "Auth/OAuth/SSO", "API/GraphQL", "Admin/Internal"], prioritaet: "KRITISCH" },
  { tier: "Tier 2", klassen: ["Upload/Export", "Search/Query", "User/Profile"], prioritaet: "MITTEL" },
  { tier: "Tier 3", klassen: ["Sonstige Live-Hosts"], prioritaet: "NIEDRIG" },
];

// ═══════════════════════════════════════════════════════
// SECURITY STATS & AKTIVITÄTEN
// ═══════════════════════════════════════════════════════

export const SECURITY_STATS: SecurityStatModel[] = [
  { label: "Plattformen",         wert: "5",       icon: "🎯" },
  { label: "Aktive Targets",      wert: "5",       icon: "🔍" },
  { label: "Pipeline-Skripte",    wert: "30+",     icon: "⚙️" },
  { label: "Custom Tools",        wert: "13",      icon: "🛠️" },
  { label: "Scoring-Kategorien",  wert: "12",      icon: "📊" },
  { label: "Hard-Gates pro Submit", wert: "12",    icon: "🛡️" },
  { label: "VPS Infrastruktur",   wert: "Hardened", icon: "🖥️" },
  { label: "GraphQL-Tools",       wert: "5",       icon: "🔗" },
];

// ═══════════════════════════════════════════════════════
// HERO STATS (Senior-Elite Highlights, fürs Labor-Banner)
// Zentrale Wahrheit; HeroView + LaborView lesen daraus.
// ═══════════════════════════════════════════════════════

export const SYSTEM_STATS: SecurityStatModel[] = [
  { label: "MCP-Server",         wert: "22",  icon: "⚡" },
  { label: "Pentest-Agents",     wert: "32",  icon: "🤖" },
  { label: "Custom Skills",      wert: "11",  icon: "✦" },
  { label: "Slash-Commands",     wert: "11",  icon: "/" },
  { label: "Lifecycle-Hooks",    wert: "3",   icon: "⊕" },
  { label: "Memory-Tiers",       wert: "5",   icon: "◆" },
  { label: "systemd Workflows",  wert: "12",  icon: "⟳" },
  { label: "OSINT-Quellen",      wert: "30+", icon: "🛰" },
];

export const TOOLS_STACK = [
  // Eigene Tools auf dem VPS
  { name: "Recon-Search-Assistant", rolle: "Custom OSINT-Suchtool mit API-Integration", kategorie: "eigenbau", beschreibung: "Aggregiert Ergebnisse aus Shodan, Censys, VirusTotal und weiteren APIs in einer einzigen Abfrage. Automatische Deduplizierung, Rate-Limiting und strukturierter JSON-Output für die Pipeline-Integration." },
  { name: "GraphQLer",            rolle: "Automatisierte GraphQL-Schema-Analyse", kategorie: "eigenbau", beschreibung: "Führt vollständige Introspection durch, erkennt deprecated Fields und generiert automatisch testbare Queries für alle Mutations. Output wird direkt in den Scoring-Algorithmus eingespeist." },
  { name: "graphql-cop",          rolle: "GraphQL Security Policy Checker", kategorie: "eigenbau", beschreibung: "Prüft Endpoints auf Batching, Query Depth, Introspection, Field Suggestions und weitere Policy-Schwachstellen. Liefert strukturierte Befunde mit CVSS-Einschätzung." },
  { name: "graphw00f",            rolle: "GraphQL Engine Fingerprinting", kategorie: "eigenbau", beschreibung: "Identifiziert die eingesetzte GraphQL-Engine (Apollo, Hasura, Shopify, etc.) anhand von Fehlermustern und Response-Charakteristika, ohne Introspection zu benötigen." },
  { name: "graphql-mcp-server",   rolle: "MCP-Integration für GraphQL-Testing", kategorie: "eigenbau", beschreibung: "Bindet GraphQL-Endpoints als MCP-Tools ein, sodass Claude direkt Schema, Queries und Mutations interaktiv analysieren kann. Beschleunigt die manuelle Review-Phase erheblich." },
  { name: "clairvoyance",         rolle: "GraphQL Schema-Rekonstruktion ohne Introspection", kategorie: "eigenbau", beschreibung: "Rekonstruiert das vollständige Schema durch Wortlisten-basiertes Field-Guessing, auch wenn Introspection deaktiviert ist. Essentiell für härtere Targets mit Production-Restrictions." },
  { name: "SSTImap",              rolle: "Server-Side Template Injection Scanner", kategorie: "eigenbau", beschreibung: "Testet Parameter automatisch auf SSTI in Jinja2, Twig, Freemarker und weiteren Engines. Payloads werden dynamisch angepasst und mit Blind-Detection-Technik kombiniert." },
  { name: "confused",             rolle: "Dependency Confusion Checker", kategorie: "eigenbau", beschreibung: "Analysiert package.json, requirements.txt und andere Manifest-Dateien auf interne Package-Namen, die im öffentlichen Registry nicht registriert sind, potenzielle Dependency-Confusion-Targets." },
  { name: "FavFreak",             rolle: "Favicon-basierte Technologie-Erkennung", kategorie: "eigenbau", beschreibung: "Berechnet MurmurHash-Werte von Favicons und matched gegen eine Datenbank bekannter Technologien und Produkte. Effektiv für die Asset-Discovery versteckter Subdomains und interner Services." },
  { name: "LinkFinder",           rolle: "JavaScript Endpoint Extraktion", kategorie: "eigenbau", beschreibung: "Extrahiert Endpoints, Pfade und Parameter direkt aus minifiziertem JavaScript. Analysiert auch dynamisch geladene Bundles und identifiziert undokumentierte API-Routen." },
  // Integrierte Tools
  { name: "Caido",               rolle: "Traffic Interception & Analyse", kategorie: "proxy", beschreibung: "Moderner Proxy mit Replay-, Automate- und Match-&-Replace-Features. Wird für manuelle Request-Analyse, Auth-Flow-Testing und gezielte Payload-Injection eingesetzt." },
  { name: "Chrome DevTools MCP",  rolle: "Authentifizierte Browser-Automation", kategorie: "automation", beschreibung: "Steuert Chrome über das DevTools Protocol direkt aus Claude heraus. Ermöglicht authentifizierte Session-Tests, DOM-Inspection und JavaScript-Execution im Kontext eingeloggter User." },
  { name: "httpx",               rolle: "Live-Host-Discovery & Tech-Detect", kategorie: "recon", beschreibung: "Validiert Subdomain-Listen auf erreichbare Hosts, erkennt Web-Technologien, Status-Codes und Security-Header in einem einzigen Durchlauf. Massenfähig mit Rate-Control." },
  { name: "Subfinder + Amass",   rolle: "Subdomain Enumeration", kategorie: "recon", beschreibung: "Kombinierter Einsatz für passive und aktive Subdomain-Discovery. Subfinder aggregiert Certificate-Transparency und APIs, Amass ergänzt durch aktive DNS-Bruteforce und Graph-Analyse." },
  { name: "ParamSpider + gf",    rolle: "Parameter-Discovery & Pattern-Matching", kategorie: "recon", beschreibung: "ParamSpider extrahiert URL-Parameter aus Wayback Machine und Common Crawl. gf filtert anschließend nach bekannten Vuln-Patterns wie SSRF, Open Redirect, SQLi und XSS." },
  { name: "xnLinkFinder",        rolle: "Deep Link & Parameter Extraktion", kategorie: "recon", beschreibung: "Crawlt Responses rekursiv auf verlinkte Endpoints und eingebettete Parameter. Besonders effektiv bei Single-Page-Anwendungen mit dynamisch generiertem Markup." },
  { name: "Nuclei",              rolle: "CVE-Scanning & Custom Templates", kategorie: "scanner", beschreibung: "Template-basierter Scanner mit über 9.000 Community-Templates. Im Pipeline-Einsatz mit eigenen Custom-Templates für target-spezifische Checks und Auth-Bypass-Pattern." },
  { name: "dalfox",              rolle: "Blind/DOM XSS Detection", kategorie: "scanner", beschreibung: "Spezialisierter XSS-Scanner mit Blind-Callback-Support über eigenen OOB-Server. Erkennt DOM-basierte, Reflected und Stored XSS mit Context-Awareness für verschiedene Render-Umgebungen." },
  { name: "Brave Search API",    rolle: "Automatisiertes Dorking (24 Kategorien)", kategorie: "osint", beschreibung: "Führt strukturiertes Dorking über die Brave Search API durch: 24 vordefinierte Kategorien (ENV Files, Config Files, Admin-Panels, Tokens, AWS Keys, Swagger, S3 Buckets, JS-Source-Maps u.a.), vollautomatisch pro Target via intel_dork_api_to_pipeline.sh." },
  { name: "Docker/Kali",         rolle: "Isolierte Testumgebung auf VPS", kategorie: "infrastructure", beschreibung: "Alle Tests laufen in dedizierten Docker-Containern auf einem gehärteten VPS. Kali Linux als Basis sichert vollständige Tool-Verfügbarkeit bei gleichzeitiger Isolation vom Host-System." },
];

// ═══════════════════════════════════════════════════════
// SKILLS
// ═══════════════════════════════════════════════════════

export const SKILLS: SkillModel[] = [
  { name: "Web Application Security",  level: 3, kategorie: "security" },
  { name: "OWASP Top 10",              level: 4, kategorie: "security" },
  { name: "Vulnerability Research",    level: 3, kategorie: "security" },
  { name: "OSINT / Reconnaissance",    level: 4, kategorie: "security" },
  { name: "OAuth / Auth Flow Testing", level: 3, kategorie: "security" },
  { name: "API Security (REST/GraphQL)", level: 3, kategorie: "security" },
  { name: "Scoring-Algorithmen",       level: 4, kategorie: "security" },

  { name: "Swift / SwiftUI",           level: 4, kategorie: "development" },
  { name: "MVVM Architecture",         level: 4, kategorie: "development" },
  { name: "React / TypeScript",        level: 3, kategorie: "development" },
  { name: "Bash / Shell Scripting",    level: 5, kategorie: "development" },
  { name: "Python",                    level: 3, kategorie: "development" },
  { name: "awk / sed / Textverarbeitung", level: 4, kategorie: "development" },
  { name: "Git / GitHub",              level: 4, kategorie: "development" },

  { name: "Linux Server Administration", level: 4, kategorie: "infrastructure" },
  { name: "Docker / Containerisierung",  level: 3, kategorie: "infrastructure" },
  { name: "VPS Hardening",              level: 3, kategorie: "infrastructure" },
  { name: "Netzwerk-Infrastruktur",     level: 4, kategorie: "infrastructure" },

  { name: "Caido / Burp Suite",        level: 3, kategorie: "tools" },
  { name: "Nuclei / ffuf / httpx",     level: 3, kategorie: "tools" },
  { name: "Chrome DevTools MCP",       level: 4, kategorie: "tools" },
  { name: "Xcode / iOS Toolchain",     level: 4, kategorie: "tools" },
];

// ═══════════════════════════════════════════════════════
// ZEITSTRAHL
// ═══════════════════════════════════════════════════════

export const ZEITSTRAHL: ZeitstrahlModel[] = [
  {
    jahr: "1999-2014",
    titel: "Elektroinstallateur - Ausbildung & Berufspraxis",
    beschreibung: "Gesellenbrief 2003 (HWK Niederbayern-Oberpfalz), vier Jahre Ausbildung bei Fa. Freise in Deggendorf. Danach über ein Jahrzehnt Praxis in Elektronik-, Netzwerk-, Server-, Telefon- und Videoanlagen, oft in leitender Rolle. Hier entstand das Fundament: Fehleranalyse, saubere Dokumentation und Systemdenken.",
    kategorie: "beruf",
    modulTitel: "Projekte & Referenzen",
    module: [
      { name: "Wohnbaugenossenschaft", skills: ["Projektleitung", "2 Wohnblöcke", "12 + 9 Wohnungen", "Komplett-Installation", "Inbetriebnahme"] },
      { name: "Pharmaunternehmen",     skills: ["Rechenzentren", "Planung & Verkabelung", "Patchen", "Spleißen"] },
      { name: "DECT-Großsysteme",      skills: ["Projektleitung", "Bayerns größtes DECT-System", "Funkzellen-Planung", "Basisstationen"] },
      { name: "Vernetzte Infrastruktur", skills: ["Deutsche Telekom", "Siemens", "E.ON Energie", "Schwachstrom"] },
    ],
  },
  {
    jahr: "2014-2018",
    titel: "Teamführung & interdisziplinäre Praxis",
    beschreibung: "Als Teil eines interdisziplinären Teams begleitete ich schwer erziehbare Jugendliche in der Arbeitstherapie an der Fachklinik Kompass Hof in Mindelheim. Kommunikation auf Augenhöhe, Konfliktlösung und ruhiges Handeln in anspruchsvollen Situationen, Qualitäten, die meine Arbeitsweise bis heute prägen.",
    kategorie: "teamarbeit",
    modulTitel: "Aufgaben & Verantwortung",
    module: [
      { name: "Arbeitstherapie",            skills: ["Aufnahmegespräche", "Projektarbeit mit Klienten", "Gruppensitzungen"] },
      { name: "Reha-Dokumentation",         skills: ["KTL-Leistungen", "Berichte für die DRV"] },
      { name: "Qualität & Arbeitssicherheit", skills: ["QM-Beauftragter (QMB)", "Sicherheitsbeauftragter"] },
      { name: "Weiterbildung",              skills: ["Gruppendynamik", "Konfliktlösung", "Psychologische Grundlagen"] },
    ],
  },
  {
    jahr: "2020-heute",
    titel: "Linux, VPS & Infrastruktur",
    beschreibung: "Aufbau und Betrieb gehärteter Linux-Systeme, als Fundament für alles Weitere. Auf dieser selbst administrierten Infrastruktur laufen heute sämtliche Security-, Recon- und KI-Aufgaben, reproduzierbar und abgesichert.",
    kategorie: "infrastruktur",
    modulTitel: "Stack & Schwerpunkte",
    module: [
      { name: "System & Härtung", skills: ["VPS", "SSH-Hardening", "UFW", "fail2ban", "Docker", "tmux"] },
      { name: "Betrieb",          skills: ["Reverse-Proxy", "TLS", "Backups", "Monitoring"] },
      { name: "Automatisierung",  skills: ["Reproduzierbare Setups", "systemd-Timer", "Deploy-Skripte"] },
    ],
  },
  {
    jahr: "2023-2024",
    titel: "Umschulung App-Entwicklung - Syntax Institut",
    beschreibung: "Geförderte Umschulung zur IT-Fachkraft für App-Entwicklung (iOS & Android): 2.300 Unterrichtseinheiten, CERTQUA-zertifiziert nach DIN EN ISO 9001. Der strukturierte Einstieg in moderne Software-Entwicklung.",
    kategorie: "bildung",
    modulTitel: "Module der Ausbildung",
    module: [
      { name: "Mobile UX/UI-Design",   skills: ["Figma", "User Flows", "Prototyping", "iOS HIG"] },
      { name: "Programmier-Grundlagen", skills: ["OOP", "Datenstrukturen", "Git & GitHub"] },
      { name: "Android-Entwicklung",   skills: ["Kotlin", "Android Studio", "Retrofit", "Room", "Coroutines"] },
      { name: "iOS-Entwicklung",       skills: ["Swift", "SwiftUI", "Core Data", "Firebase"] },
    ],
  },
  {
    jahr: "2024-2025",
    titel: "Native Apps & Software-Architektur",
    beschreibung: "Drei native Apps von Grund auf gebaut, von der Architektur bis zum lauffähigen Stand. Aus Gelerntem wurde gelebte Praxis: saubere Schichtentrennung, reaktive Datenflüsse und wartbarer Code.",
    kategorie: "entwicklung",
    modulTitel: "Projekte",
    module: [
      { name: "ONE · iOS",            skills: ["SwiftUI", "MVVM", "Multi-Modell (Claude/GPT/Gemini)", "Keychain"] },
      { name: "Sports Almanach · iOS", skills: ["Quoten-Algorithmus", "Firebase", "Swift Charts", "Service-Layer"] },
      { name: "Z Almanach · Android", skills: ["Kotlin", "Dual-API-Pipeline", "Repository Pattern"] },
    ],
  },
  {
    jahr: "2025-heute",
    titel: "Security Research",
    beschreibung: "Autorisierte Security-Forschung auf HackerOne und Intigriti, mit bestätigten Schwachstellen. Im Zentrum steht eine selbst gebaute Recon- und Analyse-Pipeline, die Aufklärung, Bewertung und Nachweis zusammenführt.",
    kategorie: "security",
    modulTitel: "Findings & Methodik",
    module: [
      { name: "Bestätigte Befunde",   skills: ["OAuth CSRF", "GraphQL Request Batching", "Open Redirect"] },
      { name: "Eigene Recon-Pipeline", skills: ["30+ Skripte", "awk-Scoring · 500k URLs/15 s", "12 Kategorien", "Caido-Proxy"] },
    ],
  },
  {
    jahr: "2025-heute",
    titel: "KI-Stack, Agenten & Automatisierung",
    beschreibung: "Eine selbst gebaute, KI-gestützte Arbeitsumgebung, die Recherche und Analyse weitgehend automatisiert. Spezialisierte Agenten, lokale Modelle und eigene Pipelines greifen zu einem reproduzierbaren Ablauf zusammen.",
    kategorie: "eigenbau",
    modulTitel: "Bausteine",
    module: [
      { name: "Agenten & Modelle",     skills: ["32 Pentest-Agenten", "Claude Code", "Ollama + Milvus", "Code-Suche über 9 Codebases"] },
      { name: "Angebundene Dienste",   skills: ["15+ MCP-Server", "GitHub", "Chrome DevTools", "Firecrawl"] },
      { name: "Eigene Engines",        skills: ["NeoRecon · 7-Phasen", "Exploit Dashboard"] },
    ],
  },
];

// ═══════════════════════════════════════════════════════
// PERSÖNLICHE DATEN
// ═══════════════════════════════════════════════════════

export const PERSOENLICH = {
  name: "Michael Fleps",
  firma: "FREE DATA Solutions",
  standort: "Nürnberg, Bayern",
  titel: "AI-Automation & Integration Engineer",
  untertitel: "KI-Automation • App-Entwicklung • Infrastruktur • Security",
  firmaTagline: "Produktive KI-Systeme, gehärtete Infrastruktur, Security mit Angreifer-Blick, selbst gebaut und betrieben.",
  kurzvorstellung: "Ich baue Software und Automatisierung, die Arbeit abnimmt, und betreibe sie auf einer Infrastruktur, die ich selbst absichere und am Laufen halte. Vom KI-gestützten Workflow bis zum gehärteten Server: keine Demos, sondern Systeme, auf die im Alltag Verlass ist.",
  email: "michael_fleps@aol.com",
  telefon: "+49 172 572 5081",
  telefonLink: "+491725725081",
  adresse: "Nürnberg, Bayern",
  github: "https://github.com/NEO849",
  hackerone: "https://hackerone.com/luicypher_neo",
  intigriti: "https://app.intigriti.com/researcher/profile/cypherneo",
};

// ═══════════════════════════════════════════════════════
// LEISTUNGEN — kundenorientiert (Was Sie davon haben)
// Treibt die Leistungen-Sektion auf der Startseite.
// ═══════════════════════════════════════════════════════

export interface LeistungModel {
  readonly titel: string;
  readonly nutzen: string;
  readonly leistungen: readonly string[];
  readonly ergebnis: string;
  readonly farbeRgb: string;
  readonly akzentHex: string;
}

export const LEISTUNGEN: LeistungModel[] = [
  {
    titel: "KI-Automation & Integration",
    nutzen: "Wiederkehrende Aufgaben übernehmen Agenten und saubere Schnittstellen, angebunden an die Werkzeuge, die Sie ohnehin nutzen.",
    leistungen: [
      "Workflow-Automation mit n8n, APIs und eigenen Skripten",
      "Sprachmodelle & Agenten, mit klaren Grenzen und Kontrolle",
      "Wissensbasis-Suche (RAG), auf Wunsch komplett auf Ihrem Server",
    ],
    ergebnis: "Weniger Handarbeit, schnellere Abläufe, weniger Fehler.",
    farbeRgb: "79, 124, 251",
    akzentHex: "#7aa2ff",
  },
  {
    titel: "Linux & Infrastruktur",
    nutzen: "Server, die nicht nur eingerichtet, sondern verlässlich betrieben werden, abgesichert und wartbar.",
    leistungen: [
      "Gehärtete Linux- und Docker-Umgebungen (Firewall, Fail2ban, SSH)",
      "Reverse-Proxy, Verschlüsselung, Backups und Monitoring",
      "Automatisierung und saubere, wiederholbare Deployments",
    ],
    ergebnis: "Eine Basis, die läuft, und die man nachts nicht im Kopf hat.",
    farbeRgb: "56, 189, 248",
    akzentHex: "#38bdf8",
  },
  {
    titel: "Security-Reviews",
    nutzen: "Ein Blick aus der Angreifer-Perspektive auf Ihre Anwendung, bevor es jemand anderes versucht.",
    leistungen: [
      "Prüfung von Web-Apps und APIs auf reale Schwachstellen",
      "Nachvollziehbare Befunde statt anonymer Scanner-Listen",
      "Konkrete Handlungsempfehlung und Nachkontrolle nach dem Fix",
    ],
    ergebnis: "Sicherheit, die man versteht und belegen kann.",
    farbeRgb: "148, 163, 184",
    akzentHex: "#94a3b8",
  },
  {
    titel: "Sichere App-Entwicklung",
    nutzen: "Native iOS-Apps, von jemandem entwickelt, der Apps und APIs beruflich auch auf Schwachstellen prüft. So ist Sicherheit von Anfang an eingebaut, nicht nachträglich aufgesetzt.",
    leistungen: [
      "iOS-Entwicklung in Swift & SwiftUI, saubere MVVM-Architektur",
      "Auth- und API-Anbindung, Sicherheit von Anfang an mitgedacht",
      "Anbindung an KI-Funktionen und bestehende Backends",
    ],
    ergebnis: "Apps, die gut aussehen, und auch unter Druck halten.",
    farbeRgb: "52, 211, 153",
    akzentHex: "#34d399",
  },
];

// ═══════════════════════════════════════════════════════════════════
// SENIOR-ELITE LABOR — Daten für die /labor-Seite
// Single Source of Truth — keine Daten doppelt zu SecurityView.
// ═══════════════════════════════════════════════════════════════════

import type {
  MemoryTierModel,
  McpKategorieModel,
  AutoWorkflowModel,
  SlashCommandModel,
  CustomSkillModel,
  HardGateModel,
} from "./typen";

// Memory v2 — 5-Tier-Architektur (MemGPT-inspiriert)
export const MEMORY_TIERS: MemoryTierModel[] = [
  {
    tier: "Core",
    ort: "MEMORY.md",
    loaded: "bei jedem Turn",
    lifecycle: "hand-kuratiert, ≤ 195 Zeilen",
    anzahl: "1 Datei",
    farbeRgb: "122, 162, 255",
    bedeutung: "Die Inhaltsverzeichnis-Datei, die bei jeder neuen Anfrage automatisch mitgeladen wird. Verweist auf alles andere. Bewusst klein gehalten, was hier oben steht, sieht das Sprachmodell zuerst.",
  },
  {
    tier: "Deep",
    ort: "MEMORY_DEEP.md",
    loaded: "bei Bedarf",
    lifecycle: "abgeschlossene Themen",
    anzahl: "1 Datei",
    farbeRgb: "138, 160, 200",
    bedeutung: "Themen, die ich nicht in jeder Session brauche (z.B. abgeschlossene Research-Targets oder alte iOS-Notizen). Wird nur geladen wenn ich explizit darauf zeige. Spart ca. 875 Tokens pro Session.",
  },
  {
    tier: "Archival",
    ort: "feedback_* · project_* · reference_*",
    loaded: "wenn verlinkt",
    lifecycle: "Frontmatter mit Wichtigkeit, Vertrauen, Verifizierungs-Datum",
    anzahl: "~ 161 Dateien",
    farbeRgb: "167, 139, 250",
    bedeutung: "Das eigentliche Gedächtnis. Eine Datei pro Lektion oder Konzept. Jede Datei hat Metadaten: wie wichtig, wie sicher, wann zuletzt geprüft. Wird nur geladen wenn ein anderes Dokument auf sie verweist (Wiki-Link-Prinzip).",
  },
  {
    tier: "Recall",
    ort: "sessions/YYYY-MM-DD-<id>.md",
    loaded: "auf Anfrage",
    lifecycle: "90 Tage greifbar, danach archiviert",
    anzahl: "automatisch erzeugt",
    farbeRgb: "34, 197, 94",
    bedeutung: "Eine kurze Zusammenfassung jeder Session, automatisch geschrieben am Ende vom Session-Hook. Dadurch kann ich später nachvollziehen wann wir was besprochen haben, ohne die ganze Konversation noch einmal zu lesen.",
  },
  {
    tier: "Staging",
    ort: "inbox/pending · surprises · contradictions",
    loaded: "nur über /memory-review",
    lifecycle: "Sammelplatz, niemals direkt produktiv",
    anzahl: "von Hooks gefüttert",
    farbeRgb: "245, 158, 11",
    bedeutung: "Hier landen automatisch Beobachtungen aus Sessions: Korrekturen, Überraschungen, Widersprüche. Sie werden niemals direkt zu Memory befördert: ich gehe sie regelmäßig durch und entscheide pro Eintrag selbst, was übernommen wird. Schutz vor halluzinierten Memories.",
  },
];

// MCP-Arsenal — 22 verbundene MCPs in 4 fokussierten Kategorien.
// Jede Kategorie hat eine Farbe als visuelles Anker — kein Emoji,
// stattdessen ein farbiger Dot (konsistent zu Memory-Tier-Pills
// und zu den Section-Headings im Workflow-Tab).
export const MCP_KATEGORIEN: McpKategorieModel[] = [
  {
    kategorie: "Recon & Intel",
    icon: "",
    farbeRgb: "138, 160, 200",
    beschreibung: "Asset-Discovery, CVE-Lookup, Pattern-Recall (vor jeder Hunt-Phase)",
    mcps: [
      { name: "censys",       rolle: "Platform-API v3 (Eigenbau, 6 Tools)", eigenbau: true },
      { name: "shodan",       rolle: "Host-Info, CVE-DB, CPE-Lookup (~20 Tools)" },
      { name: "exa",          rolle: "Neural Search (1000 free/Monat)" },
      { name: "brave-search", rolle: "Web + Local Search" },
      { name: "firecrawl",    rolle: "JS-Render, Crawl, Monitor, Browser-Control" },
      { name: "fetch",        rolle: "Raw HTTP (Header-Diff, Status-Codes)" },
    ],
  },
  {
    kategorie: "Reasoning & Memory",
    icon: "",
    farbeRgb: "167, 139, 250",
    beschreibung: "Multi-Step-Hypothesen, Cross-Target-Pattern, Code-Suche",
    mcps: [
      { name: "sequential-thinking", rolle: "Strukturiertes Multi-Step-Reasoning" },
      { name: "memory-graph",        rolle: "Cross-Target Entity-Pattern (graph.json)" },
      { name: "findings-db",         rolle: "SQL gegen /root/.pentest-ai/findings.db (8 Tables)" },
      { name: "claude-context",      rolle: "Semantische Code-Suche (Ollama + Milvus, lokal)" },
      { name: "serena",              rolle: "Symbol-Level Refactoring (find_symbol, references)" },
    ],
  },
  {
    kategorie: "Web · App · Mobile",
    icon: "",
    farbeRgb: "79, 124, 251",
    beschreibung: "Live-Browser, Caido-Bridge, APK-Decompile",
    mcps: [
      { name: "chrome-devtools",     rolle: "CDP: Browser-Control, DOM, Network (auch Mac-Chrome via SSH-Tunnel)" },
      { name: "playwright",          rolle: "E2E Multi-Page-Flows, Login-Sequences" },
      { name: "caido",               rolle: "60 Tools, Eigenbau-Binary v3.0.0 (auto-aktiviert via /caido-tunnel)" },
      { name: "apktool",             rolle: "Android APK Decompile, Smali-Edit (zinja-coder)" },
      { name: "filesystem",          rolle: "Sandboxed read/write/move/list" },
      { name: "github",              rolle: "Issues, PRs, Code-Search, Commits" },
    ],
  },
  {
    kategorie: "Cloud · Dev · Docs",
    icon: "",
    farbeRgb: "34, 197, 94",
    beschreibung: "Library-Docs aktuell halten, Cross-Device Sync",
    mcps: [
      { name: "Cloudflare Dev Platform", rolle: "D1, R2, KV, Workers, Hyperdrive" },
      { name: "Firebase",                rolle: "Crashlytics, Auth, Hosting, Firestore" },
      { name: "Context7",                rolle: "Library-Docs aktuell (statt Training-Data)" },
      { name: "claude-bus",              rolle: "Mac↔Server Tier-1 (Tailscale)", eigenbau: true },
      { name: "claude-bus-mobile",       rolle: "iPhone↔Server Tier-2 (Cloudflare + OAuth)", eigenbau: true },
    ],
  },
];

// Auto-Workflows (systemd Timers + Services)
//
// Farben: bewusst nur ZWEI, abgeleitet vom Typ — Timer = akzent (Indigo),
// Service = cyber (Cyan). Kritische Workflows werden über ein optionales
// 'kritisch'-Flag markiert (im View als subtiler Dot), nicht über
// eine dritte Farbe — das hält die Auflistung visuell ruhig und
// konsistent zur restlichen Webseite (SecurityView / LaborView).
export const AUTO_WORKFLOWS: AutoWorkflowModel[] = [
  // ─── Timers (laufen nach Zeitplan) — alle in Akzent-Indigo ───────────
  {
    name: "claude-backup.timer",
    typ: "timer",
    cadence: "täglich 04:15",
    output: "Git-Repository + rsync-Snapshot",
    farbeRgb: "122, 162, 255",
    details: "Sichert das Memory-Verzeichnis, alle Research-Notizen und Security-Berichte jede Nacht. Drei-Tier-Backup: Git-Repo, lokaler Snapshot, externer Sync. Bei Datenverlust ist alles in unter einer Minute wiederherstellbar.",
  },
  {
    name: "claude-bus-mobile-rotate.timer",
    typ: "timer",
    cadence: "Montag 04:30",
    output: "neuer Bearer-Token für iPhone-Endpunkt",
    farbeRgb: "122, 162, 255",
    details: "Wöchentliche Rotation des Authentifizierungs-Tokens für den iPhone-Endpunkt. Begrenzt das Schadenspotenzial, falls ein Token versehentlich offengelegt würde, auf maximal eine Woche.",
  },
  {
    name: "hacktivity-stream.timer",
    typ: "timer",
    cadence: "stündlich (+ Zufalls-Offset)",
    output: "Sofort-Alarm bei Score ≥ 75",
    farbeRgb: "122, 162, 255",
    kritisch: true,
    details: "Pollt HackerOne-Disclosure-Reports und gleicht sie mit meinen aktiven Targets ab. Wenn ein neuer Report meinen Target-Stack betrifft oder ein bekanntes Pattern bestätigt, kommt sofort eine Benachrichtigung. First-Mover-Vorteil bei neuen Vulnerability-Klassen.",
  },
  {
    name: "hacktivity-stream-digest.timer",
    typ: "timer",
    cadence: "täglich 18:00",
    output: "Tageszusammenfassung als Markdown",
    farbeRgb: "122, 162, 255",
    details: "Sammelt alle Findings, die unter dem Sofort-Alarm-Schwellenwert lagen, und liefert sie um 18 Uhr als kompakte Tageszusammenfassung. Verhindert Alarm-Müdigkeit, ohne Informationen zu verlieren.",
  },
  // ─── Services (laufen dauerhaft) — alle in Cyber-Cyan ────────────────
  {
    name: "claude-bus.service",
    typ: "service",
    cadence: "dauerhaft",
    output: "Mac ↔ Server Mailbox (Tailscale)",
    farbeRgb: "138, 160, 200",
    details: "FastMCP-Server, über den Claude Desktop auf dem Mac asynchron mit Claude Code auf dem Server kommuniziert. Tailscale-geschützt, Bearer-authentifiziert, jeder Tool-Aufruf wird auditiert.",
  },
  {
    name: "claude-bus-mobile.service",
    typ: "service",
    cadence: "dauerhaft",
    output: "iPhone ↔ Server Mailbox (Cloudflare)",
    farbeRgb: "138, 160, 200",
    details: "Zweite Mailbox-Instanz speziell für die Claude.ai-iPhone-App. OAuth-2.1-Worker auf Cloudflare davor, strenge Pfad-Allowlist auf der Server-Seite. Mobile darf lesen, schreiben nur in den Handoff-Ordner, kein Shell-Zugriff.",
  },
  {
    name: "claude-bus-anomaly.service",
    typ: "service",
    cadence: "dauerhaft",
    output: "Alarm bei Off-Hours / Burst / abgelehnten Zugriffen",
    farbeRgb: "138, 160, 200",
    kritisch: true,
    details: "Beobachtet das Audit-Log der beiden Mailbox-Services live. Bei verdächtigen Mustern (Aktivität nachts, viele Anfragen in kurzer Zeit, abgelehnte Pfade) kommt sofort ein Alarm. Frühwarnsystem für kompromittierte Tokens.",
  },
  {
    name: "caido-pipeline.service",
    typ: "service",
    cadence: "Datei-Watcher",
    output: "HAR-Analyse → Markdown-Befund",
    farbeRgb: "138, 160, 200",
    details: "Überwacht den Handoff-Ordner. Sobald ich aus Caido eine HTTP-Session als HAR-Datei exportiere, läuft sie durch zehn Pattern-Detektoren (Auth, IDOR, SSRF, CORS …) und ich bekomme einen strukturierten Befund-Report inklusive Counter-Pattern-Check gegen mein Memory.",
  },
  {
    name: "voice-bridge.service",
    typ: "service",
    cadence: "dauerhaft",
    output: "Sprachaufnahme → Claude-Session",
    farbeRgb: "138, 160, 200",
    details: "Nimmt Sprachaufnahmen vom iPhone oder Mac entgegen, schickt sie an den lokalen Whisper-Server und tippt den Text direkt in meine laufende Claude-Session. Null Anthropic-Token für Speech-to-Text, weil Whisper lokal läuft.",
  },
  {
    name: "whisper-server.service",
    typ: "service",
    cadence: "dauerhaft",
    output: "lokales Speech-to-Text (whisper.cpp)",
    farbeRgb: "138, 160, 200",
    details: "whisper.cpp-Server mit dem mehrsprachigen ggml-small-Modell (488 MB). Komplett offline, keine Cloud-Calls, kein Datentransfer nach außen. Latenz ~ 10-15 Sekunden für eine 5-15-Sekunden-Aufnahme.",
  },
  {
    name: "cloudflared.service",
    typ: "service",
    cadence: "dauerhaft",
    output: "Cloudflare-Tunnel zu m.cyp-hr.com",
    farbeRgb: "138, 160, 200",
    details: "Erzeugt einen sicheren Tunnel von Cloudflare zum Server, ohne dass ich einen Port nach außen öffnen muss. TLS automatisch erneuert, WAF + DDoS-Schutz am Edge. Der iPhone-Endpunkt + Voice-UI sind nur über diesen Tunnel erreichbar.",
  },
  {
    name: "milvus-standalone.service",
    typ: "service",
    cadence: "Docker",
    output: "Vektor-Datenbank für semantische Code-Suche",
    farbeRgb: "138, 160, 200",
    details: "Milvus-Standalone-Container, in dem die Embeddings meiner indexierten Codebases liegen. Ollama erzeugt die Embeddings lokal, claude-context legt sie hier ab, dadurch funktioniert semantische Code-Suche (etwa: 'zeig mir alle Stellen wo API-Keys verarbeitet werden') komplett ohne externe APIs.",
  },
];

// Custom Slash-Commands (11 — selbst geschrieben)
export const SLASH_COMMANDS: SlashCommandModel[] = [
  // Submit + Target Pipeline
  { cmd: "/submit-gate",   purpose: "5-Phasen Final-Review: 10 Hard-Gates · Devil's-Advocate · Hacktivity-Check · Reputation-Status · Verdict: freigeben / prüfen / stoppen", gruppe: "submit-pipeline", hardRule: true },
  { cmd: "/new-target",    purpose: "7-Phasen-Onboarding: Memory-Gates · Ordner · Recon · Graph-Entity · Cross-Ref · Caido-Pre-Flight",                  gruppe: "submit-pipeline", hardRule: true },
  // Memory-Pflege (markmem — selbst-lernendes System)
  { cmd: "/memory-review",          purpose: "Interaktives Triage der Inbox (pending · surprises · contradictions): Promote/Reject pro Item", gruppe: "memory-pflege" },
  { cmd: "/memory-quiz",            purpose: "Active-Recall: zufällige Memories testen, catched dead/unclear/stale",                          gruppe: "memory-pflege" },
  { cmd: "/memory-outcome",         purpose: "Submit-Resolution → confidence backprop auf zitierte Memories (STALE-Pattern)",                  gruppe: "memory-pflege" },
  { cmd: "/memory-link",            purpose: "A-MEM Auto-Linker: gewichtete Jaccard-Similarity → bidirektionale [[wiki-links]]",                gruppe: "memory-pflege" },
  { cmd: "/memory-search",          purpose: "Semantic Search via claude-context MCP (Ollama+Milvus). 'JWT' matcht 'JSON Web Token'",           gruppe: "memory-pflege" },
  { cmd: "/memory-stub",            purpose: "Auto-generiert project_<target>_bugbounty.md Master aus existierenden feedback_<target>_*.md",    gruppe: "memory-pflege" },
  { cmd: "/memory-synthesize",      purpose: "ExpeL-Pattern-Crystallization: Cluster ähnlicher Memories → synthesisierte Meta-Rule",            gruppe: "memory-pflege" },
  { cmd: "/memory-status",          purpose: "One-Screen Dashboard: Token-Tax · Tier-Verteilung · Top-5 Files · Confidence-Trends (<200ms)",    gruppe: "memory-pflege" },
  { cmd: "/memory-citation-check",  purpose: "Analyse: wie oft wurde Advice OHNE [[link]] zur Memory gegeben, Pro-Self-Feedback",              gruppe: "memory-pflege" },
];

// Custom Skills (11 — selbst geschrieben, in ~/.claude/skills/)
export const CUSTOM_SKILLS: CustomSkillModel[] = [
  // Master Skills
  { name: "research",              trigger: "/research",            purpose: "Multi-Spezialist-Verify-Welle (4-6 Subagenten parallel) · Live-OOB · DA-Pass · 45%-Cap", gruppe: "master-skill" },
  { name: "live-intel-pipeline",   trigger: "/live-intel",          purpose: "4 Phasen pro Hypothese: CVE/N-Day · WAF-Bypass · Hacktivity · Vendor-Doc → Verdict",     gruppe: "master-skill" },
  { name: "authrecon",             trigger: "/authrecon",           purpose: "Authenticated Recon via Mac-Chrome (eingeloggt) + SSH-Reverse-Tunnel + CDP vom VPS",      gruppe: "master-skill" },
  { name: "caido-tunnel",          trigger: "/caido-tunnel",        purpose: "Mac→VPS Caido-Bridge live: 2 Mac-Befehle + VPS-Verify + 9-Mode-Fehlermatrix",            gruppe: "master-skill" },
  { name: "projekt-indexieren",    trigger: "/projekt-indexieren",  purpose: "Codebase semantisch indexieren via Ollama+Milvus (lokal)",                                gruppe: "master-skill" },
  // Research Lifecycle (Phase 1–10)
  { name: "bounty-analyse-1",         trigger: "bounty analysieren",  purpose: "Voll-Analyse Programm: Scope · OOS · Reward-Range · EV-Math · Konkurrenzniveau",         gruppe: "bb-lifecycle" },
  { name: "bounty-target-setup-0",    trigger: "neues Ziel erstellen", purpose: "Ordnerstruktur + Startdateien unter ~/bugbounty/targets/<name>/",                       gruppe: "bb-lifecycle" },
  { name: "bounty-dateien-befüllen-2",trigger: "target befüllen",      purpose: "scope.md · scope_seeds · OOS · request_identity aus rohem Brief",                       gruppe: "bb-lifecycle" },
  { name: "bounty-priorisierung-1",   trigger: "priorisierung",        purpose: "Hypothesengetriebene Re-Priorisierung (max 45% ohne Server-Confirm)",                   gruppe: "bb-lifecycle" },
  { name: "bounty-diff-analyse-2",    trigger: "diff analyse",         purpose: "HTTP-Request/Response-Diff → leitet nächsten manuellen Test ab",                        gruppe: "bb-lifecycle" },
  { name: "bounty-reporting-3",       trigger: "reporting",            purpose: "Roh-Entwurf für autorisierten Report (nur belegte Fakten, kein erfundener Impact)",    gruppe: "bb-lifecycle" },
];

// Submit Hard-Gates (12 — Pflicht vor jedem Submit)
export const HARD_GATES: HardGateModel[] = [
  {
    nummer: 1,
    titel: "Klasse auf der Submit-Whitelist",
    check: "Gehört der Bug-Typ zu Tier S, A oder B? Sonst nicht einreichen.",
    beispiel: "Tier S: cross-tenant Datenzugriff mit 2-Account-Beweis · RCE · SQL-Injection mit Daten-Read · Auth-Bypass. Tier A: Privilege-Escalation, SSRF mit internem Daten-Read, Race-Conditions mit beweisbarer State-Korruption. Alles andere muss vorher belegt werden, dass das Programm es wirklich auszahlt.",
  },
  {
    nummer: 2,
    titel: "Nicht auf der Blacklist",
    check: "Kein reiner Topology-Leak, kein Open-Redirect ohne Folge-Chain, keine bloße Enumeration, keine über-gestretchte CVE-Anekdote.",
    beispiel: "Ich habe in 14 Closes innerhalb von zwei Wochen 6 vorhersagbare Anti-Patterns gemacht. Daraus entstand diese Liste: RFC1918-DNS-Disclosures bei Shopify (0 $), Open-Redirect ohne Cookie-/Token-Klau bei Grammarly (N/A), Enumeration-Only bei GitLab (Informative).",
  },
  {
    nummer: 3,
    titel: "Konkret demonstrierter Impact",
    check: "Kein „könnte“, kein „potenziell“, kein „theoretisch“: entweder Daten lesen, oder Aktion ausführen, oder nicht einreichen.",
    beispiel: "Falsch: „SSRF ist möglich, dadurch könnte ein Angreifer interne Services erreichen.“ Richtig: „SSRF lieferte folgenden Output vom Metadata-Endpoint: <konkretes Token>.“ Triager bewerten Demonstrated-Impact-Reports systematisch höher.",
  },
  {
    nummer: 4,
    titel: "Zwei-Account-Beweis bei BOLA / IDOR",
    check: "Bei Zugriffsbruch zwischen Accounts: Beweis mit zwei eigenen Accounts, Screenshot inklusive.",
    beispiel: "Account A erzeugt Ressource ID 42. Account B sendet GET /api/resource/42 und bekommt Account-A-Daten zurück. Screenshot mit beiden Browser-Profilen nebeneinander. Ohne diesen Beweis schließt der Triager als „architectural risk“ ohne Bounty.",
  },
  {
    nummer: 5,
    titel: "Manueller Hacktivity-Check",
    check: "Auf hackerone.com/<program>/hacktivity sortiert nach Resolved + Informative durchsuchen.",
    beispiel: "Wenn dasselbe Asset bereits einen Informative-Close hat, ist jeder Folge-Report automatisch ein Duplicate. Dieser Check rettet vor genau dem Fehler, der bei MELI und Grab passierte.",
  },
  {
    nummer: 6,
    titel: "Original-Report-Suche",
    check: "Manuell nach deiner exakten Asset + Klasse-Kombination suchen, nicht von einem Agent erledigen lassen.",
    beispiel: "Disclosed Reports geben den exakten Wording-Schlüssel des Triagers, was als Bounty-würdig und was als Out-of-Scope gilt. Wenn dein Befund das gleiche Pattern hat: 99 % Duplicate.",
  },
  {
    nummer: 7,
    titel: "Programm-Status live geprüft",
    check: "Programm ist aktuell aktiv für Submissions, nicht suspendiert.",
    beispiel: "Suspended-Programme sehen in deinen Lesezeichen aus wie sonst, bis du den Submit-Button drückst und einen Fehler bekommst, oder schlimmer: Report im Limbo. Vor jedem Submit das Programm-Dashboard frisch laden.",
  },
  {
    nummer: 8,
    titel: "Out-of-Scope-Klauseln frisch geprüft",
    check: "OOS-Regeln können seit der letzten Recon angepasst worden sein.",
    beispiel: "Programme schärfen ihre OOS-Listen regelmäßig nach. Ein Asset, das vor zwei Wochen scoped war, kann jetzt OOS sein. Vor dem Submit-Klick die aktuelle OOS-Liste komplett neu lesen.",
  },
  {
    nummer: 9,
    titel: "CVSS-Berechnung sauber",
    check: "Keine Stretch beim S:C-Vektor, keine Severity-Inflation. Lieber konservativ.",
    beispiel: "Wenn der Triager die CVSS-Note runterstuft, beeinflusst das die Reputation. Lieber Medium einreichen und Lift bekommen, als High einreichen und Downgrade kassieren.",
  },
  {
    nummer: 10,
    titel: "Wording-Pass",
    check: "Kein 'speculative impact'-Vokabular, kein aufgeblähtes Angreifer-Profil.",
    beispiel: "„Ein motivierter nation-state Actor mit beliebigen Ressourcen“ klingt nach Hollywood, nicht nach Bug-Bounty. Bleib bei „ein authentifizierter Standard-Benutzer“ oder „ein nicht-authentifizierter externer Angreifer“.",
  },
  {
    nummer: 11,
    titel: "Impact in einem Satz formulierbar",
    check: "Lässt sich der Angreifer-Gewinn in einem einzigen Satz konkret benennen?",
    beispiel: "Wenn ich nicht in einem Satz sagen kann „Angreifer-Gewinn: X konkrete Daten oder Y konkrete Aktion“, dann ist mein Impact noch nicht klar genug. Test bestanden = Submit-bereit. Test nicht bestanden = noch nicht genug Beweis.",
  },
  {
    nummer: 12,
    titel: "Triager-Brille aufsetzen",
    check: "Würde der Triager schreiben: „Interessante Analyse, aber kein echter Impact“?",
    beispiel: "Vor dem Submit-Klick mental durchspielen: wie wird der Triager diesen Report wahrnehmen? Wenn das wahrscheinlichste Verdict „Informative - interesting but no real impact“ ist, dann ist es noch kein Submit-Kandidat.",
  },
];

// Devil's Advocate — 5 Anti-Patterns
export const DA_PATTERNS: ReadonlyArray<{ titel: string; problem: string; lesson: string }> = [
  {
    titel: "Stretched-Parallel-CVE",
    problem: "CVE im Client-SDK ≠ Server-Side-Bug. Direct-Analog-Claims führen zu Architectural-Pushback",
    lesson: "Nur als 'Organizational-Quality-Signal' framen wenn Code-Path-Equivalence nicht direkt nachweisbar",
  },
  {
    titel: "Absence-of-Evidence-Trap",
    problem: "'Docs erwähnen scope restriction nicht' ≠ Bug: mature payments API enforces server-side ALWAYS",
    lesson: "Bei Surface-Mapping aus Docs allein NIE >25% Confidence vergeben",
  },
  {
    titel: "Single-Source-Generalization",
    problem: "N=1 Pattern bestätigt nichts. Post-hoc rationalization gefährlich",
    lesson: "Patterns nur anwenden wenn ≥2 unabhängige Disclosed Reports den Pattern bestätigen",
  },
  {
    titel: "Plan-Bloat",
    problem: "5-Tool-Upgrade-Plan in 3 Monaten contradicts 2-concurrent-programs-Discipline",
    lesson: "Methodology-Upgrades auf max 2 simultan kappen, low-effort/high-ROI first",
  },
  {
    titel: "Public-Blog vs HackerOne-Body",
    problem: "Sam-Curry-Style ~3.200 Wörter prose ≠ HackerOne-Submission-Body",
    lesson: "Public-Blogs sind für Audience-Reading optimiert · HackerOne-Bodies für Triager-Speed",
  },
];

// Senior-Elite Hardening Highlights (für /labor Hero-Banner)
export const ELITE_PRINZIPIEN: ReadonlyArray<{ titel: string; beschreibung: string; rgb: string }> = [
  { titel: "Disziplin vor Menge",   beschreibung: "Vor jedem Submit greifen zwölf feste Prüf-Gates, eingereicht wird nur, was sie alle besteht.",                rgb: "239, 68, 68" },
  { titel: "Lernendes System",      beschreibung: "Ein fünfstufiges Gedächtnis mit automatischen Hooks sorgt dafür, dass jede Sitzung auf der vorherigen aufbaut.", rgb: "122, 162, 255" },
  { titel: "Geräteübergreifend",    beschreibung: "Mac, Server und iPhone arbeiten zusammen, sicher verbunden über ein privates Netz und einen eigenen OAuth-Worker.", rgb: "138, 160, 200" },
  { titel: "Kostenbewusst",         beschreibung: "Spracherkennung, Embeddings und die meisten OSINT-Quellen laufen lokal oder schlüssellos, ohne laufende API-Kosten.", rgb: "34, 197, 94" },
  { titel: "Ausfallsicher",         beschreibung: "Lockfiles, Wiederholungslogik und eine dauerhafte Warteschlange fangen Fehler ab, bevor sie den Ablauf stoppen.",   rgb: "245, 158, 11" },
  { titel: "Stetiges Lernen",       beschreibung: "Aktive Wiederholung, Ergebnis-Rückkopplung und regelmäßige Refactorings halten das Wissen aktuell.",              rgb: "167, 139, 250" },
];
