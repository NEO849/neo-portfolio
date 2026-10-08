import { motion } from "framer-motion";
import { PIPELINE_SCHRITTE } from "../models/daten";
import { KURVEN } from "../bewegung/varianten";

// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: PipelineKette — visualisiert die automatisierte Recon-/Analyse-
// Pipeline (7 Schritte), die diese Befunde findet: je Schritt Name, was er
// tut und welchen Output er erzeugt. Zeigt die Automatisierungskette vom
// Scope bis zum priorisierten Kandidaten. reduced-motion-fest.
// ═══════════════════════════════════════════════════════════════════

export function PipelineKette() {
  return (
    <div className="relative rounded-3xl2 border border-white/[0.08] p-5 md:p-7"
      style={{ background: "radial-gradient(120% 80% at 10% 0%, rgba(79,124,251,0.07), transparent 55%), #0a0d14" }}>
      <ol className="relative space-y-3">
        {/* durchgehende Leitung */}
        <span className="pointer-events-none absolute left-[18px] top-2 bottom-2 w-px"
          style={{ background: "linear-gradient(to bottom, rgba(122,162,255,0.5), rgba(122,162,255,0.08))" }} aria-hidden />

        {PIPELINE_SCHRITTE.map((s, i) => (
          <motion.li
            key={s.nummer}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.05, duration: 0.5, ease: KURVEN.expressiv }}
            className="relative flex gap-4"
          >
            {/* Knoten */}
            <span className="relative z-10 grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-akzent-500/40 bg-[#0a0d14] font-mono text-sm font-bold text-akzent-300"
              style={{ boxShadow: "0 0 0 4px rgba(79,124,251,0.06)" }}>
              {String(s.nummer).padStart(2, "0")}
            </span>
            {/* Karte */}
            <div className="min-w-0 flex-1 rounded-2xl2 border border-white/[0.07] bg-white/[0.02] p-4">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <h4 className="font-display text-sm font-bold text-white">{s.name}</h4>
                <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-akzent-300/80">{s.skript}</code>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/60">{s.beschreibung}</p>
              <p className="mt-2 flex items-start gap-1.5 font-mono text-[11px] text-white/40">
                <span className="text-akzent-400/70">→</span>
                <span className="min-w-0 break-words">{s.output}</span>
              </p>
            </div>
          </motion.li>
        ))}
      </ol>

      <p className="mt-4 pl-[52px] text-[13px] leading-relaxed text-white/55">
        Jeder Lauf legt die Ordner- und Datei-Struktur automatisch an, ist wiederhol- und nachvollziehbar —
        aus Hunderttausenden Adressen wird in Sekunden eine priorisierte, prüfbare Kandidatenliste.
      </p>
    </div>
  );
}
