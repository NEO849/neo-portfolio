import { useState } from "react";
import { motion } from "framer-motion";
import { PIPELINE_SCHRITTE, SCORING_KATEGORIEN, ASSET_TIERS, SECURITY_STATS, TOOLS_STACK } from "../models/daten";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { InfoKarte } from "../bausteine/InfoKarte";
import { AbzeichenStatus } from "../bausteine/AbzeichenStatus";

const WERKZEUG_FARBEN: Record<string, string> = {
  eigenbau:   "34, 197, 94",
  proxy:      "239, 68, 68",
  recon:      "34, 211, 238",
  scanner:    "245, 158, 11",
  osint:      "34, 197, 94",
  automation: "167, 139, 250",
};

export default function SecurityView() {
  const [aktiverSchritt, setAktiverSchritt] = useState<number | null>(null);

  return (
    <section id="security" className="py-24 px-6 max-w-6xl mx-auto">
      <AbschnittsTitel
        prefix="> security_research"
        titel="Security Research & Tooling"
        untertitel="Eigene Infrastruktur, eigene Tools, eigene Pipeline. Vom Recon bis zum Review-Plan – alles selbst gebaut."
        klassen="mb-12"
      />

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16"
      >
        {SECURITY_STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06, duration: 0.4 }}
          >
            <InfoKarte lichtfarbe="99, 102, 241" klassen="p-4 text-center h-full">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="font-display text-xl font-bold text-white">{stat.wert}</div>
              <div className="text-xs text-white/40">{stat.label}</div>
            </InfoKarte>
          </motion.div>
        ))}
      </motion.div>

      {/* Master Pipeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <h3 className="font-display text-xl font-bold mb-1 flex items-center gap-2">
          <span className="text-cyber-400">⚙</span> Master-Pipeline
        </h3>
        <p className="text-white/40 text-sm mb-6 font-mono">
          run_master_pipeline.sh — 7 Schritte, Lockfile-geschützt, --resume-from Support
        </p>

        <div className="space-y-2">
          {PIPELINE_SCHRITTE.map((schritt) => (
            <InfoKarte
              key={schritt.nummer}
              lichtfarbe="34, 211, 238"
              mitHoverAnimation={false}
              akzentRand={aktiverSchritt === schritt.nummer}
              akzentFarbe="#22d3ee"
              onClick={() => setAktiverSchritt(aktiverSchritt === schritt.nummer ? null : schritt.nummer)}
              klassen="cursor-pointer"
            >
              <div className={`p-4 transition-colors ${aktiverSchritt === schritt.nummer ? "bg-cyber-400/5" : ""}`}>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-cyber-400/10 border border-cyber-400/20 flex items-center justify-center font-mono text-sm text-cyber-400 font-bold flex-shrink-0">
                    {schritt.nummer}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{schritt.name}</span>
                      <span className="font-mono text-xs text-white/25 hidden md:inline">{schritt.skript}</span>
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">{schritt.beschreibung}</p>
                  </div>
                  <motion.span
                    animate={{ rotate: aktiverSchritt === schritt.nummer ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-white/20 text-lg flex-shrink-0"
                  >
                    +
                  </motion.span>
                </div>
                {aktiverSchritt === schritt.nummer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 pt-3 border-t border-white/5 overflow-hidden"
                  >
                    <p className="font-mono text-xs text-akzent-400">Output: {schritt.output}</p>
                  </motion.div>
                )}
              </div>
            </InfoKarte>
          ))}
        </div>
      </motion.div>

      {/* Scoring Engine */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <h3 className="font-display text-xl font-bold mb-1 flex items-center gap-2">
          <span className="text-akzent-400">◈</span> Scoring-Algorithmus
        </h3>
        <p className="text-white/40 text-sm mb-6">
          Single-Pass awk-Engine: 500.000 URLs in unter 15 Sekunden. 12 Kategorien mit gewichteten Scores.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {SCORING_KATEGORIEN.map((kategorie, index) => {
            const breite = (kategorie.score / 10) * 100;
            return (
              <motion.div
                key={kategorie.name}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04, duration: 0.35 }}
              >
                <InfoKarte lichtfarbe="99, 102, 241" mitHoverAnimation={false} klassen="p-3">
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-sm text-akzent-400 font-bold w-6 text-center flex-shrink-0">
                      {kategorie.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-white/70 truncate">{kategorie.name}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: "linear-gradient(90deg, #6366f1, #06b6d4)" }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${breite}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.04 + 0.2, duration: 0.6 }}
                        />
                      </div>
                      <p className="text-[10px] text-white/30 mt-1">{kategorie.grund}</p>
                    </div>
                  </div>
                </InfoKarte>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Asset Tiers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <h3 className="font-display text-xl font-bold mb-1 flex items-center gap-2">
          <span className="text-signal-rot">◎</span> Asset-Klassifizierung
        </h3>
        <p className="text-white/40 text-sm mb-6">Automatische Priorisierung nach Bounty-Potential</p>

        <div className="space-y-3">
          {ASSET_TIERS.map((tier) => {
            const tierVariante = tier.tier === "Tier 1" ? "aktiv" : tier.tier === "Tier 2" ? "entwicklung" : "neutral";
            const tierLicht = tier.tier === "Tier 1" ? "239, 68, 68" : tier.tier === "Tier 2" ? "234, 179, 8" : "255, 255, 255";
            return (
              <InfoKarte key={tier.tier} lichtfarbe={tierLicht} mitHoverAnimation={false} klassen="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <AbzeichenStatus variante={tierVariante as "aktiv" | "entwicklung" | "neutral"} text={tier.tier} />
                  <span className="text-xs text-white/40">{tier.prioritaet}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tier.klassen.map((klasse) => (
                    <span key={klasse} className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/60">{klasse}</span>
                  ))}
                </div>
              </InfoKarte>
            );
          })}
        </div>
      </motion.div>

      {/* Tools Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="font-display text-xl font-bold mb-1 flex items-center gap-2">
          <span className="text-akzent-400">◧</span> Tool Stack
        </h3>
        <p className="text-white/40 text-sm mb-6">13 Custom Tools + professionelle Security-Toolchain auf gehärtetem VPS</p>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AbzeichenStatus variante="aktiv" text="EIGENBAU" mitPuls />
            <span className="text-xs text-white/30">Selbst aufgesetzt & konfiguriert auf VPS</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {TOOLS_STACK.filter(t => t.kategorie === "eigenbau").map((werkzeug) => (
              <InfoKarte key={werkzeug.name} lichtfarbe="34, 197, 94" akzentRand akzentFarbe="#22c55e" mitHoverAnimation={false} klassen="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-signal-gruen flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-sm text-white font-medium">{werkzeug.name}</span>
                    <p className="text-xs text-white/40">{werkzeug.rolle}</p>
                  </div>
                </div>
              </InfoKarte>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <AbzeichenStatus variante="neutral" text="INTEGRIERT" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {TOOLS_STACK.filter(t => t.kategorie !== "eigenbau").map((werkzeug) => {
              const lichtfarbe = WERKZEUG_FARBEN[werkzeug.kategorie] ?? "99, 102, 241";
              return (
                <InfoKarte key={werkzeug.name} lichtfarbe={lichtfarbe} mitHoverAnimation={false} klassen="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: `rgb(${lichtfarbe})` }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm text-white">{werkzeug.name}</span>
                      <p className="text-xs text-white/40">{werkzeug.rolle}</p>
                    </div>
                  </div>
                </InfoKarte>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
