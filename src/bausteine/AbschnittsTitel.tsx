// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: AbschnittsTitel
// Einheitliche Überschriften für alle Sektionen.
// Enthält optionalen Terminal-Prefix und Untertitel.
// ═══════════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { EINBLENDEN } from "../bewegung/varianten";

interface AbschnittsTitelProps {
  prefix?: string;          // z.B. "> projekte"
  titel: string;
  untertitel?: string;
  zentriert?: boolean;
  klassen?: string;
}

export function AbschnittsTitel({
  prefix,
  titel,
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
      {prefix && (
        <p className="font-mono text-sm text-akzent-400 mb-2 tracking-wider">
          {prefix}
        </p>
      )}
      <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
        {titel}
      </h2>
      {untertitel && (
        <p className="text-white/70 max-w-2xl leading-relaxed">
          {untertitel}
        </p>
      )}
    </motion.div>
  );
}
