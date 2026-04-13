// ═══════════════════════════════════════════════════════════════════
// GESTALTUNG: Farb-System — Single Source of Truth
// Alle Farben kommen von hier. Nirgendwo sonst hart kodieren.
// ═══════════════════════════════════════════════════════════════════

export const FARBEN = {
  grund: {
    tiefst:  '#06080f',   // Haupt-Hintergrund
    tief:    '#0a0e1a',   // Karten-Hintergrund
    mittel:  '#111827',   // Subtile Divider & Borders
    hell:    '#1f2937',   // Hover-Hintergründe
  },
  akzent: {
    schwach:   'rgba(99,102,241,0.08)',
    gedimmt:   'rgba(99,102,241,0.15)',
    standard:  '#6366f1',
    hell:      '#818cf8',
    leuchtend: '#a5b4fc',
  },
  cyber: {
    schwach:   'rgba(6,182,212,0.08)',
    standard:  '#06b6d4',
    hell:      '#22d3ee',
  },
  signal: {
    gruen:   '#22c55e',
    gruenSchwach: 'rgba(34,197,94,0.1)',
    gelb:    '#f59e0b',
    rot:     '#ef4444',
    rotSchwach: 'rgba(239,68,68,0.1)',
  },
  text: {
    voll:    'rgba(255,255,255,1.00)',
    stark:   'rgba(255,255,255,0.85)',
    mittel:  'rgba(255,255,255,0.50)',
    schwach: 'rgba(255,255,255,0.25)',
    hauch:   'rgba(255,255,255,0.08)',
  },
  rand: {
    subtil:  'rgba(255,255,255,0.06)',
    normal:  'rgba(255,255,255,0.10)',
    stark:   'rgba(255,255,255,0.18)',
    akzent:  'rgba(99,102,241,0.25)',
  },
} as const;

// CSS-Variablen-Objekt für dynamische Verwendung
export const CSS_VARIABLEN = {
  '--farbe-akzent':  FARBEN.akzent.standard,
  '--farbe-cyber':   FARBEN.cyber.standard,
  '--farbe-grund':   FARBEN.grund.tiefst,
} as const;
