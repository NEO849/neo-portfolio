// ═══════════════════════════════════════════════════════════════════
// GESTALTUNG: Abstands-System
// Alle Abstände basieren auf 4px-Raster
// ═══════════════════════════════════════════════════════════════════

// Basis-Einheit in px
const BASIS = 4;

// Erzeugt rem-Wert aus Vielfachem der Basis
const raster = (vielfaches: number) => `${(BASIS * vielfaches) / 16}rem`;

export const ABSTAENDE = {
  '0':   '0px',
  px:    '1px',
  '0.5': raster(0.5),  //  2px
  '1':   raster(1),    //  4px
  '2':   raster(2),    //  8px
  '3':   raster(3),    // 12px
  '4':   raster(4),    // 16px
  '5':   raster(5),    // 20px
  '6':   raster(6),    // 24px
  '8':   raster(8),    // 32px
  '10':  raster(10),   // 40px
  '12':  raster(12),   // 48px
  '16':  raster(16),   // 64px
  '20':  raster(20),   // 80px
  '24':  raster(24),   // 96px
  '32':  raster(32),   // 128px
} as const;

// Seitenspezifische Abstände
export const SEITENABSTAENDE = {
  mobile:  ABSTAENDE['6'],   // 24px
  tablet:  ABSTAENDE['10'],  // 40px
  desktop: ABSTAENDE['16'],  // 64px
} as const;

// Maximale Inhaltsbreiten
export const MAXBREITEN = {
  inhalt:  '1152px',  // max-w-6xl
  schmal:  '768px',   // max-w-3xl
  text:    '640px',   // max-w-xl
  terminal:'896px',   // max-w-4xl
} as const;
