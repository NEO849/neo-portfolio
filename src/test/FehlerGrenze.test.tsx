// ═══════════════════════════════════════════════════════════════════
// TEST: FehlerGrenze — Sicherheitsnetz gegen "nur Hintergrund"-Crashes
//
// Beweist: (1) ein Render-Fehler eines Kindes wird abgefangen und durch eine
// bedienbare Meldung ersetzt (kein leerer Baum), (2) fehlerfreie Kinder
// rendern unverändert, (3) ein Wechsel von `resetSchluessel` (≙ Routenwechsel)
// verwirft den Fehler-Zustand und versucht erneut.
// ═══════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FehlerGrenze } from "../bausteine/FehlerGrenze";

function Kracher(): never {
  throw new Error("absichtlicher Test-Crash");
}

describe("FehlerGrenze", () => {
  beforeEach(() => {
    // componentDidCatch loggt bewusst — im Test stummschalten, damit die
    // Ausgabe sauber bleibt.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rendert Kinder normal, wenn kein Fehler auftritt", () => {
    render(
      <FehlerGrenze resetSchluessel="/">
        <p>Alles in Ordnung</p>
      </FehlerGrenze>,
    );
    expect(screen.getByText("Alles in Ordnung")).toBeInTheDocument();
    expect(screen.queryByText(/schiefgelaufen/i)).toBeNull();
  });

  it("fängt einen Render-Fehler ab und zeigt die bedienbare Meldung", () => {
    render(
      <FehlerGrenze resetSchluessel="/">
        <Kracher />
      </FehlerGrenze>,
    );
    expect(screen.getByText(/Etwas ist schiefgelaufen/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Neu laden/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Startseite/i })).toHaveAttribute("href", "/");
  });

  it("setzt den Fehler-Zustand bei Wechsel von resetSchluessel zurück", () => {
    const { rerender } = render(
      <FehlerGrenze resetSchluessel="/projekte">
        <Kracher />
      </FehlerGrenze>,
    );
    expect(screen.getByText(/Etwas ist schiefgelaufen/i)).toBeInTheDocument();

    // Wie ein Routenwechsel: neuer Schlüssel + fehlerfreies Kind → Erholung.
    rerender(
      <FehlerGrenze resetSchluessel="/kontakt">
        <p>Neue Seite</p>
      </FehlerGrenze>,
    );
    expect(screen.getByText("Neue Seite")).toBeInTheDocument();
    expect(screen.queryByText(/schiefgelaufen/i)).toBeNull();
  });
});
