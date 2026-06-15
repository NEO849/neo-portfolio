// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: AbschnittsTitel
// Einheitliche Überschriften für alle Sektionen.
// Premium: kein Terminal-Präfix (">") mehr. Stattdessen ein ruhiges
// Eyebrow-Kategorie-Label mit feiner Akzentlinie, darunter der Untertitel
// als selbstbewusster Display-Lead (Manrope).
// ═══════════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { EINBLENDEN } from "../bewegung/varianten";
import { GlanzUeberschrift } from "../bewegung/GlanzUeberschrift";
import { Augenbraue } from "./Augenbraue";

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
      {/* Eyebrow: gemeinsame Augenbraue-Komponente (eine Quelle der Wahrheit) */}
      <Augenbraue text={label} zentriert={zentriert} klassen="mb-4" />
      {untertitel && (
        <GlanzUeberschrift
          element="h2"
          klassen="font-display font-semibold tracking-[-0.01em] leading-snug text-xl md:text-2xl max-w-2xl"
          kinder={untertitel}
        />
      )}
    </motion.div>
  );
}
