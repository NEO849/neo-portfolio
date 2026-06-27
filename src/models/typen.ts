// ═══════════════════════════════════════════════════════
// MODEL: Typ-Definitionen für das gesamte Portfolio
// ═══════════════════════════════════════════════════════

/** Ein Screenshot in der Projekt-Bildergalerie. */
export interface ProjektBild {
  /** Pfad ab /public, z.B. "/projekte/sports-almanach/sport_home_3.webp". */
  readonly quelle: string;
  /** Kurzer Titel des Screenshots. */
  readonly titel: string;
  /** Ein Satz Kontext zum Screenshot. */
  readonly text: string;
}

export interface ProjektModel {
  readonly titel: string;
  readonly kurzbeschreibung: string;
  readonly langbeschreibung: string;
  readonly kategorie: "security" | "development" | "tooling";
  readonly technologien: string[];
  readonly highlights: string[];
  readonly linkGithub?: string;
  readonly linkLive?: string;
  /** Interne Route zu einer In-App-Demo (z.B. "/voice-demo"). */
  readonly linkDemo?: string;
  /** Slug für die Bildergalerie-Route "/projekte/<slug>/bilder". */
  readonly galerieSlug?: string;
  /** Screenshots für die Bildergalerie (gleiche Bilder wie im README). */
  readonly bilder?: ProjektBild[];
  readonly zeitraum: string;
  readonly status?: "aktiv" | "abgeschlossen" | "in-entwicklung";
}

export interface SkillModel {
  readonly name: string;
  readonly level: 1 | 2 | 3 | 4 | 5;
  readonly kategorie: "security" | "development" | "infrastructure" | "tools";
}

export interface ZeitstrahlModul {
  readonly name: string;
  readonly skills: ReadonlyArray<string>;
}

export interface ZeitstrahlModel {
  readonly jahr: string;
  readonly titel: string;
  readonly beschreibung: string;
  readonly kategorie: "beruf" | "teamarbeit" | "infrastruktur" | "bildung" | "entwicklung" | "security" | "eigenbau";
  readonly module?: ReadonlyArray<ZeitstrahlModul>;
  /** Überschrift über dem Modul-Block. Default: "Module & Schwerpunkte". */
  readonly modulTitel?: string;
}

export interface SecurityStatModel {
  readonly label: string;
  readonly wert: string;
  readonly icon: string;
}

export interface NavigationModel {
  readonly pfad: string;
  readonly label: string;
  readonly abschnitt: string;
}

export interface PipelineSchritt {
  readonly nummer: number;
  readonly name: string;
  readonly skript: string;
  readonly beschreibung: string;
  readonly output: string;
}

export interface ScoringKategorie {
  readonly name: string;
  readonly score: number;
  readonly grund: string;
}

// ═══════════════════════════════════════════════════════
// SENIOR-ELITE: markmem — selbst-lernendes KI-Gedächtnis (5-Tier-Laden)
// ═══════════════════════════════════════════════════════

export interface MemoryTierModel {
  readonly tier: string;
  readonly ort: string;
  readonly loaded: string;
  readonly lifecycle: string;
  readonly anzahl?: string;
  readonly farbeRgb: string;        // "79, 124, 251" Format
  /** Optionale Klartext-Erklärung für Aufklapp-Detail. */
  readonly bedeutung?: string;
}

// ═══════════════════════════════════════════════════════
// SENIOR-ELITE: MCP-Arsenal (25 MCPs in 5 Kategorien)
// ═══════════════════════════════════════════════════════

export interface McpKategorieModel {
  readonly kategorie: string;
  readonly icon: string;
  readonly farbeRgb: string;
  readonly mcps: ReadonlyArray<{ name: string; rolle: string; eigenbau?: boolean }>;
  readonly beschreibung: string;
}

// ═══════════════════════════════════════════════════════
// SENIOR-ELITE: Auto-Workflows (systemd Timers + Services)
// ═══════════════════════════════════════════════════════

export interface AutoWorkflowModel {
  readonly name: string;
  readonly typ: "timer" | "service";
  readonly cadence: string;
  readonly output: string;
  readonly farbeRgb: string;
  readonly kritisch?: boolean;
  /** Optionale Klartext-Erklärung für Aufklapp-Detail (was macht das konkret?). */
  readonly details?: string;
}

// ═══════════════════════════════════════════════════════
// SENIOR-ELITE: Custom Slash-Commands (11)
// ═══════════════════════════════════════════════════════

export interface SlashCommandModel {
  readonly cmd: string;
  readonly purpose: string;
  readonly gruppe: "submit-pipeline" | "memory-pflege";
  readonly hardRule?: boolean;
}

// ═══════════════════════════════════════════════════════
// SENIOR-ELITE: Custom Skills (11)
// ═══════════════════════════════════════════════════════

export interface CustomSkillModel {
  readonly name: string;
  readonly trigger: string;
  readonly purpose: string;
  readonly gruppe: "bb-lifecycle" | "master-skill";
}

// ═══════════════════════════════════════════════════════
// SENIOR-ELITE: Submit-Hard-Gates (12 Gates)
// ═══════════════════════════════════════════════════════

export interface HardGateModel {
  readonly nummer: number;
  readonly titel: string;
  readonly check: string;
  /** Optionales konkretes Beispiel für Aufklapp-Detail. */
  readonly beispiel?: string;
}
