import { motion } from "framer-motion";
import { PERSOENLICH } from "../models/daten";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { InfoKarte } from "../bausteine/InfoKarte";
import { KnopfPrimaer } from "../bausteine/KnopfPrimaer";
import { KnopfSekundaer } from "../bausteine/KnopfSekundaer";

const KONTAKT_EINTRAEGE = [
  {
    href: `mailto:${PERSOENLICH.email}`,
    extern: false,
    icon: "📧",
    label: "E-Mail",
    wert: PERSOENLICH.email,
    lichtfarbe: "99, 102, 241",
    akzentFarbe: "#6366f1",
  },
  {
    href: `tel:${PERSOENLICH.telefon?.replace(/\s/g, "")}`,
    extern: false,
    icon: "📱",
    label: "Telefon",
    wert: PERSOENLICH.telefon,
    lichtfarbe: "34, 197, 94",
    akzentFarbe: "#22c55e",
  },
  {
    href: PERSOENLICH.github,
    extern: true,
    icon: "⌥",
    label: "GitHub",
    wert: "NEO849",
    lichtfarbe: "255, 255, 255",
    akzentFarbe: "#ffffff",
  },
  {
    href: PERSOENLICH.hackerone,
    extern: true,
    icon: "◎",
    label: "HackerOne",
    wert: "luicypher_neo",
    lichtfarbe: "239, 68, 68",
    akzentFarbe: "#ef4444",
  },
  {
    href: PERSOENLICH.intigriti,
    extern: true,
    icon: "◈",
    label: "Intigriti",
    wert: "cypherneo",
    lichtfarbe: "34, 211, 238",
    akzentFarbe: "#22d3ee",
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
              className="block"
            >
              <InfoKarte
                lichtfarbe={eintrag.lichtfarbe}
                akzentRand
                akzentFarbe={eintrag.akzentFarbe}
                klassen="p-5"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 font-mono"
                    style={{ background: `rgba(${eintrag.lichtfarbe}, 0.08)`, border: `1px solid rgba(${eintrag.lichtfarbe}, 0.2)` }}
                  >
                    {eintrag.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{eintrag.label}</div>
                    <div className="text-sm text-white/40 font-mono">{eintrag.wert}</div>
                  </div>
                  <div className="ml-auto text-white/20 text-sm">→</div>
                </div>
              </InfoKarte>
            </a>
          </motion.div>
        ))}
      </motion.div>

      {/* Downloads */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 flex flex-wrap gap-3"
      >
        <KnopfPrimaer zuUrl="/Michael_Fleps_Lebenslauf.pdf">
          Lebenslauf (PDF)
        </KnopfPrimaer>
        <KnopfSekundaer zuUrl="/Michael_Fleps_Anschreiben.pdf">
          Anschreiben (PDF)
        </KnopfSekundaer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-xs text-white/20 font-mono">{PERSOENLICH.adresse} • {PERSOENLICH.standort}</p>
      </motion.div>
    </section>
  );
}
