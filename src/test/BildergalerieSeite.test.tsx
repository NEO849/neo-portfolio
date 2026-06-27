// ═══════════════════════════════════════════════════════════════════
// TEST: BildergalerieSeite — Routing (Deep-Link + Slug-Umleitung)
// ═══════════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import BildergalerieSeite from "../seiten/BildergalerieSeite";
import { galerienLaden } from "../views/BildergalerieView";

// Spiegelt den aktuellen Pfad in den DOM, um Umleitungen prüfen zu können.
function PfadSonde() {
  const ort = useLocation();
  return <div data-testid="pfad">{ort.pathname}</div>;
}

function renderMitRoute(start: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[start]}>
        <PfadSonde />
        <Routes>
          <Route path="/bilder" element={<BildergalerieSeite />} />
          <Route path="/bilder/:slug" element={<BildergalerieSeite />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe("BildergalerieSeite — Routing", () => {
  it("rendert die Übersicht unter /bilder", () => {
    renderMitRoute("/bilder");
    expect(screen.getByTestId("pfad")).toHaveTextContent("/bilder");
    expect(screen.getByRole("tablist", { name: /Galerien nach Kategorie filtern/ })).toBeInTheDocument();
  });

  it("öffnet bei gültigem Deep-Link die Galerie", () => {
    const projekt = galerienLaden()[0];
    renderMitRoute(`/bilder/${projekt.galerieSlug}`);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("leitet unbekannten Slug sanft auf /bilder um (kein Crash)", () => {
    renderMitRoute("/bilder/gibt-es-nicht-xyz");
    expect(screen.getByTestId("pfad")).toHaveTextContent("/bilder");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
