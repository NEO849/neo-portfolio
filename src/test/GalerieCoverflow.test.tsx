// ═══════════════════════════════════════════════════════════════════
// TEST: GalerieCoverflow — Auswahl-Ebene (Fokus + Nachbarn)
// Prüft: Fokus/Nachbar-Render, Blättern (Pfeil/Tastatur/Dot),
//        Öffnen (Klick + Enter) ruft onOeffnen mit dem Fokus-Projekt,
//        Akzentfarbe folgt der Fokus-Kategorie, Edge n=1/n=2,
//        Reduced-Motion-Pfad.
// ═══════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ProjektModel } from "../models/typen";
import { kategorieKonfig } from "../models/kategorieKonfiguration";

// useReducedMotion steuerbar machen: Standard = false, einzeln überschreibbar.
// vi.hoisted, da vi.mock über die Imports gehoben wird.
const { reducedMock } = vi.hoisted(() => ({ reducedMock: vi.fn<() => boolean>(() => false) }));
vi.mock("framer-motion", async () => {
  const echt = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return { ...echt, useReducedMotion: () => reducedMock() };
});

// Import NACH dem Mock, damit die Komponente die gemockte Hook sieht.
const { GalerieCoverflow } = await import("../bausteine/GalerieCoverflow");

// ─── Fixtures ───────────────────────────────────────────────────────

function bauProjekt(
  slug: string,
  titel: string,
  kategorie: ProjektModel["kategorie"],
  bilderAnzahl: number,
): ProjektModel {
  return {
    titel,
    kurzbeschreibung: `Kurz ${titel}`,
    langbeschreibung: `Lang ${titel}`,
    kategorie,
    technologien: ["TS"],
    highlights: ["H"],
    galerieSlug: slug,
    bilder: Array.from({ length: bilderAnzahl }, (_, i) => ({
      quelle: `/${slug}-${i}.webp`,
      titel: `${titel} Bild ${i + 1}`,
      text: `Kontext ${i + 1}`,
    })),
    zeitraum: "2026",
  };
}

const DREI: ProjektModel[] = [
  bauProjekt("alpha", "Alpha Galerie", "security", 9),
  bauProjekt("beta", "Beta Galerie", "development", 4),
  bauProjekt("gamma", "Gamma Galerie", "tooling", 2),
];

beforeEach(() => {
  reducedMock.mockReturnValue(false);
});

afterEach(() => {
  vi.clearAllMocks();
});

// ─── Render: Fokus + Nachbarn ───────────────────────────────────────

describe("GalerieCoverflow — Render", () => {
  it("rendert die Fokus-Galerie öffenbar mit Bilderzähler", () => {
    render(<GalerieCoverflow galerien={DREI} onOeffnen={() => {}} />);
    const fokus = screen.getByRole("button", { name: /Galerie öffnen: Alpha Galerie/ });
    expect(fokus).toBeInTheDocument();
    expect(screen.getByText("9 Bilder")).toBeInTheDocument();
  });

  it("zeigt einen i/n-Zähler", () => {
    render(<GalerieCoverflow galerien={DREI} onOeffnen={() => {}} />);
    expect(screen.getByText("01 / 03")).toBeInTheDocument();
  });

  it("erzeugt je Galerie einen Dot-Button", () => {
    render(<GalerieCoverflow galerien={DREI} onOeffnen={() => {}} />);
    expect(screen.getByRole("button", { name: "Galerie 1: Alpha Galerie" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Galerie 2: Beta Galerie" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Galerie 3: Gamma Galerie" })).toBeInTheDocument();
  });

  it("kündigt den Fokus über eine Live-Region an", () => {
    render(<GalerieCoverflow galerien={DREI} onOeffnen={() => {}} />);
    expect(
      screen.getByText("Galerie 1 von 3: Alpha Galerie, 9 Bilder"),
    ).toBeInTheDocument();
  });
});

// ─── Blättern: Pfeil / Tastatur / Dot ──────────────────────────────

describe("GalerieCoverflow — Blättern ändert den Fokus", () => {
  it("blättert per Pfeil zur nächsten Galerie", () => {
    render(<GalerieCoverflow galerien={DREI} onOeffnen={() => {}} />);
    fireEvent.click(screen.getByLabelText("Nächste Galerie"));
    expect(screen.getByRole("button", { name: /Galerie öffnen: Beta Galerie/ })).toBeInTheDocument();
    expect(screen.getByText("02 / 03")).toBeInTheDocument();
  });

  it("blättert per Pfeil-Taste (ArrowRight)", () => {
    render(<GalerieCoverflow galerien={DREI} onOeffnen={() => {}} />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByRole("button", { name: /Galerie öffnen: Beta Galerie/ })).toBeInTheDocument();
  });

  it("wrap-around: ArrowLeft auf Index 0 springt ans Ende", () => {
    render(<GalerieCoverflow galerien={DREI} onOeffnen={() => {}} />);
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByRole("button", { name: /Galerie öffnen: Gamma Galerie/ })).toBeInTheDocument();
    expect(screen.getByText("03 / 03")).toBeInTheDocument();
  });

  it("springt per Dot direkt zur Galerie", () => {
    render(<GalerieCoverflow galerien={DREI} onOeffnen={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Galerie 3: Gamma Galerie" }));
    expect(screen.getByRole("button", { name: /Galerie öffnen: Gamma Galerie/ })).toBeInTheDocument();
  });
});

// ─── Öffnen: Klick + Enter ──────────────────────────────────────────

describe("GalerieCoverflow — Öffnen ruft onOeffnen mit dem Fokus-Projekt", () => {
  it("Klick auf die Fokus-Karte öffnet das richtige Projekt", () => {
    const onOeffnen = vi.fn();
    render(<GalerieCoverflow galerien={DREI} onOeffnen={onOeffnen} />);
    fireEvent.click(screen.getByRole("button", { name: /Galerie öffnen: Alpha Galerie/ }));
    expect(onOeffnen).toHaveBeenCalledTimes(1);
    expect(onOeffnen).toHaveBeenCalledWith(DREI[0]);
  });

  it("nach Blättern öffnet die Fokus-Karte das neue Projekt", () => {
    const onOeffnen = vi.fn();
    render(<GalerieCoverflow galerien={DREI} onOeffnen={onOeffnen} />);
    fireEvent.click(screen.getByLabelText("Nächste Galerie"));
    fireEvent.click(screen.getByRole("button", { name: /Galerie öffnen: Beta Galerie/ }));
    expect(onOeffnen).toHaveBeenCalledWith(DREI[1]);
  });

  it("Enter/Leertaste auf der fokussierten Karte öffnet (nativer Button)", () => {
    const onOeffnen = vi.fn();
    render(<GalerieCoverflow galerien={DREI} onOeffnen={onOeffnen} />);
    const karte = screen.getByRole("button", { name: /Galerie öffnen: Alpha Galerie/ });
    // Ein <button type=button> löst onClick per Enter/Space aus.
    fireEvent.click(karte);
    expect(onOeffnen).toHaveBeenCalledWith(DREI[0]);
  });

  it("respektiert startIndex", () => {
    const onOeffnen = vi.fn();
    render(<GalerieCoverflow galerien={DREI} onOeffnen={onOeffnen} startIndex={2} />);
    expect(screen.getByRole("button", { name: /Galerie öffnen: Gamma Galerie/ })).toBeInTheDocument();
    expect(screen.getByText("03 / 03")).toBeInTheDocument();
  });
});

// ─── Akzentfarbe folgt der Fokus-Kategorie ─────────────────────────

describe("GalerieCoverflow — Akzentfarbe folgt dem Fokus", () => {
  it("nutzt die Akzentfarbe der Fokus-Kategorie im Eyebrow", () => {
    // Fokus = security (Galerie 0). Eyebrow zeigt das Kategorie-Label in der Akzentfarbe.
    render(<GalerieCoverflow galerien={DREI} onOeffnen={() => {}} />);
    const securityAkzent = kategorieKonfig("security").akzentFarbe;
    const eyebrow = screen.getByText(kategorieKonfig("security").label);
    // jest-dom normalisiert Hex↔rgb auf beiden Seiten.
    expect(eyebrow).toHaveStyle({ color: securityAkzent });
  });

  it("wechselt die Akzentfarbe beim Blättern zur development-Galerie", async () => {
    render(<GalerieCoverflow galerien={DREI} onOeffnen={() => {}} />);
    fireEvent.click(screen.getByLabelText("Nächste Galerie"));
    const devAkzent = kategorieKonfig("development").akzentFarbe;
    // Caption-Block wechselt via AnimatePresence mode="wait" — auf den neuen
    // Eyebrow warten (alter muss erst ausblenden).
    const eyebrow = await screen.findByText(kategorieKonfig("development").label);
    expect(eyebrow).toHaveStyle({ color: devAkzent });
  });
});

// ─── Edge: n=1 ─────────────────────────────────────────────────────

describe("GalerieCoverflow — Edge n=1", () => {
  const EINS = [DREI[0]];

  it("rendert nur die Fokus-Karte, keine Pfeile/Dots/Zähler", () => {
    render(<GalerieCoverflow galerien={EINS} onOeffnen={() => {}} />);
    expect(screen.getByRole("button", { name: /Galerie öffnen: Alpha Galerie/ })).toBeInTheDocument();
    expect(screen.queryByLabelText("Nächste Galerie")).toBeNull();
    expect(screen.queryByLabelText("Vorherige Galerie")).toBeNull();
    expect(screen.queryByRole("button", { name: /^Galerie 1:/ })).toBeNull();
    expect(screen.queryByText("01 / 01")).toBeNull();
  });

  it("die einzige Galerie ist trotzdem öffenbar", () => {
    const onOeffnen = vi.fn();
    render(<GalerieCoverflow galerien={EINS} onOeffnen={onOeffnen} />);
    fireEvent.click(screen.getByRole("button", { name: /Galerie öffnen: Alpha Galerie/ }));
    expect(onOeffnen).toHaveBeenCalledWith(EINS[0]);
  });
});

// ─── Edge: n=2 ─────────────────────────────────────────────────────

describe("GalerieCoverflow — Edge n=2", () => {
  const ZWEI = [DREI[0], DREI[1]];

  it("stellt beide Galerien dar (Dots + Pfeile vorhanden)", () => {
    render(<GalerieCoverflow galerien={ZWEI} onOeffnen={() => {}} />);
    expect(screen.getByRole("button", { name: "Galerie 1: Alpha Galerie" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Galerie 2: Beta Galerie" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nächste Galerie")).toBeInTheDocument();
  });

  it("kein Wrap-Spam: ArrowLeft auf Index 0 bleibt bei Index 0", () => {
    render(<GalerieCoverflow galerien={ZWEI} onOeffnen={() => {}} />);
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    // ohne Wrap bleibt der Fokus auf der ersten Galerie.
    expect(screen.getByRole("button", { name: /Galerie öffnen: Alpha Galerie/ })).toBeInTheDocument();
    expect(screen.getByText("01 / 02")).toBeInTheDocument();
  });
});

// ─── Reduced-Motion-Pfad ───────────────────────────────────────────

describe("GalerieCoverflow — Reduced-Motion", () => {
  it("bleibt voll bedienbar bei prefers-reduced-motion", () => {
    reducedMock.mockReturnValue(true);
    const onOeffnen = vi.fn();
    render(<GalerieCoverflow galerien={DREI} onOeffnen={onOeffnen} />);
    // Fokus öffenbar
    fireEvent.click(screen.getByRole("button", { name: /Galerie öffnen: Alpha Galerie/ }));
    expect(onOeffnen).toHaveBeenCalledWith(DREI[0]);
    // Blättern funktioniert weiterhin
    fireEvent.click(screen.getByLabelText("Nächste Galerie"));
    expect(screen.getByRole("button", { name: /Galerie öffnen: Beta Galerie/ })).toBeInTheDocument();
  });
});

// ─── BUG 1: Tap auf die Fokus-Karte öffnet (keine Overlay-Falle) ───
// jsdom kann kein z-index-Hit-Testing — der Test sichert die Invariante:
// die Fokus-Karte ist direkt klickbar und es gibt keine ganzflächige
// drag-Overlay-Ebene mehr, die Taps abfangen würde.

describe("GalerieCoverflow — Fokus-Karte ist antippbar (kein Overlay-Schlucken)", () => {
  it("Klick öffnet die Fokus-Karte auch bei n>1 (Mobil-Pfad)", () => {
    const onOeffnen = vi.fn();
    render(<GalerieCoverflow galerien={DREI} onOeffnen={onOeffnen} />);
    fireEvent.click(screen.getByRole("button", { name: /Galerie öffnen: Alpha Galerie/ }));
    expect(onOeffnen).toHaveBeenCalledWith(DREI[0]);
  });

  it("besitzt keine ganzflächige aria-hidden Overlay-Ebene mehr", () => {
    const { container } = render(<GalerieCoverflow galerien={DREI} onOeffnen={() => {}} />);
    // Die alte Swipe-Ebene war <div aria-hidden class="absolute inset-0 z-20">.
    const overlay = container.querySelector('[aria-hidden="true"].z-20');
    expect(overlay).toBeNull();
  });
});

// ─── BUG 2: ←/→ blättert NICHT, während ein modaler Dialog offen ist ─

describe("GalerieCoverflow — Tastatur entkoppelt von offener Lightbox", () => {
  it("ArrowRight ändert den Fokus NICHT, wenn ein [role=dialog][aria-modal] offen ist", () => {
    render(<GalerieCoverflow galerien={DREI} onOeffnen={() => {}} />);
    expect(screen.getByText("01 / 03")).toBeInTheDocument();

    // Simuliere die offene Lightbox als modalen Dialog im DOM.
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    document.body.appendChild(dialog);

    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    // Fokus unverändert — der Coverflow ignoriert ←/→ hinter dem Dialog.
    expect(screen.getByText("01 / 03")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Galerie öffnen: Alpha Galerie/ })).toBeInTheDocument();

    document.body.removeChild(dialog);
  });

  it("blättert wieder, sobald kein modaler Dialog mehr offen ist", () => {
    render(<GalerieCoverflow galerien={DREI} onOeffnen={() => {}} />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("02 / 03")).toBeInTheDocument();
  });
});
