// ═══════════════════════════════════════════════════════════════════
// GESTALTUNG: Typografie-System
// Schriftfamilien, Größen-Skala, Gewichtungen
// ═══════════════════════════════════════════════════════════════════

export const SCHRIFTEN = {
  display: '"Space Grotesk", system-ui, sans-serif',  // Überschriften, Namen
  text:    '"Inter", system-ui, sans-serif',           // Fließtext, UI
  mono:    '"JetBrains Mono", monospace',              // Code, Terminal, Labels
} as const;

// Größen-Skala (in rem, Basis 16px)
export const SCHRIFTGROESSEN = {
  xs:   '0.75rem',   // 12px — Labels, Badges
  sm:   '0.875rem',  // 14px — Nebentext
  base: '1rem',      // 16px — Fließtext
  lg:   '1.125rem',  // 18px — Wichtiger Fließtext
  xl:   '1.25rem',   // 20px — Kleine Überschriften
  '2xl':'1.5rem',    // 24px
  '3xl':'1.875rem',  // 30px
  '4xl':'2.25rem',   // 36px
  '5xl':'3rem',      // 48px — Seitenüberschriften
  '6xl':'3.75rem',   // 60px — Hero-Titel
  '7xl':'4.5rem',    // 72px — Maximale Hero-Größe
} as const;

export const SCHRIFTGEWICHTE = {
  normal:    400,
  mittel:    500,
  halbfett:  600,
  fett:      700,
} as const;

export const ZEILENABSTAENDE = {
  eng:    1.2,
  normal: 1.5,
  weit:   1.75,
  sehrWeit: 2,
} as const;
