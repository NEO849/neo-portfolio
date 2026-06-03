// ═══════════════════════════════════════════════════════
// TEST: useVoiceDemo — vollständige Zustandsmaschine
//
// Prüft den simulierten Ablauf inkl. Injektions-Status (sent/queued/
// skipped), Queue + Drain, Session-Wahl, Sprache und auto-Enter.
// Timer laufen über Fake-Timers.
// ═══════════════════════════════════════════════════════

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useVoiceDemo } from "../viewmodels/useVoiceDemo";
import { DEMO_SAETZE, VERARBEITUNG_DAUER_MS } from "../models/voiceDemo";

beforeEach(() => vi.useFakeTimers());
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });

function sprechen(result: { current: ReturnType<typeof useVoiceDemo> }) {
  act(() => result.current.aufnahmeUmschalten()); // → aufnahme
  act(() => result.current.aufnahmeUmschalten()); // → verarbeitung
  act(() => { vi.advanceTimersByTime(VERARBEITUNG_DAUER_MS); });
}

describe("useVoiceDemo — Klon-Zustandsmaschine", () => {
  it("startet im erwarteten Grundzustand", () => {
    const { result } = renderHook(() => useVoiceDemo());
    expect(result.current.aufnahme).toBe("bereit");
    expect(result.current.sprache).toBe("de");
    expect(result.current.autoEnter).toBe(true);
    expect(result.current.aktiveSitzungId).toBe("bugbounty");
    expect(result.current.aktivesZiel).toBe("claude:bugbounty");
    expect(result.current.aktuellesTranskript).toBeNull();
    expect(result.current.naechsterSatz).toBe(DEMO_SAETZE.de[0]);
    expect(result.current.indikator).toEqual({ modus: "idle", text: "Bereit" });
  });

  it("durchläuft Aufnahme → Verarbeitung → sent-Transkript", () => {
    const { result } = renderHook(() => useVoiceDemo());
    const startLaenge = result.current.history.length;

    act(() => result.current.aufnahmeUmschalten());
    expect(result.current.aufnahme).toBe("aufnahme");
    expect(result.current.indikator.modus).toBe("rec");

    act(() => result.current.aufnahmeUmschalten());
    expect(result.current.aufnahme).toBe("verarbeitung");

    act(() => { vi.advanceTimersByTime(VERARBEITUNG_DAUER_MS); });

    expect(result.current.aufnahme).toBe("bereit");
    const akt = result.current.aktuellesTranskript;
    expect(akt?.text).toBe(DEMO_SAETZE.de[0]);
    expect(akt?.status).toBe("sent");           // autoEnter an + Session idle
    expect(akt?.ziel).toBe("claude:bugbounty");
    expect(akt?.frisch).toBe(true);
    expect(result.current.history.length).toBe(startLaenge + 1);
    expect(result.current.history[0].id).toBe(akt?.id);
  });

  it("markiert ohne auto-Enter als skipped", () => {
    const { result } = renderHook(() => useVoiceDemo());
    act(() => result.current.autoEnterSetzen(false));
    sprechen(result);
    expect(result.current.aktuellesTranskript?.status).toBe("skipped");
  });

  it("queued bei beschäftigter Session und drain räumt auf", () => {
    const { result } = renderHook(() => useVoiceDemo());
    const queuedVorher = result.current.bannerAnzahl; // seed: 1
    act(() => result.current.sitzungWaehlen("voice-bridge"));
    expect(result.current.indikator).toEqual({ modus: "busy", text: "Busy" });

    sprechen(result);
    expect(result.current.aktuellesTranskript?.status).toBe("queued");
    expect(result.current.bannerAnzahl).toBe(queuedVorher + 1);

    act(() => result.current.drainen());
    expect(result.current.bannerAnzahl).toBe(0);
    expect(result.current.aktuellesTranskript?.status).toBe("sent");
  });

  it("zykliert Sätze und respektiert Sprachwechsel", () => {
    const { result } = renderHook(() => useVoiceDemo());
    sprechen(result);
    expect(result.current.naechsterSatz).toBe(DEMO_SAETZE.de[1]);
    act(() => result.current.spracheWaehlen("en"));
    expect(result.current.naechsterSatz).toBe(DEMO_SAETZE.en[0]);
  });

  it("neuerInput leert die aktuelle Karte", () => {
    const { result } = renderHook(() => useVoiceDemo());
    sprechen(result);
    expect(result.current.aktuellesTranskript).not.toBeNull();
    act(() => result.current.neuerInput());
    expect(result.current.aktuellesTranskript).toBeNull();
  });

  it("öffnet/schließt Detail- und Einstellungs-Dialog", () => {
    const { result } = renderHook(() => useVoiceDemo());
    act(() => result.current.detailOeffnen(result.current.history[0]));
    expect(result.current.detailTranskript).not.toBeNull();
    act(() => result.current.detailSchliessen());
    expect(result.current.detailTranskript).toBeNull();

    act(() => result.current.einstellungenOeffnen());
    expect(result.current.einstellungenOffen).toBe(true);
    act(() => result.current.einstellungenSpeichern("en"));
    expect(result.current.einstellungenOffen).toBe(false);
    expect(result.current.sprache).toBe("en");
  });

  it("ignoriert Umschalten während der Verarbeitung", () => {
    const { result } = renderHook(() => useVoiceDemo());
    act(() => result.current.aufnahmeUmschalten());
    act(() => result.current.aufnahmeUmschalten()); // → verarbeitung
    act(() => result.current.aufnahmeUmschalten()); // ignoriert
    expect(result.current.aufnahme).toBe("verarbeitung");
  });
});
