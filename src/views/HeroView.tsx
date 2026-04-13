import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PERSOENLICH } from "../models/daten";

// ═══════════════════════════════════════════════════════
// VIEW: Hero mit Code-Rain-Animation
// ═══════════════════════════════════════════════════════

function CodeRainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const kontext = canvas.getContext("2d");
    if (!kontext) return;

    let breite = window.innerWidth;
    let hoehe = window.innerHeight;
    canvas.width = breite;
    canvas.height = hoehe;

    const zeichen = "01{}[]();:=></>#!/usr/bin function return const async await import export class if else for while try catch query mutation schema resolve auth token session redirect callback graphql api";
    const zeichenArray = zeichen.split("");
    const spaltenBreite = 14;
    let spaltenAnzahl = Math.floor(breite / spaltenBreite);
    let tropfen: number[] = Array(spaltenAnzahl).fill(0).map(() => Math.random() * -100);

    const zeichneBild = () => {
      kontext.fillStyle = "rgba(6, 8, 15, 0.06)";
      kontext.fillRect(0, 0, breite, hoehe);
      kontext.font = `11px 'JetBrains Mono', monospace`;

      for (let spalte = 0; spalte < spaltenAnzahl; spalte++) {
        const zufallsZeichen = zeichenArray[Math.floor(Math.random() * zeichenArray.length)];
        const xPosition = spalte * spaltenBreite;
        const yPosition = tropfen[spalte] * spaltenBreite;

        // Kopf des Tropfens heller
        if (Math.random() > 0.97) {
          kontext.fillStyle = "rgba(99, 102, 241, 0.4)";
        } else if (Math.random() > 0.95) {
          kontext.fillStyle = "rgba(6, 182, 212, 0.3)";
        } else {
          kontext.fillStyle = "rgba(99, 102, 241, 0.08)";
        }

        kontext.fillText(zufallsZeichen, xPosition, yPosition);

        if (yPosition > hoehe && Math.random() > 0.985) {
          tropfen[spalte] = 0;
        }
        tropfen[spalte] += 0.5;
      }
    };

    const intervall = setInterval(zeichneBild, 50);

    const groesseAnpassen = () => {
      breite = window.innerWidth;
      hoehe = window.innerHeight;
      canvas.width = breite;
      canvas.height = hoehe;
      spaltenAnzahl = Math.floor(breite / spaltenBreite);
      tropfen = Array(spaltenAnzahl).fill(0).map(() => Math.random() * -100);
    };

    window.addEventListener("resize", groesseAnpassen);
    return () => {
      clearInterval(intervall);
      window.removeEventListener("resize", groesseAnpassen);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ opacity: 0.6 }} />
  );
}

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const buchstabenVariante = {
  versteckt: { opacity: 0, y: 40 },
  sichtbar: (index: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: 0.04 * index, ease: EASE }
  }),
};

const einblend = (verzoegerung: number) => ({
  versteckt: { opacity: 0, y: 20 },
  sichtbar: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: verzoegerung, ease: EASE }
  },
});

export default function HeroView() {
  const vorname = PERSOENLICH.name.split(" ")[0];
  const nachname = PERSOENLICH.name.split(" ")[1];

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Code Rain */}
      <CodeRainCanvas />

      {/* Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-akzent-500/6 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyber-500/4 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-4xl">
        {/* Status Pill */}
        <motion.div variants={einblend(0)} initial="versteckt" animate="sichtbar"
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-signal-gruen/20 bg-signal-gruen/5 mb-10 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-signal-gruen animate-pulse" />
          <span className="text-sm font-mono text-signal-gruen/80">Verfügbar für neue Herausforderungen</span>
        </motion.div>

        {/* Profilbild */}
        <motion.div variants={einblend(0.1)} initial="versteckt" animate="sichtbar" className="mb-8">
          <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden"
            style={{
              border: "2px solid rgba(99,102,241,0.2)",
              boxShadow: "0 0 40px rgba(99,102,241,0.1), 0 0 80px rgba(6,182,212,0.05)",
            }}>
            <img src="/profilbild.jpg" alt="Michael Fleps" className="w-full h-full object-cover"
              onError={(event) => {
                const bild = event.target as HTMLImageElement;
                bild.style.display = "none";
              }}
            />
          </div>
        </motion.div>

        {/* Name */}
        <div className="mb-3">
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight inline-flex flex-wrap justify-center gap-x-4">
            <span className="flex">
              {vorname.split("").map((buchstabe, index) => (
                <motion.span key={`v-${index}`} custom={index} variants={buchstabenVariante} initial="versteckt" animate="sichtbar" className="text-white">
                  {buchstabe}
                </motion.span>
              ))}
            </span>
            <span className="flex">
              {nachname.split("").map((buchstabe, index) => (
                <motion.span key={`n-${index}`} custom={index + vorname.length + 2} variants={buchstabenVariante} initial="versteckt" animate="sichtbar" className="text-akzent-400">
                  {buchstabe}
                </motion.span>
              ))}
            </span>
          </h1>
        </div>

        {/* Titel */}
        <motion.div variants={einblend(0.5)} initial="versteckt" animate="sichtbar"
          className="font-mono text-base md:text-lg text-white/40 mb-5 tracking-widest">
          {PERSOENLICH.titel}
        </motion.div>

        {/* Kurzvorstellung */}
        <motion.p variants={einblend(0.65)} initial="versteckt" animate="sichtbar"
          className="text-base text-white/30 max-w-lg mx-auto leading-relaxed">
          {PERSOENLICH.kurzvorstellung}
        </motion.p>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-16"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-8 mx-auto rounded-full border border-white/15 flex justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-white/30" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
