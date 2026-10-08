import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROZESS_PHASEN } from "../models/prozessDaten";
import type { ProzessPhase } from "../models/prozessDaten";
import { useBewegungErlaubt } from "../bewegung/hooks/useBewegungErlaubt";
import { KURVEN } from "../bewegung/varianten";

// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: ProzessFluss — interaktiver Prozess-Graph der Vorgehensweise.
// Vier Phasen als Kette (Verstehen → Bauen → Absichern → Betrieb). Das
// Gate-Glied "Absichern" ist visuell hervorgehoben. Fluss-Animation auf
// der Verbindungslinie (nur wenn Bewegung erlaubt). Ein Knoten ist zur
// Zeit aktiv; darunter erscheint sein Detail-Panel. Tastatur-bedienbar.
// Technik bewusst React+SVG statt schwerer Graph-Lib (Bundle-Budget).
// ═══════════════════════════════════════════════════════════════════

function GateSchild({ hex }: { hex: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={hex}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2.5l7.5 3.2v5.1c0 4.7-3.2 8-7.5 9.7-4.3-1.7-7.5-5-7.5-9.7V5.7z" />
      <path d="m9 11.7 2 2 3.6-4" />
    </svg>
  );
}

function Knoten({
  phase, aktiv, erlaubt, onAktivieren,
}: {
  phase: ProzessPhase;
  aktiv: boolean;
  erlaubt: boolean;
  onAktivieren: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onAktivieren}
      aria-pressed={aktiv}
      aria-label={`Phase ${phase.nummer}: ${phase.titel}`}
      className="group relative z-10 flex w-full flex-col items-center gap-2 rounded-2xl2 px-3 py-4 text-center outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-akzent-400/70"
      style={{
        background: aktiv
          ? `linear-gradient(160deg, rgba(${phase.farbeRgb},0.16), rgba(${phase.farbeRgb},0.04))`
          : "rgba(255,255,255,0.025)",
        border: `1px solid ${aktiv ? `rgba(${phase.farbeRgb},0.55)` : "rgba(255,255,255,0.08)"}`,
        boxShadow: aktiv ? `0 0 0 1px rgba(${phase.farbeRgb},0.18), 0 16px 40px rgba(${phase.farbeRgb},0.12)` : undefined,
      }}
    >
      {/* Nummern-/Gate-Plättchen */}
      <span
        className="relative grid h-11 w-11 place-items-center rounded-full font-mono text-sm font-bold transition-transform duration-300 group-hover:scale-105"
        style={{
          color: aktiv ? "#fff" : phase.akzentHex,
          background: `linear-gradient(150deg, rgba(${phase.farbeRgb},${aktiv ? 0.4 : 0.14}), rgba(${phase.farbeRgb},0.03))`,
          border: `1px solid rgba(${phase.farbeRgb},${aktiv ? 0.6 : 0.3})`,
        }}
      >
        {phase.istGate ? <GateSchild hex={aktiv ? "#fff" : phase.akzentHex} /> : phase.nummer}
        {/* Gate-Puls — nur Bewegung erlaubt */}
        {phase.istGate && erlaubt && (
          <span
            className="absolute inset-0 rounded-full"
            style={{ boxShadow: `0 0 0 0 rgba(${phase.farbeRgb},0.5)`, animation: "gate-puls 2.6s ease-out infinite" }}
            aria-hidden
          />
        )}
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className="font-display text-[13px] font-semibold leading-tight tracking-[-0.01em] transition-colors"
          style={{ color: aktiv ? "#fff" : "rgba(255,255,255,0.72)" }}
        >
          {phase.titel}
        </span>
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">
        {phase.istGate ? "Security-Gate" : `Phase ${phase.nummer}`}
      </span>
    </button>
  );
}

function Verbinder({ hex, farbeRgb, erlaubt }: { hex: string; farbeRgb: string; erlaubt: boolean }) {
  return (
    <div className="relative flex items-center justify-center px-1 md:px-0" aria-hidden>
      {/* Mobile: kurze senkrechte Linie · Desktop: waagerechte Linie */}
      <div className="relative h-6 w-px md:h-px md:w-full md:min-w-[1.5rem]"
        style={{ background: `rgba(${farbeRgb},0.38)` }}>
        {/* Laufender Fluss-Punkt — nur Desktop (waagerecht) und nur wenn Bewegung erlaubt */}
        {erlaubt && (
          <span
            className="fluss-dot hidden md:block absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
            style={{ background: hex, boxShadow: `0 0 8px 1px ${hex}` }}
          />
        )}
      </div>
    </div>
  );
}

export function ProzessFluss() {
  const erlaubt = useBewegungErlaubt();
  const [aktivId, setAktivId] = useState<string>(PROZESS_PHASEN[0].id);
  const aktivePhase = PROZESS_PHASEN.find((p) => p.id === aktivId) ?? PROZESS_PHASEN[0];

  return (
    <div>
      {/* Knoten-Kette */}
      <div className="flex flex-col md:flex-row md:items-stretch">
        {PROZESS_PHASEN.map((phase, i) => (
          <div key={phase.id} className="contents md:flex md:flex-1 md:items-stretch">
            <div className="md:flex-1">
              <Knoten
                phase={phase}
                aktiv={phase.id === aktivId}
                erlaubt={erlaubt}
                onAktivieren={() => setAktivId(phase.id)}
              />
            </div>
            {i < PROZESS_PHASEN.length - 1 && (
              <Verbinder hex={phase.akzentHex} farbeRgb={phase.farbeRgb} erlaubt={erlaubt} />
            )}
          </div>
        ))}
      </div>

      {/* Detail-Panel des aktiven Knotens */}
      <AnimatePresence mode="wait">
        <motion.div
          key={aktivePhase.id}
          initial={erlaubt ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={erlaubt ? { opacity: 0, y: -8 } : undefined}
          transition={{ duration: 0.4, ease: KURVEN.expressiv }}
          className="mt-6 rounded-3xl2 border border-white/[0.08] bg-white/[0.025] p-6 md:p-8"
          style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05)` }}
        >
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="font-display text-xl font-bold text-white">
              {aktivePhase.titel}
            </h3>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: aktivePhase.akzentHex }}>
              {aktivePhase.istGate ? "Security-Gate" : `Phase ${aktivePhase.nummer} von ${PROZESS_PHASEN.length}`}
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">{aktivePhase.kurz}</p>

          <ul className="mt-5 space-y-2">
            {aktivePhase.punkte.map((punkt) => (
              <li key={punkt} className="flex items-start gap-2.5 text-sm text-white/70">
                <span className="mt-[3px] flex-shrink-0 text-[11px]" style={{ color: aktivePhase.akzentHex }}>›</span>
                <span>{punkt}</span>
              </li>
            ))}
          </ul>

          {/* Security-Linse — immer sichtbar, macht "sicher von Anfang bis Ende" greifbar */}
          <div
            className="mt-6 flex items-start gap-3 rounded-2xl2 p-4"
            style={{ background: `rgba(${aktivePhase.farbeRgb},0.06)`, border: `1px solid rgba(${aktivePhase.farbeRgb},0.22)` }}
          >
            <span className="mt-0.5 flex-shrink-0"><GateSchild hex={aktivePhase.akzentHex} /></span>
            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] mb-1" style={{ color: aktivePhase.akzentHex }}>
                Sicherheit in dieser Phase
              </p>
              <p className="text-[13px] leading-relaxed text-white/70">{aktivePhase.sicherheit}</p>
            </div>
          </div>

          <div className="mt-5 border-t border-white/[0.06] pt-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Ergebnis</span>
            <p className="mt-1 text-[13px] leading-relaxed text-white/75">{aktivePhase.ergebnis}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
