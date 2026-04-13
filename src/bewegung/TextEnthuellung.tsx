// ═══════════════════════════════════════════════════════════════════
// BEWEGUNG: TextEnthuellung — Wort-für-Wort Reveal
// Überschriften erscheinen nicht einfach — sie werden enthüllt.
// Aufgabe: Fokus lenken, Wichtigkeit signalisieren
// Verwendung: <TextEnthuellung text="Titel hier" element="h1" />
// ═══════════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { useBewegungErlaubt } from "./hooks/useBewegungErlaubt";
import { TEXTREVEAL_CONTAINER, TEXTREVEAL_WORT, KURVEN } from "./varianten";

interface TextEnthuellungProps {
  text: string;
  element?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  klassen?: string;
  verzoegerung?: number;
  einmal?: boolean;   // true = nur einmal animieren (beim ersten Erscheinen)
}

export function TextEnthuellung({
  text,
  element: Element = "h2",
  klassen = "",
  verzoegerung = 0,
  einmal = true,
}: TextEnthuellungProps) {
  const bewegungErlaubt = useBewegungErlaubt();
  const woerter = text.split(" ");

  // Ohne Bewegung: einfach rendern
  if (!bewegungErlaubt) {
    return <Element className={klassen}>{text}</Element>;
  }

  return (
    <motion.div
      className={`overflow-hidden ${klassen}`}
      variants={{
        ...TEXTREVEAL_CONTAINER,
        sichtbar: {
          ...(TEXTREVEAL_CONTAINER.sichtbar as object),
          transition: {
            staggerChildren: 0.035,
            delayChildren: verzoegerung,
          },
        },
      }}
      initial="versteckt"
      whileInView="sichtbar"
      viewport={{ once: einmal, margin: "-60px" }}
    >
      <Element
        className="flex flex-wrap gap-x-[0.25em]"
        style={{ margin: 0 }}
      >
        {woerter.map((wort, index) => (
          <span
            key={`${wort}-${index}`}
            style={{ overflow: "hidden", display: "inline-block" }}
          >
            <motion.span
              variants={TEXTREVEAL_WORT}
              style={{ display: "inline-block" }}
            >
              {wort}
            </motion.span>
          </span>
        ))}
      </Element>
    </motion.div>
  );
}

// ─── Buchstaben-Variante für Hero-Namen ──────────────────────────
interface BuchstabenEnthuellungProps {
  text: string;
  klassen?: string;
  verzoegerung?: number;
  buchstabenKlassen?: string;
}

export function BuchstabenEnthuellung({
  text,
  klassen = "",
  verzoegerung = 0,
  buchstabenKlassen = "",
}: BuchstabenEnthuellungProps) {
  const bewegungErlaubt = useBewegungErlaubt();
  const buchstaben = text.split("");

  if (!bewegungErlaubt) {
    return <span className={klassen}>{text}</span>;
  }

  return (
    <span className={`inline-flex ${klassen}`}>
      {buchstaben.map((buchstabe, index) => (
        <motion.span
          key={`${buchstabe}-${index}`}
          className={buchstabenKlassen}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: verzoegerung + index * 0.04,
            ease: KURVEN.expressiv,
          }}
          style={{ display: "inline-block" }}
        >
          {buchstabe === " " ? "\u00A0" : buchstabe}
        </motion.span>
      ))}
    </span>
  );
}
