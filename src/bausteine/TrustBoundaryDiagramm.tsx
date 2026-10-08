import { motion } from "framer-motion";
import { useBewegungErlaubt } from "../bewegung/hooks/useBewegungErlaubt";

// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: TrustBoundaryDiagramm — Visualisierung der Fund-Klasse
// "Cross-Environment-Schlüssel-Verwechslung". Zwei Umgebungen teilen
// denselben Signatur-Schlüssel; ein in der Sandbox ausgestelltes Token
// wandert über die Vertrauensgrenze und wird in Produktion akzeptiert.
// De-identifiziert (keine echten Namen/Werte). reduced-motion-fest.
// ═══════════════════════════════════════════════════════════════════

function SchluesselIcon({ hex }: { hex: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={hex}
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="8" cy="8" r="4" />
      <path d="m11 11 7 7" /><path d="m15 15 2-2" /><path d="m18 18 2-2" />
    </svg>
  );
}

function Umgebung({
  name, rolle, hex, farbeRgb, markiert,
}: { name: string; rolle: string; hex: string; farbeRgb: string; markiert: boolean }) {
  return (
    <div
      className="relative flex-1 rounded-2xl2 p-5"
      style={{
        background: `linear-gradient(160deg, rgba(${farbeRgb},0.08), rgba(${farbeRgb},0.02))`,
        border: `1px solid rgba(${farbeRgb},0.28)`,
      }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: hex }}>{rolle}</p>
      <p className="font-display text-base font-bold text-white mb-4">{name}</p>
      <div
        className="inline-flex items-center gap-2 rounded-xl2 px-3 py-2"
        style={{
          background: markiert ? "rgba(241,100,108,0.1)" : `rgba(${farbeRgb},0.08)`,
          border: `1px solid ${markiert ? "rgba(241,100,108,0.4)" : `rgba(${farbeRgb},0.3)`}`,
        }}
      >
        <SchluesselIcon hex={markiert ? "#f1646c" : hex} />
        <span className="font-mono text-xs" style={{ color: markiert ? "#f1646c" : "rgba(255,255,255,0.75)" }}>
          Schlüssel&nbsp;A
        </span>
        {markiert && (
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#f1646c]/80">identisch</span>
        )}
      </div>
    </div>
  );
}

export function TrustBoundaryDiagramm() {
  const erlaubt = useBewegungErlaubt();

  return (
    <div className="rounded-3xl2 border border-white/[0.08] bg-white/[0.02] p-5 md:p-7">
      <div className="relative flex flex-col gap-4 md:flex-row md:items-stretch md:gap-0">
        <Umgebung name="Sandbox / Test" rolle="Umgebung 1" hex="#a9c4ff" farbeRgb="169, 196, 255" markiert />

        {/* Vertrauensgrenze */}
        <div className="relative flex items-center justify-center md:w-28" aria-hidden>
          <div className="relative h-px w-full md:h-full md:w-px"
            style={{ backgroundImage: "repeating-linear-gradient(to right, rgba(241,100,108,0.5) 0 6px, transparent 6px 12px)" }}>
          </div>
          <span className="absolute whitespace-nowrap rounded-full border border-[#f1646c]/30 bg-[#f1646c]/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[#f1646c]/90">
            Vertrauensgrenze
          </span>
          {/* Wanderndes Token — Sandbox → Produktion (nur wenn Bewegung erlaubt) */}
          {erlaubt && (
            <motion.span
              className="absolute left-0 top-1/2 hidden h-2 w-2 -translate-y-1/2 rounded-full md:block"
              style={{ background: "#f1646c", boxShadow: "0 0 10px 2px rgba(241,100,108,0.7)" }}
              initial={{ left: "-8%", opacity: 0 }}
              animate={{ left: ["-8%", "108%"], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
            />
          )}
        </div>

        <Umgebung name="Produktion" rolle="Umgebung 2" hex="#7aa2ff" farbeRgb="122, 162, 255" markiert />
      </div>

      <p className="mt-5 text-sm leading-relaxed text-white/60">
        Beide Umgebungen signierten Zugangs-Token mit <span className="text-white/80">demselben Schlüssel</span>.
        Ein in der Sandbox ausgestelltes Token wandert über die Vertrauensgrenze und wird in Produktion
        als echt akzeptiert — die Trennung von Test und Produktion ist damit kryptografisch aufgehoben.
      </p>
    </div>
  );
}
