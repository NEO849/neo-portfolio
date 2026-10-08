import { useEffect, useRef, useState } from "react";
import { useBewegungErlaubt } from "../bewegung/hooks/useBewegungErlaubt";
import type { AngriffsKette, TerminalZeile } from "../models/referenzenDaten";

// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: AngriffsSimulation — verkettete, überlappende Terminal-Fenster.
// Spielt eine Angriffs-Kette (PIPELINE → RECON → FORGE → EXPLOIT → IMPACT)
// als Kaskade echter wirkender Terminal-Fenster ab, Fenster für Fenster,
// Zeile für Zeile. MOCK-Daten, Hosts *.example, keine echte Ausführung.
// reduced-motion: alles sofort sichtbar. Ein Baustein für alle Befunde.
// ═══════════════════════════════════════════════════════════════════

const PHASE_FARBE: Record<string, string> = {
  PIPELINE: "#7aa2ff", RECON: "#38bdf8", FORGE: "#f5b544", INJECT: "#f5b544",
  SETUP: "#7aa2ff", EXPLOIT: "#f5884b", PIVOT: "#f5884b", CHAIN: "#f5884b", IMPACT: "#f1646c",
};
const phaseHex = (p: string) => PHASE_FARBE[p] ?? "#7aa2ff";

const ZEILE_FARBE: Record<TerminalZeile["art"], string> = {
  cmd: "#e6ebe7",
  out: "rgba(230,235,231,0.68)",
  ok: "#34d399",
  note: "rgba(230,235,231,0.4)",
  crit: "#f1646c",
};

function Zeile({ z }: { z: TerminalZeile }) {
  return (
    <div className="whitespace-pre-wrap" style={{ color: ZEILE_FARBE[z.art] }}>
      {z.art === "cmd" && <span className="mr-1.5 text-akzent-400">❯</span>}
      {z.art === "ok" && <span className="mr-1 text-[#34d399]">✓ </span>}
      {z.art === "note" && <span className="mr-1 text-white/30"># </span>}
      {z.art === "crit" && <span className="mr-1 font-bold text-[#f1646c]">▲ </span>}
      {z.text}
    </div>
  );
}

export function AngriffsSimulation({ kette }: { kette: AngriffsKette }) {
  const erlaubt = useBewegungErlaubt();
  const [laeuft, setLaeuft] = useState(false);
  const [wIdx, setWIdx] = useState(-1);   // aktuell enthülltes Fenster
  const [lIdx, setLIdx] = useState(0);    // Zeilen im aktuellen Fenster
  const timer = useRef<number | null>(null);

  const clear = () => { if (timer.current) { window.clearTimeout(timer.current); timer.current = null; } };
  useEffect(() => () => clear(), []);

  const alleZeigen = () => {
    clear();
    setLaeuft(false);
    setWIdx(kette.length - 1);
    setLIdx(kette[kette.length - 1]?.zeilen.length ?? 0);
  };

  const starten = () => {
    clear();
    if (!erlaubt) { alleZeigen(); return; }
    setLaeuft(true);
    setWIdx(0);
    setLIdx(0);
    let w = 0, l = 0;
    const schritt = () => {
      const fenster = kette[w];
      if (!fenster) { setLaeuft(false); return; }
      if (l < fenster.zeilen.length) {
        l += 1;
        setLIdx(l);
        const art = fenster.zeilen[l - 1]?.art;
        const dauer = art === "cmd" ? 300 : art === "crit" ? 360 : 190;
        timer.current = window.setTimeout(schritt, dauer);
      } else if (w < kette.length - 1) {
        w += 1; l = 0;
        setWIdx(w); setLIdx(0);
        timer.current = window.setTimeout(schritt, 420);
      } else {
        setLaeuft(false);
      }
    };
    timer.current = window.setTimeout(schritt, 260);
  };

  const zuruecksetzen = () => { clear(); setLaeuft(false); setWIdx(-1); setLIdx(0); };

  const gestartet = wIdx >= 0;

  return (
    <div>
      {/* Steuerung + Phasen-Fortschritt */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={starten}
          disabled={laeuft}
          className="inline-flex items-center gap-2 rounded-full border border-[#f1646c]/40 bg-[#f1646c]/10 px-4 py-2 font-mono text-xs text-[#f1646c] transition-colors hover:border-[#f1646c]/70 hover:text-white disabled:opacity-50"
        >
          <span className="relative flex h-2 w-2">
            {laeuft && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f1646c]/70" />}
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#f1646c]" />
          </span>
          {laeuft ? "Angriff läuft …" : gestartet ? "Erneut" : "Angriff ausführen"}
        </button>
        {gestartet && !laeuft && (
          <button type="button" onClick={zuruecksetzen} className="font-mono text-xs text-white/40 transition-colors hover:text-white/70">
            Reset
          </button>
        )}
        <span className="ml-auto flex items-center gap-1.5" aria-hidden>
          {kette.map((f, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i <= wIdx ? 20 : 10,
                background: i <= wIdx ? phaseHex(f.phase) : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </span>
      </div>

      {/* Fenster-Kaskade */}
      <div className="relative">
        {!gestartet && (
          <div className="rounded-2xl2 border border-white/[0.1] bg-[#0a0b0d] px-4 py-8 text-center">
            <p className="font-mono text-sm text-white/40">
              Klick auf <span className="text-[#f1646c]">Angriff ausführen</span> — der Weg vom automatisierten
              Fund bis zum maximalen Schaden, Fenster für Fenster. Simulation, Mock-Daten.
            </p>
          </div>
        )}
        {kette.slice(0, wIdx + 1).map((fenster, i) => {
          const aktiv = i === wIdx;
          const zeilen = i < wIdx ? fenster.zeilen : fenster.zeilen.slice(0, lIdx);
          const hex = phaseHex(fenster.phase);
          return (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl2 border bg-[#0a0b0d] transition-all duration-300"
              style={{
                marginTop: i === 0 ? 0 : "-0.6rem",
                marginLeft: `min(${i * 1.4}rem, 4.2rem)`,
                marginRight: i % 2 === 1 ? "0.4rem" : 0,
                zIndex: i + 1,
                opacity: aktiv ? 1 : 0.68,
                borderColor: aktiv ? `${hex}66` : "rgba(255,255,255,0.08)",
                boxShadow: aktiv
                  ? `0 24px 60px -20px rgba(0,0,0,0.8), 0 0 0 1px ${hex}22`
                  : "0 16px 40px -24px rgba(0,0,0,0.7)",
              }}
            >
              {/* Fensterkopf */}
              <div className="flex items-center gap-2 border-b border-white/[0.07] bg-white/[0.02] px-3 py-2">
                <span className="flex gap-1.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f1646c]/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f5b544]/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]/70" />
                </span>
                <span
                  className="rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em]"
                  style={{ color: hex, background: `${hex}1f`, border: `1px solid ${hex}55` }}
                >
                  {fenster.phase}
                </span>
                <span className="font-mono text-[11px] text-white/40 truncate">{fenster.titel}</span>
              </div>
              {/* Körper */}
              <div className="max-h-[20rem] overflow-y-auto px-4 py-3 font-mono text-[12.5px] leading-relaxed">
                {zeilen.map((z, j) =>
                  z.art === "cmd" ? (
                    <div key={j} className="mb-0.5 whitespace-pre-wrap">
                      <span className="mr-1.5 text-[#34d399]">{fenster.prompt}</span>
                      <span style={{ color: ZEILE_FARBE.cmd }}>{z.text}</span>
                    </div>
                  ) : (
                    <div key={j} className="mb-0.5"><Zeile z={z} /></div>
                  ),
                )}
                {aktiv && laeuft && <span className="inline-block h-4 w-2 animate-pulse bg-akzent-400/80 align-middle" aria-hidden />}
              </div>
            </div>
          );
        })}
      </div>

      {gestartet && (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/25">
          Simulation · Mock-Daten · Hosts *.example · nichts verlässt den Browser
        </p>
      )}
    </div>
  );
}
