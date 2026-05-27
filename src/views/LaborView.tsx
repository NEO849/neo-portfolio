// ═══════════════════════════════════════════════════════════════════
// VIEW: Labor — Werkstatt-Ansicht
//
// Single Source of Truth: liest alle Daten aus models/daten.ts.
// Konsistent zu SecurityView (Tab-System, GlassTabs, InfoKarte mit
// Aufklapp-Pattern) und ZeugnisseView (Tab-Layout für längere Labels).
//
// Tabs werden gleichmäßig über die Breite verteilt (scrollable=false),
// damit auf jedem Viewport jedes Label sichtbar bleibt.
// ═══════════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MEMORY_TIERS,
  MCP_KATEGORIEN,
  AUTO_WORKFLOWS,
  SLASH_COMMANDS,
  CUSTOM_SKILLS,
  ELITE_PRINZIPIEN,
  SYSTEM_STATS,
} from "../models/daten";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { InfoKarte } from "../bausteine/InfoKarte";
import { AbzeichenStatus } from "../bausteine/AbzeichenStatus";
import { GlassTabs } from "../bausteine/GlassTabs";

type LaborTab = "memory" | "mcps" | "workflows" | "commands";

const TABS: { id: LaborTab; label: string }[] = [
  { id: "memory",    label: "Memory" },
  { id: "mcps",      label: "MCPs" },
  { id: "workflows", label: "Workflows" },
  { id: "commands",  label: "Commands" },
];

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export default function LaborView() {
  const [aktiverTab, setAktiverTab] = useState<LaborTab>("memory");

  return (
    <section id="labor" className="py-16 px-6 max-w-6xl mx-auto">
      <AbschnittsTitel
        prefix="> labor"
        untertitel="Die Werkzeuge, Workflows und Sicherheitsregeln hinter meinem täglichen Security-Arbeitsablauf — vieles selbst gebaut, der Rest sorgfältig integriert. Diese Seite erklärt, wie die einzelnen Bausteine ineinandergreifen. Sie ist gleichzeitig Dokumentation für mich selbst und ein Beleg dafür, dass solide Security-Arbeit weniger über einzelne Tools entscheidet als über die Disziplin, mit der sie eingesetzt werden."
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

      {/* ── Leitprinzipien (6 Karten in 2 Reihen) ─────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4 }}
        className="mb-12"
      >
        <h3 className="font-display text-sm font-bold text-white/70 mb-3 flex items-center gap-2 uppercase tracking-[0.18em]">
          <span className="text-akzent-400">◆</span>
          Leitprinzipien
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
                <p className="text-[11.5px] text-white/60 leading-relaxed">{prinzip.beschreibung}</p>
              </InfoKarte>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Tab-Navigation (gleichmäßig über volle Breite verteilt) ─ */}
      <GlassTabs
        tabs={TABS}
        activeId={aktiverTab}
        onTabChange={(id) => setAktiverTab(id as LaborTab)}
        layoutId="labor-tab-bg"
        ariaLabel="Werkstatt-Bereiche"
        scrollable={false}
        buttonClassName="min-w-0 px-1.5 sm:px-4 text-[11px] sm:text-sm"
        className="mb-8 w-full"
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
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ACT 1 — Memory v2 (5-Tier-Architektur, Karten aufklappbar)
// ═══════════════════════════════════════════════════════════════════

function MemoryAct() {
  const [offenerTier, setOffenerTier] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <header>
        <h3 className="font-display text-lg font-bold text-white mb-1.5">
          Selbst-lernendes Memory-System
        </h3>
        <p className="text-sm text-white/60 leading-relaxed max-w-3xl">
          Damit Claude Code zwischen Sessions wirklich „dazulernt" und nicht jedes Mal bei null anfängt,
          habe ich ein gestaffeltes Gedächtnis aufgebaut. Inspiriert von MemGPT (NeurIPS 2023), Generative
          Agents (Park et al.) und A-MEM (NeurIPS 2025). Drei Hooks fangen automatisch User-Korrekturen
          und Session-Verläufe ein. Eine Inbox sammelt neue Beobachtungen — beförderte Memory entsteht
          nur, wenn ich Eintrag-für-Eintrag manuell entscheide. Eine tägliche Self-Healing-Routine prüft
          Konsistenz und committet alles in Git.
        </p>
        <p className="text-[11px] text-white/35 font-mono mt-2">
          Klicke eine Karte an, um zu sehen, welche Rolle der Tier im Gesamtsystem spielt.
        </p>
      </header>

      <div className="space-y-2">
        {MEMORY_TIERS.map((tier, i) => {
          const offen = offenerTier === tier.tier;
          return (
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
                klassen="p-0"
                stil={{ borderLeft: `2px solid rgb(${tier.farbeRgb})` }}
              >
                <button
                  onClick={() => setOffenerTier(offen ? null : tier.tier)}
                  aria-expanded={offen}
                  className="w-full text-left p-4 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset rounded-xl"
                  style={{ ['--tw-ring-color' as string]: `rgba(${tier.farbeRgb}, 0.4)` }}
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
                        <span className="font-mono text-[12px] text-white/85 break-all min-w-0">{tier.ort}</span>
                        {tier.anzahl && (
                          <span className="font-mono text-[10px] text-white/30 flex-shrink-0">{tier.anzahl}</span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                        <div className="flex gap-2 text-[11px]">
                          <span className="text-white/30 w-20 flex-shrink-0">geladen</span>
                          <span className="text-white/70">{tier.loaded}</span>
                        </div>
                        <div className="flex gap-2 text-[11px]">
                          <span className="text-white/30 w-20 flex-shrink-0">Lifecycle</span>
                          <span className="text-white/70">{tier.lifecycle}</span>
                        </div>
                      </div>
                    </div>
                    <motion.span
                      animate={{ rotate: offen ? 45 : 0 }}
                      transition={{ duration: 0.18 }}
                      className="text-lg flex-shrink-0 font-light leading-none mt-1"
                      style={{ color: `rgb(${tier.farbeRgb})`, opacity: offen ? 0.9 : 0.5 }}
                      aria-hidden="true"
                    >
                      +
                    </motion.span>
                  </div>
                </button>
                <AnimatePresence>
                  {offen && tier.bedeutung && (
                    <motion.div
                      key="detail"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="px-4 pb-4 border-t pt-3"
                        style={{ borderColor: `rgba(${tier.farbeRgb}, 0.12)` }}
                      >
                        <p className="text-[12px] text-white/70 leading-relaxed">
                          {tier.bedeutung}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </InfoKarte>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 pt-2">
        {[
          { titel: "Drei Lifecycle-Hooks",   bsp: "User-Korrekturen einfangen · Session-Digests schreiben · Inbox-Banner zeigen", rgb: "129, 140, 248" },
          { titel: "A-MEM Auto-Linker",      bsp: "Erkennt verwandte Memories und schlägt bidirektionale Verlinkung vor",        rgb: "167, 139, 250" },
          { titel: "Confidence-Decay",       bsp: "Submit-Outcome aktualisiert die Vertrauens-Werte zitierter Memories",          rgb: "34, 197, 94" },
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
              <div className="text-[10.5px] text-white/60 leading-relaxed">{meta.bsp}</div>
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
        <h3 className="font-display text-lg font-bold text-white mb-1.5">
          MCP-Server — was wann womit
        </h3>
        <p className="text-sm text-white/60 leading-relaxed max-w-3xl">
          MCP-Server sind die Brücke zwischen Claude und allem anderen — APIs, Browser, Datenbanken,
          Dateisystemen. Ich habe 25 davon eingebunden, zwei selbst gebaut (Censys-Platform-API und
          die Caido-Bridge). Wichtiger als die reine Anzahl ist die Entscheidungslogik:
          welches MCP passt für welche Aufgabe besser. Statt blind Bash-Befehle zu schreiben, prüfe
          ich erst, ob ein spezialisiertes MCP die Aufgabe sauberer löst.
        </p>
        <p className="text-[11px] text-white/35 font-mono mt-2">
          Wähle eine Kategorie. Die Tools darin sind nach Häufigkeit der Nutzung sortiert.
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
                aktiv ? "text-white" : "text-white/40 hover:text-white/80"
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
                style={{ background: `rgba(${kat.farbeRgb}, 0.12)`, color: `rgb(${kat.farbeRgb})` }}
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
                            selbst gebaut
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/60 mt-0.5 leading-snug">{mcp.rolle}</p>
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
// ACT 3 — Auto-Workflows (Timers + Services, aufklappbar)
// ═══════════════════════════════════════════════════════════════════

function WorkflowsAct() {
  const [offenerWorkflow, setOffenerWorkflow] = useState<string | null>(null);
  const timers   = AUTO_WORKFLOWS.filter(w => w.typ === "timer");
  const services = AUTO_WORKFLOWS.filter(w => w.typ === "service");

  return (
    <div className="space-y-8">
      <header>
        <h3 className="font-display text-lg font-bold text-white mb-1.5">
          Automatisierte Abläufe
        </h3>
        <p className="text-sm text-white/60 leading-relaxed max-w-3xl">
          Sachen, die ich nicht jeden Tag manuell anstoßen will, laufen als systemd-Timer (zeitgesteuert)
          oder -Service (dauerhaft). Backups jede Nacht, Token-Rotation jede Woche, Hacktivity-Polling
          jede Stunde — und dauerhaft die Mailbox-Bridges zwischen Mac, iPhone und Server. Jede Aktion
          wird auditiert, der Anomaly-Watcher schlägt bei verdächtigen Mustern Alarm.
        </p>
        <p className="text-[11px] text-white/35 font-mono mt-2">
          Klicke einen Ablauf an, um zu sehen, was er konkret tut.
        </p>
      </header>

      {/* Timers */}
      <section>
        <h4 className="font-display text-sm font-bold text-white/80 mb-3 flex items-center gap-2 uppercase tracking-[0.16em]">
          <span className="text-akzent-400">⟳</span>
          Zeitgesteuerte Abläufe
          <span className="ml-auto font-mono text-[10px] text-white/30 normal-case tracking-normal">{timers.length} aktiv</span>
        </h4>
        <div className="space-y-1.5">
          {timers.map((wf, i) => (
            <WorkflowRow
              key={wf.name}
              workflow={wf}
              delay={i * 0.05}
              offen={offenerWorkflow === wf.name}
              onToggle={() => setOffenerWorkflow(offenerWorkflow === wf.name ? null : wf.name)}
            />
          ))}
        </div>
      </section>

      {/* Services */}
      <section>
        <h4 className="font-display text-sm font-bold text-white/80 mb-3 flex items-center gap-2 uppercase tracking-[0.16em]">
          <span className="text-cyber-400">●</span>
          Dauerhaft laufende Dienste
          <span className="ml-auto font-mono text-[10px] text-white/30 normal-case tracking-normal">{services.length} laufen</span>
        </h4>
        <div className="space-y-1.5">
          {services.map((wf, i) => (
            <WorkflowRow
              key={wf.name}
              workflow={wf}
              delay={i * 0.04}
              offen={offenerWorkflow === wf.name}
              onToggle={() => setOffenerWorkflow(offenerWorkflow === wf.name ? null : wf.name)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

interface WorkflowRowProps {
  workflow: typeof AUTO_WORKFLOWS[number];
  delay: number;
  offen: boolean;
  onToggle: () => void;
}

function WorkflowRow({ workflow, delay, offen, onToggle }: WorkflowRowProps) {
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
        klassen="p-0"
        stil={{
          borderLeft: workflow.kritisch
            ? `2px solid rgb(${workflow.farbeRgb})`
            : `1px solid rgba(${workflow.farbeRgb}, 0.18)`,
        }}
      >
        <button
          onClick={onToggle}
          aria-expanded={offen}
          className="w-full text-left p-3 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset rounded-xl"
          style={{ ['--tw-ring-color' as string]: `rgba(${workflow.farbeRgb}, 0.4)` }}
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
            <span className="text-[11px] text-white/40 hidden md:inline truncate max-w-[260px]">
              → {workflow.output}
            </span>
            {workflow.details && (
              <motion.span
                animate={{ rotate: offen ? 45 : 0 }}
                transition={{ duration: 0.18 }}
                className="text-base flex-shrink-0 font-light leading-none ml-1"
                style={{ color: `rgb(${workflow.farbeRgb})`, opacity: offen ? 0.9 : 0.4 }}
                aria-hidden="true"
              >
                +
              </motion.span>
            )}
          </div>
          <p className="text-[10.5px] text-white/40 mt-1 md:hidden">→ {workflow.output}</p>
        </button>
        <AnimatePresence>
          {offen && workflow.details && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div
                className="px-3 pb-3 border-t pt-2.5"
                style={{ borderColor: `rgba(${workflow.farbeRgb}, 0.12)` }}
              >
                <p className="text-[12px] text-white/70 leading-relaxed">
                  {workflow.details}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </InfoKarte>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ACT 4 — Slash-Commands + Custom Skills (11 + 11)
// ═══════════════════════════════════════════════════════════════════

function CommandsAct() {
  const submitCmds   = SLASH_COMMANDS.filter(c => c.gruppe === "submit-pipeline");
  const memoryCmds   = SLASH_COMMANDS.filter(c => c.gruppe === "memory-pflege");
  const masterSkills = CUSTOM_SKILLS.filter(s => s.gruppe === "master-skill");
  const bbSkills     = CUSTOM_SKILLS.filter(s => s.gruppe === "bb-lifecycle");

  return (
    <div className="space-y-8">
      <header>
        <h3 className="font-display text-lg font-bold text-white mb-1.5">
          Eigene Erweiterungen für Claude Code
        </h3>
        <p className="text-sm text-white/60 leading-relaxed max-w-3xl">
          Aus der Box kann Claude Code viel — aber nicht alles, was ich für meinen Bug-Bounty-Workflow
          brauche. Deshalb 22 selbst geschriebene Erweiterungen: 11 Slash-Commands (kurze Befehle wie
          <span className="font-mono text-akzent-400"> /submit-gate</span>) und 11 Skills (komplette
          mehrstufige Workflows wie <span className="font-mono text-cyber-400">/research</span>).
          Zwei davon sind harte Regeln und müssen vor jedem neuen Target bzw. jedem Submit gelaufen
          sein — ohne sie verlasse ich mich auf Disziplin allein, und Disziplin lässt sich austricksen.
        </p>
      </header>

      {/* Slash-Commands */}
      <section>
        <h4 className="font-display text-sm font-bold text-white/80 mb-3 flex items-center gap-2 uppercase tracking-[0.16em]">
          <span className="text-akzent-400">/</span>
          Slash-Commands
          <span className="ml-auto font-mono text-[10px] text-white/30 normal-case tracking-normal">11 Befehle</span>
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <AbzeichenStatus variante="aktiv" text="SUBMIT-PIPELINE" mitPuls />
              <span className="text-[10px] text-white/35 font-mono">Pflicht vor jedem Submit</span>
            </div>
            <div className="space-y-1.5">
              {submitCmds.map((cmd, i) => (
                <CommandRow key={cmd.cmd} cmd={cmd} delay={i * 0.06} />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <AbzeichenStatus variante="akzent" text="MEMORY-PFLEGE" />
              <span className="text-[10px] text-white/35 font-mono">Selbst-lernendes System</span>
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
          Skills
          <span className="ml-auto font-mono text-[10px] text-white/30 normal-case tracking-normal">11 Skills</span>
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <AbzeichenStatus variante="cyber" text="MASTER-SKILLS" />
              <span className="text-[10px] text-white/35 font-mono">orchestrieren mehrere Subagenten</span>
            </div>
            <div className="space-y-1.5">
              {masterSkills.map((skill, i) => (
                <SkillRow key={skill.name} skill={skill} delay={i * 0.06} />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <AbzeichenStatus variante="akzent" text="BUG-BOUNTY-LIFECYCLE" />
              <span className="text-[10px] text-white/35 font-mono">Phase 1 bis 10</span>
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
        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
          <span className="font-mono text-[12px] font-semibold" style={{ color: `rgb(${rgb})` }}>{cmd.cmd}</span>
          {cmd.hardRule && (
            <span
              className="font-mono text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider"
              style={{ background: `rgba(${rgb}, 0.10)`, color: `rgb(${rgb})`, border: `1px solid rgba(${rgb}, 0.30)` }}
            >
              harte Regel
            </span>
          )}
        </div>
        <p className="text-[11px] text-white/60 leading-snug">{cmd.purpose}</p>
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
        <p className="text-[11px] text-white/60 leading-snug">{skill.purpose}</p>
      </InfoKarte>
    </motion.div>
  );
}

