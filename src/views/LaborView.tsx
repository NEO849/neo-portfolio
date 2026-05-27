// ═══════════════════════════════════════════════════════════════════
// VIEW: Labor — Senior-Elite Architektur-Manifest
//
// Single Source of Truth liest aus models/daten.ts. Keine Daten-Duplikate
// zur SecurityView. Fünf Acts unter einem Tab-System, vorgelagerte
// Prinzipien-Galerie als ruhiger Einstieg.
// ═══════════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MEMORY_TIERS,
  MCP_KATEGORIEN,
  AUTO_WORKFLOWS,
  SLASH_COMMANDS,
  CUSTOM_SKILLS,
  HARD_GATES,
  DA_PATTERNS,
  ELITE_PRINZIPIEN,
  SYSTEM_STATS,
} from "../models/daten";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { InfoKarte } from "../bausteine/InfoKarte";
import { AbzeichenStatus } from "../bausteine/AbzeichenStatus";
import { GlassTabs } from "../bausteine/GlassTabs";

type LaborTab = "memory" | "mcps" | "workflows" | "commands" | "gates";

const TABS: { id: LaborTab; label: string }[] = [
  { id: "memory",    label: "Memory v2" },
  { id: "mcps",      label: "MCP-Arsenal" },
  { id: "workflows", label: "Workflows" },
  { id: "commands",  label: "Commands & Skills" },
  { id: "gates",     label: "Hard-Gates" },
];

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export default function LaborView() {
  const [aktiverTab, setAktiverTab] = useState<LaborTab>("memory");

  return (
    <section id="labor" className="py-16 px-6 max-w-6xl mx-auto">
      <AbschnittsTitel
        prefix="> labor_senior_elite"
        untertitel="Was hier zu sehen ist, ist nicht eine Liste von Tools — es ist ein zusammenhängendes System. Selbst-lernendes Memory, 25 MCPs mit Decision-Matrix, 12 systemd-Workflows, 11 Custom-Skills, 11 Slash-Commands und 12 Hard-Gates. Vor jedem Submit. Nach jedem Erfolg. Kontinuierlich."
        klassen="mb-8"
      />

      {/* ── System-Stats (kompakte Hero-Reihe) ────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45, ease: EASE }}
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-10"
      >
        {SYSTEM_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.35, ease: EASE }}
          >
            <InfoKarte lichtfarbe="99, 102, 241" klassen="px-2.5 py-3 text-center h-full" mitHoverAnimation={false}>
              <div className="text-base mb-0.5 select-none">{stat.icon}</div>
              <div className="font-display text-lg font-bold text-white leading-none tabular-nums">{stat.wert}</div>
              <div className="text-[10px] text-white/40 leading-tight mt-1">{stat.label}</div>
            </InfoKarte>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Elite-Prinzipien (6 Karten in 2 Reihen) ─────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4 }}
        className="mb-12"
      >
        <h3 className="font-display text-sm font-bold text-white/70 mb-3 flex items-center gap-2 uppercase tracking-[0.18em]">
          <span className="text-akzent-400">◆</span>
          Elite-Prinzipien
          <span className="ml-auto font-mono text-[10px] text-white/30 normal-case tracking-normal">was junior von senior trennt</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {ELITE_PRINZIPIEN.map((prinzip, i) => (
            <motion.div
              key={prinzip.titel}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.45, ease: EASE }}
            >
              <InfoKarte
                lichtfarbe={prinzip.rgb}
                klassen="p-4 h-full"
                stil={{ boxShadow: `0 1px 24px rgba(${prinzip.rgb},0.06)` }}
              >
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: `rgb(${prinzip.rgb})` }}
                  />
                  <span className="font-display text-[13px] font-bold text-white leading-tight">{prinzip.titel}</span>
                </div>
                <p className="text-[11.5px] text-white/55 leading-relaxed">{prinzip.beschreibung}</p>
              </InfoKarte>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Tab-Navigation ───────────────────────────────────────── */}
      <GlassTabs
        tabs={TABS}
        activeId={aktiverTab}
        onTabChange={(id) => setAktiverTab(id as LaborTab)}
        layoutId="labor-tab-bg"
        ariaLabel="Senior-Elite Architektur Navigation"
        buttonClassName="min-w-[90px] px-3 text-[11px] sm:text-sm"
        className="mb-8"
      />

      {/* ── Tab-Inhalt ────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={aktiverTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: EASE }}
        >

          {aktiverTab === "memory"    && <MemoryAct />}
          {aktiverTab === "mcps"      && <McpAct />}
          {aktiverTab === "workflows" && <WorkflowsAct />}
          {aktiverTab === "commands"  && <CommandsAct />}
          {aktiverTab === "gates"     && <GatesAct />}

        </motion.div>
      </AnimatePresence>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ACT 1 — Memory v2 (5-Tier-Architektur)
// ═══════════════════════════════════════════════════════════════════

function MemoryAct() {
  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs text-white/60 mb-2">
          5-tier · MemGPT-inspired · A-MEM linking · hook-driven · git-versioned
        </p>
        <p className="text-sm text-white/55 leading-relaxed max-w-3xl">
          Selbst-lernendes Memory-System. Drei Lifecycle-Hooks fangen User-Korrekturen ein,
          schreiben Session-Digests und zeigen Inbox-Banner. Confidence-Decay nach Submit-Resolution.
          A-MEM Auto-Linker erzeugt bidirektionale <span className="font-mono text-akzent-400">[[wiki-links]]</span> via gewichteter Jaccard-Similarity.
          Daily-Cron 04:00 macht read-only Health-Check + Auto-Commit.
        </p>
      </header>

      <div className="space-y-2">
        {MEMORY_TIERS.map((tier, i) => (
          <motion.div
            key={tier.tier}
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: EASE }}
          >
            <InfoKarte
              lichtfarbe={tier.farbeRgb}
              mitHoverAnimation={false}
              klassen="p-4"
              stil={{ borderLeft: `2px solid rgb(${tier.farbeRgb})` }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-1 rounded-md flex-shrink-0 mt-0.5"
                  style={{
                    color: `rgb(${tier.farbeRgb})`,
                    backgroundColor: `rgba(${tier.farbeRgb}, 0.08)`,
                    border: `1px solid rgba(${tier.farbeRgb}, 0.22)`,
                  }}
                >
                  {tier.tier}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1.5">
                    <span className="font-mono text-[12px] text-white/85">{tier.ort}</span>
                    {tier.anzahl && (
                      <span className="font-mono text-[10px] text-white/30">{tier.anzahl}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                    <div className="flex gap-2 text-[11px]">
                      <span className="text-white/30 w-16 flex-shrink-0">Loaded</span>
                      <span className="text-white/65">{tier.loaded}</span>
                    </div>
                    <div className="flex gap-2 text-[11px]">
                      <span className="text-white/30 w-16 flex-shrink-0">Lifecycle</span>
                      <span className="text-white/65">{tier.lifecycle}</span>
                    </div>
                  </div>
                </div>
              </div>
            </InfoKarte>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 pt-2">
        {[
          { titel: "3 Lifecycle-Hooks",   bsp: "surprise_catcher · session_reflect · session_start_banner", rgb: "129, 140, 248" },
          { titel: "A-MEM Auto-Linker",   bsp: "Jaccard-Similarity → bidirektionale [[wiki-links]]",         rgb: "167, 139, 250" },
          { titel: "Confidence-Decay",    bsp: "/memory-outcome propagiert Submit-Resolution zurück",         rgb: "34, 197, 94" },
        ].map((meta, i) => (
          <motion.div
            key={meta.titel}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 + 0.2, duration: 0.4, ease: EASE }}
          >
            <InfoKarte lichtfarbe={meta.rgb} klassen="p-3">
              <div className="font-mono text-[10px] text-white/30 mb-1 uppercase tracking-wider">Mechanik</div>
              <div className="text-[12px] text-white font-medium mb-1">{meta.titel}</div>
              <div className="text-[10.5px] text-white/45 font-mono leading-relaxed">{meta.bsp}</div>
            </InfoKarte>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ACT 2 — MCP-Arsenal (25 MCPs in 5 Kategorien)
// ═══════════════════════════════════════════════════════════════════

function McpAct() {
  const [aktiveKategorie, setAktiveKategorie] = useState<string>(MCP_KATEGORIEN[0].kategorie);
  const aktive = MCP_KATEGORIEN.find(k => k.kategorie === aktiveKategorie) ?? MCP_KATEGORIEN[0];

  return (
    <div className="space-y-5">
      <header>
        <p className="font-mono text-xs text-white/60 mb-2">
          25 connected MCP-Server · 2 Eigenbau · decision-matrix vor jedem Bash-Aufruf
        </p>
        <p className="text-sm text-white/55 leading-relaxed max-w-3xl">
          Vor jeder Aufgabe: erst Decision-Matrix prüfen welches MCP fitst — nicht planlos Bash.
          IP-Recon → <span className="font-mono text-cyber-400">censys</span>. CVE-Lookup → <span className="font-mono text-cyber-400">shodan</span> (FREE).
          Pattern-Recall → <span className="font-mono text-cyber-400">exa</span> (neural).
          Cross-Target → <span className="font-mono text-cyber-400">memory-graph</span>. Multi-Step-Hypothesen → <span className="font-mono text-cyber-400">sequential-thinking</span>.
        </p>
      </header>

      {/* Kategorie-Pills */}
      <div className="flex flex-wrap gap-1.5">
        {MCP_KATEGORIEN.map((kat) => {
          const aktiv = kat.kategorie === aktiveKategorie;
          return (
            <button
              key={kat.kategorie}
              onClick={() => setAktiveKategorie(kat.kategorie)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                aktiv
                  ? "text-white"
                  : "text-white/45 hover:text-white/80"
              }`}
              style={{
                background: aktiv ? `rgba(${kat.farbeRgb}, 0.14)` : "rgba(255,255,255,0.025)",
                border: `1px solid ${aktiv ? `rgba(${kat.farbeRgb}, 0.35)` : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <span className="text-sm" aria-hidden="true">{kat.icon}</span>
              <span>{kat.kategorie}</span>
              <span
                className="font-mono text-[10px] px-1.5 py-0.5 rounded-md tabular-nums"
                style={{
                  background: `rgba(${kat.farbeRgb}, 0.12)`,
                  color: `rgb(${kat.farbeRgb})`,
                }}
              >
                {kat.mcps.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Aktive Kategorie-Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={aktive.kategorie}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="space-y-3"
        >
          <p className="text-[12px] text-white/50 italic">{aktive.beschreibung}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {aktive.mcps.map((mcp, i) => (
              <motion.div
                key={mcp.name}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, duration: 0.28, ease: EASE }}
              >
                <InfoKarte lichtfarbe={aktive.farbeRgb} klassen="p-3" mitHoverAnimation={false}>
                  <div className="flex items-start gap-2.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                      style={{ backgroundColor: `rgb(${aktive.farbeRgb})` }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-mono text-[12px] text-white font-medium">{mcp.name}</span>
                        {mcp.eigenbau && (
                          <span
                            className="font-mono text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                            style={{
                              background: "rgba(34,197,94,0.10)",
                              color: "rgb(34,197,94)",
                              border: "1px solid rgba(34,197,94,0.25)",
                            }}
                          >
                            Eigenbau
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/45 mt-0.5 leading-snug">{mcp.rolle}</p>
                    </div>
                  </div>
                </InfoKarte>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ACT 3 — Auto-Workflows (systemd Timers + Services)
// ═══════════════════════════════════════════════════════════════════

function WorkflowsAct() {
  const timers   = AUTO_WORKFLOWS.filter(w => w.typ === "timer");
  const services = AUTO_WORKFLOWS.filter(w => w.typ === "service");

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs text-white/60 mb-2">
          systemd · self-healing · audit-logged · token-rotation · anomaly-watcher
        </p>
        <p className="text-sm text-white/55 leading-relaxed max-w-3xl">
          12 Auto-Workflows. Backups · Hacktivity-Stream-Polling · Token-Rotation · Caido-Pipeline-Watcher · Voice-Bridge · Anomaly-Detection.
          Jede Aktion audit-getaggt. Bei Bedarf in &lt;1s wiederherstellbar via Git oder 3-Tier-Backup.
        </p>
      </header>

      {/* Timers */}
      <section>
        <h4 className="font-display text-sm font-bold text-white/80 mb-3 flex items-center gap-2 uppercase tracking-[0.16em]">
          <span className="text-akzent-400">⟳</span>
          Periodic Timers
          <span className="ml-auto font-mono text-[10px] text-white/30 normal-case tracking-normal">{timers.length} aktiv</span>
        </h4>
        <div className="space-y-1.5">
          {timers.map((wf, i) => (
            <WorkflowRow key={wf.name} workflow={wf} delay={i * 0.05} />
          ))}
        </div>
      </section>

      {/* Services */}
      <section>
        <h4 className="font-display text-sm font-bold text-white/80 mb-3 flex items-center gap-2 uppercase tracking-[0.16em]">
          <span className="text-cyber-400">●</span>
          Continuous Services
          <span className="ml-auto font-mono text-[10px] text-white/30 normal-case tracking-normal">{services.length} laufen</span>
        </h4>
        <div className="space-y-1.5">
          {services.map((wf, i) => (
            <WorkflowRow key={wf.name} workflow={wf} delay={i * 0.04} />
          ))}
        </div>
      </section>
    </div>
  );
}

function WorkflowRow({ workflow, delay }: { workflow: typeof AUTO_WORKFLOWS[number]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ delay, duration: 0.35, ease: EASE }}
    >
      <InfoKarte
        lichtfarbe={workflow.farbeRgb}
        mitHoverAnimation={false}
        klassen="p-3"
        stil={{
          borderLeft: workflow.kritisch
            ? `2px solid rgb(${workflow.farbeRgb})`
            : `1px solid rgba(${workflow.farbeRgb}, 0.18)`,
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor: `rgb(${workflow.farbeRgb})`,
              boxShadow: workflow.kritisch ? `0 0 8px rgba(${workflow.farbeRgb}, 0.6)` : undefined,
            }}
          />
          <span className="font-mono text-[12px] text-white/85 flex-1 truncate">{workflow.name}</span>
          <span
            className="font-mono text-[10px] px-2 py-0.5 rounded-full tabular-nums whitespace-nowrap flex-shrink-0"
            style={{
              background: `rgba(${workflow.farbeRgb}, 0.10)`,
              color: `rgb(${workflow.farbeRgb})`,
              border: `1px solid rgba(${workflow.farbeRgb}, 0.20)`,
            }}
          >
            {workflow.cadence}
          </span>
          <span className="text-[11px] text-white/45 hidden md:inline truncate max-w-[280px]">
            → {workflow.output}
          </span>
        </div>
        <p className="text-[10.5px] text-white/40 mt-1 md:hidden">→ {workflow.output}</p>
      </InfoKarte>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ACT 4 — Commands & Skills (11 + 11)
// ═══════════════════════════════════════════════════════════════════

function CommandsAct() {
  const submitCmds   = SLASH_COMMANDS.filter(c => c.gruppe === "submit-pipeline");
  const memoryCmds   = SLASH_COMMANDS.filter(c => c.gruppe === "memory-pflege");
  const masterSkills = CUSTOM_SKILLS.filter(s => s.gruppe === "master-skill");
  const bbSkills     = CUSTOM_SKILLS.filter(s => s.gruppe === "bb-lifecycle");

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs text-white/60 mb-2">
          22 selbst geschriebene Erweiterungen · 11 Slash-Commands · 11 Skills
        </p>
        <p className="text-sm text-white/55 leading-relaxed max-w-3xl">
          Was Claude Code aus-der-Box nicht kann, wird hier ergänzt. Submit-Gate erzwingt 12 Hard-Gates vor jedem Submit.
          Memory-System lernt via Hooks. Master-Skills orchestrieren Multi-Subagent-Wellen. Bug-Bounty-Lifecycle ist
          End-zu-End automatisiert von Programm-Analyse bis Submit.
        </p>
      </header>

      {/* Slash-Commands */}
      <section>
        <h4 className="font-display text-sm font-bold text-white/80 mb-3 flex items-center gap-2 uppercase tracking-[0.16em]">
          <span className="text-akzent-400">/</span>
          Slash-Commands
          <span className="ml-auto font-mono text-[10px] text-white/30 normal-case tracking-normal">11 Commands</span>
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Submit-Pipeline (Hard-Rules) */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <AbzeichenStatus variante="aktiv" text="SUBMIT-PIPELINE" mitPuls />
              <span className="text-[10px] text-white/35 font-mono">Pflicht bei jedem Submit</span>
            </div>
            <div className="space-y-1.5">
              {submitCmds.map((cmd, i) => (
                <CommandRow key={cmd.cmd} cmd={cmd} delay={i * 0.06} />
              ))}
            </div>
          </div>

          {/* Memory-Pflege */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <AbzeichenStatus variante="akzent" text="MEMORY-PFLEGE" />
              <span className="text-[10px] text-white/35 font-mono">Self-Improving System</span>
            </div>
            <div className="space-y-1.5">
              {memoryCmds.map((cmd, i) => (
                <CommandRow key={cmd.cmd} cmd={cmd} delay={i * 0.04} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Custom Skills */}
      <section>
        <h4 className="font-display text-sm font-bold text-white/80 mb-3 flex items-center gap-2 uppercase tracking-[0.16em]">
          <span className="text-cyber-400">✦</span>
          Custom Skills
          <span className="ml-auto font-mono text-[10px] text-white/30 normal-case tracking-normal">11 Skills</span>
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Master Skills */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <AbzeichenStatus variante="cyber" text="MASTER-SKILLS" />
              <span className="text-[10px] text-white/35 font-mono">Multi-Subagent Orchestrierung</span>
            </div>
            <div className="space-y-1.5">
              {masterSkills.map((skill, i) => (
                <SkillRow key={skill.name} skill={skill} delay={i * 0.06} />
              ))}
            </div>
          </div>

          {/* BB-Lifecycle */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <AbzeichenStatus variante="akzent" text="BB-LIFECYCLE" />
              <span className="text-[10px] text-white/35 font-mono">Phase 1 → Phase 10</span>
            </div>
            <div className="space-y-1.5">
              {bbSkills.map((skill, i) => (
                <SkillRow key={skill.name} skill={skill} delay={i * 0.04} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CommandRow({ cmd, delay }: { cmd: typeof SLASH_COMMANDS[number]; delay: number }) {
  const rgb = cmd.hardRule ? "239, 68, 68" : "99, 102, 241";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ delay, duration: 0.32, ease: EASE }}
    >
      <InfoKarte
        lichtfarbe={rgb}
        mitHoverAnimation={false}
        klassen="p-3"
        stil={cmd.hardRule ? { borderLeft: `2px solid rgb(${rgb})` } : undefined}
      >
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-mono text-[12px] font-semibold" style={{ color: `rgb(${rgb})` }}>{cmd.cmd}</span>
          {cmd.hardRule && (
            <span
              className="font-mono text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider"
              style={{ background: `rgba(${rgb}, 0.10)`, color: `rgb(${rgb})`, border: `1px solid rgba(${rgb}, 0.30)` }}
            >
              Hard-Rule
            </span>
          )}
        </div>
        <p className="text-[11px] text-white/55 leading-snug">{cmd.purpose}</p>
      </InfoKarte>
    </motion.div>
  );
}

function SkillRow({ skill, delay }: { skill: typeof CUSTOM_SKILLS[number]; delay: number }) {
  const rgb = skill.gruppe === "master-skill" ? "34, 211, 238" : "129, 140, 248";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ delay, duration: 0.32, ease: EASE }}
    >
      <InfoKarte lichtfarbe={rgb} mitHoverAnimation={false} klassen="p-3">
        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
          <span className="font-mono text-[12px] font-semibold" style={{ color: `rgb(${rgb})` }}>{skill.name}</span>
          <span className="font-mono text-[10px] text-white/35">{skill.trigger}</span>
        </div>
        <p className="text-[11px] text-white/55 leading-snug">{skill.purpose}</p>
      </InfoKarte>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ACT 5 — Hard-Gates + Devil's Advocate
// ═══════════════════════════════════════════════════════════════════

function GatesAct() {
  return (
    <div className="space-y-10">
      <header>
        <p className="font-mono text-xs text-white/60 mb-2">
          12 hard-gates · 5 DA-patterns · whitelist · blacklist · senior-elite discipline
        </p>
        <p className="text-sm text-white/55 leading-relaxed max-w-3xl">
          Discipline schlägt Volume. Kein Submit ohne alle 12 Gates ✅. Kein Submit ohne Devil's-Advocate-Pass.
          Whitelist (Tier S/A/B) und Blacklist sind aus 14+ realen Closure-Patterns destilliert — jede Lesson
          aus der echten Praxis dokumentiert in 161 Memory-Files.
        </p>
      </header>

      {/* 12 Hard-Gates */}
      <section>
        <h4 className="font-display text-sm font-bold text-white/80 mb-3 flex items-center gap-2 uppercase tracking-[0.16em]">
          <span className="text-signal-rot">🛡</span>
          12 Hard-Gates
          <span className="ml-auto font-mono text-[10px] text-white/30 normal-case tracking-normal">vor jedem Submit · ✅ alle oder ❌ Submit verweigert</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {HARD_GATES.map((gate, i) => (
            <motion.div
              key={gate.nummer}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ delay: i * 0.025, duration: 0.3, ease: EASE }}
            >
              <InfoKarte lichtfarbe="239, 68, 68" mitHoverAnimation={false} klassen="p-2.5">
                <div className="flex items-start gap-3">
                  <div className="font-mono text-[11px] text-signal-rot font-bold w-5 text-center flex-shrink-0 tabular-nums">
                    {String(gate.nummer).padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[12px] text-white/90 font-medium">{gate.titel}</div>
                    <p className="text-[10.5px] text-white/45 mt-0.5 leading-snug">{gate.check}</p>
                  </div>
                </div>
              </InfoKarte>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Devil's Advocate Patterns */}
      <section>
        <h4 className="font-display text-sm font-bold text-white/80 mb-3 flex items-center gap-2 uppercase tracking-[0.16em]">
          <span className="text-akzent-400">◈</span>
          Devil's Advocate Patterns
          <span className="ml-auto font-mono text-[10px] text-white/30 normal-case tracking-normal">5 Anti-Patterns · DA-Pass Pflicht</span>
        </h4>
        <div className="space-y-2">
          {DA_PATTERNS.map((pattern, i) => (
            <motion.div
              key={pattern.titel}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: EASE }}
            >
              <InfoKarte lichtfarbe="167, 139, 250" mitHoverAnimation={false} klassen="p-4">
                <div className="flex items-baseline gap-3 mb-2 flex-wrap">
                  <span
                    className="font-mono text-[10px] tabular-nums font-bold tracking-wider px-1.5 py-0.5 rounded-md"
                    style={{
                      color: "rgb(167, 139, 250)",
                      background: "rgba(167, 139, 250, 0.10)",
                      border: "1px solid rgba(167, 139, 250, 0.22)",
                    }}
                  >
                    DA-{String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-[13px] font-bold text-white">{pattern.titel}</span>
                </div>
                <div className="space-y-1.5 ml-1">
                  <div className="flex gap-2 text-[11.5px]">
                    <span className="text-signal-rot/80 w-14 flex-shrink-0 font-mono uppercase text-[10px] tracking-wider pt-0.5">Problem</span>
                    <span className="text-white/65 leading-relaxed">{pattern.problem}</span>
                  </div>
                  <div className="flex gap-2 text-[11.5px]">
                    <span className="text-signal-gruen/80 w-14 flex-shrink-0 font-mono uppercase text-[10px] tracking-wider pt-0.5">Lesson</span>
                    <span className="text-white/85 leading-relaxed">{pattern.lesson}</span>
                  </div>
                </div>
              </InfoKarte>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
