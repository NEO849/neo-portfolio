// ═══════════════════════════════════════════════════════════════════
// GESTALTUNG: Farb-System — Single Source of Truth
// Alle Farben kommen von hier. Nirgendwo sonst hart kodieren.
//
// Premium-Richtung (2026-06): EIN vertrauensvolles Azur-Blau als Akzent
// auf tiefem Navy/Graphit. Das frühere Cyan-Neon ("cyber") wurde bewusst
// zu einem gedämpften Stahlblau degradiert — so verlieren alle Alt-
// Verwendungen ihren Neon-Charakter automatisch, ohne jede Datei
// einzeln anzufassen. Akzente sparsam, Materialität durch Tiefe.
// ═══════════════════════════════════════════════════════════════════

export const FARBEN = {
  grund: {
    tiefst:  '#070a12',   // Haupt-Hintergrund (tiefes Navy)
    tief:    '#0b0f1a',   // Karten-Hintergrund
    mittel:  '#141a28',   // Subtile Divider & Borders
    hell:    '#1d2536',   // Hover-Hintergründe
  },
  // Flächen-Layering (Material-Tiefe): von tief nach erhaben
  flaeche: {
    basis:   'rgba(255,255,255,0.024)',
    erhaben: 'rgba(255,255,255,0.045)',
    hoch:    'rgba(255,255,255,0.072)',
  },
  akzent: {
    schwach:   'rgba(79,124,251,0.08)',
    gedimmt:   'rgba(79,124,251,0.15)',
    standard:  '#4f7cfb',   // Azur — Kompetenz, Technologie, Vertrauen
    hell:      '#7aa2ff',
    leuchtend: '#a9c4ff',
  },
  // "cyber" beibehalten als Schlüssel (Alt-Imports), aber entneont:
  // gedämpftes Stahlblau statt Neon-Cyan.
  cyber: {
    schwach:   'rgba(122,162,255,0.07)',
    standard:  '#5b6f99',
    hell:      '#8aa0c8',
  },
  signal: {
    gruen:   '#34d399',
    gruenSchwach: 'rgba(52,211,153,0.10)',
    gelb:    '#f5b544',
    rot:     '#f1646c',
    rotSchwach: 'rgba(241,100,108,0.10)',
  },
  text: {
    voll:    'rgba(255,255,255,1.00)',
    stark:   'rgba(255,255,255,0.86)',
    mittel:  'rgba(255,255,255,0.56)',
    schwach: 'rgba(255,255,255,0.30)',
    hauch:   'rgba(255,255,255,0.09)',
  },
  rand: {
    subtil:  'rgba(255,255,255,0.06)',
    normal:  'rgba(255,255,255,0.10)',
    stark:   'rgba(255,255,255,0.16)',
    akzent:  'rgba(79,124,251,0.28)',
  },
} as const;

// CSS-Variablen-Objekt für dynamische Verwendung
export const CSS_VARIABLEN = {
  '--farbe-akzent':  FARBEN.akzent.standard,
  '--farbe-cyber':   FARBEN.cyber.standard,
  '--farbe-grund':   FARBEN.grund.tiefst,
} as const;
