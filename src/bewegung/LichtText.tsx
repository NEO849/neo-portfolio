// ═══════════════════════════════════════════════════════════════════
// BEWEGUNG: LichtText — Headline mit wanderndem Licht
// Eine hochwertige Lichtquelle streicht langsam über die Buchstaben.
// Tritt per Blur-to-Sharp in Fokus. Ruhig, teuer, kein Neon.
// ═══════════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { useBewegungErlaubt } from "./hooks/useBewegungErlaubt";
import { UNSCHARF_REVEAL } from "./varianten";

type TagName = "h1" | "h2" | "h3" | "p" | "span";

const TAGS = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  span: motion.span,
} as const;

interface LichtTextProps {
  text: string;
  element?: TagName;
  klassen?: string;
  verzoegerung?: number;
  /** true = beim Scroll-in; false = sofort (z. B. Hero). */
  scroll?: boolean;
  /** Lichtsweep über die Buchstaben (Standard an). */
  sweep?: boolean;
}

export function LichtText({
  text,
  element = "h2",
  klassen = "",
  verzoegerung = 0,
  scroll = true,
  sweep = true,
}: LichtTextProps) {
  const erlaubt = useBewegungErlaubt();
  const Tag = TAGS[element];

  // Ohne Bewegung: statisch, voll lesbar (Sweep eingefroren via CSS-Guard).
  if (!erlaubt) {
    const Plain = element;
    return <Plain className={`${sweep ? "licht-name " : ""}${klassen}`}>{text}</Plain>;
  }

  const ablauf = scroll
    ? { initial: "versteckt" as const, whileInView: "sichtbar" as const, viewport: { once: true, margin: "-70px" } }
    : { initial: "versteckt" as const, animate: "sichtbar" as const };

  return (
    <Tag
      className={`${sweep ? "licht-name " : ""}${klassen}`}
      variants={UNSCHARF_REVEAL}
      transition={{ delay: verzoegerung }}
      {...ablauf}
    >
      {text}
    </Tag>
  );
}
