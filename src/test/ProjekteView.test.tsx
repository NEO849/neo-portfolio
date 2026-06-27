// ═══════════════════════════════════════════════════════════════════
// TEST: ProjekteView — "Bilder →"-Button bleibt erhalten + Ziel aus galeriePfad
// ═══════════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProjekteView from "../views/ProjekteView";
import { PROJEKTE } from "../models/daten";
import { galeriePfad } from "../hilfsmittel/galeriePfad";

// Die "Bilder →"-Buttons liegen im aufklappbaren Detail jeder ProjektKarte.
// Für die Tests klappen wir alle Karten auf (aria-expanded="false" → Klick).
function renderProjekteAufgeklappt() {
  const ergebnis = render(
    <MemoryRouter>
      <ProjekteView />
    </MemoryRouter>,
  );
  screen
    .getAllByRole("button")
    .filter((el) => el.getAttribute("aria-expanded") === "false")
    .forEach((el) => fireEvent.click(el));
  return ergebnis;
}

describe("ProjekteView — Bilder-Button", () => {
  it("zeigt für jedes Projekt mit Galerie einen 'Bilder →'-Link", () => {
    renderProjekteAufgeklappt();
    const mitGalerie = PROJEKTE.filter((p) => p.galerieSlug && (p.bilder?.length ?? 0) > 0);
    const buttons = screen.getAllByRole("link", { name: /Bilder →/ });
    expect(buttons).toHaveLength(mitGalerie.length);
  });

  it("verlinkt das Galerie-Ziel über galeriePfad(slug) = /bilder/<slug>", () => {
    renderProjekteAufgeklappt();
    const projekt = PROJEKTE.find((p) => p.galerieSlug && (p.bilder?.length ?? 0) > 0)!;
    const buttons = screen.getAllByRole("link", { name: /Bilder →/ });
    const ziele = buttons.map((b) => b.getAttribute("href"));
    expect(ziele).toContain(galeriePfad(projekt.galerieSlug!));
    // Keiner zeigt mehr auf die alte Route.
    for (const ziel of ziele) {
      expect(ziel).toMatch(/^\/bilder\//);
    }
  });
});
