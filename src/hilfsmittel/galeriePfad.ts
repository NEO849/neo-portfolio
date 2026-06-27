// ═══════════════════════════════════════════════════════════════════
// HILFSMITTEL: galeriePfad
// Einzige Quelle der Wahrheit für die Bildergalerie-Route.
// Überall verwenden statt den Pfad als String-Literal zu wiederholen —
// so liegt die Route-Form an genau einer Stelle.
// ═══════════════════════════════════════════════════════════════════

/** Basis-Pfad der Bildergalerie-Übersicht. */
export const GALERIE_BASIS = "/bilder";

/** Erzeugt den Deep-Link zu einer Projekt-Galerie: "/bilder/<slug>". */
export function galeriePfad(galerieSlug: string): string {
  return `${GALERIE_BASIS}/${galerieSlug}`;
}
