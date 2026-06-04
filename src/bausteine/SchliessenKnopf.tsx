// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: SchliessenKnopf
// Quadratischer „×"-Knopf in der Topbar des Klons. Beim Klick dreht er
// sich vertikal (rotateX) und löst das Schließen aus — das eigentliche
// Wegklappen der Demo übernimmt die View (vertikaler Flip + Navigation).
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
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      animate={{ rotateX: gedreht ? 360 : 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformPerspective: 600, border: "1px solid rgba(255,255,255,0.13)", background: "#1c1d22" }}
      className="grid place-items-center w-10 h-10 rounded-[11px] text-white/70 hover:text-white"
    >
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </motion.button>
  );
}
