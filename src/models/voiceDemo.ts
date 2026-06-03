// ═══════════════════════════════════════════════════════════════════
// MODEL: voice-bridge Demo
//
// Daten und Typen für die interaktive, vollständig SIMULIERTE Demo der
// echten voice-bridge. Es wird nichts aufgenommen, gesendet oder
// gespeichert — der Besucher wählt einen Satz, löst die Aufnahme-Geste
// aus und sieht denselben Ablauf (Orb-Zustände, Pegel, Transkription)
// wie im echten Tool.
// ═══════════════════════════════════════════════════════════════════

/** Zustände der Aufnahme-Maschine — exakt wie im echten Daemon. */
export type AufnahmeZustand = "bereit" | "aufnahme" | "verarbeitung";

/** Sprachwahl des Segment-Schalters. */
export type DemoSprache = "de" | "en" | "auto";

/** Eine Nachricht im Sitzungsverlauf. */
export interface DemoNachricht {
  readonly id: string;
  readonly text: string;
  readonly zeit: string;
  /** true für die gerade frisch transkribierte Nachricht (Tipp-Animation). */
  readonly frischTranskribiert?: boolean;
}

/** Eine wählbare Claude-Sitzung in der Seitenleiste. */
export interface DemoSitzung {
  readonly id: string;
  readonly name: string;
  readonly kontext: string;
  readonly datumsGruppe: string;
  readonly verlauf: readonly DemoNachricht[];
}

/** Simulierte Verarbeitungsdauer (Orb im Busy-Zustand), in Millisekunden. */
export const VERARBEITUNG_DAUER_MS = 1300;

/** Maximale Aufnahmedauer, bevor automatisch gestoppt wird (Anti-Hänger). */
export const AUFNAHME_MAX_MS = 9000;

// ─── Sätze pro Sprache ────────────────────────────────────────────
// Werden bei jedem Druck reihum durchgewählt — der Besucher muss nichts
// auswählen, einfach drücken und der nächste Satz wird transkribiert.
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

/**
 * Sätze je Sprache. "auto" steht für Auto-Erkennung und liefert hier
 * dieselben deutschen Sätze (erkannte Sprache des Nutzers).
 */
export const DEMO_SAETZE: Record<DemoSprache, readonly string[]> = {
  de: SAETZE_DE,
  en: SAETZE_EN,
  auto: SAETZE_DE,
};

// ─── Vorbelegte Sitzungen (Seitenleiste) ──────────────────────────
export const DEMO_SITZUNGEN: readonly DemoSitzung[] = [
  {
    id: "bugbounty",
    name: "claude · bugbounty",
    kontext: "Recon & Findings",
    datumsGruppe: "Heute",
    verlauf: [
      { id: "bb-1", text: "Welche Subdomains sind seit gestern neu dazugekommen?", zeit: "09:14" },
      { id: "bb-2", text: "Exportier die Top-10-Kandidaten als Hunt-Sheet.",       zeit: "09:21" },
    ],
  },
  {
    id: "portfolio",
    name: "claude · portfolio",
    kontext: "Web-Projekt",
    datumsGruppe: "Heute",
    verlauf: [
      { id: "pf-1", text: "Deploy die Änderung und prüf danach die Security-Header.", zeit: "11:02" },
    ],
  },
  {
    id: "voice-bridge",
    name: "claude · voice-bridge",
    kontext: "Daemon-Tuning",
    datumsGruppe: "Gestern",
    verlauf: [
      { id: "vb-1", text: "Setz das Whisper-Modell auf small und miss die Latenz.", zeit: "18:40" },
      { id: "vb-2", text: "Räum die tmpfs-Audios nach jeder Aufnahme zuverlässig auf.", zeit: "18:47" },
    ],
  },
];
