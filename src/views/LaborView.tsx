// ═══════════════════════════════════════════════════════════════════
// VIEW: Labor — Werkstatt-Ansicht
//
// Single Source of Truth: liest alle Daten aus models/daten.ts.
// Konsistent zu SecurityView (Tab-System, GlassTabs, InfoKarte mit
// Aufklapp-Pattern, Tab-Layout für längere Labels).
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
import { AbzeichenStatus, TechTag } from "../bausteine/AbzeichenStatus";
import { AusklappKarte } from "../bausteine/AusklappKarte";
import { AufklappIndikator } from "../bausteine/AufklappIndikator";
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
        untertitel="Die Werkzeuge, Workflows und Regeln hinter meiner täglichen Security-Arbeit – vieles selbst gebaut, der Rest bewusst integriert. Entscheidend ist nicht die Zahl der Tools, sondern wie diszipliniert sie zusammenspielen."
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
          <span className="w-1.5 h-1.5 rounded-full bg-akzent-400 flex-shrink-0" aria-hidden="true" />
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
          Damit der KI-Assistent zwischen Sitzungen dazulernt statt jedes Mal von vorn zu beginnen, habe
          ich ihm ein gestaffeltes Gedächtnis gegeben – angelehnt an Forschung wie MemGPT und A-MEM.
          Drei Hooks erfassen Korrekturen und Verläufe automatisch; neue Beobachtungen werden erst nach
          manueller Prüfung dauerhaft übernommen, und eine tägliche Routine hält alles konsistent und
          sichert es in Git.
        </p>
        <p className="text-[11px] text-white/45 font-mono mt-2">
          Klicke eine Karte an, um zu sehen, welche Rolle diese Schicht im Gesamtsystem spielt.
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
              <AusklappKarte
                lichtfarbe={tier.farbeRgb}
                akzentFarbe={`rgb(${tier.farbeRgb})`}
                offen={offen}
                onUmschalten={() => setOffenerTier(offen ? null : tier.tier)}
                kopf={
                  <>
                    <div className="flex items-center flex-wrap gap-2 mb-2.5">
                      <span
                        className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-1 rounded-md flex-shrink-0"
                        style={{
                          color: `rgb(${tier.farbeRgb})`,
                          backgroundColor: `rgba(${tier.farbeRgb}, 0.08)`,
                          border: `1px solid rgba(${tier.farbeRgb}, 0.22)`,
                        }}
                      >
                        {tier.tier}
                      </span>
                      <span className="font-mono text-[12px] text-white/85 break-all min-w-0">{tier.ort}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {tier.anzahl && <TechTag name={tier.anzahl} />}
                      <TechTag name={`geladen · ${tier.loaded}`} />
                    </div>
                  </>
                }
                detail={
                  <div className="space-y-2.5">
                    {tier.bedeutung && (
                      <p className="text-[13px] text-white/70 leading-relaxed">{tier.bedeutung}</p>
                    )}
                    <p className="font-mono text-[11px] text-white/45 leading-relaxed">
                      <span className="text-white/30">Pflege ·</span> {tier.lifecycle}
                    </p>
                  </div>
                }
              />
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 pt-2">
        {[
          { titel: "Drei Lifecycle-Hooks",   bsp: "Fangen Korrekturen ein, schreiben Session-Zusammenfassungen und melden offene Einträge.", rgb: "129, 140, 248" },
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
              <span className="inline-block font-mono text-[9px] px-1.5 py-0.5 rounded-md border border-white/[0.05] bg-white/5 text-white/40 uppercase tracking-wider leading-none mb-2">
                Mechanik
              </span>
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
// ACT 2 — MCP-Arsenal (22 MCPs in 4 Kategorien)
// ═══════════════════════════════════════════════════════════════════

// Kurz-Labels für die MCP-Kategorie-Tabs auf Mobile (< md). Damit passen
// alle vier Tabs ohne Scroll/Abschneiden in die Screen-Breite; ab md wird
// das volle Label gezeigt. Nur Darstellung — die Auswahl-Logik nutzt
// weiterhin kat.kategorie als id.
const MCP_KURZ: Record<string, string> = {
  "Recon & Intel":      "Recon",
  "Reasoning & Memory": "Reasoning",
  "Web · App · Mobile": "Web/App",
  "Cloud · Dev · Docs": "Cloud",
};

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
          MCP-Server verbinden den KI-Assistenten mit allem anderen – APIs, Browser, Datenbanken,
          Dateisystemen. 22 sind eingebunden, zwei davon selbst gebaut (die Censys-API und die
          Caido-Bridge). Wichtiger als die Anzahl ist die Auswahl: Statt blind Befehle abzusetzen,
          übernimmt für jede Aufgabe das Werkzeug, das sie am saubersten löst.
        </p>
        <p className="text-[11px] text-white/35 font-mono mt-2">
          Wähle eine Kategorie. Die Tools darin sind nach Häufigkeit der Nutzung sortiert.
        </p>
      </header>

      {/*
        Kategorie-Auswahl als verschachtelte horizontale Tab-Leiste:
        dieselbe GlassTabs-Komponente + buttonClassName wie die
        Haupt-Tableiste (eigener layoutId), damit beide Ebenen exakt
        konsistent wirken. scrollable=false → die vier Tabs teilen sich
        die Breite gleichmäßig (flex-1, min-w-0) und sind als 4er-Segment
        immer vollständig sichtbar — kein horizontaler Overflow, kein
        Scrollen. Auf Mobile (< md) kurze Labels, ab md das volle Label.
      */}
      <GlassTabs
        tabs={MCP_KATEGORIEN.map((kat) => ({
          id: kat.kategorie,
          label: (
            <>
              <span className="md:hidden">{MCP_KURZ[kat.kategorie] ?? kat.kategorie}</span>
              <span className="hidden md:inline">{kat.kategorie}</span>
            </>
          ),
        }))}
        activeId={aktiveKategorie}
        onTabChange={(id) => setAktiveKategorie(id)}
        layoutId="labor-mcp-tab-bg"
        ariaLabel="MCP-Kategorien"
        scrollable={false}
        buttonClassName="min-w-0 px-1.5 sm:px-4 text-[11px] sm:text-sm"
        className="w-full"
      />

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
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="font-mono text-[10px] px-1.5 py-0.5 rounded-md border leading-none flex-shrink-0"
              style={{
                color: `rgb(${aktive.farbeRgb})`,
                backgroundColor: `rgba(${aktive.farbeRgb}, 0.1)`,
                borderColor: `rgba(${aktive.farbeRgb}, 0.25)`,
              }}
            >
              {aktive.mcps.length} Server
            </span>
            <p className="text-[12px] text-white/60 leading-relaxed min-w-0">{aktive.beschreibung}</p>
          </div>

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
                            className="font-mono text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider leading-none"
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
          Wiederkehrende Aufgaben laufen automatisch – zeitgesteuert als Timer oder dauerhaft als Dienst:
          nächtliche Backups, wöchentliche Token-Rotation, stündliches Hacktivity-Polling und die ständigen
          Bridges zwischen Mac, iPhone und Server. Jede Aktion wird protokolliert, ein Watcher meldet
          ungewöhnliche Muster sofort.
        </p>
      </header>

      {/* Timers — alle in Akzent-Indigo, Section-Header mit farbigem Dot */}
      <section>
        <h4 className="font-display text-sm font-bold text-white/80 mb-3 flex items-center gap-2 uppercase tracking-[0.16em]">
          <span className="w-1.5 h-1.5 rounded-full bg-akzent-400 flex-shrink-0" aria-hidden="true" />
          Zeitgesteuerte Abläufe
          <span className="ml-auto font-mono text-[10px] text-white/45 normal-case tracking-normal">{timers.length} aktiv</span>
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

      {/* Services — alle in Cyber-Cyan, Section-Header mit farbigem Dot */}
      <section>
        <h4 className="font-display text-sm font-bold text-white/80 mb-3 flex items-center gap-2 uppercase tracking-[0.16em]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-400 flex-shrink-0" aria-hidden="true" />
          Dauerhaft laufende Dienste
          <span className="ml-auto font-mono text-[10px] text-white/45 normal-case tracking-normal">{services.length} laufen</span>
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
      {/* Konsistenz: KEIN borderLeft mehr — alle Cards identisch.
          Kritische Workflows werden durch ein Glow am Dot markiert. */}
      <InfoKarte
        lichtfarbe={workflow.farbeRgb}
        mitHoverAnimation={false}
        klassen="p-0"
      >
        <button
          onClick={onToggle}
          aria-expanded={offen}
          className="group w-full text-left p-3 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset rounded-xl"
          style={{ ['--tw-ring-color' as string]: `rgba(${workflow.farbeRgb}, 0.4)` }}
        >
          {/*
            CSS-Grid statt Flex: [Name+Output | Cadence-Badge | Icon-Slot].
            Die Icon-Spalte hat konstante Breite (w-5) und sitzt ganz rechts.
            Dadurch liegt die rechte Kante der Cadence-Badge in JEDER Zeile auf
            derselben X-Position (die 1fr-Namensspalte fängt die variable
            Badge-Breite ab) — saubere, ruhige rechte Badge-Spalte ohne
            margin-Hacks und ohne fixe Badge-Breite.
          */}
          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3">
            {/* Spalte 1 — Dot + Name + Output (als Unterzeile) */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: `rgb(${workflow.farbeRgb})`,
                  boxShadow: workflow.kritisch ? `0 0 8px rgba(${workflow.farbeRgb}, 0.7)` : undefined,
                }}
                aria-label={workflow.kritisch ? "kritisch" : undefined}
              />
              <div className="min-w-0">
                <div className="font-mono text-[12px] text-white/85 truncate">{workflow.name}</div>
                <div className="text-[11px] text-white/50 truncate mt-0.5">→ {workflow.output}</div>
              </div>
            </div>
            {/* Spalte 2 — Cadence-Badge (Chip-Pattern, rechte Kante bündig) */}
            <span
              className="font-mono text-[10px] px-1.5 py-0.5 rounded-md tabular-nums whitespace-nowrap leading-none flex-shrink-0"
              style={{
                background: `rgba(${workflow.farbeRgb}, 0.1)`,
                color: `rgb(${workflow.farbeRgb})`,
                border: `1px solid rgba(${workflow.farbeRgb}, 0.25)`,
              }}
            >
              {workflow.cadence}
            </span>
            {/* Spalte 3 — Icon-Slot mit konstanter Breite (stabile rechte Kante) */}
            <div className="w-7 flex justify-center flex-shrink-0">
              {workflow.details && (
                <AufklappIndikator
                  offen={offen}
                  lichtfarbe={workflow.farbeRgb}
                  akzentFarbe={`rgb(${workflow.farbeRgb})`}
                  groesse="sm"
                />
              )}
            </div>
          </div>
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
          Was Claude Code von Haus aus nicht abdeckt, habe ich selbst ergänzt: 22 eigene Erweiterungen –
          11 kurze Slash-Commands wie
          <span className="font-mono text-akzent-400"> /submit-gate</span> und 11 mehrstufige Skills wie
          <span className="font-mono text-cyber-400"> /research</span>.
          Zwei davon sind Pflicht vor jedem neuen Ziel bzw. jedem Submit – als feste Regel, die nicht
          von der Tagesform abhängt.
        </p>
      </header>

      {/* Slash-Commands — Section-Header mit farbigem Dot statt Glyph */}
      <section>
        <h4 className="font-display text-sm font-bold text-white/80 mb-3 flex items-center gap-2 uppercase tracking-[0.16em]">
          <span className="w-1.5 h-1.5 rounded-full bg-akzent-400 flex-shrink-0" aria-hidden="true" />
          Slash-Commands
          <span className="ml-auto font-mono text-[10px] text-white/30 normal-case tracking-normal">11 Befehle</span>
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <AbzeichenStatus variante="aktiv" text="SUBMIT-PIPELINE" />
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

      {/* Custom Skills — Section-Header mit farbigem Dot statt Glyph */}
      <section>
        <h4 className="font-display text-sm font-bold text-white/80 mb-3 flex items-center gap-2 uppercase tracking-[0.16em]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-400 flex-shrink-0" aria-hidden="true" />
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
              <AbzeichenStatus variante="akzent" text="RESEARCH-LIFECYCLE" />
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
  // Konsistenz: gleiche Karten-Anatomie wie die MCP-Karten (Dot + Name +
  // Beschreibung). Alle Slash-Cards in Akzent-Indigo. Der Pflicht-Charakter
  // der Submit-Pipeline steht bereits im Sektions-Eyebrow — kein lautes
  // rotes Badge pro Zeile, das aus dem Farbschema fällt.
  const rgb = "99, 102, 241";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ delay, duration: 0.32, ease: EASE }}
    >
      <InfoKarte lichtfarbe={rgb} mitHoverAnimation={false} klassen="p-3">
        <div className="flex items-start gap-2.5">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
            style={{ backgroundColor: `rgb(${rgb})` }}
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <span className="font-mono text-[12px] font-semibold block mb-1" style={{ color: `rgb(${rgb})` }}>{cmd.cmd}</span>
            <p className="text-[11px] text-white/60 leading-snug">{cmd.purpose}</p>
          </div>
        </div>
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
        <div className="flex items-start gap-2.5">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
            style={{ backgroundColor: `rgb(${rgb})` }}
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap mb-1">
              <span className="font-mono text-[12px] font-semibold" style={{ color: `rgb(${rgb})` }}>{skill.name}</span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-md border text-white/55 leading-none bg-white/[0.05] border-white/[0.07]">
                {skill.trigger}
              </span>
            </div>
            <p className="text-[11px] text-white/60 leading-snug">{skill.purpose}</p>
          </div>
        </div>
      </InfoKarte>
    </motion.div>
  );
}

