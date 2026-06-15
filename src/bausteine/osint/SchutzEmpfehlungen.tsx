// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: SchutzEmpfehlungen
// Der defensive Mehrwert: zeigt — NUR wenn ein echtes Sicherheitsproblem
// vorliegt (Gating im aufrufenden View) — als EINE ausklappbare Card, was
// man konkret dagegen tun kann (priorisierte, kategorisierte Maßnahmen).
// Reine Darstellung; die Logik liegt im Backend (werkzeug schutz_empfehlungen).
// Visuell konsistent zur ErgebnisUebersicht (Glas + Severity-Farbwelt).
// ═══════════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SchutzEmpfehlung } from "../../dienste/osintApi";

type Prio = SchutzEmpfehlung["prioritaet"];

const PRIO: Record<Prio, { etikett: string; text: string; rand: string; punkt: string }> = {
  hoch:    { etikett: "Sofort",   text: "text-signal-rot",   rand: "border-signal-rot/30",   punkt: "bg-signal-rot" },
  mittel:  { etikett: "Bald",     text: "text-signal-gelb",  rand: "border-signal-gelb/30",  punkt: "bg-signal-gelb" },
  niedrig: { etikett: "Optional", text: "text-signal-gruen", rand: "border-signal-gruen/30", punkt: "bg-signal-gruen" },
};

function SchildIkon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      className="text-akzent-300 flex-shrink-0">
      <path d="M12 2.5 4.5 5.5v5c0 4.4 3.1 8.4 7.5 9.8 4.4-1.4 7.5-5.4 7.5-9.8v-5L12 2.5Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function SchutzEmpfehlungen({ empfehlungen }: { empfehlungen: readonly SchutzEmpfehlung[] }) {
  const [offen, setOffen] = useState(false);
  if (!empfehlungen.length) return null;

  const dringend = empfehlungen.filter((e) => e.prioritaet === "hoch").length;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-akzent-500/20 bg-akzent-500/[0.04] mb-5">
      <span className="absolute inset-y-0 left-0 w-1 bg-akzent-500/70" />

      <button
        type="button"
        onClick={() => setOffen((o) => !o)}
        aria-expanded={offen}
        className="w-full pl-5 pr-4 py-3.5 flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-akzent-400/50 rounded-2xl"
      >
        <SchildIkon />
        <span className="font-display font-semibold text-white text-[15px]">So schützt du dich</span>
        <span className="ml-auto flex items-center gap-2.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/45">
            {empfehlungen.length} Maßnahme{empfehlungen.length === 1 ? "" : "n"}
            {dringend > 0 ? ` · ${dringend} dringend` : ""}
          </span>
          <span className={`text-akzent-300 text-[11px] transition-transform duration-200 ${offen ? "rotate-180" : ""}`}>▾</span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {offen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <ul className="pl-5 pr-4 pb-4 pt-1 space-y-2.5">
              {empfehlungen.map((e, index) => {
                const p = PRIO[e.prioritaet] ?? PRIO.mittel;
                return (
                  <li key={`${e.titel}-${index}`} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border ${p.rand} px-2 py-0.5`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.punkt}`} />
                        <span className={`font-mono text-[9px] uppercase tracking-wider ${p.text}`}>{p.etikett}</span>
                      </span>
                      <span className="font-medium text-white text-[13.5px]">{e.titel}</span>
                      <span className="ml-auto font-mono text-[10px] text-white/35">{e.kategorie}</span>
                    </div>
                    <p className="text-[13px] text-white/75 leading-relaxed mt-1.5">{e.was}</p>
                    <p className="text-[12px] text-white/45 leading-relaxed mt-1">
                      <span className="text-white/30">Warum: </span>{e.warum}
                    </p>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
