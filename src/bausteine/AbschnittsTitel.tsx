// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: AbschnittsTitel
// Einheitliche Überschriften für alle Sektionen.
// Enthält optionalen Terminal-Prefix und Untertitel.
// ═══════════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { EINBLENDEN } from "../bewegung/varianten";

interface AbschnittsTitelProps {
  prefix: string;
  untertitel?: string;
  zentriert?: boolean;
  klassen?: string;
}

export function AbschnittsTitel({
  prefix,
  untertitel,
  zentriert = false,
  klassen = "",
}: AbschnittsTitelProps) {
  const ausrichtung = zentriert ? "text-center" : "text-left";

  return (
    <motion.div
      className={`${ausrichtung} ${klassen}`}
      variants={EINBLENDEN}
      initial="versteckt"
      whileInView="sichtbar"
      viewport={{ once: true, margin: "-80px" }}
    >
      <h2 className="font-mono text-xl md:text-2xl font-semibold text-akzent-400 mb-3 tracking-wider">
        {prefix}
      </h2>
      {untertitel && (
        <p className="text-white/70 max-w-2xl leading-relaxed">
          {untertitel}
        </p>
      )}
    </motion.div>
  );
}
