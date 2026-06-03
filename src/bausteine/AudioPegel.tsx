// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: AudioPegel
// Sieben Balken wie im echten voice-bridge-Visualizer. Während der
// Aufnahme schwingen sie simuliert (kein echtes Mikrofon nötig), sonst
// ruhen sie flach. Reduzierte Bewegung → statische, ruhige Balken.
// ═══════════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { useBewegungErlaubt } from "../bewegung/hooks/useBewegungErlaubt";

const REC = "#ff453a";
const ANZAHL_BALKEN = 7;

// Pro Balken eine eigene Schwingungsdauer + Spitzenhöhe → lebendiges,
// aber deterministisches Muster (kein Zufall, kein Flackern).
const BALKEN = [
  { dauer: 0.50, spitze: 0.55 },
  { dauer: 0.42, spitze: 0.95 },
  { dauer: 0.58, spitze: 0.70 },
  { dauer: 0.38, spitze: 1.00 },
  { dauer: 0.54, spitze: 0.72 },
  { dauer: 0.46, spitze: 0.90 },
  { dauer: 0.52, spitze: 0.50 },
];

interface AudioPegelProps {
  aktiv: boolean;
}

export function AudioPegel({ aktiv }: AudioPegelProps) {
  const bewegung = useBewegungErlaubt();
  const schwingt = aktiv && bewegung;

  return (
    <div
      className="flex items-end justify-center gap-1.5 h-10"
      aria-hidden
    >
      {BALKEN.slice(0, ANZAHL_BALKEN).map((balken, index) => (
        <motion.span
          key={index}
          className="w-1.5 rounded-full"
          style={{
            height: 36,
            transformOrigin: "bottom",
            background: aktiv ? REC : "rgba(255,255,255,0.18)",
          }}
          initial={{ scaleY: 0.18 }}
          animate={
            schwingt
              ? { scaleY: [0.18, balken.spitze, 0.18] }
              : { scaleY: aktiv ? 0.4 : 0.18 }
          }
          transition={
            schwingt
              ? { duration: balken.dauer, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.3, ease: "easeOut" }
          }
        />
      ))}
    </div>
  );
}
