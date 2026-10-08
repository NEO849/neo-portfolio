import { motion } from "framer-motion";
import { useBewegungErlaubt } from "../bewegung/hooks/useBewegungErlaubt";

// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: TrustBoundaryDiagramm — Cross-Environment-Schlüssel-Verwechslung.
// Zwei Umgebungen mit IDENTISCHEM Signatur-Schlüssel. Ein in der Sandbox
// geforgtes JWT wandert über die (gebrochene) Vertrauensgrenze und wird in
// Produktion als echt akzeptiert. De-identifiziert, reduced-motion-fest.
// ═══════════════════════════════════════════════════════════════════

function Fingerprint({ hex }: { hex: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px]"
      style={{ borderColor: `${hex}44`, background: `${hex}12`, color: hex }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={hex} strokeWidth="2" strokeLinecap="round" aria-hidden>
        <circle cx="8" cy="8" r="4" /><path d="m11 11 8 8" /><path d="m16 16 2-2" />
      </svg>
      sig-key-01 · n≡
    </span>
  );
}

function Jwt({ dim }: { dim?: boolean }) {
  const seg = [
    { t: "header", c: "#7aa2ff" },
    { t: "payload", c: "#a5b4fc" },
    { t: "signature", c: "#f1646c" },
  ];
  return (
    <span className="inline-flex overflow-hidden rounded-md border border-white/10 font-mono text-[9px]" style={{ opacity: dim ? 0.55 : 1 }}>
      {seg.map((s, i) => (
        <span key={s.t} className="px-1.5 py-0.5"
          style={{ color: s.c, background: `${s.c}14`, borderLeft: i ? "1px solid rgba(255,255,255,0.08)" : undefined }}>
          {s.t}
        </span>
      ))}
    </span>
  );
}

function Umgebung({
  rolle, name, hex, farbeRgb, badge,
}: { rolle: string; name: string; hex: string; farbeRgb: string; badge?: string }) {
  return (
    <div className="relative flex-1 overflow-hidden rounded-2xl2 p-4"
      style={{ background: `linear-gradient(165deg, rgba(${farbeRgb},0.1), rgba(${farbeRgb},0.02))`, border: `1px solid rgba(${farbeRgb},0.26)` }}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: hex }}>{rolle}</p>
          <p className="font-display text-base font-bold text-white">{name}</p>
        </div>
        {badge && (
          <span className="rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider"
            style={{ color: hex, background: `${hex}1a`, border: `1px solid ${hex}44` }}>{badge}</span>
        )}
      </div>
      <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">Signatur-Schlüssel</p>
      <Fingerprint hex={hex} />
      <div className="mt-3">
        <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">Ausgestelltes Token</p>
        <Jwt />
      </div>
    </div>
  );
}

export function TrustBoundaryDiagramm() {
  const erlaubt = useBewegungErlaubt();
  return (
    <div className="overflow-hidden rounded-3xl2 border border-white/[0.08] p-5 md:p-6"
      style={{ background: "radial-gradient(120% 90% at 50% 0%, rgba(79,124,251,0.07), transparent 60%), #0a0d14" }}>
      {/* feines Raster */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize: "28px 28px", maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%,#000 40%,transparent 80%)" }} />

        <div className="relative flex flex-col items-stretch gap-4 md:flex-row md:items-center">
          <Umgebung rolle="Umgebung 1 · offen registrierbar" name="Sandbox / Test" hex="#a9c4ff" farbeRgb="169, 196, 255" badge="Token geforgt" />

          {/* Vertrauensgrenze + Schlüssel-Node */}
          <div className="relative flex min-h-[7rem] items-center justify-center md:w-40" aria-hidden>
            {/* gebrochene Grenze */}
            <div className="absolute h-full w-px md:w-full md:h-px"
              style={{ backgroundImage: "repeating-linear-gradient(to bottom, rgba(241,100,108,0.55) 0 7px, transparent 7px 14px)" }} />
            {/* geteilter Schlüssel in der Mitte */}
            <div className="relative z-10 grid place-items-center rounded-full border border-[#f1646c]/50 bg-[#0a0d14] p-2.5"
              style={{ boxShadow: "0 0 0 6px rgba(241,100,108,0.08), 0 0 22px rgba(241,100,108,0.35)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f1646c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="7.5" cy="15.5" r="4.5" /><path d="m10.5 12.5 9-9" /><path d="m15 8 3 3" /><path d="m18.5 4.5 3 3" />
              </svg>
            </div>
            <span className="absolute -bottom-1 whitespace-nowrap rounded-full border border-[#f1646c]/30 bg-[#f1646c]/10 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-[#f1646c] md:bottom-auto md:-top-6">
              gleicher Schlüssel
            </span>
            {/* wanderndes Token (nur Desktop + Bewegung) */}
            {erlaubt && (
              <motion.span
                className="absolute left-0 top-1/2 hidden h-2.5 w-2.5 -translate-y-1/2 rounded-sm md:block"
                style={{ background: "#f1646c", boxShadow: "0 0 10px 2px rgba(241,100,108,0.8)" }}
                initial={{ left: "2%", opacity: 0 }}
                animate={{ left: ["2%", "96%"], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </div>

          <Umgebung rolle="Umgebung 2 · echte Kundendaten" name="Produktion" hex="#7aa2ff" farbeRgb="122, 162, 255" badge="✓ akzeptiert" />
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2.5 rounded-2xl2 border border-[#f1646c]/20 bg-[#f1646c]/[0.06] p-3.5">
        <span className="mt-0.5 font-bold text-[#f1646c]">▲</span>
        <p className="text-[13px] leading-relaxed text-white/70">
          Beide Umgebungen signieren mit <span className="text-white">demselben Schlüssel</span>. Ein in der
          offen registrierbaren Sandbox geforgtes Admin-Token trägt eine Signatur, die auch Produktion als echt
          akzeptiert — die Trennung von Test und Produktion ist kryptografisch aufgehoben.
        </p>
      </div>
    </div>
  );
}
