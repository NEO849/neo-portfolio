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
  const spaceIdx = prefix.indexOf(" ");
  const zeichen  = spaceIdx > -1 ? prefix.slice(0, spaceIdx) : prefix;
  const label    = spaceIdx > -1 ? prefix.slice(spaceIdx) : "";

  return (
    <motion.div
      className={`${ausrichtung} ${klassen}`}
      variants={EINBLENDEN}
      initial="versteckt"
      whileInView="sichtbar"
      viewport={{ once: true, margin: "-80px" }}
    >
      <h2 className="font-mono text-xl md:text-2xl font-semibold tracking-wider mb-3">
        <span className="text-akzent-400">{zeichen}</span>
        {label && <span className="text-white/70">{label}</span>}
      </h2>
      {untertitel && (
        <p className="text-white/70 max-w-2xl leading-relaxed">
          {untertitel}
        </p>
      )}
    </motion.div>
  );
}
