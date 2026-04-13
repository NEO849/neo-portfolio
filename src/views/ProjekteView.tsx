import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROJEKTE } from "../models/daten";
import type { ProjektModel } from "../models/typen";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { AbzeichenStatus, TechTag } from "../bausteine/AbzeichenStatus";
import { InfoKarte } from "../bausteine/InfoKarte";
import { KnopfSekundaer } from "../bausteine/KnopfSekundaer";

const KATEGORIE_KONFIGURATION: Record<string, { lichtfarbe: string; akzentFarbe: string; variante: "aktiv" | "akzent" | "cyber" }> = {
  security:    { lichtfarbe: "239, 68, 68",   akzentFarbe: "#ef4444", variante: "aktiv" },
  development: { lichtfarbe: "99, 102, 241",  akzentFarbe: "#6366f1", variante: "akzent" },
  tooling:     { lichtfarbe: "34, 211, 238",  akzentFarbe: "#22d3ee", variante: "cyber" },
};

function ProjektKarte({ projekt }: { projekt: ProjektModel }) {
  const [offen, setOffen] = useState(false);
  const konfiguration = KATEGORIE_KONFIGURATION[projekt.kategorie] ?? KATEGORIE_KONFIGURATION.development;

  return (
    <InfoKarte
      lichtfarbe={konfiguration.lichtfarbe}
      akzentRand
      akzentFarbe={konfiguration.akzentFarbe}
      mitHoverAnimation={!offen}
    >
      <button onClick={() => setOffen(!offen)} className="w-full text-left p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <AbzeichenStatus
                variante={konfiguration.variante}
                text={projekt.kategorie}
                mitPuls={projekt.status === "aktiv"}
              />
              <span className="text-xs text-white/30 font-mono">{projekt.zeitraum}</span>
              {projekt.status === "aktiv" && (
                <AbzeichenStatus variante="aktiv" text="aktiv" mitPuls />
              )}
            </div>
            <h3 className="font-display text-lg font-bold text-white">{projekt.titel}</h3>
          </div>
          <motion.span
            animate={{ rotate: offen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-white/30 text-xl flex-shrink-0 leading-none"
          >
            +
          </motion.span>
        </div>
        <p className="text-sm text-white/50">{projekt.kurzbeschreibung}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {projekt.technologien.map(tech => (
            <TechTag key={tech} name={tech} />
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
              <p className="font-mono text-xs text-akzent-400 mb-2 tracking-wider">HIGHLIGHTS</p>
              <ul className="space-y-1.5 mb-5">
                {projekt.highlights.map((highlight, index) => (
                  <li key={index} className="text-sm text-white/50 flex items-start gap-2">
                    <span className="text-cyber-400 mt-0.5 flex-shrink-0">›</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              {projekt.linkGithub && (
                <KnopfSekundaer zuUrl={projekt.linkGithub} klassen="text-xs">
                  GitHub →
                </KnopfSekundaer>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </InfoKarte>
  );
}

export default function ProjekteView() {
  return (
    <section id="projekte" className="py-16 px-6 max-w-5xl mx-auto">
      <AbschnittsTitel
        prefix="> projekte"
        titel="Projekte"
        untertitel="Von der Exploit-Engine bis zur iOS-App – jedes Projekt löst ein echtes Problem."
        klassen="mb-12"
      />

      <div className="space-y-4">
        {PROJEKTE.map((projekt, index) => (
          <motion.div
            key={projekt.titel}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.45 }}
          >
            <ProjektKarte projekt={projekt} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
