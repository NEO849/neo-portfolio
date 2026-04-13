import { useState } from "react";
import { motion } from "framer-motion";
import { SKILLS } from "../models/daten";

const einblend = { versteckt: { opacity: 0, y: 24 }, sichtbar: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

type SkillFilter = "alle" | "security" | "development" | "infrastructure" | "tools";

const filterOptionen: { wert: SkillFilter; label: string }[] = [
  { wert: "alle",           label: "Alle" },
  { wert: "security",       label: "Security" },
  { wert: "development",    label: "Development" },
  { wert: "infrastructure", label: "Infra" },
  { wert: "tools",          label: "Tools" },
];

const levelLabel = ["", "Grundlagen", "Solide", "Fortgeschritten", "Stark", "Experte"];

export default function SkillsView() {
  const [filter, setFilter] = useState<SkillFilter>("alle");
  const gefiltert = filter === "alle" ? SKILLS : SKILLS.filter(skill => skill.kategorie === filter);

  return (
    <section id="skills" className="py-24 px-6 max-w-5xl mx-auto">
      <motion.div initial="versteckt" whileInView="sichtbar" viewport={{ once: true, margin: "-80px" }} variants={einblend}>
        <p className="font-mono text-sm text-akzent-400 mb-2">&gt; skills</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Fähigkeiten</h2>
        <p className="text-white/50 max-w-2xl mb-8">Nicht nur Buzzwords – reale Kompetenz mit messbarem Level.</p>
      </motion.div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filterOptionen.map(option => (
          <button key={option.wert} onClick={() => setFilter(option.wert)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === option.wert
                ? "bg-akzent-500/20 border border-akzent-400/40 text-akzent-400"
                : "glass text-white/50 hover:text-white/70"
            }`}>
            {option.label}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {gefiltert.map((skill) => (
          <motion.div key={skill.name} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white truncate">{skill.name}</span>
                <span className="text-xs text-white/30 font-mono flex-shrink-0 ml-2">{levelLabel[skill.level]}</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(stufe => (
                  <div key={stufe} className="h-1.5 flex-1 rounded-full overflow-hidden bg-white/5">
                    {stufe <= skill.level && (
                      <div className="h-full w-full rounded-full skill-balken" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
