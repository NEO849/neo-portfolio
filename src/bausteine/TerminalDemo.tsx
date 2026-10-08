import { useEffect, useRef, useState } from "react";
import { useBewegungErlaubt } from "../bewegung/hooks/useBewegungErlaubt";
import type { TerminalDemoSkript } from "../models/referenzenDaten";

// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: TerminalDemo — spielt ein Demo-Skript im Terminal-Look ab.
// Deterministisch, rein clientseitig, MOCK-Daten (Hosts = *.example).
// „Ausführen" zeigt die Zeilen schrittweise; reduced-motion = sofort alle.
// Keine echte Ausführung, kein Netzwerk. Ein Baustein für alle Befunde.
// ═══════════════════════════════════════════════════════════════════

const FARBE: Record<string, string> = {
  cmd: "#e6ebe7",
  out: "rgba(230,235,231,0.72)",
  note: "rgba(230,235,231,0.42)",
  crit: "#f1646c",
};

export function TerminalDemo({ skript }: { skript: TerminalDemoSkript }) {
  const erlaubt = useBewegungErlaubt();
  const [laeuft, setLaeuft] = useState(false);
  const [sichtbar, setSichtbar] = useState(0);
  const timer = useRef<number | null>(null);
  const total = skript.length;

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const starten = () => {
    if (timer.current) window.clearTimeout(timer.current);
    if (!erlaubt) { setSichtbar(total); setLaeuft(false); return; }
    setSichtbar(0);
    setLaeuft(true);
    let i = 0;
    const tick = () => {
      i += 1;
      setSichtbar(i);
      if (i >= total) { setLaeuft(false); return; }
      timer.current = window.setTimeout(tick, 480);
    };
    timer.current = window.setTimeout(tick, 220);
  };

  const zuruecksetzen = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setLaeuft(false);
    setSichtbar(0);
  };

  const zeilen = skript.slice(0, sichtbar);

  return (
    <div className="overflow-hidden rounded-2xl2 border border-white/[0.1] bg-[#0a0b0d]">
      {/* Fensterkopf */}
      <div className="flex items-center gap-2 border-b border-white/[0.07] bg-white/[0.02] px-3 py-2">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#f1646c]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#f5b544]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]/70" />
        </span>
        <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
          demo · simulation · mock-daten
        </span>
        <span className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={starten}
            disabled={laeuft}
            className="rounded-md border border-akzent-500/40 bg-akzent-500/10 px-2.5 py-1 font-mono text-[11px] text-akzent-300 transition-colors hover:border-akzent-500/70 hover:text-white disabled:opacity-50"
          >
            {laeuft ? "läuft …" : sichtbar > 0 ? "erneut" : "Ausführen"}
          </button>
          {sichtbar > 0 && !laeuft && (
            <button
              type="button"
              onClick={zuruecksetzen}
              className="font-mono text-[11px] text-white/40 transition-colors hover:text-white/70"
            >
              Reset
            </button>
          )}
        </span>
      </div>

      {/* Terminal-Körper */}
      <div className="max-h-[22rem] overflow-y-auto px-4 py-3 font-mono text-[12.5px] leading-relaxed">
        {sichtbar === 0 && (
          <p className="py-4 text-white/30">
            Klick auf <span className="text-akzent-300">Ausführen</span> — die Lücke wird mit Mock-Daten
            Schritt für Schritt vorgeführt. Nichts verlässt den Browser.
          </p>
        )}
        {zeilen.map((z, i) => (
          <div key={i} className="whitespace-pre-wrap" style={{ color: FARBE[z.art] }}>
            {z.art === "cmd" && <span className="mr-1.5 text-akzent-400">$</span>}
            {z.art === "note" && <span className="mr-1 text-white/30"># </span>}
            {z.art === "crit" && <span className="mr-1 font-bold text-[#f1646c]">! </span>}
            {z.text}
          </div>
        ))}
        {laeuft && <span className="inline-block h-4 w-2 animate-pulse bg-akzent-400/80 align-middle" aria-hidden />}
      </div>
    </div>
  );
}
