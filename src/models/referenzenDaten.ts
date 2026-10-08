// ═══════════════════════════════════════════════════════════════════
// MODEL: Referenzen / Proof — der stärkste Vertrauens-Hebel.
// WICHTIG (Ehrlichkeit vor Marketing): nichts hier ist erfunden.
// Die Case-Study ist anonymisiert und bewusst zurückhaltend formuliert;
// Details nur auf Anfrage. Der Beispiel-Bericht trägt ausdrücklich
// ERFUNDENE Daten und ist als solcher gekennzeichnet.
// ═══════════════════════════════════════════════════════════════════

export interface CaseStudy {
  readonly kennzeichen: string;        // Badge, z.B. "Autorisierter Wettbewerb"
  readonly titel: string;
  readonly situation: string;
  readonly vorgehen: string;
  readonly ergebnis: string;
  readonly lehre: string;
  readonly hinweis?: string;           // z.B. "Details auf Anfrage"
  readonly akzentHex: string;
  readonly farbeRgb: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    kennzeichen: "Autorisierter Sicherheits-Wettbewerb",
    titel: "Ein KI-Agent gab Daten eines anderen Nutzers preis",
    situation:
      "In einem autorisierten KI-Sicherheits-Wettbewerb stand ein KI-Agent zur Verfügung, der im Auftrag von Nutzern Aufgaben erledigte und dabei auf deren Daten zugriff.",
    vorgehen:
      "Ich habe untersucht, ob sich der Agent über präparierte Eingaben dazu bewegen lässt, seine Grenzen zu überschreiten, also Daten zu verwenden oder auszugeben, die zu einem anderen Nutzer gehören.",
    ergebnis:
      "Der Agent liess sich zu einem Cross-User-Datenzugriff bringen: Informationen eines fremden Nutzers wurden preisgegeben. Der Fund wurde im Rahmen des Wettbewerbs anerkannt.",
    lehre:
      "Genau diese Klasse von Fehlern (ein KI-System gibt Daten heraus, die es nicht herausgeben darf) prüfe ich heute bei Kundenlösungen, bevor sie in den Betrieb gehen.",
    hinweis: "Anonymisiert. Konkreter Write-up und Nachweis auf Anfrage.",
    akzentHex: "#4f7cfb",
    farbeRgb: "79, 124, 251",
  },
];

// ─── Beispiel-Bericht (ERFUNDENE Daten, nur zur Veranschaulichung) ──────
// Zeigt, was ein Kunde als Ergebnis eines KI-Sicherheits-Checks bekommt:
// eine klare Ampel und nachvollziehbare Befunde, keine Scanner-Liste.

export type BefundAmpel = "rot" | "gelb" | "gruen";

export interface BeispielBefund {
  readonly ampel: BefundAmpel;
  readonly titel: string;
  readonly was: string;       // was wurde beobachtet
  readonly risiko: string;    // warum es zählt
  readonly fix: string;       // empfohlene Behebung
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

// ─── Flaggschiff-Fallstudie (DE-IDENTIFIZIERT) ──────────────────────────
// Echter Bounty-Fund, bewusst ohne Name und ohne rekonstruierbare Details
// (keine Hosts, keine Key-IDs, keine Modulus-Werte). Offenlegung ist nicht
// freigegeben → Name/Details nur auf Anfrage unter Vertraulichkeit.
export const KEY_FALLSTUDIE = {
  kennzeichen: "Autorisiertes Bug-Bounty · anonymisiert",
  titel: "Produktion und Testumgebung teilten denselben Schlüssel",
  anbieter: "Grosser deutscher SaaS-Anbieter (Name vertraulich)",
  situation:
    "Der Anbieter betrieb seine Login- und API-Infrastruktur in zwei getrennten Umgebungen — Produktion und eine Sandbox zum Testen. Beide veröffentlichten, wie vom Standard vorgesehen, ihre Signatur-Schlüssel.",
  fund:
    "Zwei dieser Signatur-Schlüssel waren in beiden Umgebungen bit-identisch — nicht nur gleich benannt, sondern mathematisch dasselbe Schlüsselmaterial.",
  warum:
    "Eine Produktiv-Anwendung, die ein Zugangs-Token nur anhand der Signatur prüft, würde damit auch ein in der Sandbox ausgestelltes Token akzeptieren. Genau die Grenze zwischen Test und Produktion, die schützen soll, war kryptografisch aufgehoben.",
  nachweis:
    "Rein passiv belegbar: zwei öffentliche Abrufe und ein Vergleich des Schlüssel-Materials. Kein Eingriff in fremde Systeme, kein Zugriff auf Daten.",
  verantwortung:
    "Verantwortungsvoll über das Bug-Bounty-Programm des Anbieters gemeldet und live bestätigt. Name und Details bleiben vertraulich, solange keine Offenlegung freigegeben ist.",
  norm: "Einordnung: CWE-693 (fehlende Trennung der Schutzmechanismen), NIST SP 800-57 (Schlüssel je Umgebung trennen).",
} as const;
