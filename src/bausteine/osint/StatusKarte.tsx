// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: StatusKarte — Live-Systemstatus ALLER OSINT-Werkzeuge
// Vollständige, gruppierte Tool-Übersicht mit ECHTEM Live-Status pro Tool
// (aus /gesundheit) + innovativen Animationen: gestaffeltes „Hochfahren",
// gezeichnete Häkchen, einmalige Scan-Linie, pulsierende Live-Punkte.
// Konsistent zum dunklen Premium-Stil.
// ═══════════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GesundheitErgebnis } from "../../dienste/osintApi";

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

const FUNDAMENT: Record<string, string> = {
  cache: "TTL-Cache", transparenz: "DSGVO-Transparenz", pivots: "Pivot-Engine",
  geocoding: "Geocoding", hlr_lookup: "HLR-Lookup", netz_schutz: "SSRF-Guard",
};

function AnimiertesHaken({ verzoegerung }: { verzoegerung: number }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden
      className="text-signal-gruen flex-shrink-0">
      <motion.circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.4" opacity="0.3"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: verzoegerung }} />
      <motion.path d="m7.5 12 3 3 6-6" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, delay: verzoegerung + 0.15 }} />
    </svg>
  );
}

function ToolZeile({ tool, ok, index }: { tool: ToolDef; ok: boolean; index: number }) {
  const [offen, setOffen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.4, delay: 0.06 * index, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-xl border overflow-hidden ${
        ok ? "border-white/[0.06] bg-white/[0.02]" : "border-signal-rot/30 bg-signal-rot/[0.06]"
      }`}
    >
      {/* Kopf: Name + Live — Klick zeigt die Quellen */}
      <button type="button" onClick={() => setOffen((o) => !o)} aria-expanded={offen}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-white/[0.02]">
        {ok ? <AnimiertesHaken verzoegerung={0.06 * index + 0.15} />
            : <span className="w-[15px] h-[15px] grid place-items-center text-signal-rot flex-shrink-0">✕</span>}
        <span className="text-[13px] text-white/85 font-medium truncate flex-1">{tool.name}</span>
        <span className={`font-mono text-[9px] uppercase tracking-wider flex-shrink-0 ${ok ? "text-signal-gruen/80" : "text-signal-rot"}`}>
          {ok ? "live" : "offline"}
        </span>
        <span className="flex-shrink-0" style={{ color: "#6D7CFF" }} aria-hidden>
          {offen ? (
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
          )}
        </span>
      </button>
      {/* Aufklappbar: Datenquellen des Werkzeugs */}
      <AnimatePresence initial={false}>
        {offen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden">
            <div className="px-3 pb-2.5 pl-[42px] text-[11px] text-white/60 leading-relaxed">{tool.quelle}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
        <p className="text-[13px] text-white/65 mt-1">Der Live-Status konnte nicht geladen werden. Bitte später erneut prüfen.</p>
      </div>
    );
  }

  const live = new Set([...(daten.werkzeuge ?? []), ...(daten.fundament ?? [])]);
  const alleTools = GRUPPEN.flatMap((g) => g.tools);
  const aktiv = alleTools.filter((t) => live.has(t.key)).length;
  const gesamt = alleTools.length;
  const allesOk = aktiv === gesamt;
  let laufindex = 0;

  return (
    <div className="relative overflow-hidden rounded-2xl2 border border-white/[0.08] bg-white/[0.03] mb-5 kante-licht">
      <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-white/20" />

      {/* Einmalige Scan-Linie beim Laden (dezent) */}
      <motion.span aria-hidden
        className="absolute inset-x-0 h-16 pointer-events-none"
        style={{ background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.06), transparent)" }}
        initial={{ top: "-20%", opacity: 0 }}
        animate={{ top: "120%", opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />

      {/* Header */}
      <div className="relative px-5 pt-5 pb-3 flex items-center gap-3 flex-wrap">
        <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
          <span className={`absolute inline-flex h-full w-full rounded-full animate-ping ${allesOk ? "bg-signal-gruen/70" : "bg-signal-gelb/70"}`} />
          <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${allesOk ? "bg-signal-gruen" : "bg-signal-gelb"}`} />
        </span>
        <span className="font-display font-semibold text-white text-[16px]">
          {allesOk ? "Alle Systeme live" : "System teilweise eingeschränkt"}
        </span>
        <span className="ml-auto flex items-center gap-2">
          <motion.span
            key={aktiv}
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className={`font-mono text-[11px] ${allesOk ? "text-signal-gruen/90" : "text-signal-gelb/90"}`}>
            {aktiv}/{gesamt} Werkzeuge live
          </motion.span>
          <span className="font-mono text-[10px] text-white/50 rounded-full border border-white/10 px-2 py-0.5">v{daten.version}</span>
        </span>
      </div>

      {/* Gruppen mit Tool-Zeilen */}
      <div className="relative px-5 pb-2 space-y-4">
        {GRUPPEN.map((gruppe) => (
          <div key={gruppe.titel}>
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 mb-1.5">{gruppe.titel}</span>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {gruppe.tools.map((tool) => (
                <ToolZeile key={tool.key} tool={tool} ok={live.has(tool.key)} index={laufindex++} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Fundament */}
      {(daten.fundament?.length ?? 0) > 0 && (
        <div className="relative px-5 pb-4 pt-2 border-t border-white/[0.06]">
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2 mt-2">Fundament</span>
          <div className="flex flex-wrap gap-1.5">
            {daten.fundament.map((f, i) => (
              <motion.span key={f}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-signal-gruen animate-pulse" />
                <span className="font-mono text-[10.5px] text-white/70">{FUNDAMENT[f] ?? f}</span>
              </motion.span>
            ))}
          </div>
        </div>
      )}

      <div className="relative px-5 pb-4 font-mono text-[10px] text-white/30">
        Live-Check gegen die OSINT-API · Quellen frei/keyless oder key-gated (DSGVO-transparent)
      </div>
    </div>
  );
}
