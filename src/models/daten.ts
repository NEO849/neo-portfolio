import type { ProjektModel, SkillModel, ZeitstrahlModel, SecurityStatModel, NavigationModel } from "./typen";

// ═══════════════════════════════════════════════════════
// MODEL: Alle Portfolio-Daten (Single Source of Truth)
// ═══════════════════════════════════════════════════════

export const NAVIGATION: NavigationModel[] = [
  { pfad: "#hero",       label: "Start",      abschnitt: "hero" },
  { pfad: "#ueber",      label: "Über mich",  abschnitt: "ueber" },
  { pfad: "#projekte",   label: "Projekte",   abschnitt: "projekte" },
  { pfad: "#security",   label: "Security",   abschnitt: "security" },
  { pfad: "#osint",      label: "OSINT Lab",  abschnitt: "osint" },
  { pfad: "#zeugnisse",  label: "Dokumente",  abschnitt: "zeugnisse" },
  { pfad: "#skills",     label: "Skills",     abschnitt: "skills" },
  { pfad: "#kontakt",    label: "Kontakt",    abschnitt: "kontakt" },
];

export const PROJEKTE: ProjektModel[] = [
  {
    titel: "Neo Dev Stack – AI-Augmented Security Workstation",
    kurzbeschreibung: "31 spezialisierte Claude-Agents, 15+ MCP-Server, lokale LLM-Inferenz (Ollama + Milvus) und 80+ Security-Tools – orchestriert zu einem intelligenten Pentest-Betriebssystem",
    langbeschreibung: "Vollständig selbst gebaute, KI-augmentierte Entwicklungs- und Sicherheitsumgebung. 31 spezialisierte Pentest-Agents (Recon, Web, Cloud, Mobile, Forensics, Exploit-Chaining) laufen direkt in Claude Code und greifen über 15+ MCP-Server auf GitHub, GitLab, Firecrawl, Chrome DevTools Protocol, Brave Search und eine lokale Vektordatenbank (Milvus v2.6.14) zu. Ollama stellt lokale LLM-Inferenz bereit. Claude kann über den Chrome DevTools MCP authentifizierte Browser-Sessions steuern, DOM inspizieren und JavaScript live ausführen – ohne externen Proxy. Alle Security-Tools (osmedeus, nuclei, paramspider, sherlock, holehe, waymore) sind in 6 parallelen tmux-Sessions orchestriert. findings.db hält alle Bug-Bounty-Findings über sämtliche aktiven Targets in Sync. Die semantische Codebase-Indexierung über Milvus erlaubt bedeutungsbasierte Code-Suche über 9 indexierte Projekte.",
    kategorie: "tooling",
    technologien: ["Claude Code", "MCP Protocol", "Ollama", "Milvus", "Docker", "tmux", "Python", "Bash", "Chrome DevTools", "Firecrawl"],
    highlights: [
      "31 spezialisierte Pentest-Agents: Recon, Web, Cloud, Mobile, Forensics, Exploit-Chaining",
      "15+ MCP-Server: GitHub, GitLab, Firecrawl, Chrome DevTools, Brave Search, Claude Context, YouTube",
      "Lokale LLM-Inferenz: Ollama + Open WebUI + Milvus v2.6.14 (Vektordatenbank, 882 Chunks)",
      "Chrome DevTools MCP: Claude steuert authentifizierte Browser-Sessions direkt aus dem Chat",
      "6 parallele tmux-Sessions mit 80+ integrierten CLI-Security-Tools",
      "Semantic Code Search: bedeutungsbasierte Suche über 9 indexierte Codebases",
      "findings.db: SQLite-Tracking aller Bug-Bounty-Findings über alle aktiven Targets",
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
  { label: "Plattformen",         wert: "2",       icon: "🎯" },
  { label: "Reports eingereicht", wert: "9",       icon: "📝" },
  { label: "Aktive Targets",      wert: "4",       icon: "🔍" },
  { label: "Pipeline-Skripte",    wert: "30+",     icon: "⚙️" },
  { label: "Custom Tools",        wert: "13",      icon: "🛠️" },
  { label: "Scoring-Kategorien",  wert: "12",      icon: "📊" },
  { label: "VPS Infrastruktur",   wert: "Hardened", icon: "🖥️" },
  { label: "GraphQL-Tools",       wert: "5",       icon: "🔗" },
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
    titel: "Elektronik & technische Systeme",
    beschreibung: "15 Jahre Praxis in Elektronik, Netzwerk-, Server-, Telefon- und Videoanlagen. Starkes Fundament in Fehlersuche, Dokumentation, Systemlogik und sauberer technischer Umsetzung.",
    kategorie: "beruf",
  },
  {
    jahr: "2014–2018",
    titel: "Interdisziplinäre Praxis & Verantwortung",
    beschreibung: "Arbeit in einem interdisziplinären Team mit Verantwortung für Gruppen, strukturierte Abläufe und Dokumentation. Kommunikation, Konfliktlösung, Qualitätsdenken und ruhiges Handeln in anspruchsvollen Situationen.",
    kategorie: "teamarbeit",
  },
  {
    jahr: "2020–2026",
    titel: "Linux, Server & Administration",
    beschreibung: "Aufbau und Betrieb von Linux-Systemen, VPS-Umgebungen, SSH, Docker, Firewalling, Terminal-Workflows und reproduzierbaren Toolchains.",
    kategorie: "infrastruktur",
  },
  {
    jahr: "2023–2025",
    titel: "Syntax Institut Berlin",
    beschreibung: "Vollzeit-Ausbildung in Softwareentwicklung mit Fokus auf Swift, SwiftUI, UIKit, Kotlin, MVVM, Clean Architecture, iOS/macOS und Android.",
    kategorie: "bildung",
  },
  {
    jahr: "2024–2025",
    titel: "Native Apps & Architektur",
    beschreibung: "ONE, Sports Almanach, NeoVimExplorer und weitere App-Projekte mit SwiftUI, MVVM, modularer Struktur, API-Anbindung, State-Management und sauberer Wartbarkeit.",
    kategorie: "entwicklung",
  },
  {
    jahr: "2025–2026",
    titel: "Security Research & Bug Bounty",
    beschreibung: "Eigene Recon-, OSINT- und Bug-Bounty-Pipelines auf Linux/VPS-Basis. Fokus auf GraphQL, OAuth, API-Security, Scoring, Reporting und reproduzierbare Schwachstellenanalyse.",
    kategorie: "security",
  },
  {
    jahr: "2026",
    titel: "Tooling & Automatisierung",
    beschreibung: "Eigene Tools: Recon-Search-Assistant, Pipeline-Engine, Dashboard, OSINT Toolkit und Security-Helfer für strukturierte Analyse, Priorisierung und Reporting.",
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
