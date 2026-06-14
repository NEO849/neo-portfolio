// ═══════════════════════════════════════════════════════════════════
// BEWEGUNG: MatrixSchleier
// Dezenter, herabfließender Code-Regen als Hintergrund-Textur.
// Bewusst sehr zurückhaltend (niedrige Deckkraft, Azur statt Neon),
// damit er edel wirkt statt nach „Hacker-Klischee". Zeichnet auf Canvas
// (kein DOM-Thrashing), blendet zum unteren Rand weich aus, respektiert
// prefers-reduced-motion (dann gar kein Schleier).
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { useBewegungErlaubt } from "./hooks/useBewegungErlaubt";

interface MatrixSchleierProps {
  /** Gesamt-Deckkraft des Schleiers (0–1). Dezent halten. */
  deckkraft?: number;
  klassen?: string;
}

export function MatrixSchleier({ deckkraft = 0.36, klassen = "" }: MatrixSchleierProps) {
  const flaecheRef = useRef<HTMLCanvasElement>(null);
  const bewegungErlaubt = useBewegungErlaubt();

  useEffect(() => {
    if (!bewegungErlaubt) return;
    const flaeche = flaecheRef.current;
    if (!flaeche) return;
    const pinsel = flaeche.getContext("2d");
    if (!pinsel) return;

    let breite = window.innerWidth;
    let hoehe = window.innerHeight;
    flaeche.width = breite;
    flaeche.height = hoehe;

    // Zeichensatz mit Tech-Anmutung — keine Wertung, reine Textur.
    const zeichensatz = "01{}[]();=></>#!_$ const async await import token auth graphql".split("");
    const spaltenBreite = 16;
    let spalten = Math.floor(breite / spaltenBreite);
    let tropfen = Array(spalten).fill(0).map(() => Math.random() * -80);

    const zeichnen = () => {
      // Leichtes Nachziehen (grund-950 mit niedriger Deckkraft) erzeugt Schweif.
      pinsel.fillStyle = "rgba(7, 10, 18, 0.06)";
      pinsel.fillRect(0, 0, breite, hoehe);
      pinsel.font = "12px 'JetBrains Mono', monospace";
      for (let spalte = 0; spalte < spalten; spalte++) {
        const zeichen = zeichensatz[Math.floor(Math.random() * zeichensatz.length)];
        const x = spalte * spaltenBreite;
        const y = tropfen[spalte] * spaltenBreite;
        const zufall = Math.random();
        // Selten ein heller Azur-„Kopf", meist sehr blasse Spur.
        if (zufall > 0.986) pinsel.fillStyle = "rgba(169, 196, 255, 0.55)";
        else if (zufall > 0.95) pinsel.fillStyle = "rgba(122, 162, 255, 0.22)";
        else pinsel.fillStyle = "rgba(122, 162, 255, 0.06)";
        pinsel.fillText(zeichen, x, y);
        if (y > hoehe && Math.random() > 0.985) tropfen[spalte] = 0;
        tropfen[spalte] += 0.42;
      }
    };

    const intervall = window.setInterval(zeichnen, 55);
    const beiGroessenAenderung = () => {
      breite = window.innerWidth;
      hoehe = window.innerHeight;
      flaeche.width = breite;
      flaeche.height = hoehe;
      spalten = Math.floor(breite / spaltenBreite);
      tropfen = Array(spalten).fill(0).map(() => Math.random() * -80);
    };
    window.addEventListener("resize", beiGroessenAenderung);

    return () => {
      window.clearInterval(intervall);
      window.removeEventListener("resize", beiGroessenAenderung);
    };
  }, [bewegungErlaubt]);

  // Reduced-Motion: kein Canvas — der ruhige Aurora-Hintergrund bleibt.
  if (!bewegungErlaubt) return null;

  const maske =
    "linear-gradient(to bottom, #000 0%, #000 42%, rgba(0,0,0,0.32) 74%, transparent 96%)";

  return (
    <canvas
      ref={flaecheRef}
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none ${klassen}`}
      style={{ opacity: deckkraft, maskImage: maske, WebkitMaskImage: maske }}
    />
  );
}
