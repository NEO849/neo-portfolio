// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: StatusKarte — Live-Systemstatus ALLER OSINT-Werkzeuge
// Gruppen als aufklappbare One-Liner (Klick → Tools), echter Live-Status
// pro Tool (aus /gesundheit), Indigo–Cyan–Teal-Farbwelt (sparsames Grün),
// Animationen: Scan-Linie, gestaffeltes Reveal, gezeichnete Teal-Häkchen.
// ═══════════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GesundheitErgebnis } from "../../dienste/osintApi";

// Designsystem
const CYAN = "#33D6FF";
const TEAL = "#19D3B4";

interface ToolDef { key: string; name: string; quelle: string }
interface Gruppe { titel: string; tools: ToolDef[] }

const GRUPPEN: Gruppe[] = [
  {
    titel: "Identität / Person",
    tools: [
      { key: "email-recon", name: "E-Mail-Vollanalyse", quelle: "HIBP · XposedOrNot · LeakCheck · Gravatar · GitHub · EmailRep · PGP" },
      { key: "soziale-praesenz", name: "Soziale Präsenz", quelle: "Bluesky · GitHub · Reddit · Mastodon · Keybase · WhatsMyName 600+" },
      { key: "telefon", name: "Telefon-Analyse", quelle: "libphonenumber · NumVerify · HLR · Reverse-Verzeichnisse" },
      { key: "bild", name: "Reverse Image", quelle: "EXIF/GPS · pHash · C2PA · KI-Erkennung · ELA · 14 Engines" },
    ],
  },
  {
    titel: "Infrastruktur",
    tools: [
      { key: "domain", name: "Domain & Shodan", quelle: "DNS · WHOIS · ASN · HTTP-Sec · Ports/CVEs · VirusTotal" },
      { key: "subdomains", name: "Subdomain-Recon", quelle: "crt.sh · Wayback · CommonCrawl" },
      { key: "ip-intel", name: "IP-Intel", quelle: "RIPEstat · IPinfo (Geo · VPN/Proxy/Tor)" },
      { key: "censys", name: "Censys Host-Intel", quelle: "Services · Standort · AS · WHOIS" },
    ],
  },
  {
    titel: "Aggregation / Meta",
    tools: [
      { key: "aggregator", name: "Such-Aggregator", quelle: "50+ kuratierte Such-Links (kein Auto-Call)" },
      { key: "orchestrator", name: "Orchestrator", quelle: "Auto-Typ-Erkennung · Multi-Modul · Beziehungs-Graph" },
    ],
  },
];

const FUNDAMENT_NAME: Record<string, string> = {
  cache: "TTL-Cache", transparenz: "DSGVO-Transparenz", pivots: "Pivot-Engine",
  geocoding: "Geocoding", hlr_lookup: "HLR-Lookup", netz_schutz: "SSRF-Guard",
};

function TealHaken({ verzoegerung }: { verzoegerung: number }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="flex-shrink-0" style={{ color: TEAL }}>
      <motion.path d="m7 12 3.2 3.2L17 8" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, delay: verzoegerung }} />
    </svg>
  );
}

function ToolZeile({ tool, ok, index }: { tool: ToolDef; ok: boolean; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.05 * index, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 ${
        ok ? "border-white/[0.06] bg-white/[0.015]" : "border-signal-rot/30 bg-signal-rot/[0.06]"
      }`}
    >
      {ok ? <span className="mt-0.5"><TealHaken verzoegerung={0.05 * index + 0.1} /></span>
          : <span className="mt-0.5 w-3.5 h-3.5 grid place-items-center text-signal-rot flex-shrink-0 text-[11px]">✕</span>}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-white/85 font-medium truncate">{tool.name}</span>
          <span className="ml-auto font-mono text-[9px] uppercase tracking-wider flex-shrink-0"
            style={{ color: ok ? TEAL : undefined }}>
            <span className={ok ? "" : "text-signal-rot"}>{ok ? "live" : "offline"}</span>
          </span>
        </div>
        <div className="text-[10.5px] text-white/40 leading-snug mt-0.5 truncate">{tool.quelle}</div>
      </div>
    </motion.div>
  );
}

function StatusGruppe({ titel, tools, live }: { titel: string; tools: ToolDef[]; live: Set<string> }) {
  const [offen, setOffen] = useState(false);
  const aktiv = tools.filter((t) => live.has(t.key)).length;
  const allOk = aktiv === tools.length;

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <button type="button" onClick={() => setOffen((o) => !o)} aria-expanded={offen}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-white/[0.02]">
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: allOk ? TEAL : "#f5b544" }} />
        <span className="font-display font-medium text-white/85 text-[13.5px]">{titel}</span>
        <span className="font-mono text-[10px]" style={{ color: CYAN }}>{aktiv}/{tools.length} live</span>
        <span className="ml-auto text-[11px] transition-transform duration-200"
          style={{ color: CYAN, transform: offen ? "rotate(180deg)" : "none" }}>▾</span>
      </button>
      <AnimatePresence initial={false}>
        {offen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden">
            <div className="px-3.5 pb-3 grid grid-cols-1 lg:grid-cols-2 gap-2">
              {tools.map((t, i) => <ToolZeile key={t.key} tool={t} ok={live.has(t.key)} index={i} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function StatusKarte({ daten }: { daten: GesundheitErgebnis | null }) {
  if (!daten) {
    return (
      <div className="rounded-2xl2 border border-signal-rot/30 bg-signal-rot/[0.06] px-5 py-4 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-signal-rot" />
          <span className="font-display font-semibold text-white text-[15px]">API nicht erreichbar</span>
        </div>
        <p className="text-[13px] text-white/55 mt-1">Der Live-Status konnte nicht geladen werden. Bitte später erneut prüfen.</p>
      </div>
    );
  }

  const live = new Set([...(daten.werkzeuge ?? []), ...(daten.fundament ?? [])]);
  const fundamentGruppe: ToolDef[] = (daten.fundament ?? []).map((f) => ({
    key: f, name: FUNDAMENT_NAME[f] ?? f, quelle: "Interner Dienst",
  }));
  const alleTools = GRUPPEN.flatMap((g) => g.tools);
  const aktiv = alleTools.filter((t) => live.has(t.key)).length;
  const gesamt = alleTools.length;
  const allesOk = aktiv === gesamt;

  return (
    <div className="relative overflow-hidden rounded-2xl2 border mb-5 kante-licht"
      style={{ borderColor: "rgba(109,124,255,0.22)", backgroundColor: "rgba(109,124,255,0.05)" }}>
      {/* Top-Bar im Indigo→Cyan-Verlauf */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-0.5"
        style={{ backgroundImage: `linear-gradient(90deg, #6D7CFF, ${CYAN})` }} />

      {/* Einmalige Scan-Linie beim Laden (cyan) */}
      <motion.span aria-hidden className="absolute inset-x-0 h-16 pointer-events-none"
        style={{ background: `linear-gradient(180deg, transparent, rgba(51,214,255,0.10), transparent)` }}
        initial={{ top: "-20%", opacity: 0 }}
        animate={{ top: "120%", opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.1, ease: "easeInOut" }} />

      {/* Header */}
      <div className="relative px-5 pt-5 pb-4 flex items-center gap-3 flex-wrap">
        <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full animate-ping"
            style={{ backgroundColor: allesOk ? `${TEAL}b3` : "#f5b544b3" }} />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: allesOk ? TEAL : "#f5b544" }} />
        </span>
        <span className="font-display font-semibold text-white text-[16px]">
          {allesOk ? "Alle Systeme live" : "System teilweise eingeschränkt"}
        </span>
        <span className="ml-auto flex items-center gap-2">
          <span className="font-mono text-[11px] rounded-full px-2.5 py-0.5"
            style={{ color: CYAN, border: `1px solid rgba(51,214,255,0.3)`, backgroundColor: "rgba(51,214,255,0.08)" }}>
            {aktiv}/{gesamt} Werkzeuge live
          </span>
          <span className="font-mono text-[10px] text-white/40 rounded-full border border-white/10 px-2 py-0.5">v{daten.version}</span>
        </span>
      </div>

      {/* Aufklappbare Gruppen */}
      <div className="relative px-5 pb-5 space-y-2">
        {GRUPPEN.map((g) => <StatusGruppe key={g.titel} titel={g.titel} tools={g.tools} live={live} />)}
        {fundamentGruppe.length > 0 && (
          <StatusGruppe titel="Fundament" tools={fundamentGruppe} live={live} />
        )}
      </div>
    </div>
  );
}
