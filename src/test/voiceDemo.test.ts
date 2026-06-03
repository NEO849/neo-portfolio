// ═══════════════════════════════════════════════════════
// TEST: useVoiceDemo — Aufnahme-Zustandsmaschine
//
// Prüft den simulierten Ablauf bereit → aufnahme → verarbeitung →
// Transkript ohne Hardware/Netz. Timer laufen über Fake-Timers,
// damit der Test deterministisch und sofort durchläuft.
// ═══════════════════════════════════════════════════════

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useVoiceDemo } from "../viewmodels/useVoiceDemo";
import { DEMO_SAETZE, VERARBEITUNG_DAUER_MS } from "../models/voiceDemo";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("useVoiceDemo — Zustandsmaschine", () => {
  it("startet bereit mit erster Sitzung und erstem Satz", () => {
    const { result } = renderHook(() => useVoiceDemo());
    expect(result.current.aufnahme).toBe("bereit");
    expect(result.current.sprache).toBe("de");
    expect(result.current.aktiveSitzung.id).toBe("bugbounty");
    expect(result.current.naechsterSatz).toBe(DEMO_SAETZE.de[0]);
  });

  it("schaltet bereit → aufnahme → verarbeitung → bereit und transkribiert", () => {
    const { result } = renderHook(() => useVoiceDemo());
    const startLaenge = result.current.aktiveSitzung.verlauf.length;

    act(() => result.current.aufnahmeUmschalten());
    expect(result.current.aufnahme).toBe("aufnahme");

    act(() => result.current.aufnahmeUmschalten());
    expect(result.current.aufnahme).toBe("verarbeitung");

    act(() => {
      vi.advanceTimersByTime(VERARBEITUNG_DAUER_MS);
    });

    expect(result.current.aufnahme).toBe("bereit");
    const verlauf = result.current.aktiveSitzung.verlauf;
    expect(verlauf.length).toBe(startLaenge + 1);
    const letzte = verlauf[verlauf.length - 1];
    expect(letzte.text).toBe(DEMO_SAETZE.de[0]);
    expect(letzte.frischTranskribiert).toBe(true);
  });

  it("wählt nach jeder Transkription den nächsten Satz", () => {
    const { result } = renderHook(() => useVoiceDemo());

    function einmalSprechen() {
      act(() => result.current.aufnahmeUmschalten()); // → aufnahme
      act(() => result.current.aufnahmeUmschalten()); // → verarbeitung
      act(() => {
        vi.advanceTimersByTime(VERARBEITUNG_DAUER_MS);
      });
    }

    einmalSprechen();
    expect(result.current.naechsterSatz).toBe(DEMO_SAETZE.de[1]);
    einmalSprechen();
    expect(result.current.naechsterSatz).toBe(DEMO_SAETZE.de[2]);
  });

  it("ignoriert Umschalten während der Verarbeitung", () => {
    const { result } = renderHook(() => useVoiceDemo());
    act(() => result.current.aufnahmeUmschalten());
    act(() => result.current.aufnahmeUmschalten()); // → verarbeitung
    act(() => result.current.aufnahmeUmschalten()); // soll ignoriert werden
    expect(result.current.aufnahme).toBe("verarbeitung");
  });

  it("wechselt die Sitzung", () => {
    const { result } = renderHook(() => useVoiceDemo());
    act(() => result.current.sitzungWaehlen("portfolio"));
    expect(result.current.aktiveSitzung.id).toBe("portfolio");
  });

  it("wechselt die Sprache und startet die Satzliste neu", () => {
    const { result } = renderHook(() => useVoiceDemo());
    act(() => result.current.spracheWaehlen("en"));
    expect(result.current.sprache).toBe("en");
    expect(result.current.naechsterSatz).toBe(DEMO_SAETZE.en[0]);
  });
});
