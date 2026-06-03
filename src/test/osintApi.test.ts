// ═══════════════════════════════════════════════════════
// TEST: Dienst — osintApi (Fehler-Management)
//
// Prüft die Kern-Eigenschaft der Dienst-Schicht (Karte 4.3):
// Fehler sind erwartete, typisierte Zustände — keine Überraschungen.
// Getestet wird die öffentliche Funktion domainAnalysieren(), weil
// die Fetch-/Retry-Maschine (apiFetch) modul-privat ist. Der globale
// fetch wird gestubbt; die Backoff-Pausen laufen über Fake-Timers,
// damit die Tests deterministisch und sofort durchlaufen.
// ═══════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Apifehler, domainAnalysieren } from "../dienste/osintApi";

// Minimaler Response-Stub — nur die Felder, die apiFetch tatsächlich liest.
function antwortStub(
  status: number,
  koerper: unknown,
  jsonWirftFehler = false,
): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => {
      if (jsonWirftFehler) throw new Error("kein JSON-Körper");
      return koerper;
    },
  } as unknown as Response;
}

const urspruenglicherFetch = globalThis.fetch;

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
  globalThis.fetch = urspruenglicherFetch;
});

describe("Apifehler — typisierte Fehlerklasse", () => {
  it("setzt Standardwerte für art und versuche", () => {
    const fehler = new Apifehler("kaputt");
    expect(fehler).toBeInstanceOf(Error);
    expect(fehler.name).toBe("Apifehler");
    expect(fehler.art).toBe("unbekannt");
    expect(fehler.versuche).toBe(1);
    expect(fehler.statusCode).toBeUndefined();
  });

  it("istRateLimit ist nur bei art=rate_limit wahr", () => {
    expect(new Apifehler("x", 429, "rate_limit").istRateLimit).toBe(true);
    expect(new Apifehler("x", 500, "server").istRateLimit).toBe(false);
  });
});

describe("osintApi — Fehlerklassifikation & Retry", () => {
  it("liefert bei 200 die geparsten Daten ohne Wiederholung", async () => {
    const daten = { domain: "beispiel.de", existiert: true };
    globalThis.fetch = vi.fn().mockResolvedValue(antwortStub(200, daten));

    await expect(domainAnalysieren("beispiel.de")).resolves.toEqual(daten);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("klassifiziert 429 als rate_limit und wiederholt NICHT", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(antwortStub(429, {}));

    const fehler = await domainAnalysieren("beispiel.de").catch((e) => e);
    expect(fehler).toBeInstanceOf(Apifehler);
    expect(fehler.art).toBe("rate_limit");
    expect(fehler.istRateLimit).toBe(true);
    expect(fehler.statusCode).toBe(429);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("klassifiziert 4xx als client und übernimmt die Server-Detailmeldung", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(antwortStub(400, { detail: "Ungültige Domain" }));

    const fehler = await domainAnalysieren("x").catch((e) => e);
    expect(fehler.art).toBe("client");
    expect(fehler.statusCode).toBe(400);
    expect(fehler.message).toBe("Ungültige Domain");
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("fällt bei 4xx ohne JSON-Körper auf eine generische Meldung zurück", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(antwortStub(403, null, true));

    const fehler = await domainAnalysieren("x").catch((e) => e);
    expect(fehler.art).toBe("client");
    expect(fehler.statusCode).toBe(403);
    expect(fehler.message).toContain("403");
  });

  it("wiederholt 5xx bis MAX_VERSUCHE und wirft dann art=server", async () => {
    vi.useFakeTimers();
    globalThis.fetch = vi.fn().mockResolvedValue(antwortStub(503, {}));

    const versprechen = domainAnalysieren("x").catch((e) => e);
    await vi.runAllTimersAsync();
    const fehler = await versprechen;

    expect(fehler.art).toBe("server");
    expect(fehler.statusCode).toBe(503);
    expect(globalThis.fetch).toHaveBeenCalledTimes(3); // 1 initial + 2 Retries
  });

  it("erholt sich, wenn ein 5xx-Versuch von einem 200 gefolgt wird", async () => {
    vi.useFakeTimers();
    const daten = { domain: "beispiel.de" };
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(antwortStub(500, {}))
      .mockResolvedValueOnce(antwortStub(200, daten));

    const versprechen = domainAnalysieren("beispiel.de");
    await vi.runAllTimersAsync();

    await expect(versprechen).resolves.toEqual(daten);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it("klassifiziert einen Netzwerkabbruch als netzwerk und wiederholt", async () => {
    vi.useFakeTimers();
    globalThis.fetch = vi
      .fn()
      .mockRejectedValue(new TypeError("Failed to fetch"));

    const versprechen = domainAnalysieren("x").catch((e) => e);
    await vi.runAllTimersAsync();
    const fehler = await versprechen;

    expect(fehler.art).toBe("netzwerk");
    expect(fehler.statusCode).toBe(0);
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });

  it("klassifiziert einen AbortError als timeout", async () => {
    vi.useFakeTimers();
    const abbruch = new Error("aborted");
    abbruch.name = "AbortError";
    globalThis.fetch = vi.fn().mockRejectedValue(abbruch);

    const versprechen = domainAnalysieren("x").catch((e) => e);
    await vi.runAllTimersAsync();
    const fehler = await versprechen;

    expect(fehler.art).toBe("timeout");
    expect(fehler.message).toContain("Zeitüberschreitung");
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });
});
