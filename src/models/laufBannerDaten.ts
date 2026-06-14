// ═══════════════════════════════════════════════════════════════════
// MODELL: Lauf-Banner der HeroView
// Typisierte, leicht selbst pflegbare Liste der „News"-Einträge, die als
// nahtloser Ticker durch die Hero laufen. Reine Daten — keine Logik, keine
// Darstellung (MVVM: Model). Texte bewusst kurz für den Lauf-Rhythmus.
// ═══════════════════════════════════════════════════════════════════

export interface BannerEintrag {
  readonly id: string;
  readonly text: string;        // Haupttext, kurz und prägnant
  readonly wert?: string;       // optional hervorgehobener Wert, z. B. "30+ Quellen"
  readonly symbol?: string;     // optional dezentes Akzent-Glyph (kein Emoji-Overload)
}

// Platzhalter aus der eigenen Infrastruktur-/Projektwelt — jederzeit editierbar.
export const bannerEintraege: readonly BannerEintrag[] = [
  { id: "mcp",     text: "MCP-Server live auf dem VPS",      wert: "17", symbol: "▹" },
  { id: "memory",  text: "Self-Learning Memory · Lektionen", wert: "220" },
  { id: "osint",   text: "OSINT-Engine · keyless Quellen",   wert: "30+", symbol: "▹" },
  { id: "bounty",  text: "Bug-Bounty bestätigt · GitLab · Notion" },
  { id: "caido",   text: "Caido-Daemon · eigene Detektoren",  wert: "11" },
  { id: "ios",     text: "iOS-App ONE · Multi-Agent-Chat",   symbol: "▹" },
  { id: "infra",   text: "Gehärtete Linux-Infrastruktur · seit Jahren live" },
];
