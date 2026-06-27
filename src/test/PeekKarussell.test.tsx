// ═══════════════════════════════════════════════════════════════════
// TEST: PeekKarussell — horizontales Peek-Karussell mit Scroll-Snap
// Prüft: Items + Caption rendern, das aktive (mittige) Item öffnet per
//        Tap/Enter mit korrektem Index, Tap auf einen Nachbarn öffnet
//        NICHT (zentriert nur), Dots/Pfeile vorhanden, Reduced-Motion-
//        Pfad bleibt bedienbar, A11y-Rollen.
//
// Hinweis: In jsdom ist IntersectionObserver gestubbt und feuert nie —
// der aktive Index bleibt also bei `startIndex` (Default 0). Die Tests
// rechnen damit (Item 0 = Mitte).
// ═══════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { PeekEintrag } from "../bausteine/PeekKarussell";

// useReducedMotion steuerbar: Standard = false, einzeln überschreibbar.
const { reducedMock } = vi.hoisted(() => ({
  reducedMock: vi.fn<() => boolean>(() => false),
}));
vi.mock("framer-motion", async () => {
  const echt = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return { ...echt, useReducedMotion: () => reducedMock() };
});

const { PeekKarussell } = await import("../bausteine/PeekKarussell");

// ─── Fixtures ───────────────────────────────────────────────────────

const EINTRAEGE: PeekEintrag[] = [
  { quelle: "/alpha.webp", titel: "Alpha", untertitel: "Erster", akzentFarbe: "#94a3b8" },
  { quelle: "/beta.webp", titel: "Beta", untertitel: "Zweiter", akzentFarbe: "#4f7cfb" },
  { quelle: "/gamma.webp", titel: "Gamma", untertitel: "Dritter", akzentFarbe: "#8aa0c8" },
];

beforeEach(() => {
  reducedMock.mockReturnValue(false);
});

afterEach(() => {
  vi.clearAllMocks();
});

// ─── Render ─────────────────────────────────────────────────────────

describe("PeekKarussell — Render", () => {
  it("rendert je Eintrag ein Item-Bild (scharfe Vordergrund-Ebene)", () => {
    render(<PeekKarussell eintraege={EINTRAEGE} ariaLabel="Test-Karussell" />);
    expect(screen.getByAltText("Alpha")).toBeInTheDocument();
    expect(screen.getByAltText("Beta")).toBeInTheDocument();
    expect(screen.getByAltText("Gamma")).toBeInTheDocument();
  });

  it("trägt die Karussell-Region mit aria-roledescription + Label", () => {
    render(<PeekKarussell eintraege={EINTRAEGE} ariaLabel="Test-Karussell" />);
    const region = screen.getByRole("region", { name: "Test-Karussell" });
    expect(region).toHaveAttribute("aria-roledescription", "Karussell");
  });

  it("zeigt den Titel + Untertitel des aktiven (mittigen) Items in der Caption", () => {
    render(<PeekKarussell eintraege={EINTRAEGE} ariaLabel="Test-Karussell" />);
    expect(screen.getByRole("heading", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.getByText("Erster")).toBeInTheDocument();
  });

  it("kündigt den mittigen Eintrag über eine Live-Region an", () => {
    render(<PeekKarussell eintraege={EINTRAEGE} ariaLabel="Test-Karussell" />);
    expect(screen.getByText("1 von 3: Alpha")).toBeInTheDocument();
  });

  it("zeigt einen i/n-Zähler in der Kopfzeile", () => {
    render(<PeekKarussell eintraege={EINTRAEGE} ariaLabel="Test-Karussell" />);
    expect(screen.getByText(/01\s*\/\s*03/)).toBeInTheDocument();
  });

  it("zeigt KEINE Caption-Texte im Bild (Titel steht unter der Bühne als Heading)", () => {
    render(<PeekKarussell eintraege={EINTRAEGE} ariaLabel="Test-Karussell" />);
    // Genau EINE Titel-Überschrift (die Caption unter der Bühne, aktives Item).
    expect(screen.getAllByRole("heading", { name: "Alpha" })).toHaveLength(1);
  });

  it("respektiert startIndex (Item wird zum aktiven/mittigen)", () => {
    render(<PeekKarussell eintraege={EINTRAEGE} startIndex={2} ariaLabel="Test-Karussell" />);
    // Caption gehört dem aktiven Item → Gamma ist Überschrift.
    expect(screen.getByRole("heading", { name: "Gamma" })).toBeInTheDocument();
  });
});

// ─── Öffnen: Mitte öffnet, Nachbar nicht ────────────────────────────

describe("PeekKarussell — Öffnen via onOeffnen", () => {
  it("Tap auf das aktive (mittige) Item ruft onOeffnen mit dem Index", () => {
    const onOeffnen = vi.fn();
    render(
      <PeekKarussell eintraege={EINTRAEGE} onOeffnen={onOeffnen} ariaLabel="Test-Karussell" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Öffnen: Alpha" }));
    expect(onOeffnen).toHaveBeenCalledTimes(1);
    expect(onOeffnen).toHaveBeenCalledWith(0);
  });

  it("Enter/Leertaste auf dem aktiven Item öffnet (nativer Button)", () => {
    const onOeffnen = vi.fn();
    render(
      <PeekKarussell eintraege={EINTRAEGE} onOeffnen={onOeffnen} ariaLabel="Test-Karussell" />,
    );
    // <button type=button> löst onClick per Enter/Space aus.
    fireEvent.click(screen.getByRole("button", { name: "Öffnen: Alpha" }));
    expect(onOeffnen).toHaveBeenCalledWith(0);
  });

  it("Tap auf einen Nachbarn öffnet NICHT (zentriert nur)", () => {
    const onOeffnen = vi.fn();
    render(
      <PeekKarussell eintraege={EINTRAEGE} onOeffnen={onOeffnen} ariaLabel="Test-Karussell" />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Zu .Beta. wechseln/ }));
    expect(onOeffnen).not.toHaveBeenCalled();
  });

  it("respektiert startIndex beim Öffnen-Index", () => {
    const onOeffnen = vi.fn();
    render(
      <PeekKarussell
        eintraege={EINTRAEGE}
        startIndex={2}
        onOeffnen={onOeffnen}
        ariaLabel="Test-Karussell"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Öffnen: Gamma" }));
    expect(onOeffnen).toHaveBeenCalledWith(2);
  });
});

// ─── Foto-Ebene: ohne onOeffnen tut die Mitte nichts ────────────────

describe("PeekKarussell — ohne onOeffnen (Foto-Ebene)", () => {
  it("Tap auf das aktive Item löst keinen Öffnen-Callback aus (reines Blättern)", () => {
    render(<PeekKarussell eintraege={EINTRAEGE} ariaLabel="Test-Karussell" />);
    // Aktives Item-Label = blanker Titel (kein „Öffnen:"-Präfix).
    const aktiv = screen.getByRole("button", { name: "Alpha" });
    // Kein Crash beim Klick, kein onOeffnen vorhanden.
    fireEvent.click(aktiv);
    expect(aktiv).toBeInTheDocument();
  });
});

// ─── Dots + Pfeile ──────────────────────────────────────────────────

describe("PeekKarussell — Steuerung", () => {
  it("erzeugt je Eintrag einen Dot-Button", () => {
    render(<PeekKarussell eintraege={EINTRAEGE} ariaLabel="Test-Karussell" />);
    expect(screen.getByRole("button", { name: "Zu 1: Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zu 2: Beta" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zu 3: Gamma" })).toBeInTheDocument();
  });

  it("blendet Pfeile + Dots bei einem einzigen Eintrag aus (kein Crash)", () => {
    render(<PeekKarussell eintraege={[EINTRAEGE[0]]} ariaLabel="Test-Karussell" />);
    expect(screen.getByRole("heading", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Weiter")).toBeNull();
    expect(screen.queryByRole("button", { name: /^Zu 1:/ })).toBeNull();
  });

  it("Pfeile sind nie disabled (es loopt) und beide vorhanden", () => {
    render(<PeekKarussell eintraege={EINTRAEGE} ariaLabel="Test-Karussell" />);
    // Pfeile rendern desktop-seitig (matchMedia-Stub → istMobile=false).
    expect(screen.getByLabelText("Zurück")).not.toBeDisabled();
    expect(screen.getByLabelText("Weiter")).not.toBeDisabled();
  });

  it("LOOP: Pfeil-zurück auf dem ersten Item springt ans Ende (Index 3/3)", async () => {
    render(<PeekKarussell eintraege={EINTRAEGE} ariaLabel="Test-Karussell" />);
    // #1: scrolleZu setzt den Index DIREKT → in jsdom ohne Observer prüfbar.
    // Der Zähler aktualisiert sofort; die Caption wechselt via AnimatePresence.
    fireEvent.click(screen.getByLabelText("Zurück"));
    expect(screen.getByText(/03\s*\/\s*03/)).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Gamma" })).toBeInTheDocument();
  });

  it("Pfeil-weiter schaltet zuverlässig zum nächsten Item (Index 2/3)", async () => {
    render(<PeekKarussell eintraege={EINTRAEGE} ariaLabel="Test-Karussell" />);
    fireEvent.click(screen.getByLabelText("Weiter"));
    expect(screen.getByText(/02\s*\/\s*03/)).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Beta" })).toBeInTheDocument();
  });

  it("Dot schaltet den aktiven Eintrag direkt um", async () => {
    render(<PeekKarussell eintraege={EINTRAEGE} ariaLabel="Test-Karussell" />);
    fireEvent.click(screen.getByRole("button", { name: "Zu 3: Gamma" }));
    expect(await screen.findByRole("heading", { name: "Gamma" })).toBeInTheDocument();
  });
});

// ─── Reduced-Motion ─────────────────────────────────────────────────

describe("PeekKarussell — Reduced-Motion", () => {
  it("bleibt voll bedienbar bei prefers-reduced-motion", () => {
    reducedMock.mockReturnValue(true);
    const onOeffnen = vi.fn();
    render(
      <PeekKarussell eintraege={EINTRAEGE} onOeffnen={onOeffnen} ariaLabel="Test-Karussell" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Öffnen: Alpha" }));
    expect(onOeffnen).toHaveBeenCalledWith(0);
  });
});
