// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: StatusKarte — Live-Systemstatus der OSINT-API (Modul „Status")
// Hochwertige Status-Ansicht: grüner Live-Header + Werkzeug-Grid (live)
// + Fundament-Dienste + Version. Konsistent zum dunklen Premium-Stil.
// ═══════════════════════════════════════════════════════════════════

import type { GesundheitErgebnis } from "../../dienste/osintApi";

// Werkzeug-Schlüssel (Backend) → menschliche Bezeichnung
const NAME: Record<string, string> = {
  domain: "Domain & Shodan",
  email: "E-Mail",
  "email-recon": "E-Mail-Recon",
  benutzername: "Username (WhatsMyName)",
  telefon: "Telefon",
  bild: "Reverse Image",
  shodan: "Shodan InternetDB",
  censys: "Censys Host-Intel",
  subdomains: "Subdomain-Recon",
  "ip-intel": "IP-Intel",
  "soziale-praesenz": "Soziale Präsenz",
  aggregator: "Such-Aggregator",
  orchestrator: "Orchestrator",
};

const FUNDAMENT: Record<string, string> = {
  cache: "TTL-Cache",
  transparenz: "DSGVO-Transparenz",
  pivots: "Pivot-Engine",
  geocoding: "Geocoding",
  hlr_lookup: "HLR-Lookup",
};

function CheckPunkt() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
      className="text-signal-gruen flex-shrink-0">
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
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

  const werkzeuge = daten.werkzeuge ?? [];
  const fundament = daten.fundament ?? [];

  return (
    <div className="relative overflow-hidden rounded-2xl2 border border-signal-gruen/25 bg-signal-gruen/[0.045] mb-5 kante-licht">
      <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-signal-gruen/70" />

      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-3 flex-wrap">
        <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-signal-gruen/70 animate-ping" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-signal-gruen" />
        </span>
        <span className="font-display font-semibold text-white text-[16px]">Alle Systeme live</span>
        <span className="ml-auto flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-signal-gruen/85">
            {werkzeuge.length} Werkzeuge aktiv
          </span>
          <span className="font-mono text-[10px] text-white/40 rounded-full border border-white/10 px-2 py-0.5">v{daten.version}</span>
        </span>
      </div>

      {/* Werkzeug-Grid */}
      <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {werkzeuge.map((w) => (
          <div key={w} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5">
            <CheckPunkt />
            <span className="text-[12.5px] text-white/80 truncate">{NAME[w] ?? w}</span>
          </div>
        ))}
      </div>

      {/* Fundament */}
      {fundament.length > 0 && (
        <div className="px-5 pb-4 pt-1 border-t border-white/[0.06]">
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 mb-2 mt-3">Fundament</span>
          <div className="flex flex-wrap gap-1.5">
            {fundament.map((f) => (
              <span key={f} className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-signal-gruen" />
                <span className="font-mono text-[10.5px] text-white/60">{FUNDAMENT[f] ?? f}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="px-5 pb-4 font-mono text-[10px] text-white/30">
        Live-Check gegen die OSINT-API · alle Quellen frei/keyless oder key-gated (DSGVO-transparent)
      </div>
    </div>
  );
}
