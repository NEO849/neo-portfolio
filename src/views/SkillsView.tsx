import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SKILLS } from "../models/daten";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { InfoKarte } from "../bausteine/InfoKarte";

type SkillFilter = "alle" | "security" | "development" | "infrastructure" | "tools";

const FILTER_OPTIONEN: { wert: SkillFilter; label: string }[] = [
  { wert: "alle",           label: "Alle" },
  { wert: "security",       label: "Security" },
  { wert: "development",    label: "Development" },
  { wert: "infrastructure", label: "Infra" },
  { wert: "tools",          label: "Tools" },
];

const KATEGORIE_FARBEN: Record<string, string> = {
  security:       "239, 68, 68",
  development:    "99, 102, 241",
  infrastructure: "34, 211, 238",
  tools:          "167, 139, 250",
};

const LEVEL_LABELS = ["", "Grundlagen", "Solide", "Fortgeschritten", "Stark", "Experte"];

export default function SkillsView() {
  const [filter, setFilter] = useState<SkillFilter>("alle");
  const gefiltert = filter === "alle" ? SKILLS : SKILLS.filter(skill => skill.kategorie === filter);

  return (
    <section id="skills" className="py-16 px-6 max-w-5xl mx-auto">
      <AbschnittsTitel
        prefix="> skills"
        titel="Fähigkeiten"
        untertitel="Nicht nur Buzzwords – reale Kompetenz mit messbarem Level."
        klassen="mb-8"
      />

      {/* Filter-Leiste */}
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTER_OPTIONEN.map(option => (
          <motion.button
            key={option.wert}
            onClick={() => setFilter(option.wert)}
            layout
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === option.wert
                ? "bg-akzent-500/20 border border-akzent-400/40 text-akzent-400"
                : "glass text-white/50 hover:text-white/70"
            }`}
          >
            {option.label}
          </motion.button>
        ))}
      </div>

      {/* Skills Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {gefiltert.map((skill, index) => {
            const lichtfarbe = KATEGORIE_FARBEN[skill.kategorie] ?? "99, 102, 241";
            return (
              <motion.div
                key={skill.name}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, delay: index * 0.025 }}
              >
                <InfoKarte lichtfarbe={lichtfarbe} mitHoverAnimation={false} klassen="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-white truncate">{skill.name}</span>
                        <span className="text-xs text-white/30 font-mono flex-shrink-0 ml-2">
                          {LEVEL_LABELS[skill.level]}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(stufe => (
                          <div key={stufe} className="h-1.5 flex-1 rounded-full overflow-hidden bg-white/5">
                            {stufe <= skill.level && (
                              <motion.div
                                className="h-full w-full rounded-full"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.4, delay: index * 0.02 + stufe * 0.05 }}
                                style={{ transformOrigin: "left", background: `linear-gradient(90deg, rgb(${lichtfarbe}), rgba(${lichtfarbe}, 0.5))` }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </InfoKarte>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
