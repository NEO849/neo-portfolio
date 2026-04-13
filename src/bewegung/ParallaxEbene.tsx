// ═══════════════════════════════════════════════════════════════════
// BEWEGUNG: ParallaxEbene — Scroll-basierte Tiefenwirkung
// Elemente bewegen sich beim Scrollen unterschiedlich schnell.
// Aufgabe: Räumliche Tiefe erzeugen (vorne/hinten Gefühl)
// Verwendung: <ParallaxEbene geschwindigkeit={0.3}> Element </ParallaxEbene>
// ═══════════════════════════════════════════════════════════════════

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useBewegungErlaubt } from "./hooks/useBewegungErlaubt";

interface ParallaxEbeneProps {
  children: ReactNode;
  geschwindigkeit?: number;   // negativ = langsamer (tiefer), positiv = schneller (näher)
  klassen?: string;
}

export function ParallaxEbene({
  children,
  geschwindigkeit = -0.2,
  klassen = "",
}: ParallaxEbeneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const bewegungErlaubt = useBewegungErlaubt();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${geschwindigkeit * -100}px`, `${geschwindigkeit * 100}px`]
  );

  if (!bewegungErlaubt) {
    return <div className={klassen}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={klassen}
    >
      {children}
    </motion.div>
  );
}
