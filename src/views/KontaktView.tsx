import { motion } from "framer-motion";
import { PERSOENLICH } from "../models/daten";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { InfoKarte } from "../bausteine/InfoKarte";

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
  {
    href: PERSOENLICH.hackerone,
    extern: true,
    icon: "◎",
    label: "HackerOne",
    wert: "luicypher_neo",
  },
  {
    href: PERSOENLICH.intigriti,
    extern: true,
    icon: "◈",
    label: "Intigriti",
    wert: "cypherneo",
  },
];

export default function KontaktView() {
  return (
    <section id="kontakt" className="py-16 px-6 max-w-3xl mx-auto">
      <AbschnittsTitel
        prefix="> kontakt"
        titel="Kontakt"
        untertitel="Interesse an Zusammenarbeit, Jobangeboten oder fachlichem Austausch? Ich freue mich auf deine Nachricht."
        klassen="mb-10"
      />

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

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-10 text-center"
      >
        <p className="text-xs text-white/20 font-mono">{PERSOENLICH.standort}</p>
      </motion.div>
    </section>
  );
}
