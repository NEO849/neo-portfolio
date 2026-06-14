// ═══════════════════════════════════════════════════════════════════
// GESTALTUNG: Typografie-System
// Schriftfamilien, Größen-Skala, Gewichtungen
//
// Premium-Richtung: Manrope als Display (ruhig, geometrisch-humanist,
// vermittelt Kompetenz) + Inter für dichte UI/Fließtext + JetBrains Mono
// NUR noch für echte Datenwerte/Metriken, nicht als Deko-Terminal.
// ═══════════════════════════════════════════════════════════════════

export const SCHRIFTEN = {
  display: '"Manrope", "Inter", system-ui, sans-serif',  // Überschriften, Namen
  text:    '"Inter", system-ui, sans-serif',              // Fließtext, UI
  mono:    '"JetBrains Mono", ui-monospace, monospace',   // Datenwerte, Labels
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
  schwer:    800,
} as const;

export const ZEILENABSTAENDE = {
  eng:    1.15,
  normal: 1.5,
  weit:   1.7,
  sehrWeit: 1.9,
} as const;

// Tracking (letter-spacing) — Premium: enge Displays, weite Mono-Labels
export const LAUFWEITEN = {
  eng:     '-0.02em',   // große Display-Headlines
  enger:   '-0.011em',  // Fließ-Headlines
  normal:  '0',
  label:   '0.18em',    // Mono-Eyebrow-Labels (uppercase)
} as const;
