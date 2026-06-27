// ═══════════════════════════════════════════════════════════════════
// TEST: galeriePfad — Single Source of Truth für die Galerie-Route
// ═══════════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { galeriePfad, GALERIE_BASIS } from "../hilfsmittel/galeriePfad";

describe("galeriePfad", () => {
  it("erzeugt /bilder/<slug>", () => {
    expect(galeriePfad("markmem")).toBe("/bilder/markmem");
    expect(galeriePfad("sports-almanach")).toBe("/bilder/sports-almanach");
  });

  it("baut auf der Basis-Konstante auf", () => {
    expect(GALERIE_BASIS).toBe("/bilder");
    expect(galeriePfad("x").startsWith(GALERIE_BASIS)).toBe(true);
  });
});
