// ═══════════════════════════════════════════════════════════════════
// MODEL: Vorgehensweise — "Sichere KI-Automation von Anfang bis Ende"
// Single Source of Truth für den interaktiven Prozess-Graph (ProzessFluss)
// und die /vorgehensweise-Seite. Vier Phasen als sequenzielle Kette; das
// Glied "Absichern" sitzt bewusst mittendrin — Security ist eingebaut,
// kein nachträglicher Schritt.
// ═══════════════════════════════════════════════════════════════════

export interface ProzessPhase {
  /** Stabiler Anker/Key, z.B. "discovery". */
  readonly id: string;
  /** Sichtbare Phasennummer (1-basiert). */
  readonly nummer: number;
  /** Kurzer Phasenname — die Hauptzeile im Graph-Knoten. */
  readonly titel: string;
  /** Ein Satz: was in dieser Phase passiert (Kunden-Sprache). */
  readonly kurz: string;
  /** Konkrete Schritte/Ergebnisse dieser Phase. */
  readonly punkte: readonly string[];
  /** Die Security-Linse dieser Phase — macht "sicher von Anfang bis Ende" greifbar. */
  readonly sicherheit: string;
  /** Was am Ende der Phase vorliegt (greifbares Ergebnis). */
  readonly ergebnis: string;
  /** true kennzeichnet das Security-Gate-Glied (visuell hervorgehoben). */
  readonly istGate?: boolean;
  /** Brand-Akzent (Indigo/Azur-Familie) für diesen Knoten. */
  readonly akzentHex: string;
  /** RGB-Tripel für Licht-/Glow-Effekte (Format "r, g, b"). */
  readonly farbeRgb: string;
}

export const PROZESS_PHASEN: ProzessPhase[] = [
  {
    id: "discovery",
    nummer: 1,
    titel: "Verstehen & Festlegen",
    kurz: "Wir klären, welcher Prozess am meisten Zeit kostet, was sich wirklich lohnt und wo Ihre Daten liegen.",
    punkte: [
      "Gemeinsamer Blick auf den wiederkehrenden Prozess, der automatisiert werden soll",
      "Realistische Einschätzung: was ist machbar, was spart am meisten",
      "Datenfluss und Schutzbedarf von Anfang an geklärt, nicht am Ende",
    ],
    sicherheit: "Welche Daten die Automation berührt und was davon besonders schützenswert ist, steht vor der ersten Zeile Code fest.",
    ergebnis: "Klares Ziel, klarer Rahmen, ein Angebot zum Festpreis.",
    akzentHex: "#a9c4ff",
    farbeRgb: "169, 196, 255",
  },
  {
    id: "bauen",
    nummer: 2,
    titel: "Bauen",
    kurz: "Der Workflow wird produktiv gebaut, angebunden an die Werkzeuge, die Sie ohnehin nutzen.",
    punkte: [
      "Automation mit n8n, APIs, Sprachmodellen und Agenten",
      "Angebunden an bestehende Systeme, kein Insel-Werkzeug",
      "Für den Betrieb gebaut: Fehlerfälle und Sonderfälle mitgedacht",
    ],
    sicherheit: "Minimale Rechte, klare Grenzen, keine Daten in fremde Clouds ohne Ihr Einverständnis. Sicherheit wird mitgebaut, nicht aufgesetzt.",
    ergebnis: "Ein laufendes System statt einer Demo, die beim ersten Sonderfall bricht.",
    akzentHex: "#7aa2ff",
    farbeRgb: "122, 162, 255",
  },
  {
    id: "absichern",
    nummer: 3,
    titel: "Absichern",
    kurz: "Bevor es live geht, prüfe ich mit Angreifer-Blick, ob die KI zu Dingen gebracht werden kann, die sie nicht tun darf.",
    punkte: [
      "Geprüft auf Prompt-Injection, Datenabfluss und unautorisierte Aktionen",
      "Nachvollziehbare Befunde mit klarer Ampel statt Scanner-Liste",
      "Gefundene Lücken behoben und erneut gegengeprüft",
    ],
    sicherheit: "Dies ist das Herzstück: derselbe Angreifer-Blick, mit dem ich in einem autorisierten KI-Sicherheits-Wettbewerb einen Cross-User-Datenzugriff gefunden habe, angewandt auf Ihre Lösung, bevor ein echter Angreifer es tut.",
    ergebnis: "Eine Lösung, deren Sicherheit Sie verstehen und belegen können.",
    istGate: true,
    akzentHex: "#4f7cfb",
    farbeRgb: "79, 124, 251",
  },
  {
    id: "betrieb",
    nummer: 4,
    titel: "Betrieb & Ausbau",
    kurz: "Das System läuft überwacht weiter, mit sauberer Übergabe und der Option, es Schritt für Schritt auszubauen.",
    punkte: [
      "Monitoring und Alarmierung, damit Ausfälle auffallen, bevor es jemand merkt",
      "Dokumentation und Übergabe, damit Sie nicht abhängig bleiben",
      "Optionaler Retainer für laufenden Ausbau und Pflege",
    ],
    sicherheit: "Auch im Betrieb bleibt die Absicherung Teil der Pflege, nicht ein einmaliger Haken auf einer Liste.",
    ergebnis: "Ein System, das trägt, und bei Bedarf mitwächst.",
    akzentHex: "#818cf8",
    farbeRgb: "129, 140, 248",
  },
];
