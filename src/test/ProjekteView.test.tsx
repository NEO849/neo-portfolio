// ═══════════════════════════════════════════════════════════════════
// TEST: ProjekteView — Mehrwert-Block + Vorschau-Bild-Buttons im Detail
// (die separate Bildergalerie-Seite wurde entfernt; Bilder leben jetzt
// in der Projekt-Karte und öffnen die Lightbox).
// ═══════════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProjekteView from "../views/ProjekteView";
import { PROJEKTE } from "../models/daten";

// Alle aufklappbaren Karten öffnen (Kopf-Button hat aria-expanded="false").
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

describe("ProjekteView — Detail", () => {
  it("zeigt für jedes Projekt den Mehrwert-Block 'WAS ES BRINGT'", () => {
    renderProjekteAufgeklappt();
    expect(screen.getAllByText("WAS ES BRINGT")).toHaveLength(PROJEKTE.length);
  });

  it("zeigt je Projektbild einen Vorschau-Button, der die grosse Ansicht öffnet", () => {
    renderProjekteAufgeklappt();
    const erwartet = PROJEKTE.reduce((n, p) => n + (p.bilder?.length ?? 0), 0);
    const buttons = screen.queryAllByRole("button", { name: /Bild gross anzeigen:/ });
    expect(buttons).toHaveLength(erwartet);
  });
});
