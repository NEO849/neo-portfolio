import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PIPELINE_SCHRITTE, SCORING_KATEGORIEN, ASSET_TIERS, SECURITY_STATS, TOOLS_STACK } from "../models/daten";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { InfoKarte } from "../bausteine/InfoKarte";
import { AbzeichenStatus } from "../bausteine/AbzeichenStatus";
import { GlassTabs } from "../bausteine/GlassTabs";

// ═══════════════════════════════════════════════════════
// VIEW: Security Research — Tab-System
// Vier Tabs: Überblick · Pipeline · Scoring · Tools
// ═══════════════════════════════════════════════════════

type SecurityTab = "overview" | "pipeline" | "scoring" | "tools";

const WORKFLOW_PHASEN = [
  {
    nr: "01",
    name: "Target Scope",
    beschreibung: "Programme, erlaubte Assets und Testgrenzen sauber definieren.",
    outputs: ["Scope", "Plattform", "Ziele"],
    rgb: "129,140,248",
  },
  {
    nr: "02",
    name: "Recon",
    beschreibung: "Subdomains, URLs, Parameter und Einstiegspunkte systematisch erfassen.",
    outputs: ["Live Hosts", "URLs", "Parameter"],
    rgb: "34,211,238",
  },
  {
    nr: "03",
    name: "Signal Scoring",
    beschreibung: "Rohdaten nach Risiko, Relevanz und Prüfqualität priorisieren.",
    outputs: ["High-Value URLs", "Kandidaten"],
    rgb: "245,158,11",
  },
  {
    nr: "04",
    name: "Manual Review",
    beschreibung: "Verdächtige Endpunkte gezielt testen und Verhalten reproduzieren.",
    outputs: ["Requests", "Replays", "Evidence"],
    rgb: "239,68,68",
  },
  {
    nr: "05",
    name: "Validation",
    beschreibung: "Schwachstellen kontrolliert und reproduzierbar bestätigen.",
    outputs: ["PoC", "Impact", "CVSS"],
    rgb: "34,197,94",
  },
  {
    nr: "06",
    name: "Report",
    beschreibung: "Bestätigte Findings klar und mit sauberer Beweiskette dokumentieren.",
    outputs: ["Summary", "Steps", "Impact"],
    rgb: "129,140,248",
  },
];

const TABS: { id: SecurityTab; label: string; beschreibung: string }[] = [
  { id: "overview",  label: "Überblick",  beschreibung: "Kennzahlen & Aktivität" },
  { id: "pipeline",  label: "Pipeline",   beschreibung: "7-Schritt Master-Pipeline" },
  { id: "scoring",   label: "Scoring",    beschreibung: "Algorithmus & Asset-Tiers" },
  { id: "tools",     label: "Tools",      beschreibung: "Custom & integrierte Tools" },
];

const WERKZEUG_FARBEN: Record<string, string> = {
  eigenbau:       "34, 197, 94",
  proxy:          "239, 68, 68",
  recon:          "34, 211, 238",
  scanner:        "245, 158, 11",
  osint:          "34, 197, 94",
  automation:     "167, 139, 250",
  infrastructure: "56, 189, 248",
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
        untertitel="Vom ersten DNS-Query bis zum validierten Report — sechs Phasen, 13 Custom-Tools, eigene VPS-Infrastruktur. Jede Phase liefert konkrete Zwischenergebnisse: von priorisierten Angriffsflächen über reproduzierbare PoC-Skripte bis zur manuellen Bestätigung der Schwachstelle."
        klassen="mb-6"
      />

      {/* Workflow Flow — Visual Pipeline */}
      <div className="mb-8 -mx-1 overflow-x-auto scrollbar-none pb-2">
        <div className="flex items-stretch gap-1.5 min-w-max px-1">
          {WORKFLOW_PHASEN.map((p, i) => (
            <motion.div
              key={p.nr}
              className="flex items-stretch gap-1.5"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
            >
              <div
                className="w-[158px] rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5 flex flex-col gap-2 h-full"
                style={{ boxShadow: `0 2px 18px rgba(${p.rgb},0.07)` }}
              >
                {/* Nummer + Titel */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-mono text-[10px] font-bold tabular-nums" style={{ color: `rgb(${p.rgb})` }}>
                      {p.nr}
                    </span>
                    <span className="text-[11px] font-bold text-white tracking-wide leading-none">{p.name.toUpperCase()}</span>
                  </div>
                  <p className="text-[9px] text-white/70 leading-snug">{p.beschreibung}</p>
                </div>
                {/* Output-Tags */}
                <div className="flex flex-wrap gap-1 mt-auto pt-1.5 border-t border-white/[0.05]">
                  {p.outputs.map((o) => (
                    <span
                      key={o}
                      className="font-mono text-[9px] px-1.5 py-0.5 rounded-md border text-white/72 leading-none"
                      style={{
                        backgroundColor: `rgba(${p.rgb}, 0.09)`,
                        borderColor: `rgba(${p.rgb}, 0.25)`,
                      }}
                    >
                      {o}
                    </span>
                  ))}
                </div>
              </div>
              {i < WORKFLOW_PHASEN.length - 1 && (
                <motion.span
                  className="text-white/15 text-base font-light flex-shrink-0 select-none self-center"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 + 0.25, duration: 0.25 }}
                >
                  ›
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <GlassTabs
        tabs={TABS}
        activeId={aktiverTab}
        onTabChange={(id) => {
          setAktiverTab(id as SecurityTab);
          setAktiverSchritt(null);
          setAktivesWerkzeug(null);
        }}
        layoutId="security-tab-bg"
        ariaLabel="Security Research Navigation"
        buttonClassName="min-w-[80px] px-4 text-[11px] sm:text-sm"
        className="mb-8"
      />

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
            <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 lg:items-start">

              {/* ── Links: Tool-Navigation (stabile Liste ohne Layout-Shifts) ── */}
              <div className="lg:w-72 xl:w-80 flex-shrink-0 space-y-5">

                {/* Eigenbau */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AbzeichenStatus variante="aktiv" text="EIGENBAU" mitPuls />
                    <span className="text-xs text-white/30">Selbst entwickelt &amp; deployed</span>
                  </div>
                  <div className="space-y-1">
                    {TOOLS_STACK.filter(t => t.kategorie === "eigenbau").map((werkzeug, index) => {
                      const istAktiv = aktivesWerkzeug === werkzeug.name;
                      return (
                        <motion.button
                          key={werkzeug.name}
                          onClick={() => setAktivesWerkzeug(istAktiv ? null : werkzeug.name)}
                          aria-expanded={istAktiv}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.04, duration: 0.28 }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyber-400/40 ${
                            istAktiv
                              ? "border-cyber-400/30 bg-cyber-400/[0.06]"
                              : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-150 ${istAktiv ? "bg-cyber-400" : "bg-white/20"}`} />
                          <div className="flex-1 min-w-0">
                            <span className="font-mono text-sm text-white/90 font-medium block truncate">{werkzeug.name}</span>
                            <p className="text-[10px] text-white/35 truncate mt-0.5">{werkzeug.rolle}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Integriert */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AbzeichenStatus variante="akzent" text="INTEGRIERT" />
                    <span className="text-xs text-white/50">Professionelle Toolchain</span>
                  </div>
                  <div className="space-y-1">
                    {TOOLS_STACK.filter(t => t.kategorie !== "eigenbau").map((werkzeug, index) => {
                      const istAktiv = aktivesWerkzeug === werkzeug.name;
                      return (
                        <motion.button
                          key={werkzeug.name}
                          onClick={() => setAktivesWerkzeug(istAktiv ? null : werkzeug.name)}
                          aria-expanded={istAktiv}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.04, duration: 0.28 }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyber-400/40 ${
                            istAktiv
                              ? "border-cyber-400/30 bg-cyber-400/[0.06]"
                              : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-150 ${istAktiv ? "bg-cyber-400" : "bg-white/20"}`} />
                          <div className="flex-1 min-w-0">
                            <span className="font-mono text-sm text-white/90 font-medium block truncate">{werkzeug.name}</span>
                            <p className="text-[10px] text-white/35 truncate mt-0.5">{werkzeug.rolle}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── Rechts: stabiles Detail-Panel ── */}
              <div className="flex-1 min-w-0 lg:sticky lg:top-24">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] min-h-[260px] overflow-hidden">
                  <AnimatePresence mode="wait">
                    {(() => {
                      const tool = TOOLS_STACK.find(t => t.name === aktivesWerkzeug);
                      if (!tool) {
                        return (
                          <motion.div
                            key="__leer__"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="flex items-center justify-center min-h-[260px]"
                          >
                            <span className="font-mono text-[11px] text-white/18">← Tool auswählen</span>
                          </motion.div>
                        );
                      }
                      const rgb = WERKZEUG_FARBEN[tool.kategorie] ?? "34, 211, 238";
                      return (
                        <motion.div
                          key={tool.name}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.22, ease: EASE }}
                          className="p-5 md:p-6"
                        >
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="min-w-0">
                              <h4 className="font-mono text-base font-bold text-white leading-snug mb-1">{tool.name}</h4>
                              <p className="text-xs text-white/45">{tool.rolle}</p>
                            </div>
                            <span
                              className="font-mono text-[9px] px-2 py-1 rounded-lg border uppercase tracking-widest flex-shrink-0 leading-none mt-0.5"
                              style={{
                                color: `rgba(${rgb}, 0.85)`,
                                borderColor: `rgba(${rgb}, 0.25)`,
                                backgroundColor: `rgba(${rgb}, 0.08)`,
                              }}
                            >
                              {tool.kategorie}
                            </span>
                          </div>
                          <div
                            className="h-px mb-4"
                            style={{ background: `linear-gradient(to right, rgba(${rgb}, 0.3), transparent)` }}
                          />
                          <p className="text-sm text-white/65 leading-relaxed">{tool.beschreibung}</p>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>
                </div>
              </div>

            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </section>
  );
}
