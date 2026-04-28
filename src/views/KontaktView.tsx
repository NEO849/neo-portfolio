import { useState } from "react";
import { motion } from "framer-motion";
import { PERSOENLICH } from "../models/daten";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { InfoKarte } from "../bausteine/InfoKarte";
import { LegalModal, type LegalTab } from "../bausteine/LegalModal";

const CYBER_RGB = "22, 211, 238";
const CYBER_HEX = "#22d3ee";

const KONTAKT_EINTRAEGE = [
  {
    href: `mailto:${PERSOENLICH.email}`,
    extern: false,
    icon: "📧",
    label: "E-Mail",
    wert: PERSOENLICH.email,
  },
  {
    href: `tel:${PERSOENLICH.telefon?.replace(/\s/g, "")}`,
    extern: false,
    icon: "📱",
    label: "Telefon",
    wert: PERSOENLICH.telefon,
  },
  {
    href: PERSOENLICH.github,
    extern: true,
    icon: "⌥",
    label: "GitHub",
    wert: "NEO849",
  },
];

export default function KontaktView() {
  const [modalOffen, setModalOffen] = useState(false);
  const [modalTab, setModalTab] = useState<LegalTab>("impressum");

  const legalOeffnen = (tab: LegalTab) => {
    setModalTab(tab);
    setModalOffen(true);
  };

  return (
    <section id="kontakt" className="py-16 px-6 max-w-3xl mx-auto">
      <LegalModal
        offen={modalOffen}
        startTab={modalTab}
        onSchliessen={() => setModalOffen(false)}
      />

      <AbschnittsTitel
        prefix="> kontakt"
        titel="Kontakt"
        untertitel="Interesse an Zusammenarbeit, Jobangeboten oder fachlichem Austausch? Ich freue mich auf deine Nachricht."
        klassen="mb-10"
      />

      {/* Kontaktkarten */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        {KONTAKT_EINTRAEGE.map((eintrag, index) => (
          <motion.div
            key={eintrag.label}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.07, duration: 0.4 }}
          >
            <a
              href={eintrag.href}
              target={eintrag.extern ? "_blank" : undefined}
              rel={eintrag.extern ? "noopener noreferrer" : undefined}
              className="block group"
            >
              <InfoKarte
                lichtfarbe={CYBER_RGB}
                akzentRand
                akzentFarbe={CYBER_HEX}
                klassen="p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{
                      background: `rgba(${CYBER_RGB}, 0.08)`,
                      border: `1px solid rgba(${CYBER_RGB}, 0.22)`,
                    }}
                  >
                    {eintrag.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-white text-sm leading-snug">{eintrag.label}</div>
                    <div className="text-xs text-white/40 font-mono truncate">{eintrag.wert}</div>
                  </div>
                  <div className="ml-auto pl-2 text-cyber-400/55 group-hover:text-cyber-400 transition-colors duration-200 text-sm flex-shrink-0">
                    →
                  </div>
                </div>
              </InfoKarte>
            </a>
          </motion.div>
        ))}
      </motion.div>

      {/* Legal-Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.28 }}
        className="mt-4"
      >
        <div className="rounded-xl border border-cyber-400/[0.1] bg-cyber-400/[0.02] px-4 py-3 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-cyber-400/[0.08] border border-cyber-400/20 flex items-center justify-center flex-shrink-0 font-mono text-xs text-cyber-400/75">
            §
          </div>
          <span className="text-[11px] font-mono text-cyber-400/65 flex-1 select-none">Rechtliches</span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => legalOeffnen("impressum")}
              className="text-[11px] font-mono text-white/45 hover:text-cyber-400/80 px-2.5 py-1.5 rounded-lg hover:bg-cyber-400/[0.07] transition-all duration-200"
            >
              Impressum
            </button>
            <span className="text-white/25 text-[10px] select-none">·</span>
            <button
              onClick={() => legalOeffnen("datenschutz")}
              className="text-[11px] font-mono text-white/45 hover:text-cyber-400/80 px-2.5 py-1.5 rounded-lg hover:bg-cyber-400/[0.07] transition-all duration-200"
            >
              Datenschutz
            </button>
          </div>
        </div>
      </motion.div>

      {/* Standort */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.38 }}
        className="mt-8 text-center"
      >
        <p className="text-xs text-cyber-400/50 font-mono">{PERSOENLICH.standort}</p>
      </motion.div>
    </section>
  );
}
