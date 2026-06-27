// ═══════════════════════════════════════════════════════════════════
// TEST: BildergalerieView — Ableitung, Übersicht, Lightbox, Deep-Link
// ═══════════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BildergalerieView, { galerienLaden } from "../views/BildergalerieView";
import { PROJEKTE } from "../models/daten";

function renderView(props: Parameters<typeof BildergalerieView>[0] = {}) {
  return render(
    <MemoryRouter initialEntries={["/bilder"]}>
      <BildergalerieView {...props} />
    </MemoryRouter>,
  );
}

describe("galerienLaden — dynamische Ableitung aus PROJEKTE", () => {
  it("liefert nur Projekte mit galerieSlug UND mindestens einem Bild", () => {
    const galerien = galerienLaden();
    expect(galerien.length).toBeGreaterThan(0);
    for (const p of galerien) {
      expect(p.galerieSlug).toBeTruthy();
      expect(p.bilder?.length ?? 0).toBeGreaterThan(0);
    }
    // Exakt so viele wie im Datensatz die Kriterien erfüllen.
    const erwartet = PROJEKTE.filter((p) => p.galerieSlug && (p.bilder?.length ?? 0) > 0);
    expect(galerien).toHaveLength(erwartet.length);
  });

  it("schließt Projekte ohne Galerie aus", () => {
    const slugs = galerienLaden().map((p) => p.galerieSlug);
    const ohneGalerie = PROJEKTE.find((p) => !p.galerieSlug);
    expect(ohneGalerie).toBeDefined();
    expect(slugs).not.toContain(ohneGalerie?.galerieSlug);
  });
});

describe("BildergalerieView — Peek-Auswahl", () => {
  it("rendert die mittige Galerie als öffenbares Item; der Projektname steht im Köpfchen", () => {
    renderView();
    // Peek-Karussell startet auf der ersten Galerie. Nur das mittige Item
    // ist „öffnen"; Nachbarn sind „wechseln". A11y-Label trägt den vollen Titel.
    const fokus = galerienLaden()[0];
    const karte = screen.getByRole("button", {
      name: new RegExp(`Öffnen: ${fokus.titel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
    });
    expect(karte).toBeInTheDocument();
    // Projektname (Kurzform vor der Tagline) steht mittig im Köpfchen.
    const kurz = fokus.titel.split(/\s+[–—-]\s+/)[0].trim();
    expect(screen.getByRole("heading", { name: kurz })).toBeInTheDocument();
  });

  it("bietet je Galerie einen Auswahl-Punkt (Dot)", () => {
    renderView();
    const galerien = galerienLaden();
    // Dots existieren erst ab ≥2 Galerien.
    if (galerien.length > 1) {
      for (const p of galerien) {
        expect(
          screen.getByRole("button", {
            name: new RegExp(`Zu \\d+: ${p.titel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
          }),
        ).toBeInTheDocument();
      }
    }
  });

  it("startet ohne geöffnete Lightbox (kein dialog)", () => {
    renderView();
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("BildergalerieView — Lightbox öffnen/schließen", () => {
  it("öffnet die Lightbox per Klick auf das mittige Item und zeigt die Fotos", async () => {
    const projekt = galerienLaden()[0];
    renderView();

    const karte = screen.getByRole("button", {
      name: new RegExp(`Öffnen: ${projekt.titel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
    });
    fireEvent.click(karte);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    // Titel des Projekts steht als Dialog-Überschrift.
    expect(within(dialog).getByRole("heading", { name: projekt.titel })).toBeInTheDocument();
    // Erstes Foto (Caption-Heading des aktiven Items) ist sichtbar.
    expect(
      within(dialog).getByRole("heading", { name: projekt.bilder![0].titel }),
    ).toBeInTheDocument();
  });

  it("schließt die Lightbox per Schließen-Knopf", async () => {
    const projekt = galerienLaden()[0];
    renderView();

    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`Öffnen: ${projekt.titel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
      }),
    );
    await screen.findByRole("dialog");

    fireEvent.click(screen.getByLabelText("Demo schließen"));
    // AnimatePresence-Exit: warten bis Dialog vollständig weg ist.
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});

describe("BildergalerieView — Deep-Link", () => {
  it("öffnet automatisch die zum startSlug passende Galerie", () => {
    const projekt = galerienLaden()[1] ?? galerienLaden()[0];
    render(
      <MemoryRouter initialEntries={[`/bilder/${projekt.galerieSlug}`]}>
        <BildergalerieView startSlug={projekt.galerieSlug} />
      </MemoryRouter>,
    );
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: projekt.titel })).toBeInTheDocument();
  });

  it("ruft onLightboxSchliessen beim Schließen auf", async () => {
    const projekt = galerienLaden()[0];
    let geschlossen = false;
    render(
      <MemoryRouter initialEntries={[`/bilder/${projekt.galerieSlug}`]}>
        <BildergalerieView startSlug={projekt.galerieSlug} onLightboxSchliessen={() => { geschlossen = true; }} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByLabelText("Demo schließen"));
    expect(geschlossen).toBe(true);
  });
});
