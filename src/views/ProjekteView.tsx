import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROJEKTE } from "../models/daten";
import type { ProjektModel } from "../models/typen";

const einblend = { versteckt: { opacity: 0, y: 24 }, sichtbar: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const kategorieStile: Record<string, { farbe: string; label: string }> = {
  security:    { farbe: "#ef4444", label: "Security" },
  development: { farbe: "#6366f1", label: "Development" },
  tooling:     { farbe: "#22d3ee", label: "Tooling" },
};

function ProjektKarte({ projekt }: { projekt: ProjektModel }) {
  const [offen, setOffen] = useState(false);
  const stil = kategorieStile[projekt.kategorie] || kategorieStile.development;

  return (
    <motion.div layout className="glass-stark overflow-hidden">
      <button onClick={() => setOffen(!offen)} className="w-full text-left p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: `${stil.farbe}15`, color: stil.farbe }}>{stil.label}</span>
              <span className="text-xs text-white/30 font-mono">{projekt.zeitraum}</span>
              {projekt.status === "aktiv" && <span className="w-1.5 h-1.5 rounded-full bg-signal-gruen animate-pulse" />}
            </div>
            <h3 className="font-display text-lg font-bold text-white">{projekt.titel}</h3>
          </div>
          <span className="text-white/20 text-lg flex-shrink-0">{offen ? "−" : "+"}</span>
        </div>
        <p className="text-sm text-white/50">{projekt.kurzbeschreibung}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {projekt.technologien.map(tech => (
            <span key={tech} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40 font-mono">{tech}</span>
          ))}
        </div>
      </button>

      <AnimatePresence>
        {offen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-white/5 pt-4">
              <p className="text-sm text-white/60 mb-4 leading-relaxed">{projekt.langbeschreibung}</p>
              <h4 className="font-mono text-xs text-akzent-400 mb-2">HIGHLIGHTS</h4>
              <ul className="space-y-1.5 mb-4">
                {projekt.highlights.map((highlight, index) => (
                  <li key={index} className="text-sm text-white/50 flex items-start gap-2">
                    <span className="text-cyber-400 mt-1 flex-shrink-0">›</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              {projekt.linkGithub && (
                <a href={projekt.linkGithub} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-akzent-400 hover:text-akzent-400/80 transition font-mono">
                  GitHub →
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ProjekteView() {
  return (
    <section id="projekte" className="py-24 px-6 max-w-5xl mx-auto">
      <motion.div initial="versteckt" whileInView="sichtbar" viewport={{ once: true, margin: "-80px" }} variants={einblend}>
        <p className="font-mono text-sm text-akzent-400 mb-2">&gt; projekte</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Projekte</h2>
        <p className="text-white/50 max-w-2xl mb-12">Von der Exploit-Engine bis zur iOS-App – jedes Projekt löst ein echtes Problem.</p>
      </motion.div>

      <div className="space-y-4">
        {PROJEKTE.map((projekt) => (
          <motion.div key={projekt.titel} initial="versteckt" whileInView="sichtbar" viewport={{ once: true }} variants={einblend}>
            <ProjektKarte projekt={projekt} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
