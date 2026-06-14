// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: AbschnittsTitel
// Einheitliche Überschriften für alle Sektionen.
// Premium: kein Terminal-Präfix (">") mehr. Stattdessen ein ruhiges
// Eyebrow-Kategorie-Label mit feiner Akzentlinie, darunter der Untertitel
// als selbstbewusster Display-Lead (Manrope).
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
  const ausrichtung = zentriert ? "items-center text-center" : "items-start text-left";
  // Alt-Aufrufer übergeben "> slug_mit_underscores" — Terminal-Zeichen weg,
  // Trenner zu Leerzeichen, als ruhiges Kategorie-Label setzen.
  const label = prefix.replace(/^[>\s]+/, "").replace(/[_]+/g, " ").trim();

  return (
    <motion.div
      className={`flex flex-col ${ausrichtung} ${klassen}`}
      variants={EINBLENDEN}
      initial="versteckt"
      whileInView="sichtbar"
      viewport={{ once: true, margin: "-80px" }}
    >
      {/* Eyebrow: feine Akzentlinie + ruhiges Mono-Kategorie-Label */}
      <span className={`flex items-center gap-2.5 mb-4 ${zentriert ? "justify-center" : ""}`}>
        <span className="h-px w-7 bg-gradient-to-r from-akzent-500/0 via-akzent-500/80 to-akzent-500/0" />
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-akzent-400/90">
          {label}
        </span>
      </span>
      {untertitel && (
        <h2 className="font-display font-semibold text-white/90 tracking-[-0.01em] leading-snug text-xl md:text-2xl max-w-2xl">
          {untertitel}
        </h2>
      )}
    </motion.div>
  );
}
