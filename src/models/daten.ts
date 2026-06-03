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
    titel: "Neo Dev Stack – AI-Augmented Security Workstation",
    kurzbeschreibung: "Eine selbst gebaute, KI-gesteuerte Arbeitsumgebung, die wiederkehrende Sicherheits- und Recherche-Aufgaben automatisiert: spezialisierte KI-Agenten, kostenlose lokale KI-Modelle und über 80 Werkzeuge greifen nahtlos ineinander.",
    langbeschreibung: "Im Kern arbeiten 32 spezialisierte Pentest-Agents (Recon, Web, Cloud, Mobile, Forensics, Exploit-Chaining) direkt in Claude Code und greifen über 25 MCP-Server auf Censys (Eigenbau, Platform-API v3), Shodan, Exa Neural Search, GitHub, Firecrawl, Chrome DevTools, Sequential-Thinking, Memory-Graph, findings-db und eine lokale Vektordatenbank (Milvus v2.6.14) zu. Die LLM-Inferenz liefert Ollama lokal (nomic-embed-text), eine eigene Status-Line zeigt jederzeit Reputation-Status und offene Submits, und ein PreToolUse-Hook warnt automatisch vor HackerOne-Aggregator-Fallen. Den Alltag automatisieren 11 selbst geschriebene Skills (research, live-intel-pipeline, authrecon, caido-tunnel, bounty-*) und 11 Slash-Commands (/submit-gate, /new-target, /memory-*) – von der ersten Recon bis zum fertigen Report.",
    kategorie: "tooling",
    technologien: ["Claude Code", "MCP Protocol", "Ollama", "Milvus", "Docker", "tmux", "Python", "Bash", "Chrome DevTools", "Firecrawl", "Censys", "Shodan"],
    highlights: [
      "32 spezialisierte Pentest-Agents: Recon, Web, Cloud, Mobile, Forensics, Exploit-Chaining",
      "25 MCP-Server: Censys (Eigenbau), Shodan, Exa, Sequential-Thinking, Memory-Graph, findings-db u.v.m.",
      "11 selbst geschriebene Skills (research, live-intel, authrecon, caido-tunnel, bounty-*)",
      "11 Custom Slash-Commands: /submit-gate, /new-target, /memory-review, /memory-quiz, /memory-outcome…",
      "Lokale LLM-Inferenz: Ollama + Milvus v2.6.14 (Vektordatenbank, semantische Code-Suche über 9 Codebases)",
      "Custom Status-Line + PreToolUse-Hook (HackerOne-Aggregator-Warnung)",
      "findings.db (SQLite, 8 Tables): Cross-Engagement Pattern-Recall via SQL",
    ],
    zeitraum: "2025 – heute",
    status: "aktiv",
  },
  {
    titel: "Self-Improving Memory System v2 – Adaptive Knowledge Base",
    kurzbeschreibung: "Ein lernendes Gedächtnis für KI-Assistenten: Es merkt sich aus jeder Sitzung das Wichtige, sortiert Veraltetes automatisch aus und wird dadurch mit der Zeit spürbar zuverlässiger – statt jedes Mal bei null zu beginnen.",
    langbeschreibung: "Eine 5-Tier-Architektur (Core / Deep / Archival / Recall / Staging) hält den Kontext schlank und verhindert Token-Bloat. Drei Hooks (UserPromptSubmit / SessionStart / SessionEnd) erfassen automatisch Korrekturen und Bestätigungen ('Surprise-Capture' nach dem Reflexion-Paper), schreiben Session-Digests und blenden bei offenen Inbox-Items einen smarten Banner ein. Ein Frontmatter v2 mit importance/confidence/last_verified macht den Wert jeder Notiz messbar: /memory-outcome propagiert das Ergebnis eines Reports als Confidence-Update auf alle zitierten Memories zurück, /memory-link verknüpft Verwandtes über gewichtete Jaccard-Similarity zu bidirektionalen Wiki-Links (A-MEM, NeurIPS 2025), und /memory-synthesize verdichtet ähnliche Lektionen zu Meta-Regeln (ExpeL-Pattern). Eine Pro-Regel erzwingt Zitier-Disziplin – jede nicht-triviale Empfehlung trägt einen [[Wiki-Link]] zur Quelle. Ein täglicher Cron (04:00) macht einen read-only Health-Check samt Auto-Commit; inzwischen über 150 Lektionen und 12 Backend-Skripte, alle versioniert via Git.",
    kategorie: "tooling",
    technologien: ["Python", "Claude Code Hooks", "Markdown YAML Frontmatter", "Git", "Bash Cron", "A-MEM Algorithm", "Jaccard Similarity"],
    highlights: [
      "5-Tier-Architektur (MemGPT-inspiriert): Core / Deep / Archival / Recall / Staging",
      "3 Lifecycle-Hooks: surprise_catcher · session_reflect · session_start_banner (alle fail-open)",
      "A-MEM Auto-Linker (NeurIPS 2025): gewichtete Jaccard-Similarity → bidirektionale Wiki-Links",
      "Confidence-Decay (STALE): /memory-outcome propagiert Submit-Resolutions zurück",
      "Active-Recall via /memory-quiz: catched dead/unclear/stale Memories",
      "Pattern-Crystallization via /memory-synthesize: N kleine Lessons → 1 Master-Rule (ExpeL)",
      "Citation-Discipline + read-only Auto-Cron + Git-Versionierung (Bad edit? git checkout HEAD --)",
      "3 Lifecycle-Hooks · 11 Slash-Commands · 12 Backend-Scripts · 100% lokal",
    ],
    zeitraum: "2025 – heute",
    status: "aktiv",
  },
  {
    titel: "claude-bus – Mac↔Server↔iPhone Mailbox-Bridge",
    kurzbeschreibung: "Eine sichere Brücke zwischen meinen Geräten – Mac, Server und iPhone: Aufgaben und Ergebnisse wandern verschlüsselt hin und her, mit strengen Zugriffsgrenzen und durchgehender Überwachung.",
    langbeschreibung: "Zwei Ebenen verbinden Claude Desktop (Mac), Claude Code (Linux-VPS) und die Claude.ai-App auf dem iPhone. Tier-1 läuft als FastMCP-Streamable-HTTP-Server auf dem VPS, erreichbar nur über ein Tailscale-WireGuard-Netz und per Bearer-Token authentifiziert. Tier-2 fürs iPhone geht über einen Cloudflare-Tunnel mit einem selbst gebauten OAuth-2.1-Worker (492 Zeilen: PKCE-S256 verpflichtend, constant-time Secret-Vergleich, Redirect-URI-Allowlist, KV-Storage für gehashte Tokens mit 1 h Access-TTL und 30-Tage-Refresh-Rotation). Das mobile Tier ist bewusst eng geschnürt – es darf nur an einen Empfänger senden (claude_bus), nur nach /root/handoff/ schreiben und hat keinen Shell-Zugriff. Ein Anomaly-Watcher überwacht das Audit-Log live auf auffällige Muster (Off-Hours, Bursts, abgelehnte Zugriffe, neue Pfade) und alarmiert in Echtzeit; die Token rotieren wöchentlich per systemd-Timer. Eine feste Topic-Konvention (task/result/note/ask/alert/briefing) trennt die Rollen sauber: Desktop für GUI, Caido und DevTools, Code für Backend, Pipelines und Memory.",
    kategorie: "tooling",
    technologien: ["FastMCP", "Streamable HTTP", "Tailscale WireGuard", "Cloudflare Tunnel", "Cloudflare Workers", "OAuth 2.1", "PKCE", "SQLite", "systemd", "Python"],
    highlights: [
      "Tier-1: FastMCP Server auf Tailscale, Bearer-Token, Mac↔Server bidirektional",
      "Tier-2: Cloudflare-Tunnel + eigener OAuth 2.1 Worker (PKCE S256, 492 Zeilen, KV-Storage)",
      "Recipient-Allowlist als Hardcoded Code-Konstante (nicht config-basiert)",
      "Read-Path-Allowlist + Hard-Deny für /etc/shadow, .ssh, .bashrc — code-enforced",
      "Anomaly-Watcher (Off-Hours / Burst / Denied / New-Path) → Mailbox-Alerts in Echtzeit",
      "Auto-Token-Rotation wöchentlich via systemd-Timer, audit-getaggt",
      "Erfolgreich live verifiziert 2026-05-20 — End-to-End Mac→Server→iPhone",
    ],
    zeitraum: "2025 – heute",
    status: "aktiv",
  },
  {
    titel: "voice-bridge – Lokaler Whisper-Voice-Daemon mit Apple-UI",
    kurzbeschreibung: "Sprachsteuerung fürs Smartphone: Eingesprochene Aufgaben werden direkt auf dem eigenen Server – ohne Cloud-Kosten – in Text umgewandelt und landen sofort in der Arbeitssitzung. Mit einer Oberfläche auf Apple-Niveau.",
    langbeschreibung: "Der Browser auf iPhone oder Mac nimmt die Stimme via MediaRecorder auf und schickt sie über einen Cloudflare-Tunnel (Bearer-Auth, TLS) an einen FastAPI-Daemon auf dem VPS. Dort konvertiert ffmpeg das Audio und übergibt es an einen lokalen whisper.cpp-Server (ggml-small.bin, 488 MB, mehrsprachig, ~10–15 s für eine 5–15-s-Aufnahme) – die Spracherkennung läuft also komplett auf eigener Hardware, ganz ohne API-Kosten. Das Transkript landet per tmux-Buffer direkt in der richtigen Claude-Sitzung; ein Smart Target Resolver findet sie automatisch (env TMUX_TARGET → laufender 'claude'-Prozess → dauerhafte Queue als Fallback, falls tmux gerade weg ist). Die Oberfläche (v3) ist auf Apple-Niveau gebaut: Sidebar-History nach Datum, ein 260px-Mic-Orb mit drei Zuständen (ruhiges Atmen / rotes Aufnahme-Glühen / blauer Busy-Puls), ein Audio-Visualizer aus 7 Balken (AnalyserNode), Session-Picker und Sprachwahl (DE/EN/auto). Sicherheit ist eingebaut: Audio liegt nur im RAM (/dev/shm/voice/, tmpfs) und wird garantiert per finally aufgeräumt, ein gleitendes Rate-Limit (10 Anfragen/60 s) bremst Missbrauch, und systemd härtet den Dienst (ProtectSystem, NoNewPrivileges, MemoryMax, CPUQuota). Als PWA installierbar, Aufnahme per Leertaste.",
    kategorie: "tooling",
    technologien: ["whisper.cpp", "FastAPI", "ffmpeg", "Cloudflare Tunnel", "tmux", "Web Audio API", "AnalyserNode", "MediaRecorder", "systemd-hardening", "PWA"],
    highlights: [
      "0€ Speech-to-Text: lokales whisper.cpp ggml-small.bin (488 MB, mehrsprachig)",
      "Apple-Niveau UI: SF-Pro Typografie, cubic-bezier transitions, Audio-Visualizer im Mic-Orb",
      "Smart Target Resolver: findet automatisch die richtige Claude-tmux-Session",
      "Durable Fallback-Queue (JSONL) wenn tmux dead → Auto-Drain bei Recovery",
      "Audio NUR in /dev/shm/voice/ (tmpfs RAM-only), finally-Cleanup garantiert",
      "systemd-Hardening: ProtectSystem strict, NoNewPrivileges, MemoryMax, CPUQuota",
      "PWA Add-to-Home-Screen + Spacebar-Toggle + localStorage-Token-Persistierung",
    ],
    linkDemo: "/voice-demo",
    zeitraum: "2025 – heute",
    status: "aktiv",
  },
  {
    titel: "bb_recon – Senior-Elite Research OSINT-Toolkit",
    kurzbeschreibung: "Ein Recherche-Werkzeug, das öffentlich verfügbare Informationen zu einem Ziel aus über 30 Quellen in Sekunden zusammenträgt und übersichtlich aufbereitet – komplett ohne kostenpflichtige Schnittstellen.",
    langbeschreibung: "asyncio.gather orchestriert massive Parallelität – im IP-Test 510 Findings in einer einzigen Sekunde. Gebündelt werden über 30 kostenlose, schlüssellose OSINT-Quellen in einem einheitlichen Output (JSON, Markdown und Terminal): Breach-Daten (XposedOrNot, HIBP, LeakCheck), DNS (Cloudflare DoH, HackerTarget, crt.sh), Subdomains (CommonCrawl-CDX, Wayback-CDX, hostsearch), IP-Intelligence (RIPEstat ASN/Prefix/Neighbours, ip-api mit Threat-Flags, Shodan InternetDB), Historie (Wayback, Arquivo.pt, CommonCrawl), Identität (Gravatar, GitHub-Suche, PGP-Keyserver), Tor (DDG-Onion, Ahmia, archive.is), Usernamen (WhatsMyName über 600+ Plattformen) und Bilder (SauceNAO + 13 Aggregatoren). Fällt eine Quelle aus, laufen die anderen ungestört weiter (graceful degradation); jeder Treffer bekommt einen Confidence-Score (HIGH/MEDIUM/LOW/UNVERIFIED), und ein Smart-Dedup führt Mehrfach-Funde zusammen. Mit dem --tor-Flag läuft die ganze Recherche anonym über SOCKS5 (127.0.0.1:9150).",
    kategorie: "security",
    technologien: ["Python asyncio", "httpx[socks]", "aiosqlite", "dnspython", "rich", "Tor SOCKS5", "CommonCrawl CDX", "Wayback Machine"],
    highlights: [
      "30+ keyless OSINT-Quellen — keine API-Kosten, vollständig parallel",
      "Async-Architecture: 510 Findings in 1 Sekunde bei IP-Recon-Test",
      "Tor-optional via SOCKS5 127.0.0.1:9150 — anonyme Recherche bei sensitiven Targets",
      "Target-aware: --target <name> → automatisches Speichern in /targets/<name>/intel/<ts>/",
      "Smart Dedup + Confidence-Score: HIGH/MEDIUM/LOW/UNVERIFIED pro Finding",
      "Graceful Degradation: ein Modul-Fail blockiert andere nicht",
      "Komplette Target-Pipeline: bb_recon full <domain> = Domain + Subdomain-Pivot + IP-Enrich",
    ],
    zeitraum: "2025 – heute",
    status: "aktiv",
  },
  {
    titel: "NeoRecon – Research Exploit Engine",
    kurzbeschreibung: "Eine durchgängige Pipeline für autorisierte Sicherheits-Recherche: Sie sammelt Angriffsflächen, bewertet sie automatisch und liefert am Ende eine konkrete, priorisierte Prüf-Liste – aus Hunderttausenden Adressen in Sekunden.",
    langbeschreibung: "Die Master-Pipeline (run_master_pipeline.sh) führt durch 7 Phasen – abgesichert mit Lockfile, --resume-from, --skip-Flags und --dry-run. Ihr Herzstück, Engine 01, bewertet in einem einzigen awk-Durchlauf 500.000 URLs in 15 Sekunden anhand von 12 gewichteten Sicherheits-Kategorien. Ein Asset-Splitter sortiert die erreichbaren URLs automatisch in 8 Tier-Klassen nach Research-Potenzial, und die Build-Kette erzeugt daraus Focus5-Cards mit konkreten Prüfschritten pro Kandidat. Dazu kommen 13 spezialisierte Tools auf dem VPS (eine GraphQL-Suite mit 5 Werkzeugen, SSTImap, ein Dependency-Confusion-Checker, OSINT-Tools), eigene Nuclei-Templates und eine durchgängige 4-Phasen-Dokumentation.",
    kategorie: "security",
    technologien: ["Bash", "awk", "httpx", "Subfinder", "Amass", "ParamSpider", "gf", "Nuclei", "dalfox", "sqlmap", "GraphQL", "Brave Search API"],
    highlights: [
      "Master-Pipeline: 7 Schritte mit --skip-Flags, --resume-from, --dry-run, Lockfile-Schutz",
      "Engine 01: Single-Pass awk-Scoring – 500k URLs in 15 Sek, 12 Kategorien, Bonus-System",
      "Asset-Split: Automatische Klassifizierung in 8 Tier-Klassen nach Research-Potential",
      "Build-Kette: Shortlists → Hunt-Sheet → Top-Candidates → Playbook → Focus5-Cards",
      "GraphQL-Suite: 5 Tools (graphw00f, graphql-cop, clairvoyance, GraphQLer, MCP-Server)",
      "Brave Search API Dorking: 24 Kategorien (Configs, Backups, Admin-Panels, Tokens, S3, Swagger u.a.)",
      "Best-Run-Selector: Gewichteter Score wählt automatisch den ergiebigsten Recon-Run",
      "4-Phasen-Dokumentation: Setup → Scope-Recon → Deep-Hunt → Finale (komplett dokumentiert)"
    ],
    zeitraum: "2025 – heute",
    status: "aktiv",
  },
  {
    titel: "Exploit Dashboard – Vulnerability Testing Interface",
    kurzbeschreibung: "Ein Browser-Dashboard, das Sicherheitstests übersichtlich und nachvollziehbar macht: priorisierte Ziele, Wiederhol-Tests per Klick und eine visuelle Darstellung verketteter Angriffspfade.",
    langbeschreibung: "Direkt an die Recon-Pipeline angedockt, liest das Backend (Node.js + Express) die bewerteten URL-Listen aus engine_01_extract_and_rank.sh und stellt drei Kern-Funktionen bereit: Replay schickt HTTP-Anfragen live durch den Caido-Proxy (127.0.0.1:8080) und erfasst Status und Response-Länge; Diff prüft mehrere Payload-Varianten und protokolliert Abweichungen; Advanced Diff legt zuerst eine saubere Baseline an und markiert dann jede Statuscode-Änderung sowie Content-Length-Abweichungen über 50 Byte. Das Frontend ordnet Funde nach Typ (OAUTH, ADMIN, AUTH, API, JS, GENERIC), zeichnet verkettete Angriffspfade als interaktives Flussdiagramm (vis-network) und merkt sich interessante Ziele in einem Favoriten-System pro Target (localStorage).",
    kategorie: "tooling",
    technologien: ["Node.js", "Express", "JavaScript", "Caido", "Axios", "vis-network", "HTML5"],
    highlights: [
      "Replay-Engine: HTTP-Anfragen direkt durch Caido-Proxy senden, Status + Response-Länge auswerten",
      "Advanced Diff: Baseline-Vergleich — Statuscode-Änderungen und Content-Length-Deltas >50 Byte geflagged",
      "Scoring & Kategorisierung: URLs nach Typ (OAUTH, ADMIN, AUTH, API, JS) priorisiert und farbcodiert",
      "Attack-Chain-Visualisierung: vis-network rendert verkettete Angriffspfade als interaktives Diagramm",
      "Exploit-Templates: generiert Payload-Vorlagen je URL-Typ (SQLi, Path Traversal, Open Redirect)",
      "Direkte Pipeline-Integration: liest dashboard_data.json von engine_01_extract_and_rank.sh",
      "Favoriten-System: localStorage-basiertes Bookmarking aller interessanten Targets pro Session",
    ],
    zeitraum: "2025 – heute",
    status: "aktiv",
  },
  {
    titel: "ONE – Multi-Agent AI Chat",
    kurzbeschreibung: "Eine iOS-App, die mehrere KI-Modelle – Claude, GPT und Gemini – in einer einzigen, aufgeräumten Oberfläche vereint.",
    langbeschreibung: "Unter der Oberfläche sorgt eine saubere MVVM-Architektur mit Repository Pattern für eine klar getrennte Datenschicht. Die API-Schlüssel der Anbieter liegen sicher in der iOS-Keychain, Firestore synchronisiert den Stand geräteübergreifend, und Combine hält die Datenströme reaktiv – samt durchdachtem UI/UX mit Dark Mode.",
    kategorie: "development",
    technologien: ["SwiftUI", "MVVM", "Combine", "Firestore", "Keychain", "REST API"],
    highlights: [
      "Multi-Provider AI-Orchestrierung (Claude, GPT-4, Gemini) in einer nativen App",
      "Sichere Credential-Verwaltung über iOS Keychain",
      "Repository Pattern für saubere Datenschicht-Abstraktion",
      "Reaktive UI mit Combine Publishers und async/await"
    ],
    linkGithub: "https://github.com/NEO849/ONE",
    zeitraum: "2024 – 2025",
    status: "aktiv",
  },
  {
    titel: "Sports Almanach – Smart Betting App",
    kurzbeschreibung: "Eine iOS-App rund um Sportwetten mit Spielgeld: Ein selbst entwickelter Algorithmus errechnet Quoten aus historischen Ergebnissen und dem Austragungsort – dazu Team- und Spielervergleiche und ein Sportkalender.",
    langbeschreibung: "Hinter dem Quoten-Algorithmus steckt eine saubere MVVM-Architektur mit Repository- und Service-Layer, in der sich echte und Mock-API nahtlos austauschen lassen. Auf dieser Basis wird die App zur kompletten Sport-Zentrale: Nutzer tippen mit virtuellem Spielgeld auf Events und verfolgen ihren Kontostand in Echtzeit, Firebase Auth sichert die Anmeldung, Firestore synchronisiert alle Wettverläufe. Dazu kommen umfangreiche Spieler- und Teamprofile mit direkten Vergleichen nach Form, Saison und Heim-/Auswärtsstatistik, Formkurven und Trends als Swift Charts sowie ein zentraler Sport-Kalender mit persönlichen Favoriten.",
    kategorie: "development",
    technologien: ["Swift", "SwiftUI", "MVVM", "Firebase Auth", "Firestore", "Charts", "Repository Pattern"],
    highlights: [
      "Eigenentwickelter Quoten-Algorithmus: berechnet Wettquoten aus historischen Ergebnissen + Austragungsort",
      "Spielgeld-Wetten: Nutzer tippen auf Events mit virtuellem Budget, Kontostand in Echtzeit",
      "Firebase Auth + Firestore: sichere Authentifizierung und Cloud-Synchronisation aller Wettdaten",
      "Spieler- und Teamvergleiche: Form, Heim-/Auswärts, Saison-gegen-Saison direkt gegenübergestellt",
      "Sport-Kalender: kommende Spiele, Turniere, Spieltage und persönliche Favoriten",
      "Datenvisualisierung: Formkurven, Vergleichsansichten, Trendanzeigen mit Swift Charts",
      "Repository Pattern + Service-Layer: echte und Mock-API nahtlos austauschbar",
    ],
    zeitraum: "2024 – 2025",
    status: "aktiv",
  },
  {
    titel: "Z Almanach – Dragon Ball Z Kompendium",
    kurzbeschreibung: "Eine Android-App als Nachschlagewerk zum Dragon-Ball-Z-Universum: Charaktere, Verwandlungsstufen und Fraktionen im Retro-Arcade-Look – die Daten werden automatisch ins Deutsche übersetzt.",
    langbeschreibung: "In der App steckt das ganze Dragon-Ball-Z-Universum bis ins Detail: alle Transformationsstufen (Super-Saiyajin 1–4, Ultra Instinct, Legendary Super Saiyan u.v.m.), Fraktionen, Planeten und die zentralen Charaktere von Son Goku über Vegeta und Gohan bis Frieza und Cell. Das Design zitiert den Old-School-Arcade-Look der Street-Fighter-Ära – markante Rahmen, kraftvolle Typografie, kontrastreiche Farben. Die Inhalte stammen aus einer spanischsprachigen Dragon-Ball-API, die eine zweite API automatisch ins Deutsche übersetzt und strukturiert bereitstellt. Technisch sauber getrennt über das Repository Pattern, mit eigenen RecyclerView-Adaptern (ViewHolder Pattern) für flüssige Listen und SharedPreferences für persistente Einstellungen.",
    kategorie: "development",
    technologien: ["Kotlin", "Android SDK", "REST API", "RecyclerView", "SharedPreferences", "Repository Pattern", "ViewHolder Pattern", "XML Layouts"],
    highlights: [
      "Vollständiges DBZ-Universum: Charaktere, alle Transformationsstufen, Fraktionen, Planetendaten",
      "Dual-API-Pipeline: spanische Dragon-Ball-API als Quelle, zweite API übersetzt automatisch auf Deutsch",
      "Old-School Arcade-Design: Street-Fighter-inspirierter Look mit markanten Rahmen und Typografie",
      "Repository Pattern: Datenzugriffslogik vollständig von der UI getrennt",
      "Custom RecyclerView-Adapter mit ViewHolder Pattern für performante Charakterlisten",
      "SharedPreferences für persistente Nutzereinstellungen und App-Zustand",
    ],
    zeitraum: "2023",
    status: "abgeschlossen",
  },
  {
    titel: "OSINT Toolkit – Modulares Analyse-Framework",
    kurzbeschreibung: "Ein modulares Recherche-Tool mit sieben Bausteinen – E-Mail, Benutzername, Telefon, Domain, Bildersuche und mehr –, das öffentliche Online-Spuren strukturiert auswertet und als Report ausgibt.",
    langbeschreibung: "Bedienbar über ein interaktives Terminal-Menü oder direkt per CLI, steckt die Tiefe in den einzelnen Bausteinen: E-Mail-Analyse (holehe + LeakCheck), Username-Suche (sherlock, nach Plattform gruppiert), Telefon-Analyse (phoneinfoga + NumVerify + LeakCheck), Domain/DNS/WHOIS sowie eine Reverse-Image-Search mit Varianten-Erzeugung, EXIF-Auswertung, Browser-Automation und eigener HTML-Report-Engine. Darunter liegt eine saubere core/-Schicht (Runner, Validator, Formatter, Parser, Export-Helper), die jeden Lauf automatisch als TXT und JSON pro Modul ablegt.",
    kategorie: "security",
    technologien: ["Python", "holehe", "sherlock", "phoneinfoga", "LeakCheck API", "NumVerify API", "EXIF", "Selenium"],
    highlights: [
      "7 OSINT-Module mit einheitlicher Architektur (core/modules/data Pattern)",
      "Multi-API-Integration: LeakCheck, NumVerify, imgBB für automatisierte Abfragen",
      "Reverse Image Engine: Hash-Berechnung, Varianten, EXIF, Browser-Suche, HTML-Report",
      "Exposure-Layer: Automatische Breach-Prüfung für E-Mail und Telefon",
      "Strukturierte Reports: TXT + JSON pro Analyse mit Bewertung und Confidence-Level",
      "Plattform-Gruppierung: Sherlock-Treffer sortiert nach Social Media, Gaming, Dev, etc."
    ],
    zeitraum: "2025 – heute",
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
  { name: "graphw00f",            rolle: "GraphQL Engine Fingerprinting", kategorie: "eigenbau", beschreibung: "Identifiziert die eingesetzte GraphQL-Engine (Apollo, Hasura, Shopify, etc.) anhand von Fehlermustern und Response-Charakteristika — ohne Introspection zu benötigen." },
  { name: "graphql-mcp-server",   rolle: "MCP-Integration für GraphQL-Testing", kategorie: "eigenbau", beschreibung: "Bindet GraphQL-Endpoints als MCP-Tools ein, sodass Claude direkt Schema, Queries und Mutations interaktiv analysieren kann. Beschleunigt die manuelle Review-Phase erheblich." },
  { name: "clairvoyance",         rolle: "GraphQL Schema-Rekonstruktion ohne Introspection", kategorie: "eigenbau", beschreibung: "Rekonstruiert das vollständige Schema durch Wortlisten-basiertes Field-Guessing, auch wenn Introspection deaktiviert ist. Essentiell für härtere Targets mit Production-Restrictions." },
  { name: "SSTImap",              rolle: "Server-Side Template Injection Scanner", kategorie: "eigenbau", beschreibung: "Testet Parameter automatisch auf SSTI in Jinja2, Twig, Freemarker und weiteren Engines. Payloads werden dynamisch angepasst und mit Blind-Detection-Technik kombiniert." },
  { name: "confused",             rolle: "Dependency Confusion Checker", kategorie: "eigenbau", beschreibung: "Analysiert package.json, requirements.txt und andere Manifest-Dateien auf interne Package-Namen, die im öffentlichen Registry nicht registriert sind — potenzielle Dependency-Confusion-Targets." },
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
  { name: "Brave Search API",    rolle: "Automatisiertes Dorking (24 Kategorien)", kategorie: "osint", beschreibung: "Führt strukturiertes Dorking über die Brave Search API durch — 24 vordefinierte Kategorien (ENV Files, Config Files, Admin-Panels, Tokens, AWS Keys, Swagger, S3 Buckets, JS-Source-Maps u.a.) — vollautomatisch pro Target via intel_dork_api_to_pipeline.sh." },
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
    jahr: "1999–2014",
    titel: "Elektroinstallateur – Ausbildung & Berufspraxis",
    beschreibung: "Gesellenbrief als Elektroinstallateur (HWK Niederbayern-Oberpfalz, 2003). Vierjährige Ausbildung bei Fa. Freise in Deggendorf, anschließend über ein Jahrzehnt Berufspraxis in Elektronik, Netzwerk-, Server-, Telefon- und Videoanlagen – teils als Projektleiter, von der Großinstallation bis zur Inbetriebnahme. Fundament in Fehleranalyse, technischer Dokumentation und Systemlogik.",
    kategorie: "beruf",
    modulTitel: "Projekte & Referenzen",
    module: [
      { name: "Wohnbaugenossenschaft · Projektleitung", skills: ["Projektleitung", "2 zusammenhängende Wohnblöcke", "12 + 9 Wohnungen", "Komplett-Installation", "Inbetriebnahme"] },
      { name: "Pharma · Serverfarm-Aufbau",              skills: ["Serverfarm-Aufbau", "Strukturierte Verkabelung", "Patchen", "LWL-Spleißen"] },
      { name: "DECT-Großsystem · Freistaat Bayern",      skills: ["Projektleitung", "Bayerns größtes DECT-System", "München", "Aufbau & Inbetriebnahme"] },
      { name: "Telekommunikation · Großkunden-Rollouts", skills: ["Siemens", "Deutsche Telekom", "E.ON Energie", "Telefonanlagen", "Rollout-Umsetzung"] },
    ],
  },
  {
    jahr: "2014–2018",
    titel: "Teamführung & interdisziplinäre Praxis",
    beschreibung: "Arbeitstherapie mit schwer erziehbaren Jugendlichen an der Fachklinik Kompass Hof (Mindelheim), eingebunden in ein interdisziplinäres Team: Aufnahmegespräche, Reha-Dokumentation und gemeinsame Projektarbeit mit den Klienten. Zugleich Qualitätsmanagement- und Sicherheitsbeauftragter für den Arbeitsschutz. Kommunikation auf Augenhöhe, Konfliktlösung und ruhiges Handeln in anspruchsvollen Situationen – Qualitäten, die meine Arbeitsweise bis heute prägen.",
    kategorie: "teamarbeit",
    modulTitel: "Aufgaben & Verantwortung",
    module: [
      { name: "Arbeitstherapie · Jugendliche",   skills: ["Schwer erziehbare Jugendliche", "Aufnahmegespräche", "Projekte mit Klienten", "Gruppensitzungen"] },
      { name: "Reha-Dokumentation",              skills: ["KTL-Leistungen protokolliert", "Berichte für die Rentenversicherung"] },
      { name: "Qualität & Arbeitssicherheit",    skills: ["Qualitätsmanagement-Beauftragter (QMB)", "Sicherheitsbeauftragter", "Arbeitsschutz"] },
      { name: "Weiterbildung",                   skills: ["Gruppenführung & -dynamik", "Konfliktlösung", "Psychologische Grundlagen"] },
    ],
  },
  {
    jahr: "2020–heute",
    titel: "Linux, VPS & Infrastruktur",
    beschreibung: "Aufbau und Betrieb gehärteter Linux-Systeme: VPS-Setup, SSH-Härtung, Firewalling, Docker-Containerisierung, tmux-Orchestrierung und reproduzierbare Toolchains. Basis für alle Security-, Recon- und KI-Workloads, die heute auf dieser Infrastruktur laufen.",
    kategorie: "infrastruktur",
    module: [
      { name: "System-Basis",     skills: ["VPS", "SSH-Hardening", "UFW", "fail2ban", "Docker", "tmux"] },
      { name: "Target-Struktur",  skills: ["scope.md", "meta/", "recon/", "exploit/", "findings/", "reports/"] },
      { name: "Masterpipeline",   skills: ["RECON", "POST-PROC", "MERGE", "HUNT-SHEET", "CHECKS", "VALIDATE", "REPORT"] },
    ],
  },
  {
    jahr: "2023–2024",
    titel: "Syntax Institut",
    beschreibung: "IT-Fachkraft für App-Entwicklung (iOS & Android) · 2.300 Unterrichtseinheiten · CERTQUA-zertifiziert (DIN EN ISO 9001)",
    kategorie: "bildung",
    module: [
      { name: "Mobile UX/UI Design",        skills: ["Figma", "User Flows", "Prototyping", "Wireframes", "User Research", "iOS HIG"] },
      { name: "Grundlagen Programmierung",   skills: ["Kotlin", "Funktionen", "Schleifen", "OOP", "Git", "GitHub", "Datenstrukturen"] },
      { name: "Android App Development",     skills: ["Android Studio", "Kotlin", "MVVM", "Retrofit API", "Room", "Coroutines"] },
      { name: "iOS App Development",         skills: ["Xcode", "Swift", "SwiftUI", "MVVM", "Core Data", "Firebase", "Navigation"] },
    ],
  },
  {
    jahr: "2024–2025",
    titel: "Native Apps & Software-Architektur",
    beschreibung: "ONE (iOS, Multi-Provider AI-Orchestrierung mit Claude, GPT & Gemini), Sports Almanach (SwiftUI, eigener Quoten-Algorithmus, Firebase) und Z Almanach (Android/Kotlin, Dual-API-Pipeline, DBZ-Kompendium). Konsequenter Einsatz von MVVM, Repository Pattern, Combine und sauberer Datenschicht-Abstraktion.",
    kategorie: "entwicklung",
  },
  {
    jahr: "2025–heute",
    titel: "Security Research",
    beschreibung: "Aktiver Researcher auf HackerOne (cypherneo) und Intigriti. 9 eingereichte Reports – bestätigte Findings: OAuth CSRF, GraphQL Request Batching, Open Redirect (return_to). Eigene Recon-Pipeline mit 30+ Skripten, awk-Scoring-Engine (500.000 URLs in 15 Sekunden, 12 Kategorien) und Caido-Proxy-Integration.",
    kategorie: "security",
  },
  {
    jahr: "2025–heute",
    titel: "KI-Stack, Agenten & Automatisierung",
    beschreibung: "32 spezialisierte Pentest-Agenten in Claude Code, 15+ MCP-Server (GitHub, Chrome DevTools, Firecrawl, Brave Search), lokale LLM-Inferenz via Ollama + Milvus (882 Chunks, semantische Suche über 9 Codebases). NeoRecon als 7-Phasen-Pipeline-Engine und das Exploit Dashboard als Browser-Interface direkt auf der Recon-Pipeline.",
    kategorie: "eigenbau",
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
  firmaTagline: "Produktive KI-Systeme, gehärtete Infrastruktur, Security mit Angreifer-Blick — selbst gebaut und betrieben.",
  kurzvorstellung: "Ich baue Software und Automatisierung, die Arbeit abnimmt – und betreibe sie auf einer Infrastruktur, die ich selbst absichere und am Laufen halte. Vom KI-gestützten Workflow bis zum gehärteten Server: keine Demos, sondern Systeme, auf die im Alltag Verlass ist.",
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
    nutzen: "Wiederkehrende Aufgaben übernehmen Agenten und saubere Schnittstellen – angebunden an die Werkzeuge, die Sie ohnehin nutzen.",
    leistungen: [
      "Workflow-Automation mit n8n, APIs und eigenen Skripten",
      "Sprachmodelle & Agenten – mit klaren Grenzen und Kontrolle",
      "Wissensbasis-Suche (RAG), auf Wunsch komplett auf Ihrem Server",
    ],
    ergebnis: "Weniger Handarbeit, schnellere Abläufe, weniger Fehler.",
    farbeRgb: "99, 102, 241",
    akzentHex: "#818cf8",
  },
  {
    titel: "Linux & Infrastruktur",
    nutzen: "Server, die nicht nur eingerichtet, sondern verlässlich betrieben werden – abgesichert und wartbar.",
    leistungen: [
      "Gehärtete Linux- und Docker-Umgebungen (Firewall, Fail2ban, SSH)",
      "Reverse-Proxy, Verschlüsselung, Backups und Monitoring",
      "Automatisierung und saubere, wiederholbare Deployments",
    ],
    ergebnis: "Eine Basis, die läuft – und die man nachts nicht im Kopf hat.",
    farbeRgb: "56, 189, 248",
    akzentHex: "#38bdf8",
  },
  {
    titel: "Security-Reviews",
    nutzen: "Ein Blick aus der Angreifer-Perspektive auf Ihre Anwendung – bevor es jemand anderes versucht.",
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
    nutzen: "Native iOS-Apps – von jemandem entwickelt, der Apps und APIs beruflich auch auf Schwachstellen prüft. So ist Sicherheit von Anfang an eingebaut, nicht nachträglich aufgesetzt.",
    leistungen: [
      "iOS-Entwicklung in Swift & SwiftUI, saubere MVVM-Architektur",
      "Auth- und API-Anbindung – Sicherheit von Anfang an mitgedacht",
      "Anbindung an KI-Funktionen und bestehende Backends",
    ],
    ergebnis: "Apps, die gut aussehen – und auch unter Druck halten.",
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
    farbeRgb: "129, 140, 248",
    bedeutung: "Die Inhaltsverzeichnis-Datei, die bei jeder neuen Anfrage automatisch mitgeladen wird. Verweist auf alles andere. Bewusst klein gehalten — was hier oben steht, sieht das Sprachmodell zuerst.",
  },
  {
    tier: "Deep",
    ort: "MEMORY_DEEP.md",
    loaded: "bei Bedarf",
    lifecycle: "abgeschlossene Themen",
    anzahl: "1 Datei",
    farbeRgb: "34, 211, 238",
    bedeutung: "Themen, die ich nicht in jeder Session brauche — z.B. abgeschlossene Research-Targets oder alte iOS-Notizen. Wird nur geladen wenn ich explizit darauf zeige. Spart ca. 875 Tokens pro Session.",
  },
  {
    tier: "Archival",
    ort: "feedback_* · project_* · reference_*",
    loaded: "wenn verlinkt",
    lifecycle: "Frontmatter mit Wichtigkeit, Vertrauen, Verifizierungs-Datum",
    anzahl: "~ 161 Dateien",
    farbeRgb: "167, 139, 250",
    bedeutung: "Das eigentliche Gedächtnis. Eine Datei pro Lektion oder Konzept. Jede Datei hat Metadaten — wie wichtig, wie sicher, wann zuletzt geprüft. Wird nur geladen wenn ein anderes Dokument auf sie verweist (Wiki-Link-Prinzip).",
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
    bedeutung: "Hier landen automatisch Beobachtungen aus Sessions — Korrekturen, Überraschungen, Widersprüche. Sie werden niemals direkt zu Memory befördert: ich gehe sie regelmäßig durch und entscheide pro Eintrag selbst, was übernommen wird. Schutz vor halluzinierten Memories.",
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
    farbeRgb: "34, 211, 238",
    beschreibung: "Asset-Discovery, CVE-Lookup, Pattern-Recall — vor jeder Hunt-Phase",
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
    farbeRgb: "99, 102, 241",
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
    farbeRgb: "129, 140, 248",
    details: "Sichert das Memory-Verzeichnis, alle Research-Notizen und die DATEV-Reports jede Nacht. Drei-Tier-Backup: Git-Repo, lokaler Snapshot, externer Sync. Bei Datenverlust ist alles in unter einer Minute wiederherstellbar.",
  },
  {
    name: "claude-bus-mobile-rotate.timer",
    typ: "timer",
    cadence: "Montag 04:30",
    output: "neuer Bearer-Token für iPhone-Endpunkt",
    farbeRgb: "129, 140, 248",
    details: "Wöchentliche Rotation des Authentifizierungs-Tokens für den iPhone-Endpunkt. Begrenzt das Schadenspotenzial, falls ein Token versehentlich offengelegt würde, auf maximal eine Woche.",
  },
  {
    name: "hacktivity-stream.timer",
    typ: "timer",
    cadence: "stündlich (+ Zufalls-Offset)",
    output: "Sofort-Alarm bei Score ≥ 75",
    farbeRgb: "129, 140, 248",
    kritisch: true,
    details: "Pollt HackerOne-Disclosure-Reports und gleicht sie mit meinen aktiven Targets ab. Wenn ein neuer Report meinen Target-Stack betrifft oder ein bekanntes Pattern bestätigt, kommt sofort eine Benachrichtigung. First-Mover-Vorteil bei neuen Vulnerability-Klassen.",
  },
  {
    name: "hacktivity-stream-digest.timer",
    typ: "timer",
    cadence: "täglich 18:00",
    output: "Tageszusammenfassung als Markdown",
    farbeRgb: "129, 140, 248",
    details: "Sammelt alle Findings, die unter dem Sofort-Alarm-Schwellenwert lagen, und liefert sie um 18 Uhr als kompakte Tageszusammenfassung. Verhindert Alarm-Müdigkeit, ohne Informationen zu verlieren.",
  },
  // ─── Services (laufen dauerhaft) — alle in Cyber-Cyan ────────────────
  {
    name: "claude-bus.service",
    typ: "service",
    cadence: "dauerhaft",
    output: "Mac ↔ Server Mailbox (Tailscale)",
    farbeRgb: "34, 211, 238",
    details: "FastMCP-Server, über den Claude Desktop auf dem Mac asynchron mit Claude Code auf dem Server kommuniziert. Tailscale-geschützt, Bearer-authentifiziert, jeder Tool-Aufruf wird auditiert.",
  },
  {
    name: "claude-bus-mobile.service",
    typ: "service",
    cadence: "dauerhaft",
    output: "iPhone ↔ Server Mailbox (Cloudflare)",
    farbeRgb: "34, 211, 238",
    details: "Zweite Mailbox-Instanz speziell für die Claude.ai-iPhone-App. OAuth-2.1-Worker auf Cloudflare davor, strenge Pfad-Allowlist auf der Server-Seite — Mobile darf lesen, schreiben nur in den Handoff-Ordner, kein Shell-Zugriff.",
  },
  {
    name: "claude-bus-anomaly.service",
    typ: "service",
    cadence: "dauerhaft",
    output: "Alarm bei Off-Hours / Burst / abgelehnten Zugriffen",
    farbeRgb: "34, 211, 238",
    kritisch: true,
    details: "Beobachtet das Audit-Log der beiden Mailbox-Services live. Bei verdächtigen Mustern — Aktivität nachts, viele Anfragen in kurzer Zeit, abgelehnte Pfade — kommt sofort ein Alarm. Frühwarnsystem für kompromittierte Tokens.",
  },
  {
    name: "caido-pipeline.service",
    typ: "service",
    cadence: "Datei-Watcher",
    output: "HAR-Analyse → Markdown-Befund",
    farbeRgb: "34, 211, 238",
    details: "Überwacht den Handoff-Ordner. Sobald ich aus Caido eine HTTP-Session als HAR-Datei exportiere, läuft sie durch zehn Pattern-Detektoren (Auth, IDOR, SSRF, CORS …) und ich bekomme einen strukturierten Befund-Report inklusive Counter-Pattern-Check gegen mein Memory.",
  },
  {
    name: "voice-bridge.service",
    typ: "service",
    cadence: "dauerhaft",
    output: "Sprachaufnahme → Claude-Session",
    farbeRgb: "34, 211, 238",
    details: "Nimmt Sprachaufnahmen vom iPhone oder Mac entgegen, schickt sie an den lokalen Whisper-Server und tippt den Text direkt in meine laufende Claude-Session. Null Anthropic-Token für Speech-to-Text, weil Whisper lokal läuft.",
  },
  {
    name: "whisper-server.service",
    typ: "service",
    cadence: "dauerhaft",
    output: "lokales Speech-to-Text (whisper.cpp)",
    farbeRgb: "34, 211, 238",
    details: "whisper.cpp-Server mit dem mehrsprachigen ggml-small-Modell (488 MB). Komplett offline, keine Cloud-Calls, kein Datentransfer nach außen. Latenz ~ 10–15 Sekunden für eine 5–15-Sekunden-Aufnahme.",
  },
  {
    name: "cloudflared.service",
    typ: "service",
    cadence: "dauerhaft",
    output: "Cloudflare-Tunnel zu m.cyp-hr.com",
    farbeRgb: "34, 211, 238",
    details: "Erzeugt einen sicheren Tunnel von Cloudflare zum Server, ohne dass ich einen Port nach außen öffnen muss. TLS automatisch erneuert, WAF + DDoS-Schutz am Edge — der iPhone-Endpunkt + Voice-UI sind nur über diesen Tunnel erreichbar.",
  },
  {
    name: "milvus-standalone.service",
    typ: "service",
    cadence: "Docker",
    output: "Vektor-Datenbank für semantische Code-Suche",
    farbeRgb: "34, 211, 238",
    details: "Milvus-Standalone-Container, in dem die Embeddings meiner indexierten Codebases liegen. Ollama erzeugt die Embeddings lokal, claude-context legt sie hier ab — dadurch funktioniert semantische Code-Suche (etwa: 'zeig mir alle Stellen wo API-Keys verarbeitet werden') komplett ohne externe APIs.",
  },
];

// Custom Slash-Commands (11 — selbst geschrieben)
export const SLASH_COMMANDS: SlashCommandModel[] = [
  // Submit + Target Pipeline
  { cmd: "/submit-gate",   purpose: "5-Phasen Final-Review: 10 Hard-Gates · Devil's-Advocate · Hacktivity-Check · Reputation-Status · Verdict: freigeben / prüfen / stoppen", gruppe: "submit-pipeline", hardRule: true },
  { cmd: "/new-target",    purpose: "7-Phasen-Onboarding: Memory-Gates · Ordner · Recon · Graph-Entity · Cross-Ref · Caido-Pre-Flight",                  gruppe: "submit-pipeline", hardRule: true },
  // Memory-Pflege (Self-Improving System)
  { cmd: "/memory-review",          purpose: "Interaktives Triage der Inbox (pending · surprises · contradictions) — Promote/Reject pro Item", gruppe: "memory-pflege" },
  { cmd: "/memory-quiz",            purpose: "Active-Recall: zufällige Memories testen — catched dead/unclear/stale",                          gruppe: "memory-pflege" },
  { cmd: "/memory-outcome",         purpose: "Submit-Resolution → confidence backprop auf zitierte Memories (STALE-Pattern)",                  gruppe: "memory-pflege" },
  { cmd: "/memory-link",            purpose: "A-MEM Auto-Linker: gewichtete Jaccard-Similarity → bidirektionale [[wiki-links]]",                gruppe: "memory-pflege" },
  { cmd: "/memory-search",          purpose: "Semantic Search via claude-context MCP (Ollama+Milvus). 'JWT' matcht 'JSON Web Token'",           gruppe: "memory-pflege" },
  { cmd: "/memory-stub",            purpose: "Auto-generiert project_<target>_bugbounty.md Master aus existierenden feedback_<target>_*.md",    gruppe: "memory-pflege" },
  { cmd: "/memory-synthesize",      purpose: "ExpeL-Pattern-Crystallization: Cluster ähnlicher Memories → synthesisierte Meta-Rule",            gruppe: "memory-pflege" },
  { cmd: "/memory-status",          purpose: "One-Screen Dashboard: Token-Tax · Tier-Verteilung · Top-5 Files · Confidence-Trends (<200ms)",    gruppe: "memory-pflege" },
  { cmd: "/memory-citation-check",  purpose: "Analyse: wie oft wurde Advice OHNE [[link]] zur Memory gegeben — Pro-Self-Feedback",              gruppe: "memory-pflege" },
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
    beispiel: "Ich habe in 14 Closes innerhalb von zwei Wochen 6 vorhersagbare Anti-Patterns gemacht. Daraus entstand diese Liste — RFC1918-DNS-Disclosures bei Shopify (0 $), Open-Redirect ohne Cookie-/Token-Klau bei Grammarly (N/A), Enumeration-Only bei GitLab (Informative).",
  },
  {
    nummer: 3,
    titel: "Konkret demonstrierter Impact",
    check: "Kein „könnte“, kein „potenziell“, kein „theoretisch“ — entweder Daten lesen, oder Aktion ausführen, oder nicht einreichen.",
    beispiel: "Falsch: „SSRF ist möglich, dadurch könnte ein Angreifer interne Services erreichen.“ Richtig: „SSRF lieferte folgenden Output vom Metadata-Endpoint: <konkretes Token>.“ Triager bewerten Demonstrated-Impact-Reports systematisch höher.",
  },
  {
    nummer: 4,
    titel: "Zwei-Account-Beweis bei BOLA / IDOR",
    check: "Bei Zugriffsbruch zwischen Accounts: Beweis mit zwei eigenen Accounts, Screenshot inklusive.",
    beispiel: "Account A erzeugt Ressource ID 42. Account B sendet GET /api/resource/42 und bekommt Account-A-Daten zurück — Screenshot mit beiden Browser-Profilen nebeneinander. Ohne diesen Beweis schließt der Triager als „architectural risk“ ohne Bounty.",
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
    check: "Manuell nach deiner exakten Asset + Klasse-Kombination suchen — nicht von einem Agent erledigen lassen.",
    beispiel: "Disclosed Reports geben den exakten Wording-Schlüssel des Triagers, was als Bounty-würdig und was als Out-of-Scope gilt. Wenn dein Befund das gleiche Pattern hat: 99 % Duplicate.",
  },
  {
    nummer: 7,
    titel: "Programm-Status live geprüft",
    check: "Programm ist aktuell aktiv für Submissions, nicht suspendiert.",
    beispiel: "Suspended-Programme sehen in deinen Lesezeichen aus wie sonst — bis du den Submit-Button drückst und einen Fehler bekommst, oder schlimmer: Report im Limbo. Vor jedem Submit das Programm-Dashboard frisch laden.",
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
    beispiel: "Vor dem Submit-Klick mental durchspielen: wie wird der Triager diesen Report wahrnehmen? Wenn das wahrscheinlichste Verdict „Informative — interesting but no real impact“ ist, dann ist es noch kein Submit-Kandidat.",
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
    problem: "'Docs erwähnen scope restriction nicht' ≠ Bug — mature payments API enforces server-side ALWAYS",
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
    lesson: "Methodology-Upgrades auf max 2 simultan kappen — low-effort/high-ROI first",
  },
  {
    titel: "Public-Blog vs HackerOne-Body",
    problem: "Sam-Curry-Style ~3.200 Wörter prose ≠ HackerOne-Submission-Body",
    lesson: "Public-Blogs sind für Audience-Reading optimiert · HackerOne-Bodies für Triager-Speed",
  },
];

// Senior-Elite Hardening Highlights (für /labor Hero-Banner)
export const ELITE_PRINZIPIEN: ReadonlyArray<{ titel: string; beschreibung: string; rgb: string }> = [
  { titel: "Discipline > Volume",     beschreibung: "12 Hard-Gates vor jedem Submit. Tier-S/A-only Whitelist. 45% Confidence-Cap ohne Server-Confirm.",   rgb: "239, 68, 68" },
  { titel: "Self-Improving",          beschreibung: "5-Tier Memory-System. 3 Lifecycle-Hooks. A-MEM Auto-Linker. Citation-Discipline als Pro-Rule.",      rgb: "129, 140, 248" },
  { titel: "Multi-Modal Workflow",    beschreibung: "Mac (GUI) + Server (Backend) + iPhone (Mobile) — Tailscale-Trust + Cloudflare-OAuth-Worker.",        rgb: "34, 211, 238" },
  { titel: "Cost-Optimized",          beschreibung: "Whisper lokal (0€ STT). Ollama+Milvus (0€ Embeddings). 30+ keyless OSINT-Quellen.",                  rgb: "34, 197, 94" },
  { titel: "Anti-Fragile",            beschreibung: "set +e · Lockfiles · Graceful Degradation · Durable Queue · Token-Auto-Rotation · Anomaly-Watcher.", rgb: "245, 158, 11" },
  { titel: "Continuous Learning",     beschreibung: "Active-Recall (Quiz). Outcome-Backprop. Pattern-Crystallization. Quartals-Refactor.",                  rgb: "167, 139, 250" },
];
