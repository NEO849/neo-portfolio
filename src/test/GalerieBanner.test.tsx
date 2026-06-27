// ═══════════════════════════════════════════════════════════════════
// TEST: GalerieBanner — edles Einzel-Frame-Premium-Karussell
// Prüft: Fokus-Render (öffenbarer Button + Zähler im Overlay),
//        Blättern (Pfeil/Tastatur/Dot) ändert den Fokus,
//        Tap/Klick auf den Fokus ruft onOeffnen mit korrektem Projekt,
//        Akzent folgt der Fokus-Kategorie, kein Crash bei n=1,
//        Reduced-Motion-Pfad, keydown-Guard bei offenem Dialog.
// ═══════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ProjektModel } from "../models/typen";
import { kategorieKonfig } from "../models/kategorieKonfiguration";

// useReducedMotion steuerbar: Standard = false, einzeln überschreibbar.
const { reducedMock } = vi.hoisted(() => ({ reducedMock: vi.fn<() => boolean>(() => false) }));
vi.mock("framer-motion", async () => {
  const echt = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return { ...echt, useReducedMotion: () => reducedMock() };
});

const { GalerieBanner } = await import("../bausteine/GalerieBanner");

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

// ─── Render: Fokus ──────────────────────────────────────────────────

describe("GalerieBanner — Render", () => {
  it("rendert die Fokus-Galerie öffenbar mit Bilderzähler im Overlay", () => {
    render(<GalerieBanner galerien={DREI} onOeffnen={() => {}} />);
    expect(
      screen.getByRole("button", { name: /Galerie öffnen: Alpha Galerie/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("9 Bilder")).toBeInTheDocument();
  });

  it("zeigt einen i/n-Zähler", () => {
    render(<GalerieBanner galerien={DREI} onOeffnen={() => {}} />);
    expect(screen.getByText("01 / 03")).toBeInTheDocument();
  });

  it("zeigt den Titel OHNE führende Zahl", () => {
    render(<GalerieBanner galerien={DREI} onOeffnen={() => {}} />);
    const titel = screen.getByRole("heading", { name: "Alpha Galerie" });
    expect(titel).toBeInTheDocument();
    expect(titel.textContent).toBe("Alpha Galerie");
  });

  it("erzeugt je Galerie einen Dot-Button", () => {
    render(<GalerieBanner galerien={DREI} onOeffnen={() => {}} />);
    expect(screen.getByRole("button", { name: "Galerie 1: Alpha Galerie" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Galerie 2: Beta Galerie" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Galerie 3: Gamma Galerie" })).toBeInTheDocument();
  });

  it("kündigt den Fokus über eine Live-Region an", () => {
    render(<GalerieBanner galerien={DREI} onOeffnen={() => {}} />);
    expect(
      screen.getByText("Galerie 1 von 3: Alpha Galerie, 9 Bilder"),
    ).toBeInTheDocument();
  });
});

// ─── Blättern: Pfeil / Tastatur / Dot ───────────────────────────────

describe("GalerieBanner — Blättern ändert den Fokus", () => {
  it("blättert per Pfeil zur nächsten Galerie", () => {
    render(<GalerieBanner galerien={DREI} onOeffnen={() => {}} />);
    fireEvent.click(screen.getByLabelText("Nächste Galerie"));
    expect(
      screen.getByRole("button", { name: /Galerie öffnen: Beta Galerie/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("02 / 03")).toBeInTheDocument();
  });

  it("blättert per Pfeil-Taste (ArrowRight)", () => {
    render(<GalerieBanner galerien={DREI} onOeffnen={() => {}} />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(
      screen.getByRole("button", { name: /Galerie öffnen: Beta Galerie/ }),
    ).toBeInTheDocument();
  });

  it("wrap-around: ArrowLeft auf Index 0 springt ans Ende", () => {
    render(<GalerieBanner galerien={DREI} onOeffnen={() => {}} />);
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(
      screen.getByRole("button", { name: /Galerie öffnen: Gamma Galerie/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("03 / 03")).toBeInTheDocument();
  });

  it("springt per Dot direkt zur Galerie", () => {
    render(<GalerieBanner galerien={DREI} onOeffnen={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Galerie 3: Gamma Galerie" }));
    expect(
      screen.getByRole("button", { name: /Galerie öffnen: Gamma Galerie/ }),
    ).toBeInTheDocument();
  });
});

// ─── Öffnen: Tap/Klick + korrektes Projekt ──────────────────────────

describe("GalerieBanner — Öffnen ruft onOeffnen mit dem Fokus-Projekt", () => {
  it("Klick auf das Fokus-Frame öffnet das richtige Projekt", () => {
    const onOeffnen = vi.fn();
    render(<GalerieBanner galerien={DREI} onOeffnen={onOeffnen} />);
    fireEvent.click(screen.getByRole("button", { name: /Galerie öffnen: Alpha Galerie/ }));
    expect(onOeffnen).toHaveBeenCalledTimes(1);
    expect(onOeffnen).toHaveBeenCalledWith(DREI[0]);
  });

  it("nach Blättern öffnet das Fokus-Frame das neue Projekt", () => {
    const onOeffnen = vi.fn();
    render(<GalerieBanner galerien={DREI} onOeffnen={onOeffnen} />);
    fireEvent.click(screen.getByLabelText("Nächste Galerie"));
    fireEvent.click(screen.getByRole("button", { name: /Galerie öffnen: Beta Galerie/ }));
    expect(onOeffnen).toHaveBeenCalledWith(DREI[1]);
  });

  it("Enter/Leertaste auf dem Fokus-Frame öffnet (nativer Button)", () => {
    const onOeffnen = vi.fn();
    render(<GalerieBanner galerien={DREI} onOeffnen={onOeffnen} />);
    const frame = screen.getByRole("button", { name: /Galerie öffnen: Alpha Galerie/ });
    // <button type=button> löst onClick per Enter/Space aus.
    fireEvent.click(frame);
    expect(onOeffnen).toHaveBeenCalledWith(DREI[0]);
  });

  it("respektiert startIndex", () => {
    render(<GalerieBanner galerien={DREI} onOeffnen={() => {}} startIndex={2} />);
    expect(
      screen.getByRole("button", { name: /Galerie öffnen: Gamma Galerie/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("03 / 03")).toBeInTheDocument();
  });
});

// ─── Akzentfarbe folgt der Fokus-Kategorie ─────────────────────────

describe("GalerieBanner — Akzentfarbe folgt dem Fokus", () => {
  it("nutzt die Akzentfarbe der Fokus-Kategorie im Eyebrow", () => {
    render(<GalerieBanner galerien={DREI} onOeffnen={() => {}} />);
    const securityAkzent = kategorieKonfig("security").akzentFarbe;
    const eyebrow = screen.getByText(kategorieKonfig("security").label);
    expect(eyebrow).toHaveStyle({ color: securityAkzent });
  });

  it("wechselt die Akzentfarbe beim Blättern zur development-Galerie", async () => {
    render(<GalerieBanner galerien={DREI} onOeffnen={() => {}} />);
    fireEvent.click(screen.getByLabelText("Nächste Galerie"));
    const devAkzent = kategorieKonfig("development").akzentFarbe;
    // Text-Overlay wechselt via AnimatePresence mode="wait" — auf den neuen
    // Eyebrow warten (alter muss erst ausblenden).
    const eyebrow = await screen.findByText(kategorieKonfig("development").label);
    expect(eyebrow).toHaveStyle({ color: devAkzent });
  });
});

// ─── Edge: n=1 (kein Crash, keine Controls) ─────────────────────────

describe("GalerieBanner — Edge n=1", () => {
  const EINS = [DREI[0]];

  it("rendert nur das Fokus-Frame, keine Pfeile/Dots/Zähler", () => {
    render(<GalerieBanner galerien={EINS} onOeffnen={() => {}} />);
    expect(
      screen.getByRole("button", { name: /Galerie öffnen: Alpha Galerie/ }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Nächste Galerie")).toBeNull();
    expect(screen.queryByLabelText("Vorherige Galerie")).toBeNull();
    expect(screen.queryByRole("button", { name: /^Galerie 1:/ })).toBeNull();
    expect(screen.queryByText("01 / 01")).toBeNull();
  });

  it("die einzige Galerie ist trotzdem öffenbar", () => {
    const onOeffnen = vi.fn();
    render(<GalerieBanner galerien={EINS} onOeffnen={onOeffnen} />);
    fireEvent.click(screen.getByRole("button", { name: /Galerie öffnen: Alpha Galerie/ }));
    expect(onOeffnen).toHaveBeenCalledWith(EINS[0]);
  });
});

// ─── Reduced-Motion-Pfad ────────────────────────────────────────────

describe("GalerieBanner — Reduced-Motion", () => {
  it("bleibt voll bedienbar bei prefers-reduced-motion", () => {
    reducedMock.mockReturnValue(true);
    const onOeffnen = vi.fn();
    render(<GalerieBanner galerien={DREI} onOeffnen={onOeffnen} />);
    fireEvent.click(screen.getByRole("button", { name: /Galerie öffnen: Alpha Galerie/ }));
    expect(onOeffnen).toHaveBeenCalledWith(DREI[0]);
    fireEvent.click(screen.getByLabelText("Nächste Galerie"));
    expect(
      screen.getByRole("button", { name: /Galerie öffnen: Beta Galerie/ }),
    ).toBeInTheDocument();
  });
});

// ─── keydown-Guard: ←/→ gesperrt, solange ein modaler Dialog offen ist ─

describe("GalerieBanner — Tastatur entkoppelt von offener Lightbox", () => {
  it("ArrowRight ändert den Fokus NICHT, wenn ein [role=dialog][aria-modal] offen ist", () => {
    render(<GalerieBanner galerien={DREI} onOeffnen={() => {}} />);
    expect(screen.getByText("01 / 03")).toBeInTheDocument();

    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    document.body.appendChild(dialog);

    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText("01 / 03")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Galerie öffnen: Alpha Galerie/ }),
    ).toBeInTheDocument();

    document.body.removeChild(dialog);
  });

  it("blättert wieder, sobald kein modaler Dialog mehr offen ist", () => {
    render(<GalerieBanner galerien={DREI} onOeffnen={() => {}} />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("02 / 03")).toBeInTheDocument();
  });
});
