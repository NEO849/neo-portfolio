// ═══════════════════════════════════════════════════════════════════
// MODEL: voice-bridge Demo (1:1-Nachbau, vollständig simuliert)
//
// Typen + Mock-Daten für den getreuen Klon der echten voice-bridge.
// Es gibt KEIN Backend, KEINEN Mikrofon-Zugriff und KEINE Speicherung —
// alle Zustände (Aufnahme, Transkription, Sessions, Queue, History,
// Einstellungen) werden rein im Browser simuliert.
// ═══════════════════════════════════════════════════════════════════

/** Zustände der Aufnahme-Maschine. */
export type AufnahmeZustand = "bereit" | "aufnahme" | "verarbeitung";

/** Sprachwahl des Segment-Schalters. */
export type DemoSprache = "de" | "en" | "auto";

/** Wie ein Transkript in der Ziel-Sitzung gelandet ist. */
export type InjektionStatus = "sent" | "queued" | "skipped";

/** Modus der Status-Anzeige oben (Punkt + Text). */
export type IndikatorModus = "idle" | "busy" | "rec" | "dead";

/** Ein einzelnes Transkript (Karte + History-Eintrag). */
export interface DemoTranskript {
  readonly id: string;
  readonly text: string;
  readonly gruppe: string;       // "Heute" | "Gestern" | "Diese Woche" | "Älter"
  readonly anzeigeZeit: string;  // "14:32" oder "Gestern 18:40"
  readonly status: InjektionStatus;
  readonly ziel: string;         // Ziel-Sitzung (target)
  readonly dauerMs: number;      // simulierte Server-Dauer
  readonly sprache: string;      // "de" | "en"
  readonly bytesKb: number;
  readonly auditId: string;
  readonly frisch?: boolean;     // true für die gerade transkribierte Karte
}

/** Eine tmux-/Claude-Sitzung im Picker. */
export interface DemoSitzung {
  readonly id: string;
  readonly name: string;          // z.B. "claude:bugbounty"
  readonly istClaude: boolean;
  readonly beschaeftigt: boolean; // false = Bereit (idle), true = Busy
}

// ─── Timing ───────────────────────────────────────────────────────
export const VERARBEITUNG_DAUER_MS = 1300;
export const AUFNAHME_MAX_MS = 9000;

/** Wie lange das fertige Ergebnis sichtbar bleibt, bevor wieder Idle gilt. */
export const ERGEBNIS_ANZEIGE_MS = 4500;

// ─── Sätze pro Sprache (reihum bei jedem Druck) ───────────────────
const SAETZE_DE: readonly string[] = [
  "Starte die Recon-Pipeline für das neue Target und fasse die Top-Funde zusammen.",
  "Zeig mir die offenen Findings, sortiert nach erwartetem Wert.",
  "Bau aus den bestätigten Belegen einen sauberen Report-Entwurf.",
  "Prüf die SSH- und Firewall-Konfiguration und schlag konkrete Härtungen vor.",
  "Merk dir: morgen nach dem Deploy den Cloudflare-Cache purgen.",
];
const SAETZE_EN: readonly string[] = [
  "Start the recon pipeline for the new target and summarise the top findings.",
  "Show me the open findings, sorted by expected value.",
  "Turn the confirmed evidence into a clean report draft.",
  "Review the SSH and firewall configuration and suggest concrete hardening steps.",
];
export const DEMO_SAETZE: Record<DemoSprache, readonly string[]> = {
  de: SAETZE_DE,
  en: SAETZE_EN,
  auto: SAETZE_DE,
};

// ─── Sitzungen (eine ist beschäftigt → demonstriert die Queue) ────
export const DEMO_SITZUNGEN: readonly DemoSitzung[] = [
  { id: "bugbounty",    name: "claude:bugbounty",    istClaude: true,  beschaeftigt: false },
  { id: "portfolio",    name: "claude:portfolio",    istClaude: true,  beschaeftigt: false },
  { id: "voice-bridge", name: "claude:voice-bridge", istClaude: true,  beschaeftigt: true  },
  { id: "logs",         name: "tail-logs",           istClaude: false, beschaeftigt: false },
];

/** Default-Sitzung (wie "resolved_default" im echten Tool). */
export const DEMO_DEFAULT_ZIEL = "claude:bugbounty";

// ─── Vorbelegte History (gruppiert) ───────────────────────────────
export const DEMO_HISTORY: readonly DemoTranskript[] = [
  {
    id: "h1", text: "Welche Subdomains sind seit gestern neu dazugekommen?",
    gruppe: "Heute", anzeigeZeit: "09:14", status: "sent", ziel: "claude:bugbounty",
    dauerMs: 612, sprache: "de", bytesKb: 78, auditId: "a1f4c2",
  },
  {
    id: "h2", text: "Exportier die Top-10-Kandidaten als Hunt-Sheet.",
    gruppe: "Heute", anzeigeZeit: "09:21", status: "sent", ziel: "claude:bugbounty",
    dauerMs: 540, sprache: "de", bytesKb: 64, auditId: "b7e9d1",
  },
  {
    id: "h3", text: "Deploy die Änderung und prüf danach die Security-Header.",
    gruppe: "Heute", anzeigeZeit: "11:02", status: "queued", ziel: "claude:voice-bridge",
    dauerMs: 705, sprache: "de", bytesKb: 88, auditId: "c3a0f8",
  },
  {
    id: "h4", text: "Setz das Whisper-Modell auf small und miss die Latenz.",
    gruppe: "Gestern", anzeigeZeit: "Gestern 18:40", status: "sent", ziel: "claude:voice-bridge",
    dauerMs: 668, sprache: "de", bytesKb: 95, auditId: "d9b1e4",
  },
  {
    id: "h5", text: "Just a quick note: rotate the API token next week.",
    gruppe: "Gestern", anzeigeZeit: "Gestern 21:07", status: "skipped", ziel: "claude:portfolio",
    dauerMs: 489, sprache: "en", bytesKb: 52, auditId: "e2c7a0",
  },
  {
    id: "h6", text: "Räum die tmpfs-Audios nach jeder Aufnahme zuverlässig auf.",
    gruppe: "Diese Woche", anzeigeZeit: "01. Jun 17:23", status: "sent", ziel: "claude:voice-bridge",
    dauerMs: 723, sprache: "de", bytesKb: 101, auditId: "f0d5b3",
  },
];
