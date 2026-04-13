import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PERSOENLICH } from "../models/daten";

// ═══════════════════════════════════════════════════════
// VIEW: Hero — Erster Eindruck
// ═══════════════════════════════════════════════════════

function CodeRainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const zeichen = "01{}[]();=></>#!/usr/bin function const async await import graphql auth token";
    const zeichenArr = zeichen.split("");
    const spaltenBreite = 16;
    let spalten = Math.floor(w / spaltenBreite);
    let tropfen: number[] = Array(spalten).fill(0).map(() => Math.random() * -80);

    const zeichnen = () => {
      ctx.fillStyle = "rgba(6, 8, 15, 0.055)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = `12px 'JetBrains Mono', monospace`;
      for (let s = 0; s < spalten; s++) {
        const z = zeichenArr[Math.floor(Math.random() * zeichenArr.length)];
        const x = s * spaltenBreite;
        const y = tropfen[s] * spaltenBreite;
        const r = Math.random();
        if (r > 0.98) ctx.fillStyle = "rgba(99, 102, 241, 0.55)";
        else if (r > 0.94) ctx.fillStyle = "rgba(6, 182, 212, 0.25)";
        else ctx.fillStyle = "rgba(99, 102, 241, 0.07)";
        ctx.fillText(z, x, y);
        if (y > h && Math.random() > 0.983) tropfen[s] = 0;
        tropfen[s] += 0.45;
      }
    };

    const intervall = setInterval(zeichnen, 50);
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w; canvas.height = h;
      spalten = Math.floor(w / spaltenBreite);
      tropfen = Array(spalten).fill(0).map(() => Math.random() * -80);
    };
    window.addEventListener("resize", resize);
    return () => { clearInterval(intervall); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ opacity: 0.55 }} />;
}

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const buchstabenVariante = {
  versteckt: { opacity: 0, y: 36 },
  sichtbar: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: 0.035 * i, ease: EASE },
  }),
};

const einblend = (delay: number) => ({
  versteckt: { opacity: 0, y: 18 },
  sichtbar: { opacity: 1, y: 0, transition: { duration: 0.65, delay, ease: EASE } },
});

export default function HeroView() {
  const vorname = PERSOENLICH.name.split(" ")[0];
  const nachname = PERSOENLICH.name.split(" ")[1];

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 pb-12 px-6"
    >
      <CodeRainCanvas />

      {/* Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-akzent-500/5 rounded-full blur-[180px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-cyber-500/4 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 text-center max-w-3xl w-full">

        {/* Profilbild */}
        <motion.div
          variants={einblend(0.05)}
          initial="versteckt"
          animate="sichtbar"
          className="mb-8"
        >
          <div
            className="w-28 h-28 md:w-32 md:h-32 mx-auto rounded-full overflow-hidden"
            style={{
              border: "1.5px solid rgba(99,102,241,0.3)",
              boxShadow: "0 0 0 6px rgba(99,102,241,0.06), 0 0 60px rgba(99,102,241,0.15), 0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <img
              src="/profilbild.jpg"
              alt="Michael Fleps"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        </motion.div>

        {/* Name */}
        <div className="mb-3">
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight inline-flex flex-wrap justify-center gap-x-4">
            <span className="flex">
              {vorname.split("").map((b, i) => (
                <motion.span key={`v-${i}`} custom={i} variants={buchstabenVariante} initial="versteckt" animate="sichtbar" className="text-white">
                  {b}
                </motion.span>
              ))}
            </span>
            <span className="flex">
              {nachname.split("").map((b, i) => (
                <motion.span
                  key={`n-${i}`}
                  custom={i + vorname.length + 2}
                  variants={buchstabenVariante}
                  initial="versteckt"
                  animate="sichtbar"
                  style={{ background: "linear-gradient(135deg, #818cf8, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                  {b}
                </motion.span>
              ))}
            </span>
          </h1>
        </div>

        {/* Untertitel */}
        <motion.div variants={einblend(0.45)} initial="versteckt" animate="sichtbar"
          className="font-mono text-xs md:text-sm text-white/45 mb-5 tracking-[0.22em] uppercase">
          {PERSOENLICH.untertitel}
        </motion.div>

        {/* Status Pill — jetzt UNTER dem Titel, nicht über Profilbild */}
        <motion.div variants={einblend(0.6)} initial="versteckt" animate="sichtbar"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-signal-gruen/25 bg-signal-gruen/6 mb-6 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-signal-gruen animate-pulse flex-shrink-0" />
          <span className="text-xs font-mono text-signal-gruen/85 tracking-wide">
            Verfügbar für neue Herausforderungen
          </span>
        </motion.div>

        {/* Kurzvorstellung */}
        <motion.p variants={einblend(0.75)} initial="versteckt" animate="sichtbar"
          className="text-base md:text-lg text-white/60 max-w-xl mx-auto leading-relaxed mb-10">
          {PERSOENLICH.kurzvorstellung}
        </motion.p>

        {/* CTA-Buttons */}
        <motion.div variants={einblend(0.9)} initial="versteckt" animate="sichtbar"
          className="flex flex-wrap gap-3 justify-center">
          <a
            href="#kontakt"
            onClick={(e) => { e.preventDefault(); document.getElementById("kontakt")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
            className="px-6 py-3 rounded-xl font-medium text-sm text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(6,182,212,0.12))",
              border: "1px solid rgba(99,102,241,0.35)",
              boxShadow: "0 0 30px rgba(99,102,241,0.08)",
            }}
          >
            Kontakt aufnehmen
          </a>
          <a
            href={PERSOENLICH.github}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl font-medium text-sm text-white/65 hover:text-white/90 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
            style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}
          >
            GitHub →
          </a>
        </motion.div>

        {/* Scroll Indikator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="mt-16">
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-8 mx-auto rounded-full border border-white/12 flex justify-center pt-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-white/20" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
