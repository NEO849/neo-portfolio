// ═══════════════════════════════════════════════════════════════════
// MODEL: Referenzen / Belege — anonymisierte echte Befunde (Enterprise).
// EHRLICHKEIT VOR MARKETING: nichts hier ist erfunden. Alle Befunde sind
// real und stammen aus autorisierten Tests / Bug-Bounty-Programmen; sie
// sind DE-IDENTIFIZIERT (keine Anbieter-Namen, keine Hosts, keine Keys/
// Modulus-Werte). Offenlegung ist nicht freigegeben → Name und technische
// Einzelheiten nur auf Anfrage unter Vertraulichkeit. Der Beispiel-Bericht
// weiter unten trägt AUSDRÜCKLICH erfundene Daten.
// ═══════════════════════════════════════════════════════════════════

export type Schwere = "Kritisch" | "Hoch" | "Mittel" | "Niedrig";

export const SCHWERE_META: Record<Schwere, { hex: string; farbeRgb: string }> = {
  Kritisch: { hex: "#f1646c", farbeRgb: "241, 100, 108" },
  Hoch:     { hex: "#f5884b", farbeRgb: "245, 136, 75" },
  Mittel:   { hex: "#f5b544", farbeRgb: "245, 181, 68" },
  Niedrig:  { hex: "#7aa2ff", farbeRgb: "122, 162, 255" },
};

// ─── Flaggschiff-Reporte (de-identifiziert, als Report-Karten) ──────────
export interface AnonymerReport {
  readonly id: string;
  readonly kennzeichen: string;     // Herkunfts-Badge
  readonly titel: string;
  readonly klasse: string;          // Schwachstellen-Klasse
  readonly schwere: Schwere;
  readonly cvss?: string;           // z.B. "7.5"
  readonly cwe: string;
  readonly kontext: string;         // Ausgangslage (anonym)
  readonly fund: string;            // was gefunden wurde
  readonly impact: string;          // warum es zählt
  readonly nachweis: string;        // wie belegt (ohne Eingriff)
  readonly diagramm?: "trust-boundary";
}

export const REPORTE: AnonymerReport[] = [
  {
    id: "cross-env-key",
    kennzeichen: "Autorisiertes Bug-Bounty · anonymisiert",
    titel: "Produktion und Testumgebung teilten denselben Signatur-Schlüssel",
    klasse: "Cross-Environment Trust-Boundary / fehlende Schlüssel-Trennung",
    schwere: "Hoch",
    cvss: "7.5",
    cwe: "CWE-693 · CWE-668 · NIST SP 800-57",
    kontext:
      "Ein grosser deutscher SaaS-Anbieter (Name vertraulich) betrieb seine Login- und API-Infrastruktur in zwei getrennten Umgebungen — Produktion und eine Sandbox zum Testen. Beide veröffentlichten, wie vom Standard vorgesehen, ihre Signatur-Schlüssel.",
    fund:
      "Zwei dieser Signatur-Schlüssel waren in beiden Umgebungen bit-identisch — nicht nur gleich benannt, sondern mathematisch dasselbe Schlüsselmaterial.",
    impact:
      "Eine Produktiv-Anwendung, die ein Zugangs-Token nur anhand der Signatur prüft, würde damit auch ein in der Sandbox ausgestelltes Token akzeptieren. Genau die Grenze zwischen Test und Produktion, die schützen soll, war kryptografisch aufgehoben.",
    nachweis:
      "Rein passiv belegbar: zwei öffentliche Abrufe und ein Vergleich des Schlüssel-Materials. Kein Eingriff in fremde Systeme, kein Zugriff auf Daten.",
    diagramm: "trust-boundary",
  },
  {
    id: "ki-agent-cross-user",
    kennzeichen: "Autorisierter KI-Sicherheits-Wettbewerb",
    titel: "KI-Agent gab Daten eines anderen Nutzers preis",
    klasse: "Fehlerhafte Autorisierung in einem KI-Agenten (Cross-User)",
    schwere: "Hoch",
    cwe: "CWE-863 · CWE-200",
    kontext:
      "Ein KI-Agent erledigte im Auftrag von Nutzern Aufgaben und griff dabei auf deren Daten zu. Ich prüfte, ob er sich über präparierte Eingaben aus seinen Grenzen bewegen lässt.",
    fund:
      "Der Agent liess sich zu einem Cross-User-Datenzugriff bringen: Informationen eines fremden Nutzers wurden preisgegeben.",
    impact:
      "Die Klasse, die bei KI-Features am meisten zählt: Ein System gibt Daten heraus, die es nicht hergeben darf. Genau das prüfe ich bei Kundenlösungen, bevor sie in den Betrieb gehen.",
    nachweis:
      "Der Zugriff liess sich im Rahmen des Wettbewerbs nachweisen. Write-up auf Anfrage.",
  },
];

// ─── Weitere bestätigte Befunde (kompakt, anonymisiert) ─────────────────
export interface KurzBefund {
  readonly klasse: string;
  readonly schwere: Schwere;
  readonly kurz: string;
  readonly cwe: string;
}

export const WEITERE_BEFUNDE: KurzBefund[] = [
  {
    klasse: "OAuth-CSRF (fehlender State-Schutz)",
    schwere: "Mittel",
    cwe: "CWE-352",
    kurz: "Ein Login-Flow liess sich ohne wirksamen State-Parameter anstossen — Grundlage für Account-Verknüpfungs-Angriffe.",
  },
  {
    klasse: "GraphQL Request-Batching",
    schwere: "Mittel",
    cwe: "CWE-799",
    kurz: "Mehrere Operationen pro Anfrage umgingen eine mengenbasierte Begrenzung (z. B. für Brute-Force-ähnliche Muster).",
  },
  {
    klasse: "Open Redirect",
    schwere: "Niedrig",
    cwe: "CWE-601",
    kurz: "Eine Weiterleitung liess sich auf eine fremde Zieladresse lenken — relevant v. a. als Baustein in einer Angriffskette.",
  },
];

// ─── Beispiel-Bericht (ERFUNDENE Daten, nur zur Veranschaulichung) ──────
// Zeigt die FORM eines Ergebnisses: klare Ampel + nachvollziehbare Befunde.
export type BefundAmpel = "rot" | "gelb" | "gruen";

export interface BeispielBefund {
  readonly ampel: BefundAmpel;
  readonly titel: string;
  readonly was: string;
  readonly risiko: string;
  readonly fix: string;
}

export const BEISPIEL_BERICHT: {
  readonly system: string;
  readonly gesamtampel: BefundAmpel;
  readonly befunde: readonly BeispielBefund[];
} = {
  system: "Kunden-Support-Chatbot (Beispiel, erfundene Daten)",
  gesamtampel: "gelb",
  befunde: [
    {
      ampel: "rot",
      titel: "Prompt-Injection über hochgeladene Dokumente",
      was: "Eine präparierte Datei im Support-Upload brachte den Bot dazu, seine Systemanweisung zu ignorieren.",
      risiko: "Ein Kunde könnte den Bot Aufgaben ausführen lassen, die nur dem Support erlaubt sind.",
      fix: "Dokument-Inhalte strikt als Daten behandeln, nicht als Anweisung; Werkzeug-Aufrufe an feste Freigaben binden.",
    },
    {
      ampel: "gelb",
      titel: "Zu breiter Datenzugriff der Wissensbasis",
      was: "Der Bot konnte auf interne Notizen zugreifen, die für Kundenantworten nicht nötig sind.",
      risiko: "Interne Informationen könnten in einer Antwort an Kunden auftauchen.",
      fix: "Wissensbasis auf die wirklich benötigten Inhalte einschränken (Prinzip der minimalen Rechte).",
    },
    {
      ampel: "gruen",
      titel: "Keine Datenweitergabe an Dritte",
      was: "Es wurden keine Aufrufe an externe Dienste gefunden, die Kundendaten weitergeben.",
      risiko: "—",
      fix: "Zustand halten; bei neuen Integrationen erneut prüfen.",
    },
  ],
};
