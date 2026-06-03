// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: SchliessenKnopf
// Kleines „×" oben rechts. Beim Klick dreht es sich vertikal (rotateX)
// und löst das Schließen aus — das eigentliche Wegklappen der Demo
// übernimmt die View (vertikaler Flip + Navigation).
// ═══════════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";

interface SchliessenKnopfProps {
  onSchliessen: () => void;
}

export function SchliessenKnopf({ onSchliessen }: SchliessenKnopfProps) {
  const [gedreht, setGedreht] = useState(false);

  return (
    <motion.button
      type="button"
      aria-label="Demo schließen"
      onClick={() => {
        setGedreht(true);
        onSchliessen();
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      animate={{ rotateX: gedreht ? 360 : 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformPerspective: 600 }}
      className="absolute -top-3 -right-3 z-20 grid place-items-center w-9 h-9 rounded-full border text-white/70 hover:text-white"
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{ background: "#15161a", border: "1px solid rgba(255,255,255,0.13)" }}
        aria-hidden
      />
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="relative" aria-hidden>
        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </motion.button>
  );
}
