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
    kurzbeschreibung: "32 spezialisierte Claude-Agents, 25 MCP-Server, 11 selbst geschriebene Skills, 11 Slash-Commands, lokale LLM-Inferenz (Ollama + Milvus) und 80+ Security-Tools – orchestriert zu einem intelligenten Pentest-Betriebssystem",
    langbeschreibung: "Vollständig selbst gebaute, KI-augmentierte Entwicklungs- und Sicherheitsumgebung. 32 spezialisierte Pentest-Agents (Recon, Web, Cloud, Mobile, Forensics, Exploit-Chaining) laufen direkt in Claude Code und greifen über 25 MCP-Server auf Censys (Eigenbau, Platform-API v3), Shodan, Exa Neural Search, GitHub, Firecrawl, Chrome DevTools, Sequential-Thinking, Memory-Graph, findings-db und eine lokale Vektordatenbank (Milvus v2.6.14) zu. Ollama stellt lokale LLM-Inferenz mit nomic-embed-text bereit. Custom Status-Line zeigt jederzeit Reputation-Status + Pending-Submits. PreToolUse-Hook warnt automatisch vor HackerOne-Aggregator-Fallen. 11 selbst geschriebene Skills (research, live-intel-pipeline, authrecon, caido-tunnel, bounty-*) und 11 Slash-Commands (/submit-gate, /new-target, /memory-*) automatisieren die komplette Bug-Bounty-Pipeline.",
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
    kurzbeschreibung: "Selbst-lernendes 5-Tier-Memory-System mit Hooks, Confidence-Decay und A-MEM-Linking – Theorie-fundiert auf MemGPT, Park et al. Generative Agents und A-MEM (NeurIPS 2025)",
    langbeschreibung: "Eigenentwickeltes Memory-System für Claude Code, das aus jeder Session lernt. 5-Tier-Architektur (Core / Deep / Archival / Recall / Staging) verhindert Token-Bloat und Context-Loss. Drei UserPromptSubmit/SessionStart/SessionEnd-Hooks erfassen automatisch User-Korrekturen und Bestätigungen ('Surprise-Capture' nach Reflexion-Paper), schreiben Session-Digests und zeigen einen smarten Banner bei pending Inbox-Items. Frontmatter v2 trägt importance/confidence/last_verified-Felder; /memory-outcome propagiert Submit-Resolutions als Confidence-Updates zurück auf zitierte Memories (STALE-Pattern). /memory-link generiert bidirektionale Wiki-Links via gewichtete Jaccard-Similarity (A-MEM, NeurIPS 2025). /memory-synthesize crystallisiert Cluster ähnlicher Memories zu Meta-Rules (ExpeL-Pattern). Citation-Discipline als Pro-Rule: jede non-triviale Empfehlung muss [[wiki-link]] enthalten. Daily-Cron (04:00) macht read-only Health-Check + auto-commit. Aktuell 161 Memory-Files, 12 Memory-Scripts, alle vollständig versioniert via Git.",
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
      "161 Memory-Files · 11 Slash-Commands · 12 Backend-Scripts · 100% lokal",
    ],
    zeitraum: "2025 – heute",
    status: "aktiv",
  },
  {
    titel: "claude-bus – Mac↔Server↔iPhone Mailbox-Bridge",
    kurzbeschreibung: "Tier-1 (Mac via Tailscale) + Tier-2 (iPhone via Cloudflare + OAuth-Worker) Mailbox-Bridge. FastMCP, asynchrone Tasks, Anomaly-Watcher, Audit-Log",
    langbeschreibung: "Selbst gebaute Bidirektionale Bridge zwischen Claude Desktop (Mac, Opus 4.7), Claude Code (Linux-VPS, Opus 4.7) und Claude.ai iPhone-App. Tier-1 läuft als FastMCP Streamable-HTTP Server auf dem VPS, ist via Tailscale-WireGuard nur für den Mac erreichbar, Bearer-Token-authentifiziert. Tier-2 für iPhone läuft über Cloudflare-Tunnel mit selbst gebautem OAuth 2.1 Cloudflare Worker (492 Zeilen, PKCE-S256 mandatory, constant-time secret compare, Redirect-URI-Allowlist, KV-Storage für gehashte Tokens mit 1h Access-TTL + 30d Refresh-Rotation). Hardware-Allowlist-Hardening: Tier-2 darf nur an einen Recipient senden (claude_bus), nur in /root/handoff/ schreiben, hat keinen Bash-Zugriff. Anomaly-Watcher monitort das Audit-Log live auf Off-Hours/Burst/Denied/New-Path-Pattern und schickt Alerts. Wöchentliche systemd-Token-Rotation läuft Montag 04:30. Etablierte Topic-Konvention (task/result/note/ask/alert/briefing) und klare Arbeitsteilung Desktop (GUI/Caido/DevTools) vs Code (Backend/Pipelines/Memory).",
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
    kurzbeschreibung: "iPhone-Voice direkt in die Claude-tmux-Session – lokaler Whisper-Server (0€ STT), Apple-Niveau Web-UI mit Audio-Visualizer, durable Fallback-Queue",
    langbeschreibung: "Selbst gebaute Voice-to-Claude-Bridge ohne Anthropic-Token-Verbrauch für STT. iPhone- oder Mac-Browser nimmt Audio via MediaRecorder auf, schickt es via Cloudflare-Tunnel (Bearer-Auth, TLS) an FastAPI-Daemon auf dem VPS. Daemon konvertiert mit ffmpeg, sendet an lokalen whisper.cpp HTTP-Server (ggml-small.bin, 488 MB, mehrsprachig, ~10-15s Latenz für 5-15s-Aufnahme). Transcript landet via tmux load-buffer + paste-buffer in der resolved Claude-CLI-Session — Smart Target Resolver findet automatisch die richtige Session (env TMUX_TARGET → pane_current_command 'claude' → durable Queue als Fallback). Apple-Niveau UI v3 mit Sidebar-History (Datums-Gruppen), Mic-Orb (260px, 3 States: idle breathing / recording red glow / busy blue pulse), Audio-Visualizer (7 Bars via AnalyserNode), Session-Picker, Language-Segment (DE/EN/auto). Security: Audio nur in /dev/shm/voice/ (tmpfs RAM-only), automatische finally-Cleanup, Rate-Limit 10req/60s sliding, systemd hardening (ProtectSystem, NoNewPrivileges, MemoryMax, CPUQuota). PWA-fähig, Spacebar toggelt Aufnahme.",
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
    linkLive: "https://m.cyp-hr.com/voice/ui",
    zeitraum: "2025 – heute",
    status: "aktiv",
  },
  {
    titel: "bb_recon – Senior-Elite Bug-Bounty OSINT-Toolkit",
    kurzbeschreibung: "Asynchrones CLI mit 30+ keyless OSINT-Quellen, Tor-optional, Target-aware – 510 Findings in 1s bei IP-Recon",
    langbeschreibung: "Selbst entwickeltes Python-CLI für autorisierte Bug-Bounty Target-Recon. asyncio.gather orchestriert massive Parallelität — 510 Findings in 1 Sekunde beim IP-Test. Aggregiert 30+ kostenlose, keyless OSINT-Quellen in einem konsistenten JSON+Markdown+Terminal-Output: Breach-Daten (XposedOrNot, HIBP, LeakCheck), DNS (Cloudflare DoH, HackerTarget, crt.sh), Subdomain (CommonCrawl-CDX Wildcard, Wayback-CDX, hostsearch), IP (RIPEstat ASN/Prefix/Neighbours, ip-api Batch+Threat-Flags, Shodan InternetDB), Historisch (Wayback, Arquivo.pt, CommonCrawl), Identity (Gravatar, GitHub-Search, PGP keys.openpgp.org), Tor (DDG-Onion, Ahmia, archive.is-Onion), Username (WhatsMyName 600+ Plattformen), Image (SauceNAO + 13 Aggregatoren). Graceful degradation: ein Modul-Fail blockiert andere nicht. Confidence-Score HIGH/MEDIUM/LOW/UNVERIFIED pro Finding. Smart Dedup merged Findings aus mehreren Quellen. --tor Flag routet über SOCKS5 127.0.0.1:9150 für anonyme Recherche.",
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
    titel: "NeoRecon – Bug Bounty Exploit Engine",
    kurzbeschreibung: "7-Schritt Master-Pipeline: Automatisiertes Recon → Scoring → Live-Probe → Review-Plan",
    langbeschreibung: "Vollständiges, selbst gebautes Offensive Security Framework auf einem gehärteten VPS. Die Master-Pipeline (run_master_pipeline.sh) orchestriert 7 Phasen mit Lockfile-Schutz, --resume-from, --skip-Flags und --dry-run. Engine 01 nutzt einen Single-Pass awk-Algorithmus der 500.000 URLs in 15 Sekunden durch 12 gewichtete Sicherheits-Kategorien scored. Der Asset-Splitter klassifiziert Alive-URLs automatisch in 8 Tier-Klassen nach Bounty-Potential. Die Build-Kette erzeugt Focus5-Cards mit konkreten Prüfschritten pro Kandidat. Zusätzlich: 13 spezialisierte Tools auf dem VPS (GraphQL-Suite mit 5 Tools, SSTImap, Dependency Confusion Checker, OSINT-Tools), Custom Nuclei-Templates und eine vollständige 4-Phasen-Dokumentation.",
    kategorie: "security",
    technologien: ["Bash", "awk", "httpx", "Subfinder", "Amass", "ParamSpider", "gf", "Nuclei", "dalfox", "sqlmap", "GraphQL", "Brave Search API"],
    highlights: [
      "Master-Pipeline: 7 Schritte mit --skip-Flags, --resume-from, --dry-run, Lockfile-Schutz",
      "Engine 01: Single-Pass awk-Scoring – 500k URLs in 15 Sek, 12 Kategorien, Bonus-System",
      "Asset-Split: Automatische Klassifizierung in 8 Tier-Klassen nach Bounty-Potential",
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
    kurzbeschreibung: "Browser-basiertes Dashboard für manuelles Vulnerability-Testing: scored und kategorisierte URLs aus der Recon-Pipeline, Replay-Engine via Caido-Proxy, Advanced Diff-Analyse und Attack-Chain-Visualisierung",
    langbeschreibung: "Eigenentwickeltes Web-Interface das direkt an die Recon-Pipeline angebunden ist. Das Backend (Node.js + Express) liest die bewerteten URL-Listen aus engine_01_extract_and_rank.sh und stellt drei Kern-Endpunkte bereit: Replay sendet HTTP-Anfragen live durch den Caido-Proxy (127.0.0.1:8080) und erfasst Status und Response-Länge. Diff testet mehrere Payload-Varianten und loggt Abweichungen. Advanced Diff legt zuerst eine saubere Baseline an und flaggt dann alle Statuscode-Änderungen sowie Content-Length-Abweichungen über 50 Byte. Das Frontend kategorisiert Findings nach Typ (OAUTH, ADMIN, AUTH, API, JS, GENERIC), rendert Attack-Chains als interaktives Flussdiagramm via vis-network und bietet ein localStorage-basiertes Favoriten-System pro Target.",
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
    kurzbeschreibung: "Native iOS-App die Claude, GPT und Gemini in einem Interface orchestriert",
    langbeschreibung: "SwiftUI-App mit MVVM-Architektur, die mehrere KI-Modelle parallel orchestriert. Sichere API-Key-Verwaltung über iOS Keychain, Firestore-Synchronisation, Combine-basierte reaktive Datenströme und durchdachte UI/UX mit Dark Mode. Repository Pattern für saubere Datenschicht-Abstraktion.",
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
    kurzbeschreibung: "SwiftUI-App mit eigenem Quoten-Algorithmus: berechnet Wettquoten aus historischen Ergebnissen und Austragungsort – Spielgeld-Wetten, Firebase Auth, Firestore, Spieler- und Teamvergleiche",
    langbeschreibung: "Native SwiftUI-App mit MVVM-Architektur, die als digitale Sport-Zentrale und Wettplattform funktioniert. Das Herzstück ist ein eigenentwickelter Quoten-Algorithmus: Aus historischen Ergebnissen und dem Austragungsort (Heim/Auswärts) berechnet er dynamisch Wettquoten für kommende Partien. Nutzer können mit virtuellem Spielgeld auf Events tippen und ihren Kontostand in Echtzeit verfolgen. Firebase Auth sichert die Authentifizierung, Firestore synchronisiert alle Nutzerdaten und Wettverläufe. Umfangreiche Spieler- und Teamprofile, direkte Vergleiche nach Form, Saison und Heim-/Auswärtsstatistik sowie ein zentraler Sport-Kalender mit Favoriten machen die App zum vollständigen Analyse-Tool.",
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
    kurzbeschreibung: "Native Android-App als vollständiges DBZ-Nachschlagewerk: Charaktere, Transformationsstufen, Fraktionen und das gesamte Universum – im Old-School Street-Fighter-Look, Daten via spanischer API mit automatischer Deutsch-Übersetzung",
    langbeschreibung: "Native Android-App in Kotlin, die das gesamte Dragon-Ball-Z-Universum als interaktives Kompendium abbildet: Helden, Schurken, Transformationsstufen (Super Saiyajin 1–4, Ultra Instinct, Legendary Super Saiyan u.v.m.), Fraktionen, Planeten und alle zentralen Charaktere von Son Goku bis Vegeta, Gohan, Frieza und Cell. Das visuelle Design orientiert sich am Old-School-Arcade-Look der Street-Fighter-Ära — markante Rahmen, kraftvolle Typografie, kontrastreiches Farbschema. Die Datenbasis stammt aus einer spanischsprachigen Dragon-Ball-API; eine zweite API übersetzt alle Inhalte automatisch ins Deutsche und stellt sie strukturiert zur Anzeige bereit. Saubere Architektur mit Repository Pattern, Custom RecyclerView-Adaptern und SharedPreferences für persistente Nutzereinstellungen.",
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
    kurzbeschreibung: "Python-basiertes OSINT-Tool mit 7 Modulen: E-Mail, Username, Telefon, Domain, Reverse Image, Exposure",
    langbeschreibung: "Eigenentwickeltes, modulares OSINT-Framework in Python mit interaktivem Terminal-Menü und CLI-Modus. 7 spezialisierte Module: E-Mail-Analyse (holehe + LeakCheck API), Username-Suche (sherlock mit Plattform-Gruppierung), Telefon-Analyse (phoneinfoga + NumVerify + LeakCheck), Domain/DNS/WHOIS, Reverse Image Search (mit Varianten-Erzeugung, EXIF-Analyse, Browser-Automation und HTML-Report-Engine). Saubere Architektur mit core/-Schicht (Runner, Validator, Formatter, Parser, Export-Helper) und automatischer Report-Ablage in TXT + JSON pro Modul.",
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
  { label: "MCP-Server",         wert: "25",  icon: "⚡" },
  { label: "Pentest-Agents",     wert: "32",  icon: "🤖" },
  { label: "Custom Skills",      wert: "11",  icon: "✦" },
  { label: "Slash-Commands",     wert: "11",  icon: "/" },
  { label: "Memory-Files",       wert: "161", icon: "🧠" },
  { label: "systemd Workflows",  wert: "12",  icon: "⟳" },
  { label: "OSINT-Quellen",      wert: "30+", icon: "🛰" },
  { label: "Hard-Gates",         wert: "12",  icon: "🛡" },
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
  { name: "Bug Bounty Hunting",        level: 3, kategorie: "security" },
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
    beschreibung: "Gesellenbrief als Elektroinstallateur (HWK Niederbayern-Oberpfalz, 2003). Vierjährige Ausbildung bei Fa. Freise in Deggendorf, anschließend über ein Jahrzehnt Berufspraxis in Elektronik, Netzwerk-, Server-, Telefon- und Videoanlagen. Fundament in Fehleranalyse, technischer Dokumentation und Systemlogik.",
    kategorie: "beruf",
  },
  {
    jahr: "2014–2018",
    titel: "Teamführung & interdisziplinäre Praxis",
    beschreibung: "Mehrjährige Verantwortung für Gruppenkoordination, strukturierte Abläufe und Qualitätssicherung in einem interdisziplinären Team. Kommunikation auf Augenhöhe, Konfliktlösung und ruhiges Handeln in anspruchsvollen Situationen – Qualitäten, die meine Arbeitsweise bis heute prägen.",
    kategorie: "teamarbeit",
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
    titel: "Security Research & Bug Bounty",
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
  standort: "Nürnberg, Bayern",
  titel: "Security Researcher & iOS Developer",
  untertitel: "iOS Development • Security Research • Linux & Server Administration",
  kurzvorstellung: "15 Jahre Systemverständnis aus der Elektronik, moderne Software-Architektur und offensive Security Research – ich verbinde praktische Tiefe mit analytischem Denken und baue Anwendungen, die echte Probleme lösen.",
  email: "michael_fleps@aol.com",
  telefon: "015678 309580",
  adresse: "Nürnberg, Bayern",
  github: "https://github.com/NEO849",
  hackerone: "https://hackerone.com/luicypher_neo",
  intigriti: "https://app.intigriti.com/researcher/profile/cypherneo",
};

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
    loaded: "jeder Turn",
    lifecycle: "Hand-kuratiert ≤195 Zeilen",
    anzahl: "1 Datei",
    farbeRgb: "129, 140, 248",
  },
  {
    tier: "Deep",
    ort: "MEMORY_DEEP.md",
    loaded: "on-demand explizit",
    lifecycle: "Past-Targets, iOS/CSS, STALE",
    anzahl: "1 Datei",
    farbeRgb: "34, 211, 238",
  },
  {
    tier: "Archival",
    ort: "feedback_* · project_* · reference_*",
    loaded: "bei Recall via Wiki-Link",
    lifecycle: "Frontmatter v2 (importance · confidence · last_verified)",
    anzahl: "~161 Files",
    farbeRgb: "167, 139, 250",
  },
  {
    tier: "Recall",
    ort: "sessions/YYYY-MM-DD-<id>.md",
    loaded: "auf Anfrage",
    lifecycle: "SessionEnd-Hook · 90d Hot · dann Archive",
    anzahl: "Auto-generiert",
    farbeRgb: "34, 197, 94",
  },
  {
    tier: "Staging",
    ort: "inbox/{pending,surprises,contradictions}.md",
    loaded: "nur via /memory-review",
    lifecycle: "Append-only · niemals direkt promoted",
    anzahl: "Hook-gefüttert",
    farbeRgb: "245, 158, 11",
  },
];

// MCP-Arsenal — 25 verbundene MCPs in 5 Kategorien
export const MCP_KATEGORIEN: McpKategorieModel[] = [
  {
    kategorie: "Recon & Intel",
    icon: "🛰",
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
    icon: "🧠",
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
    icon: "🌐",
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
    icon: "☁️",
    farbeRgb: "34, 197, 94",
    beschreibung: "Library-Docs aktuell halten, Cross-Device Sync",
    mcps: [
      { name: "Cloudflare Dev Platform", rolle: "D1, R2, KV, Workers, Hyperdrive" },
      { name: "Firebase",                rolle: "Crashlytics, Auth, Hosting, Firestore" },
      { name: "Context7",                rolle: "Library-Docs aktuell (statt Training-Data)" },
      { name: "Google Drive · Calendar · Gmail", rolle: "Workflow-Integration" },
      { name: "claude-bus",              rolle: "Mac↔Server Tier-1 (Tailscale)", eigenbau: true },
      { name: "claude-bus-mobile",       rolle: "iPhone↔Server Tier-2 (Cloudflare + OAuth)", eigenbau: true },
    ],
  },
  {
    kategorie: "Workflow-Helper",
    icon: "⚙",
    farbeRgb: "245, 158, 11",
    beschreibung: "Submit-Timing, Berechnungen, Transcripts",
    mcps: [
      { name: "time",                  rolle: "Submit-Timing, Timezone-Math, US-Holiday-Awareness" },
      { name: "Wolfram Alpha",         rolle: "Berechnungen + Wolfram-Language" },
      { name: "youtube",               rolle: "Transcript-Extract" },
      { name: "sequential-thinking",   rolle: "Strukturierte Hypothesen-Branching" },
    ],
  },
];

// Auto-Workflows (systemd Timers + Services)
export const AUTO_WORKFLOWS: AutoWorkflowModel[] = [
  // Timers
  { name: "claude-backup.timer",            typ: "timer",   cadence: "täglich 04:15", output: "Git-Repo + rsync-Snapshots", farbeRgb: "99, 102, 241" },
  { name: "claude-bus-mobile-rotate.timer", typ: "timer",   cadence: "Mo 04:30",      output: "Bearer-Token-Rotation Tier-2", farbeRgb: "245, 158, 11" },
  { name: "hacktivity-stream.timer",        typ: "timer",   cadence: "hourly +600s",  output: "Mailbox-Alert bei Score ≥75",  farbeRgb: "34, 211, 238", kritisch: true },
  { name: "hacktivity-stream-digest.timer", typ: "timer",   cadence: "täglich 18:00", output: "Markdown nach code-to-desktop", farbeRgb: "34, 211, 238" },
  // Services (continuous)
  { name: "claude-bus.service",          typ: "service", cadence: "continuous", output: "Tier-1 MCP für Mac (Tailscale)",         farbeRgb: "129, 140, 248" },
  { name: "claude-bus-mobile.service",   typ: "service", cadence: "continuous", output: "Tier-2 MCP für iPhone (Cloudflare)",    farbeRgb: "167, 139, 250" },
  { name: "claude-bus-anomaly.service",  typ: "service", cadence: "continuous", output: "Off-Hours/Burst/Denied/New-Path Alerts", farbeRgb: "239, 68, 68",  kritisch: true },
  { name: "caido-pipeline.service",      typ: "service", cadence: "inotify",    output: "10-Detector HAR-Analyse → Mailbox",     farbeRgb: "34, 197, 94" },
  { name: "voice-bridge.service",        typ: "service", cadence: "continuous", output: "Whisper-Voice → tmux (0€ STT)",          farbeRgb: "34, 211, 238" },
  { name: "whisper-server.service",      typ: "service", cadence: "continuous", output: "whisper.cpp HTTP (ggml-small, 488MB)",   farbeRgb: "34, 211, 238" },
  { name: "cloudflared.service",         typ: "service", cadence: "continuous", output: "CF-Tunnel m.cyp-hr.com",                  farbeRgb: "245, 158, 11" },
  { name: "milvus-standalone.service",   typ: "service", cadence: "Docker",     output: "Vektor-DB für claude-context",            farbeRgb: "167, 139, 250" },
];

// Custom Slash-Commands (11 — selbst geschrieben)
export const SLASH_COMMANDS: SlashCommandModel[] = [
  // Submit + Target Pipeline
  { cmd: "/submit-gate",   purpose: "5-Phasen Final-Review: 10 Hard-Gates · Devil's-Advocate · Hacktivity-Check · Reputation-Status · Verdict ✅/⚠️/❌", gruppe: "submit-pipeline", hardRule: true },
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
  // Bug-Bounty Lifecycle (Phase 1–10)
  { name: "bounty-analyse-1",         trigger: "bounty analysieren",  purpose: "Voll-Analyse BB-Programm: Scope · OOS · Bounty-Range · EV-Math · Konkurrenzniveau",     gruppe: "bb-lifecycle" },
  { name: "bounty-target-setup-0",    trigger: "neues Ziel erstellen", purpose: "Ordnerstruktur + Startdateien unter ~/bugbounty/targets/<name>/",                       gruppe: "bb-lifecycle" },
  { name: "bounty-dateien-befüllen-2",trigger: "target befüllen",      purpose: "scope.md · scope_seeds · OOS · request_identity aus rohem Brief",                       gruppe: "bb-lifecycle" },
  { name: "bounty-priorisierung-1",   trigger: "priorisierung",        purpose: "Hypothesengetriebene Re-Priorisierung (max 45% ohne Server-Confirm)",                   gruppe: "bb-lifecycle" },
  { name: "bounty-diff-analyse-2",    trigger: "diff analyse",         purpose: "HTTP-Request/Response-Diff → leitet nächsten manuellen Test ab",                        gruppe: "bb-lifecycle" },
  { name: "bounty-reporting-3",       trigger: "reporting",            purpose: "Roh-Entwurf für autorisierten Report (nur belegte Fakten, kein erfundener Impact)",    gruppe: "bb-lifecycle" },
];

// Submit Hard-Gates (12 — Pflicht vor jedem Submit)
export const HARD_GATES: HardGateModel[] = [
  { nummer: 1,  titel: "Klasse in Tier S/A/B Whitelist",  check: "Submit-Eligible Vuln-Class? Wenn nein: STOP" },
  { nummer: 2,  titel: "Klasse nicht in Blacklist",       check: "Topology · Open-Redirect-ohne-Chain · Enumeration · CVE-Stretch?" },
  { nummer: 3,  titel: "Demonstrated Impact PoC",          check: "Kein 'could be' · 'potentially' · 'theoretically'" },
  { nummer: 4,  titel: "2-Account-Proof bei BOLA/IDOR",   check: "Non-negotiable: Account A sieht Daten von Account B" },
  { nummer: 5,  titel: "Hacktivity 5-Query-Manual-Check", check: "Resolved + Informative sorted — Original-Report-Disposition prüfen" },
  { nummer: 6,  titel: "Original-Report-Search",          check: "Manuelle Suche für deine Asset+Class-Kombi (nicht agent-driven)" },
  { nummer: 7,  titel: "Programm-Status live OPEN",       check: "Kein Suspended Program · LIVE prüfen" },
  { nummer: 8,  titel: "OOS-Klauseln re-checked",         check: "Für deine spezifische Finding-Class neu prüfen" },
  { nummer: 9,  titel: "CVSS-Math sauber",                check: "Keine S:C-Stretch · keine Severity-Inflation" },
  { nummer: 10, titel: "Wording-Pass",                    check: "Keine speculative-impact-Wörter · keine Adversary-Role-Inflation" },
  { nummer: 11, titel: "Demonstrated-impact Single-Sentence", check: "'Attacker gain: X concrete data retrieved' — wenn nicht möglich: STOP" },
  { nummer: 12, titel: "Anti-Triager-Wording",            check: "Würde Triager schreiben 'interesting analysis but no real impact'? → STOP" },
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
