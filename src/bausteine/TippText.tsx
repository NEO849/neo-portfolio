// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: TippText
// Enthüllt einen Satz Wort für Wort — für den "wird gerade transkribiert"-
// Effekt der frisch erkannten Nachricht. Ohne Animation (oder bei
// reduzierter Bewegung) erscheint der Text sofort vollständig.
// ═══════════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { useBewegungErlaubt } from "../bewegung/hooks/useBewegungErlaubt";

interface TippTextProps {
  text: string;
  animieren?: boolean;
}

export function TippText({ text, animieren = false }: TippTextProps) {
  const bewegung = useBewegungErlaubt();

  if (!animieren || !bewegung) {
    return <span>{text}</span>;
  }

  const woerter = text.split(" ");

  return (
    <motion.span
      initial="versteckt"
      animate="sichtbar"
      transition={{ staggerChildren: 0.045 }}
      aria-label={text}
    >
      {woerter.map((wort, index) => (
        <motion.span
          key={`${wort}-${index}`}
          aria-hidden
          className="inline-block"
          variants={{
            versteckt: { opacity: 0, y: 4 },
            sichtbar: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {wort}
          {index < woerter.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}
