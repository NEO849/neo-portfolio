import { useState } from "react";
import { motion } from "framer-motion";
import { PIPELINE_SCHRITTE, SCORING_KATEGORIEN, ASSET_TIERS, SECURITY_STATS, TOOLS_STACK } from "../models/daten";

const einblend = {
  versteckt: { opacity: 0, y: 24 },
  sichtbar: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function SecurityView() {
  const [aktiverSchritt, setAktiverSchritt] = useState<number | null>(null);

  return (
    <section id="security" className="py-24 px-6 max-w-6xl mx-auto">
      <motion.div initial="versteckt" whileInView="sichtbar" viewport={{ once: true, margin: "-80px" }} variants={einblend}>
        <p className="font-mono text-sm text-cyber-400 mb-2">&gt; security_research</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Security Research & Tooling</h2>
        <p className="text-white/50 max-w-2xl mb-12">Eigene Infrastruktur, eigene Tools, eigene Pipeline. Vom Recon bis zum Review-Plan – alles selbst gebaut.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div initial="versteckt" whileInView="sichtbar" viewport={{ once: true }} variants={einblend}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16">
        {SECURITY_STATS.map((stat) => (
          <div key={stat.label} className="glass p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="font-display text-xl font-bold text-white">{stat.wert}</div>
            <div className="text-xs text-white/40">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Master Pipeline */}
      <motion.div initial="versteckt" whileInView="sichtbar" viewport={{ once: true }} variants={einblend} className="mb-16">
        <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-2">
          <span className="text-cyber-400">⚙️</span> Master-Pipeline
        </h3>
        <p className="text-white/40 text-sm mb-6 font-mono">run_master_pipeline.sh — 7 Schritte, Lockfile-geschützt, --resume-from Support</p>

        <div className="space-y-2">
          {PIPELINE_SCHRITTE.map((schritt) => (
            <button
              key={schritt.nummer}
              onClick={() => setAktiverSchritt(aktiverSchritt === schritt.nummer ? null : schritt.nummer)}
              className="w-full text-left"
            >
              <div className={`glass p-4 transition-all ${aktiverSchritt === schritt.nummer ? "border-cyber-400/40 bg-white/[0.06]" : "hover:bg-white/[0.06]"}`}>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-cyber-400/10 border border-cyber-400/20 flex items-center justify-center font-mono text-sm text-cyber-400 font-bold flex-shrink-0">
                    {schritt.nummer}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{schritt.name}</span>
                      <span className="font-mono text-xs text-white/30 hidden md:inline">{schritt.skript}</span>
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">{schritt.beschreibung}</p>
                  </div>
                  <span className="text-white/20 text-sm">{aktiverSchritt === schritt.nummer ? "−" : "+"}</span>
                </div>
                {aktiverSchritt === schritt.nummer && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="font-mono text-xs text-akzent-400">Output: {schritt.output}</p>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Scoring Engine */}
      <motion.div initial="versteckt" whileInView="sichtbar" viewport={{ once: true }} variants={einblend} className="mb-16">
        <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-2">
          <span className="text-akzent-400">📊</span> Scoring-Algorithmus
        </h3>
        <p className="text-white/40 text-sm mb-6">Single-Pass awk-Engine: 500.000 URLs in unter 15 Sekunden. 12 Kategorien mit gewichteten Scores.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {SCORING_KATEGORIEN.map((kategorie) => {
            const maxScore = 10;
            const breite = (kategorie.score / maxScore) * 100;
            return (
              <div key={kategorie.name} className="glass p-3 flex items-center gap-3">
                <div className="font-mono text-sm text-akzent-400 font-bold w-6 text-center flex-shrink-0">{kategorie.score}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs text-white/70 truncate">{kategorie.name}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${breite}%`, background: `linear-gradient(90deg, #6366f1, #06b6d4)` }} />
                  </div>
                  <p className="text-[10px] text-white/30 mt-1">{kategorie.grund}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Asset Tiers */}
      <motion.div initial="versteckt" whileInView="sichtbar" viewport={{ once: true }} variants={einblend} className="mb-16">
        <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-2">
          <span className="text-signal-rot">🎯</span> Asset-Klassifizierung
        </h3>
        <p className="text-white/40 text-sm mb-6">Automatische Priorisierung nach Bounty-Potential</p>
        <div className="space-y-3">
          {ASSET_TIERS.map((tier) => (
            <div key={tier.tier} className="glass p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                  tier.tier === "Tier 1" ? "bg-signal-rot/20 text-signal-rot" :
                  tier.tier === "Tier 2" ? "bg-signal-gelb/20 text-signal-gelb" :
                  "bg-white/10 text-white/50"
                }`}>{tier.tier}</span>
                <span className="text-xs text-white/40">{tier.prioritaet}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tier.klassen.map((klasse) => (
                  <span key={klasse} className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/60">{klasse}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tools Stack */}
      <motion.div initial="versteckt" whileInView="sichtbar" viewport={{ once: true }} variants={einblend}>
        <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-2">
          <span className="text-akzent-400">🛠️</span> Tool Stack
        </h3>
        <p className="text-white/40 text-sm mb-6">13 Custom Tools + professionelle Security-Toolchain auf gehärtetem VPS</p>

        {/* Eigenbau-Tools hervorgehoben */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-signal-gruen/15 text-signal-gruen font-bold">EIGENBAU</span>
            <span className="text-xs text-white/30">Selbst aufgesetzt & konfiguriert auf VPS</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {TOOLS_STACK.filter(t => t.kategorie === "eigenbau").map((werkzeug) => (
              <div key={werkzeug.name} className="glass p-3 flex items-center gap-3 border-signal-gruen/10">
                <div className="w-2 h-2 rounded-full bg-signal-gruen flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-sm text-white font-medium">{werkzeug.name}</span>
                  <p className="text-xs text-white/40">{werkzeug.rolle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integrierte Tools */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-white/50 font-bold">INTEGRIERT</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {TOOLS_STACK.filter(t => t.kategorie !== "eigenbau").map((werkzeug) => (
              <div key={werkzeug.name} className="glass p-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{
                  background: werkzeug.kategorie === "proxy" ? "#ef4444" :
                    werkzeug.kategorie === "recon" ? "#22d3ee" :
                    werkzeug.kategorie === "scanner" ? "#f59e0b" :
                    werkzeug.kategorie === "osint" ? "#22c55e" :
                    werkzeug.kategorie === "automation" ? "#a78bfa" : "#6366f1"
                }} />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm text-white">{werkzeug.name}</span>
                  <p className="text-xs text-white/40">{werkzeug.rolle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
