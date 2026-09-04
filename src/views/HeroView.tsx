import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { PERSOENLICH } from "../models/daten";
import { KartenLicht } from "../bewegung/KartenLicht";
import { KURVEN, FEDERN } from "../bewegung/varianten";
import { useBewegungErlaubt } from "../bewegung/hooks/useBewegungErlaubt";
import { MatrixSchleier } from "../bewegung/MatrixSchleier";
import { LaufBanner } from "../bausteine/LaufBanner";
import { Augenbraue } from "../bausteine/Augenbraue";

// ═══════════════════════════════════════════════════════════════════
// VIEW: Hero — Premium-Einstieg & Produkt-Inszenierung
// Ruhige Tiefe (dezenter Code-Schleier + träge Lichtfelder), ein lebendiger
// Infra-Ticker und Produkt-Banner führen gezielt in die Bereiche (OSINT featured).
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
  readonly titel: string;       // Bereichsname — die fettgesetzte Hauptzeile
  readonly nutzen: string;      // eine prägnante Wert-Zeile darunter
  readonly icon: ReactNode;
  readonly featured?: boolean;
}

// Einheitliche Icon-Geometrie — etwas kräftiger gezeichnet für mehr Präsenz.
// Strich als hell→azur-Verlauf (Def in HeroView, einmal pro Seite) statt flacher
// Einfarbigkeit — gibt den Symbolen Tiefe und edlen Metallic-Look.
const ICON_PROPS = {
  width: 23, height: 23, viewBox: "0 0 24 24", fill: "none",
  stroke: "url(#hero-icon-grad)", strokeWidth: 1.7,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
};

const BANNER: Banner[] = [
  {
    pfad: "/osint-tools", titel: "OSINT Analyseplattform",
    nutzen: "E-Mail, Domain, Username & mehr live: Beziehungen als Graph.",
    featured: true,
    icon: (
      <svg {...ICON_PROPS}><circle cx="10.5" cy="10.5" r="6" /><path d="m20 20-4.2-4.2" /><circle cx="10.5" cy="10.5" r="2" /></svg>
    ),
  },
  {
    pfad: "/labor", titel: "Infrastruktur & Automation",
    nutzen: "Gehärtete Linux-Systeme & KI-Agenten, die Abläufe übernehmen.",
    icon: (
      <svg {...ICON_PROPS}><rect x="3" y="4" width="18" height="6.5" rx="2" /><rect x="3" y="13.5" width="18" height="6.5" rx="2" /><path d="M6.5 7.25h.01M6.5 16.75h.01" /></svg>
    ),
  },
  {
    pfad: "/security", titel: "Security & Analyse",
    nutzen: "Schwachstellen finden, bevor andere es tun: der Blick des Angreifers.",
    icon: (
      <svg {...ICON_PROPS}><path d="M12 2.5l7.5 3.2v5.1c0 4.7-3.2 8-7.5 9.7-4.3-1.7-7.5-5-7.5-9.7V5.7z" /><path d="m9 11.7 2 2 3.6-4" /></svg>
    ),
  },
  {
    pfad: "/projekte", titel: "Projekte & Entwicklung",
    nutzen: "Eigene Software & Systeme, seit Jahren produktiv im Einsatz.",
    icon: (
      <svg {...ICON_PROPS}><path d="m8 8.5-3.5 3.5 3.5 3.5" /><path d="m16 8.5 3.5 3.5-3.5 3.5" /><path d="m13.5 6-3 12" /></svg>
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

            {/* Icon-Plättchen — Glas mit Tiefe, Verlaufs-Icon, blühender
                Radial-Glow + rotierender Lichtring bei Hover (alles azur). */}
            <span
              className="relative flex-shrink-0 grid place-items-center w-12 h-12 rounded-2xl2 border border-akzent-500/25 group-hover:border-akzent-500/45 transition-all duration-300 group-hover:scale-[1.06]"
              style={{
                background: banner.featured
                  ? "linear-gradient(140deg, rgba(79,124,251,0.26), rgba(79,124,251,0.05))"
                  : "linear-gradient(140deg, rgba(79,124,251,0.16), rgba(79,124,251,0.03))",
                boxShadow: banner.featured
                  ? "inset 0 1px 0 rgba(255,255,255,0.16), 0 10px 26px rgba(79,124,251,0.18)"
                  : "inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 20px rgba(79,124,251,0.10)",
              }}
            >
              {/* Radial-Glow hinter dem Icon — ruht dezent, blüht bei Hover auf */}
              <span
                aria-hidden
                className="absolute inset-0 rounded-2xl2 opacity-50 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "radial-gradient(circle at 50% 42%, rgba(122,162,255,0.40), transparent 70%)" }}
              />
              {/* Rotierender Conic-Lichtring — nur bei Hover sichtbar */}
              <span aria-hidden className="icon-ring opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Icon selbst — über den Effekten, mit feinem Glow */}
              <span className="relative drop-shadow-[0_1px_3px_rgba(79,124,251,0.35)]">{banner.icon}</span>
            </span>

            {/* Text — Bereichsname prominent, Nutzen darunter */}
            <span className="relative min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="font-display font-semibold text-white text-[16px] md:text-[18px] tracking-[-0.01em] truncate">
                  {banner.titel}
                </span>
                {banner.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-signal-gruen/25 bg-signal-gruen/10 px-1.5 py-0.5 flex-shrink-0">
                    <span className="w-1 h-1 rounded-full bg-signal-gruen animate-pulse" />
                    <span className="font-mono text-[9px] uppercase tracking-wider text-signal-gruen/90">Live</span>
                  </span>
                )}
              </span>
              <span className="block text-[13px] md:text-sm text-white/50 leading-snug mt-1 line-clamp-2 sm:line-clamp-1">
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
      {/* Verlaufs-Strich für die Bereichs-Icons (hell oben → azur unten) — einmal pro Seite */}
      <svg width="0" height="0" aria-hidden className="absolute pointer-events-none">
        <defs>
          <linearGradient id="hero-icon-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dbe6ff" />
            <stop offset="55%" stopColor="#9bbcff" />
            <stop offset="100%" stopColor="#5c87f7" />
          </linearGradient>
        </defs>
      </svg>

      {/* Ruhige Premium-Tiefe — weiche, träge auf die Maus reagierende Lichtfelder */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Dezenter Code-Schleier (Azur, niedrige Deckkraft) — Tech-Anmutung ohne Klischee */}
        <MatrixSchleier deckkraft={0.32} />
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

        {/* Name — Vorname weiß, Nachname im Azur-Verlauf. Pro Buchstabe mit
            gestaffelter Einlauf-Animation (blur/slide) am äußeren Span; die Farbe
            + ein dezenter, synchroner Schimmer-Glint liegen auf dem inneren Span,
            damit nichts am Text-Clipping bricht und der Name sichtbar bleibt. */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-[-0.03em] leading-[0.95] inline-flex flex-wrap justify-center gap-x-4 mb-6">
          <span className="flex">
            {vorname.split("").map((b, i) => (
              <motion.span key={`v-${i}`} custom={i} variants={buchstabe} initial="versteckt" animate="sichtbar">
                <span className={`text-white ${erlaubt ? "name-schimmer" : ""}`}>{b}</span>
              </motion.span>
            ))}
          </span>
          <span className="flex">
            {nachname.split("").map((b, i) => (
              <motion.span key={`n-${i}`} custom={i + vorname.length + 2} variants={buchstabe} initial="versteckt" animate="sichtbar">
                <span className={`text-akzent-verlauf ${erlaubt ? "name-schimmer" : ""}`}>{b}</span>
              </motion.span>
            ))}
          </span>
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
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-signal-gruen/25 bg-signal-gruen/[0.07] backdrop-blur-sm mb-7"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-signal-gruen animate-pulse" />
          <span className="text-xs font-mono text-signal-gruen/85 tracking-wide">Verfügbar für neue Projekte</span>
        </motion.div>

        {/* Live-Infrastruktur-Ticker (Effekt A) — lebendiger Datenstrom */}
        <motion.div
          variants={einblend(0.78)} initial="versteckt" animate="sichtbar"
          className="w-full max-w-2xl mb-11"
        >
          <LaufBanner />
        </motion.div>

        {/* Produkt-Banner — Eyebrow exakt wie die Abschnittstitel (gemeinsame Augenbraue) */}
        <motion.div
          variants={einblend(0.8)} initial="versteckt" animate="sichtbar"
          className="w-full max-w-2xl mb-4"
        >
          <Augenbraue text="Bereiche entdecken" />
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
