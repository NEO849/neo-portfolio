// ═══════════════════════════════════════════════════════════════════
// BEWEGUNG: ScrollReveal — einheitliche Blur-to-Sharp-Inszenierung
// Abschnitte erscheinen nicht — sie werden in Fokus geholt.
// EIN konsistenter Reveal für die ganze Seite ("aus einem Guss").
// ═══════════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useBewegungErlaubt } from "./hooks/useBewegungErlaubt";
import { KURVEN } from "./varianten";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  blur?: number;
  dauer?: number;
  einmal?: boolean;
  klassen?: string;
}

export function ScrollReveal({
  children,
  delay = 0,
  y = 26,
  blur = 10,
  dauer = 0.8,
  einmal = true,
  klassen = "",
}: ScrollRevealProps) {
  const erlaubt = useBewegungErlaubt();

  if (!erlaubt) return <div className={klassen}>{children}</div>;

  return (
    <motion.div
      className={klassen}
      initial={{ opacity: 0, y, filter: `blur(${blur}px)` }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: einmal, margin: "-80px" }}
      transition={{ duration: dauer, ease: KURVEN.expressiv, delay }}
    >
      {children}
    </motion.div>
  );
}
