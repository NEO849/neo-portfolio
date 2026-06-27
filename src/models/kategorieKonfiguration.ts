// ═══════════════════════════════════════════════════════════════════
// MODEL: Kategorie-Konfiguration (Single Source of Truth)
// Eine zentrale Quelle für Akzentfarbe + Label je Projekt-Kategorie.
// Vorher doppelt gepflegt (KATEGORIE_KONFIGURATION in ProjekteView,
// AKZENT_FARBE in BilderSeite) — hier zusammengeführt, damit Farben
// und Labels nirgends mehr auseinanderlaufen.
// ═══════════════════════════════════════════════════════════════════

import type { ProjektModel } from "./typen";

/** Die drei Projekt-Kategorien des Datenmodells. */
export type Kategorie = ProjektModel["kategorie"];

export interface KategorieKonfig {
  /** Hex-Akzentfarbe (z.B. für Glow, Eyebrow, Badge-Rand). */
  readonly akzentFarbe: string;
  /** Akzentfarbe als "R, G, B"-Tripel (für rgba()-Lichtflächen). */
  readonly lichtfarbe: string;
  /** AbzeichenStatus-Variante. */
  readonly variante: "aktiv" | "akzent" | "cyber";
  /** Anzeige-Label (Filter-Tab + Badge). */
  readonly label: string;
}

// Werte exakt aus der ProjekteView übernommen (kanonische Quelle).
export const KATEGORIE_KONFIGURATION: Record<Kategorie, KategorieKonfig> = {
  security:    { akzentFarbe: "#94a3b8", lichtfarbe: "148, 163, 184", variante: "aktiv",  label: "Security" },
  development: { akzentFarbe: "#4f7cfb", lichtfarbe: "79, 124, 251",   variante: "akzent", label: "Mobil"    },
  tooling:     { akzentFarbe: "#8aa0c8", lichtfarbe: "138, 160, 200",  variante: "cyber",  label: "Tooling"  },
};

/** Fallback-Konfig für unbekannte/fehlende Kategorien. */
export const KATEGORIE_FALLBACK: KategorieKonfig = KATEGORIE_KONFIGURATION.development;

/** Liefert die Konfig einer Kategorie, robust gegen unbekannte Werte. */
export function kategorieKonfig(kategorie: string): KategorieKonfig {
  return KATEGORIE_KONFIGURATION[kategorie as Kategorie] ?? KATEGORIE_FALLBACK;
}

/** Liefert die Akzent-Hexfarbe einer Kategorie (Kurzform für den häufigen Fall). */
export function kategorieAkzent(kategorie: string): string {
  return kategorieKonfig(kategorie).akzentFarbe;
}
