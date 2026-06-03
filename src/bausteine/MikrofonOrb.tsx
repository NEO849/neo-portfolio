// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: MikrofonOrb
// Der zentrale Aufnahme-Knopf der voice-bridge-Demo — drei Zustände
// in den Originalfarben des echten Tools:
//   bereit        → ruhiges Atmen, Akzent-Blau (#0a84ff)
//   aufnahme      → rotes Glühen + pulsierender Ring (#ff453a)
//   verarbeitung  → blauer Busy-Puls
// ═══════════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import type { AufnahmeZustand } from "../models/voiceDemo";
import { useBewegungErlaubt } from "../bewegung/hooks/useBewegungErlaubt";

const AKZENT = "#0a84ff";
const REC = "#ff453a";

const BESCHRIFTUNG: Record<AufnahmeZustand, string> = {
  bereit: "Aufnahme starten",
  aufnahme: "Aufnahme stoppen",
  verarbeitung: "Wird transkribiert …",
};

interface MikrofonOrbProps {
  zustand: AufnahmeZustand;
  onClick: () => void;
}

export function MikrofonOrb({ zustand, onClick }: MikrofonOrbProps) {
  const bewegung = useBewegungErlaubt();
  const istAufnahme = zustand === "aufnahme";
  const istVerarbeitung = zustand === "verarbeitung";
  const farbe = istAufnahme ? REC : AKZENT;

  // Atem-/Puls-Animation des Glühens — bei reduzierter Bewegung statisch.
  const glühenAnimation = !bewegung
    ? { opacity: 0.5, scale: 1 }
    : istAufnahme
      ? { opacity: [0.5, 0.9, 0.5], scale: [1, 1.18, 1] }
      : istVerarbeitung
        ? { opacity: [0.35, 0.7, 0.35], scale: [1, 1.1, 1] }
        : { opacity: [0.3, 0.5, 0.3], scale: [1, 1.06, 1] };

  const glühenDauer = istAufnahme ? 1.1 : istVerarbeitung ? 0.9 : 3.2;

  return (
    <div className="relative flex items-center justify-center w-[150px] h-[150px]">
      {/* Weiches Außen-Glühen */}
      <motion.span
        aria-hidden
        className="absolute rounded-full"
        style={{
          width: 130,
          height: 130,
          background: `radial-gradient(circle, ${farbe}55 0%, ${farbe}00 70%)`,
        }}
        animate={glühenAnimation}
        transition={{ duration: glühenDauer, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Pulsierender Ring nur während der Aufnahme */}
      {istAufnahme && bewegung && (
        <motion.span
          aria-hidden
          className="absolute rounded-full border"
          style={{ width: 104, height: 104, borderColor: `${REC}99` }}
          initial={{ opacity: 0.7, scale: 1 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
        />
      )}

      <motion.button
        type="button"
        onClick={onClick}
        aria-label={BESCHRIFTUNG[zustand]}
        aria-pressed={istAufnahme}
        whileTap={{ scale: 0.94 }}
        className="relative flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        style={{
          width: 96,
          height: 96,
          background: `linear-gradient(160deg, ${farbe} 0%, ${farbe}cc 100%)`,
          boxShadow: `0 8px 30px ${farbe}66, inset 0 1px 0 rgba(255,255,255,0.25)`,
        }}
      >
        <MikrofonSymbol />
      </motion.button>
    </div>
  );
}

function MikrofonSymbol() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 1 0-7 0v5.5A3.5 3.5 0 0 0 12 15Z"
        fill="white"
      />
      <path
        d="M6 11.5a6 6 0 0 0 12 0M12 18.5V21"
        stroke="white"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
