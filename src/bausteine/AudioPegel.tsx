// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: AudioPegel
// Sieben Balken wie im echten voice-bridge-Visualizer (weiß, über dem
// Orb). Während der Aufnahme schwingen sie simuliert — kein echtes
// Mikrofon nötig. Reduzierte Bewegung → ruhige, statische Balken.
// ═══════════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { useBewegungErlaubt } from "../bewegung/hooks/useBewegungErlaubt";

const BALKEN = [
  { dauer: 0.50, spitze: 0.45 },
  { dauer: 0.42, spitze: 0.85 },
  { dauer: 0.58, spitze: 0.62 },
  { dauer: 0.36, spitze: 1.00 },
  { dauer: 0.54, spitze: 0.64 },
  { dauer: 0.46, spitze: 0.82 },
  { dauer: 0.52, spitze: 0.42 },
];

interface AudioPegelProps {
  aktiv: boolean;
}

export function AudioPegel({ aktiv }: AudioPegelProps) {
  const bewegung = useBewegungErlaubt();
  const schwingt = aktiv && bewegung;

  const hoehe = "clamp(48px, 14vw, 80px)";

  return (
    <div className="flex items-center justify-center gap-[5px]" style={{ height: hoehe }} aria-hidden>
      {BALKEN.map((balken, index) => (
        <motion.span
          key={index}
          className="rounded-sm"
          style={{
            width: 4,
            height: hoehe,
            transformOrigin: "center",
            background: "rgba(255,255,255,0.85)",
          }}
          initial={{ scaleY: 0.1 }}
          animate={schwingt ? { scaleY: [0.1, balken.spitze, 0.1] } : { scaleY: 0.1 }}
          transition={
            schwingt
              ? { duration: balken.dauer, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  );
}
