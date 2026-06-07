// ═══════════════════════════════════════════════════════════════════
// TEST: BilderKarussell — Render + Navigation
// Prüft: erstes Bild/Caption, Zähler, Dots/Thumbnails, Weiter-Navigation.
// ═══════════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BilderKarussell } from "../bausteine/BilderKarussell";

const BILDER = [
  { quelle: "/a.webp", titel: "Login", text: "Erster Screenshot." },
  { quelle: "/b.webp", titel: "Home",  text: "Zweiter Screenshot." },
  { quelle: "/c.webp", titel: "Suche", text: "Dritter Screenshot." },
];

describe("BilderKarussell", () => {
  it("rendert das erste Bild mit Caption + Zähler", () => {
    render(<BilderKarussell bilder={BILDER} />);
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Erster Screenshot.")).toBeInTheDocument();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("erzeugt Dots + Thumbnails für jedes Bild", () => {
    render(<BilderKarussell bilder={BILDER} />);
    expect(screen.getByRole("tab", { name: /Bild 1: Login/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Bild 3: Suche/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/Zu Bild 2: Home/)).toBeInTheDocument();
  });

  it("navigiert per Pfeil zum nächsten Bild", async () => {
    render(<BilderKarussell bilder={BILDER} />);
    fireEvent.click(screen.getByLabelText("Nächstes Bild"));
    expect(await screen.findByText("Home")).toBeInTheDocument();
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("springt per Thumbnail direkt zu einem Bild", async () => {
    render(<BilderKarussell bilder={BILDER} />);
    fireEvent.click(screen.getByLabelText(/Zu Bild 3: Suche/));
    expect(await screen.findByText("Suche")).toBeInTheDocument();
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
  });

  it("rendert ein einzelnes Bild ohne Navigation (keine Pfeile)", () => {
    render(<BilderKarussell bilder={[BILDER[0]]} />);
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.queryByLabelText("Nächstes Bild")).toBeNull();
  });
});
