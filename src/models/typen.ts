// ═══════════════════════════════════════════════════════
// MODEL: Typ-Definitionen für das gesamte Portfolio
// ═══════════════════════════════════════════════════════

export interface ProjektModel {
  readonly titel: string;
  readonly kurzbeschreibung: string;
  readonly langbeschreibung: string;
  readonly kategorie: "security" | "development" | "tooling";
  readonly technologien: string[];
  readonly highlights: string[];
  readonly linkGithub?: string;
  readonly linkLive?: string;
  readonly zeitraum: string;
  readonly status: "aktiv" | "abgeschlossen" | "in-entwicklung";
}

export interface SkillModel {
  readonly name: string;
  readonly level: 1 | 2 | 3 | 4 | 5;
  readonly kategorie: "security" | "development" | "infrastructure" | "tools";
}

export interface ZeitstrahlModel {
  readonly jahr: string;
  readonly titel: string;
  readonly beschreibung: string;
  readonly kategorie: "bildung" | "beruf" | "security" | "meilenstein";
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
