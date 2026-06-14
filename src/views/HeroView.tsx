import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { PERSOENLICH } from "../models/daten";
import { KartenLicht } from "../bewegung/KartenLicht";
import { KURVEN, FEDERN, UNSCHARF_REVEAL } from "../bewegung/varianten";
import { useBewegungErlaubt } from "../bewegung/hooks/useBewegungErlaubt";

// ═══════════════════════════════════════════════════════════════════
// VIEW: Hero — Premium-Einstieg & Produkt-Inszenierung
// Ruhige Tiefe statt Matrix. Horizontale Produkt-Banner führen den
// Besucher gezielt in die wichtigsten Bereiche (OSINT featured).
// ═══════════════════════════════════════════════════════════════════

const EASE = KURVEN.expressiv;

const einblend = (delay: number) => ({
  versteckt: { opacity: 0, y: 20, filter: "blur(8px)" },
  sichtbar: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.75, delay, ease: EASE } },
});

const buchstabe = {
  versteckt: { opacity: 0, y: 32, filter: "blur(8px)" },
  sichtbar: (i: number) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.6, delay: 0.04 * i, ease: EASE },
  }),
};

// ─── Produkt-Banner (jeweils echte Route, keine toten Links) ──────────

interface Banner {
  readonly pfad: string;
  readonly kicker: string;
  readonly titel: string;
  readonly nutzen: string;
  readonly icon: ReactNode;
  readonly featured?: boolean;
}

const ICON_PROPS = {
  width: 22, height: 22, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.6,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
};

const BANNER: Banner[] = [
  {
    pfad: "/osint-tools", kicker: "Intelligence Suite", titel: "OSINT Analyseplattform",
    nutzen: "E-Mail, Domain, Username & mehr live analysieren — Funde und ihre Beziehungen als Graph.",
    featured: true,
    icon: (
      <svg {...ICON_PROPS}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.5-3.5" /><circle cx="11" cy="11" r="2" /></svg>
    ),
  },
  {
    pfad: "/labor", kicker: "Infrastruktur & Automation", titel: "Systeme, die im Hintergrund tragen",
    nutzen: "Gehärtete Linux-Infrastruktur und KI-Agenten, die wiederkehrende Abläufe übernehmen.",
    icon: (
      <svg {...ICON_PROPS}><rect x="3" y="4" width="18" height="6" rx="1.5" /><rect x="3" y="14" width="18" height="6" rx="1.5" /><path d="M7 7h.01M7 17h.01" /></svg>
    ),
  },
  {
    pfad: "/security", kicker: "Security & Analyse", titel: "Der Blick des Angreifers",
    nutzen: "Schwachstellen finden, bevor andere es tun — methodisch geprüft, sauber dokumentiert.",
    icon: (
      <svg {...ICON_PROPS}><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="m9.5 11.5 1.8 1.8 3.2-3.6" /></svg>
    ),
  },
  {
    pfad: "/projekte", kicker: "Projekte & Entwicklung", titel: "Eigene Software, produktiv im Einsatz",
    nutzen: "Vom KI-Workflow bis zum gehärteten Server — seit Jahren live, abgesichert, dokumentiert.",
    icon: (
      <svg {...ICON_PROPS}><path d="m8 9-3 3 3 3" /><path d="m16 9 3 3-3 3" /><path d="m13 7-2 10" /></svg>
    ),
  },
];

function ProduktBanner({ banner, index }: { banner: Banner; index: number }) {
  return (
    <motion.div variants={einblend(0.95 + index * 0.08)} initial="versteckt" animate="sichtbar">
      <Link to={banner.pfad} className="group block focus:outline-none">
        <KartenLicht
          lichtfarbe="79, 124, 251"
          intensitaet={banner.featured ? 0.15 : 0.09}
          radius={460}
          klassen="rounded-2xl2"
        >
          <motion.div
            whileHover={{ y: -3 }}
            transition={FEDERN.weich}
            className={[
              "relative overflow-hidden rounded-2xl2 kante-licht",
              "px-5 py-4 md:px-6 md:py-5 flex items-center gap-4 md:gap-5",
              "border bg-white/[0.03] backdrop-blur-xl transition-colors duration-300",
              banner.featured
                ? "border-akzent-500/30 group-hover:border-akzent-500/50"
                : "border-white/[0.07] group-hover:border-white/[0.14]",
            ].join(" ")}
            style={banner.featured ? { boxShadow: "0 0 0 1px rgba(79,124,251,0.10), 0 20px 50px rgba(79,124,251,0.06)" } : undefined}
          >
            {/* Hover-Sheen — feiner Lichtstreif, der durchläuft */}
            <span aria-hidden className="sheen" />

            {/* Icon-Plättchen */}
            <span
              className={[
                "relative flex-shrink-0 grid place-items-center rounded-xl2 w-11 h-11 md:w-12 md:h-12 transition-colors duration-300",
                banner.featured
                  ? "text-akzent-300 bg-akzent-500/12 border border-akzent-500/25"
                  : "text-white/70 bg-white/[0.05] border border-white/[0.08] group-hover:text-akzent-300",
              ].join(" ")}
            >
              {banner.icon}
            </span>

            {/* Text */}
            <span className="relative min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.20em] text-akzent-400/80">
                  {banner.kicker}
                </span>
                {banner.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-signal-gruen/25 bg-signal-gruen/10 px-1.5 py-0.5">
                    <span className="w-1 h-1 rounded-full bg-signal-gruen animate-pulse" />
                    <span className="font-mono text-[9px] uppercase tracking-wider text-signal-gruen/90">Live</span>
                  </span>
                )}
              </span>
              <span className="block font-display font-semibold text-white text-[15px] md:text-[17px] tracking-[-0.01em] mt-0.5 truncate">
                {banner.titel}
              </span>
              <span className="block text-[13px] md:text-sm text-white/55 leading-snug mt-1 line-clamp-2 md:line-clamp-1">
                {banner.nutzen}
              </span>
            </span>

            {/* Pfeil */}
            <span className="relative flex-shrink-0 text-white/30 group-hover:text-akzent-300 transition-all duration-300 group-hover:translate-x-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </motion.div>
        </KartenLicht>
      </Link>
    </motion.div>
  );
}

export default function HeroView() {
  const [vorname, nachname] = PERSOENLICH.name.split(" ");
  const erlaubt = useBewegungErlaubt();

  // Ambient-Parallaxe: Lichtfelder folgen der Maus minimal & träge (Tiefe).
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const sx = useSpring(mvX, FEDERN.traege);
  const sy = useSpring(mvY, FEDERN.traege);
  const g1x = useTransform(sx, (v) => v * 22);
  const g1y = useTransform(sy, (v) => v * 16);
  const g2x = useTransform(sx, (v) => v * -34);
  const g2y = useTransform(sy, (v) => v * -26);

  const beiMausBewegung = (e: React.MouseEvent<HTMLElement>) => {
    if (!erlaubt) return;
    const r = e.currentTarget.getBoundingClientRect();
    mvX.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    mvY.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };

  return (
    <section
      id="hero"
      onMouseMove={beiMausBewegung}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-28 pb-16 px-6"
    >
      {/* Ruhige Premium-Tiefe — weiche, träge auf die Maus reagierende Lichtfelder */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div style={{ x: g1x, y: g1y, left: "calc(50% - 450px)" }} className="absolute -top-1/4 w-[900px] h-[900px]">
          <div className="w-full h-full rounded-full bg-akzent-500/[0.07] blur-[160px] animate-aurora-drift" />
        </motion.div>
        <motion.div style={{ x: g2x, y: g2y }} className="absolute bottom-0 right-[12%] w-[520px] h-[520px] rounded-full bg-akzent-400/[0.04] blur-[150px]" />
        {/* feines Raster — kaum sichtbar, gibt Materialität */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 70% 55% at 50% 38%, #000 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 38%, #000 30%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center text-center">

        {/* Profilbild */}
        <motion.div variants={einblend(0.05)} initial="versteckt" animate="sichtbar" className="mb-7">
          <div
            className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden"
            style={{
              border: "1px solid rgba(122,162,255,0.28)",
              boxShadow: "0 0 0 6px rgba(79,124,251,0.05), 0 18px 50px rgba(0,0,0,0.5)",
            }}
          >
            <img
              src="/profilbild.jpg"
              alt={PERSOENLICH.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        </motion.div>

        {/* Capability-Strip */}
        <motion.div
          variants={einblend(0.2)} initial="versteckt" animate="sichtbar"
          className="font-mono text-[11px] md:text-xs text-white/45 mb-5 tracking-[0.24em] uppercase"
        >
          {PERSOENLICH.untertitel}
        </motion.div>

        {/* Name */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-[-0.03em] leading-[0.95] inline-flex flex-wrap justify-center gap-x-4 mb-6">
          <span className="flex">
            {vorname.split("").map((b, i) => (
              <motion.span key={`v-${i}`} custom={i} variants={buchstabe} initial="versteckt" animate="sichtbar" className="text-white">
                {b}
              </motion.span>
            ))}
          </span>
          <motion.span
            className="licht-name"
            variants={UNSCHARF_REVEAL}
            initial="versteckt"
            animate="sichtbar"
            transition={{ delay: 0.04 * (vorname.length + 3), duration: 0.95, ease: EASE }}
          >
            {nachname}
          </motion.span>
        </h1>

        {/* Lead-Satz */}
        <motion.p
          variants={einblend(0.5)} initial="versteckt" animate="sichtbar"
          className="text-base md:text-lg text-white/70 max-w-xl leading-relaxed mb-6"
        >
          {PERSOENLICH.firmaTagline}
        </motion.p>

        {/* Status-Pill */}
        <motion.div
          variants={einblend(0.65)} initial="versteckt" animate="sichtbar"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-signal-gruen/25 bg-signal-gruen/[0.07] backdrop-blur-sm mb-12"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-signal-gruen animate-pulse" />
          <span className="text-xs font-mono text-signal-gruen/85 tracking-wide">Verfügbar für neue Projekte</span>
        </motion.div>

        {/* Produkt-Banner */}
        <motion.div
          variants={einblend(0.8)} initial="versteckt" animate="sichtbar"
          className="w-full max-w-2xl flex items-center justify-between gap-3 mb-4"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">Bereiche entdecken</span>
          <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
        </motion.div>

        <div className="w-full max-w-2xl flex flex-col gap-3">
          {BANNER.map((b, i) => (
            <ProduktBanner key={b.pfad} banner={b} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
