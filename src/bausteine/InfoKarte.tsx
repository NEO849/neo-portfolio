// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: InfoKarte
// Glassmorphism-Karte mit optionalem Licht-Effekt und Hover-Animation.
// Basiskomponente für alle Karten-Layouts der Website.
// ═══════════════════════════════════════════════════════════════════

import { type ReactNode, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { KartenLicht } from "../bewegung/KartenLicht";
import { TIEFENKARTE } from "../bewegung/varianten";

interface InfoKarteProps {
  children: ReactNode;
  mitLicht?: boolean;         // Maus-Licht-Effekt aktivieren
  mitHoverAnimation?: boolean;
  lichtfarbe?: string;        // RGB ohne Klammern, z.B. "99, 102, 241"
  klassen?: string;
  stil?: CSSProperties;
  akzentRand?: boolean;       // Farbiger linker Rand
  akzentFarbe?: string;       // für akzentRand
  onClick?: () => void;
}

export function InfoKarte({
  children,
  mitLicht = true,
  mitHoverAnimation = true,
  lichtfarbe = "99, 102, 241",
  klassen = "",
  stil,
  akzentRand = false,
  akzentFarbe,
  onClick,
}: InfoKarteProps) {
  const basisStil = `
    glass relative
    ${akzentRand ? "border-l-2" : ""}
    ${onClick ? "cursor-pointer" : ""}
    ${klassen}
  `;

  const randStil: CSSProperties = {
    ...stil,
    ...(akzentRand && akzentFarbe ? { borderLeftColor: akzentFarbe } : {}),
  };

  const inhalt = mitLicht ? (
    <KartenLicht
      lichtfarbe={lichtfarbe}
      intensitaet={0.1}
      radius={300}
      klassen="h-full"
    >
      {children}
    </KartenLicht>
  ) : (
    <>{children}</>
  );

  if (mitHoverAnimation) {
    return (
      <motion.div
        className={basisStil}
        style={randStil}
        variants={TIEFENKARTE}
        initial="normal"
        whileHover="hover"
        whileTap="gedrueckt"
        onClick={onClick}
      >
        {inhalt}
      </motion.div>
    );
  }

  return (
    <div className={basisStil} style={randStil} onClick={onClick}>
      {inhalt}
    </div>
  );
}
