import type { ProjektModel, SkillModel, ZeitstrahlModel, SecurityStatModel, NavigationModel } from "./typen";

// ═══════════════════════════════════════════════════════
// MODEL: Alle Portfolio-Daten (Single Source of Truth)
// ═══════════════════════════════════════════════════════

export const NAVIGATION: NavigationModel[] = [
  { pfad: "#hero",       label: "Start",      abschnitt: "hero" },
  { pfad: "#ueber",      label: "Über mich",  abschnitt: "ueber" },
  { pfad: "#projekte",   label: "Projekte",   abschnitt: "projekte" },
  { pfad: "#security",   label: "Security",   abschnitt: "security" },
  { pfad: "#zeugnisse",  label: "Zeugnisse",  abschnitt: "zeugnisse" },
  { pfad: "#skills",     label: "Skills",     abschnitt: "skills" },
  { pfad: "#kontakt",    label: "Kontakt",    abschnitt: "kontakt" },
];

export const PROJEKTE: ProjektModel[] = [
  {
    titel: "NeoRecon – Bug Bounty Exploit Engine",
    kurzbeschreibung: "7-Schritt Master-Pipeline: Automatisiertes Recon → Scoring → Live-Probe → Review-Plan",
    langbeschreibung: "Vollständiges, selbst gebautes Offensive Security Framework auf einem gehärteten VPS. Die Master-Pipeline (run_master_pipeline.sh) orchestriert 7 Phasen mit Lockfile-Schutz, --resume-from, --skip-Flags und --dry-run. Engine 01 nutzt einen Single-Pass awk-Algorithmus der 500.000 URLs in 15 Sekunden durch 12 gewichtete Sicherheits-Kategorien scored. Der Asset-Splitter klassifiziert Alive-URLs automatisch in 8 Tier-Klassen nach Bounty-Potential. Die Build-Kette erzeugt Focus5-Cards mit konkreten Prüfschritten pro Kandidat. Zusätzlich: 13 spezialisierte Tools auf dem VPS (GraphQL-Suite mit 5 Tools, SSTImap, Dependency Confusion Checker, OSINT-Tools), Custom Nuclei-Templates und eine vollständige 4-Phasen-Dokumentation.",
    kategorie: "security",
    technologien: ["Bash", "awk", "httpx", "Subfinder", "Amass", "ParamSpider", "gf", "Nuclei", "dalfox", "sqlmap", "GraphQL", "Google CSE API"],
    highlights: [
      "Master-Pipeline: 7 Schritte mit --skip-Flags, --resume-from, --dry-run, Lockfile-Schutz",
      "Engine 01: Single-Pass awk-Scoring – 500k URLs in 15 Sek, 12 Kategorien, Bonus-System",
      "Asset-Split: Automatische Klassifizierung in 8 Tier-Klassen nach Bounty-Potential",
      "Build-Kette: Shortlists → Hunt-Sheet → Top-Candidates → Playbook → Focus5-Cards",
      "GraphQL-Suite: 5 Tools (graphw00f, graphql-cop, clairvoyance, GraphQLer, MCP-Server)",
      "13 Custom Tools auf VPS: SSTImap, FavFreak, confused, LinkFinder, Recon-Search-Assistant",
      "Best-Run-Selector: Gewichteter Score wählt automatisch den ergiebigsten Recon-Run",
      "4-Phasen-Dokumentation: Setup → Scope-Recon → Deep-Hunt → Finale (komplett dokumentiert)"
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
    titel: "Sports Almanach",
    kurzbeschreibung: "Interaktive Sport-Datenbank mit historischen Statistiken und Visualisierung",
    langbeschreibung: "Umfangreiche SwiftUI-Anwendung zur Erfassung und Analyse historischer Sportdaten. Komplexe Datenmodellierung mit Core Data Relationen, interaktive Charts-Visualisierung und Offline-First Architektur. Durchdachte Navigation durch verschiedene Sportarten und Zeiträume.",
    kategorie: "development",
    technologien: ["Swift", "SwiftUI", "Core Data", "Charts", "MVVM"],
    highlights: [
      "Komplexe Core Data Relationen für verschachtelte Sportdaten",
      "Interaktive Statistik-Visualisierung mit Swift Charts",
      "Offline-First Architektur mit intelligentem Caching",
      "MVVM mit sauberem Repository Pattern"
    ],
    zeitraum: "2024 – 2025",
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
  { label: "Reports eingereicht", wert: "8+",      icon: "📝" },
  { label: "Aktive Targets",      wert: "4",       icon: "🔍" },
  { label: "Pipeline-Skripte",    wert: "30+",     icon: "⚙️" },
  { label: "Custom Tools",        wert: "13",      icon: "🛠️" },
  { label: "Scoring-Kategorien",  wert: "12",      icon: "📊" },
  { label: "VPS Infrastruktur",   wert: "Hardened", icon: "🖥️" },
  { label: "GraphQL-Tools",       wert: "5",       icon: "🔗" },
];

export const TOOLS_STACK = [
  // Eigene Tools auf dem VPS
  { name: "Recon-Search-Assistant", rolle: "Custom OSINT-Suchtool mit API-Integration", kategorie: "eigenbau" },
  { name: "GraphQLer",            rolle: "Automatisierte GraphQL-Schema-Analyse", kategorie: "eigenbau" },
  { name: "graphql-cop",          rolle: "GraphQL Security Policy Checker", kategorie: "eigenbau" },
  { name: "graphw00f",            rolle: "GraphQL Engine Fingerprinting", kategorie: "eigenbau" },
  { name: "graphql-mcp-server",   rolle: "MCP-Integration für GraphQL-Testing", kategorie: "eigenbau" },
  { name: "clairvoyance",         rolle: "GraphQL Schema-Rekonstruktion ohne Introspection", kategorie: "eigenbau" },
  { name: "SSTImap",              rolle: "Server-Side Template Injection Scanner", kategorie: "eigenbau" },
  { name: "confused",             rolle: "Dependency Confusion Checker", kategorie: "eigenbau" },
  { name: "FavFreak",             rolle: "Favicon-basierte Technologie-Erkennung", kategorie: "eigenbau" },
  { name: "LinkFinder",           rolle: "JavaScript Endpoint Extraktion", kategorie: "eigenbau" },
  // Integrierte Tools
  { name: "Caido",               rolle: "Traffic Interception & Analyse", kategorie: "proxy" },
  { name: "Chrome DevTools MCP",  rolle: "Authentifizierte Browser-Automation", kategorie: "automation" },
  { name: "httpx",               rolle: "Live-Host-Discovery & Tech-Detect", kategorie: "recon" },
  { name: "Subfinder + Amass",   rolle: "Subdomain Enumeration", kategorie: "recon" },
  { name: "ParamSpider + gf",    rolle: "Parameter-Discovery & Pattern-Matching", kategorie: "recon" },
  { name: "xnLinkFinder",        rolle: "Deep Link & Parameter Extraktion", kategorie: "recon" },
  { name: "Nuclei",              rolle: "CVE-Scanning & Custom Templates", kategorie: "scanner" },
  { name: "dalfox",              rolle: "Blind/DOM XSS Detection", kategorie: "scanner" },
  { name: "Google CSE API",      rolle: "Automatisiertes Dorking (27 Kategorien)", kategorie: "osint" },
  { name: "Docker/Kali",         rolle: "Isolierte Testumgebung auf VPS", kategorie: "infrastructure" },
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
  { jahr: "1999–2014", titel: "Elektroniker",                     beschreibung: "15 Jahre Berufserfahrung – Schaltkreise, Hardware-Debugging, systematisches Denken in Zuständen", kategorie: "beruf" },
  { jahr: "2023–2025", titel: "Syntax Institut Berlin",           beschreibung: "Softwareentwicklung: Swift, SwiftUI, MVVM, Clean Architecture, iOS/macOS", kategorie: "bildung" },
  { jahr: "2024",      titel: "Erste iOS-Apps",                   beschreibung: "ONE (Multi-Agent AI), SwiftScout, NeoVimExplorer, Sports Almanach", kategorie: "meilenstein" },
  { jahr: "2025",      titel: "Bug Bounty Einstieg",              beschreibung: "Intigriti + HackerOne. Reports: Superdrug, Yahoo, Whatnot, Axel Springer", kategorie: "security" },
  { jahr: "2025",      titel: "VPS Security Lab",                 beschreibung: "Hardened Contabo VPS: Caido, Docker/Kali, Recon-Pipeline, NeoRecon CLI", kategorie: "security" },
  { jahr: "2026",      titel: "Exploit Engine v3",                beschreibung: "7-Schritt Master-Pipeline, Scoring-Algorithmus, Google CSE Dorking, Multi-Agent System", kategorie: "security" },
];

// ═══════════════════════════════════════════════════════
// PERSÖNLICHE DATEN
// ═══════════════════════════════════════════════════════

export const PERSOENLICH = {
  name: "Michael Fleps",
  standort: "Plattling, Niederbayern",
  titel: "Fullstack Security Engineer",
  untertitel: "iOS Development • Security Research • Bug Bounty",
  kurzvorstellung: "15 Jahre Systemverständnis aus der Elektronik, moderne Software-Architektur und offensive Security Research – ich verbinde praktische Tiefe mit analytischem Denken und baue Lösungen, die echte Probleme lösen.",
  email: "f.michi84.989@gmail.com",
  telefon: "0172 572 5081",
  adresse: "Geranienweg 3, 94447 Plattling",
  github: "https://github.com/NEO849",
  hackerone: "https://hackerone.com/luicypher_neo",
  intigriti: "https://app.intigriti.com/researcher/profile/cypherneo",
};
