import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PIPELINE_SCHRITTE, SCORING_KATEGORIEN, ASSET_TIERS, SECURITY_STATS, TOOLS_STACK } from "../models/daten";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { InfoKarte } from "../bausteine/InfoKarte";
import { AbzeichenStatus } from "../bausteine/AbzeichenStatus";

// ═══════════════════════════════════════════════════════
// VIEW: Security Research — Tab-System
// Vier Tabs: Überblick · Pipeline · Scoring · Tools
// ═══════════════════════════════════════════════════════

type SecurityTab = "overview" | "pipeline" | "scoring" | "tools";

const TABS: { id: SecurityTab; label: string; beschreibung: string }[] = [
  { id: "overview",  label: "Überblick",  beschreibung: "Kennzahlen & Aktivität" },
  { id: "pipeline",  label: "Pipeline",   beschreibung: "7-Schritt Master-Pipeline" },
  { id: "scoring",   label: "Scoring",    beschreibung: "Algorithmus & Asset-Tiers" },
  { id: "tools",     label: "Tools",      beschreibung: "Custom & integrierte Tools" },
];

const WERKZEUG_FARBEN: Record<string, string> = {
  eigenbau:   "34, 197, 94",
  proxy:      "239, 68, 68",
  recon:      "34, 211, 238",
  scanner:    "245, 158, 11",
  osint:      "34, 197, 94",
  automation: "167, 139, 250",
};

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export default function SecurityView() {
  const [aktiverTab, setAktiverTab] = useState<SecurityTab>("overview");
  const [aktiverSchritt, setAktiverSchritt] = useState<number | null>(null);
  const [aktivesWerkzeug, setAktivesWerkzeug] = useState<string | null>(null);

  return (
    <section id="security" className="py-16 px-6 max-w-6xl mx-auto">
      <AbschnittsTitel
        prefix="> security_research"
        titel="Security Research & Tooling"
        untertitel="Eigene Infrastruktur, eigene Tools, eigene Pipeline — vom Recon bis zum fertigen Report."
        klassen="mb-10"
      />

      {/* Tab-Leiste — immer eine Zeile, auf kleinen Screens scrollbar */}
      <div className="flex gap-1.5 mb-8 p-1.5 rounded-2xl bg-white/[0.025] border border-white/[0.05] overflow-x-auto scrollbar-none">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setAktiverTab(tab.id); setAktiverSchritt(null); setAktivesWerkzeug(null); }}
            className={`relative flex-1 min-w-[80px] px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center justify-center ${
              aktiverTab === tab.id
                ? "text-white"
                : "text-white/45 hover:text-white/75"
            }`}
          >
            {aktiverTab === tab.id && (
              <motion.div
                layoutId="security-tab-bg"
                className="absolute inset-0 rounded-xl"
                style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.1))", border: "1px solid rgba(99,102,241,0.25)" }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab-Inhalt */}
      <AnimatePresence mode="wait">
        <motion.div
          key={aktiverTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: EASE }}
        >

          {/* ── Überblick ── */}
          {aktiverTab === "overview" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SECURITY_STATS.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.06, duration: 0.35 }}
                >
                  <InfoKarte lichtfarbe="99, 102, 241" klassen="p-5 text-center h-full">
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <div className="font-display text-2xl font-bold text-white mb-0.5">{stat.wert}</div>
                    <div className="text-xs text-white/40 leading-tight">{stat.label}</div>
                  </InfoKarte>
                </motion.div>
              ))}
            </div>
          )}

          {/* ── Pipeline ── */}
          {aktiverTab === "pipeline" && (
            <div>
              <p className="font-mono text-xs text-white/60 mb-5">
                run_master_pipeline.sh — Lockfile-geschützt · --resume-from · --skip-Flags · --dry-run
              </p>
              <div className="space-y-2">
                {PIPELINE_SCHRITTE.map((schritt, index) => (
                  <motion.div
                    key={schritt.nummer}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.32 }}
                  >
                    <InfoKarte
                      lichtfarbe="34, 211, 238"
                      mitHoverAnimation={false}
                      akzentRand={aktiverSchritt === schritt.nummer}
                      akzentFarbe="#22d3ee"
                      onClick={() => setAktiverSchritt(aktiverSchritt === schritt.nummer ? null : schritt.nummer)}
                      klassen="cursor-pointer"
                    >
                      <div className={`p-4 transition-colors ${aktiverSchritt === schritt.nummer ? "bg-cyber-400/4" : ""}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-cyber-400/10 border border-cyber-400/20 flex items-center justify-center font-mono text-sm text-cyber-400 font-bold flex-shrink-0">
                            {schritt.nummer}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-white text-sm">{schritt.name}</span>
                              <span className="font-mono text-xs text-white/20 hidden md:inline">{schritt.skript}</span>
                            </div>
                            <p className="text-xs text-white/40 mt-0.5">{schritt.beschreibung}</p>
                          </div>
                          <motion.span
                            animate={{ rotate: aktiverSchritt === schritt.nummer ? 45 : 0 }}
                            transition={{ duration: 0.18 }}
                            className="text-cyber-400 text-lg flex-shrink-0 font-light"
                          >
                            +
                          </motion.span>
                        </div>
                        <AnimatePresence>
                          {aktiverSchritt === schritt.nummer && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.22 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 pt-3 border-t border-cyber-400/10">
                                <p className="font-mono text-xs text-cyber-400/80">
                                  <span className="text-white/30 mr-2">Output:</span>
                                  {schritt.output}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </InfoKarte>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ── Scoring ── */}
          {aktiverTab === "scoring" && (
            <div className="space-y-10">
              {/* Scoring-Kategorien */}
              <div>
                <h3 className="font-display text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <span className="text-akzent-400 text-base">◈</span>
                  Scoring-Algorithmus
                </h3>
                <p className="text-white/40 text-xs mb-5 font-mono">
                  Single-Pass awk — 500.000 URLs in 15 Sek. · 12 Kategorien · gewichtete Scores
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {SCORING_KATEGORIEN.map((kategorie, index) => {
                    const breite = (kategorie.score / 10) * 100;
                    return (
                      <motion.div
                        key={kategorie.name}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04, duration: 0.3 }}
                      >
                        <InfoKarte lichtfarbe="99, 102, 241" mitHoverAnimation={false} klassen="p-3">
                          <div className="flex items-center gap-3">
                            <div className="font-mono text-sm text-akzent-400 font-bold w-5 text-center flex-shrink-0">
                              {kategorie.score}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-mono text-xs text-white/70 truncate">{kategorie.name}</span>
                              </div>
                              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ background: "linear-gradient(90deg, #6366f1, #06b6d4)" }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${breite}%` }}
                                  transition={{ delay: index * 0.04 + 0.15, duration: 0.55 }}
                                />
                              </div>
                              <p className="text-[10px] text-white/25 mt-1">{kategorie.grund}</p>
                            </div>
                          </div>
                        </InfoKarte>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Asset Tiers */}
              <div>
                <h3 className="font-display text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <span className="text-signal-rot text-base">◎</span>
                  Asset-Klassifizierung
                </h3>
                <p className="text-white/40 text-xs mb-5">Automatische Priorisierung nach Bounty-Potential</p>
                <div className="space-y-2">
                  {ASSET_TIERS.map((tier, index) => {
                    const tierLicht = tier.tier === "Tier 1" ? "239, 68, 68" : tier.tier === "Tier 2" ? "234, 179, 8" : "255, 255, 255";
                    const tierVariante = tier.tier === "Tier 1" ? "aktiv" : tier.tier === "Tier 2" ? "entwicklung" : "neutral";
                    return (
                      <motion.div
                        key={tier.tier}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08, duration: 0.3 }}
                      >
                        <InfoKarte lichtfarbe={tierLicht} mitHoverAnimation={false} klassen="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <AbzeichenStatus variante={tierVariante as "aktiv" | "entwicklung" | "neutral"} text={tier.tier} />
                            <span className="text-xs text-white/35 font-mono">{tier.prioritaet}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {tier.klassen.map((klasse) => (
                              <span key={klasse} className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/8 text-white/55">
                                {klasse}
                              </span>
                            ))}
                          </div>
                        </InfoKarte>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Tools ── */}
          {aktiverTab === "tools" && (
            <div className="space-y-8">
              {/* Eigenbau */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AbzeichenStatus variante="aktiv" text="EIGENBAU" mitPuls />
                  <span className="text-xs text-white/30">Selbst entwickelt & auf VPS deployed</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {TOOLS_STACK.filter(t => t.kategorie === "eigenbau").map((werkzeug, index) => (
                    <motion.div
                      key={werkzeug.name}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.04, duration: 0.28 }}
                    >
                      <InfoKarte
                        lichtfarbe="34, 211, 238"
                        akzentRand={aktivesWerkzeug === werkzeug.name}
                        akzentFarbe="#22d3ee"
                        mitHoverAnimation={false}
                        klassen="p-0"
                      >
                        <button
                          onClick={() => setAktivesWerkzeug(aktivesWerkzeug === werkzeug.name ? null : werkzeug.name)}
                          aria-expanded={aktivesWerkzeug === werkzeug.name}
                          className="w-full flex items-center gap-3 p-3 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-cyber-400/40 rounded-xl"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-cyber-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-mono text-sm text-white font-medium">{werkzeug.name}</span>
                            <p className="text-xs text-white/35">{werkzeug.rolle}</p>
                          </div>
                          <motion.span
                            animate={{ rotate: aktivesWerkzeug === werkzeug.name ? 45 : 0 }}
                            transition={{ duration: 0.18 }}
                            aria-hidden="true"
                            className="text-cyber-400 text-lg flex-shrink-0 font-light pr-1"
                          >
                            +
                          </motion.span>
                        </button>
                        <AnimatePresence>
                          {aktivesWerkzeug === werkzeug.name && werkzeug.beschreibung && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.22 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 pb-3 border-t border-cyber-400/10">
                                <p className="text-xs text-white/60 leading-relaxed pt-3">{werkzeug.beschreibung}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </InfoKarte>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Integriert */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AbzeichenStatus variante="neutral" text="INTEGRIERT" />
                  <span className="text-xs text-white/30">Professionelle Security-Toolchain</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {TOOLS_STACK.filter(t => t.kategorie !== "eigenbau").map((werkzeug, index) => (
                    <motion.div
                      key={werkzeug.name}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.04, duration: 0.28 }}
                    >
                      <InfoKarte
                        lichtfarbe="34, 211, 238"
                        akzentRand={aktivesWerkzeug === werkzeug.name}
                        akzentFarbe="#22d3ee"
                        mitHoverAnimation={false}
                        klassen="p-0"
                      >
                        <button
                          onClick={() => setAktivesWerkzeug(aktivesWerkzeug === werkzeug.name ? null : werkzeug.name)}
                          aria-expanded={aktivesWerkzeug === werkzeug.name}
                          className="w-full flex items-center gap-3 p-3 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-cyber-400/40 rounded-xl"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-cyber-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-mono text-sm text-white font-medium">{werkzeug.name}</span>
                            <p className="text-xs text-white/35">{werkzeug.rolle}</p>
                          </div>
                          <motion.span
                            animate={{ rotate: aktivesWerkzeug === werkzeug.name ? 45 : 0 }}
                            transition={{ duration: 0.18 }}
                            aria-hidden="true"
                            className="text-cyber-400 text-lg flex-shrink-0 font-light pr-1"
                          >
                            +
                          </motion.span>
                        </button>
                        <AnimatePresence>
                          {aktivesWerkzeug === werkzeug.name && werkzeug.beschreibung && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.22 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 pb-3 border-t border-cyber-400/10">
                                <p className="text-xs text-white/60 leading-relaxed pt-3">{werkzeug.beschreibung}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </InfoKarte>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </section>
  );
}
