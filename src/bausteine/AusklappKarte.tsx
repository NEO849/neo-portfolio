// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: AusklappKarte
// Gemeinsames Gerüst für alle aufklappbaren Karten (Projekte, Über-mich,
// Labor) — eine Quelle, kein Drift. Die ganze Karte ist klickbar, oben
// rechts dreht ein „+" zu „×", und der Detail-Bereich öffnet mit einer
// Trennlinie. Der wechselnde Inhalt kommt über `kopf` (eingeklappt) und
// `detail` (ausgeklappt) herein.
// ═══════════════════════════════════════════════════════════════════

import { type ReactNode, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { InfoKarte } from "./InfoKarte";

interface AusklappKarteProps {
  /** RGB ohne Klammern, z.B. "99, 102, 241" — für Licht-/Hover-Effekt. */
  lichtfarbe: string;
  /** CSS-Farbe (Hex oder rgb()) für linken Akzentrand + „+"-Toggle. */
  akzentFarbe: string;
  offen: boolean;
  onUmschalten: () => void;
  kopf: ReactNode;
  detail: ReactNode;
  stil?: CSSProperties;
}

export function AusklappKarte({
  lichtfarbe,
  akzentFarbe,
  offen,
  onUmschalten,
  kopf,
  detail,
  stil,
}: AusklappKarteProps) {
  return (
    <InfoKarte
      lichtfarbe={lichtfarbe}
      akzentRand
      akzentFarbe={akzentFarbe}
      mitHoverAnimation={!offen}
      klassen="relative overflow-hidden"
      stil={stil}
    >
      <button
        type="button"
        onClick={onUmschalten}
        aria-expanded={offen}
        className="relative w-full text-left p-5 md:p-6 focus-visible:outline-none"
      >
        <motion.span
          animate={{ rotate: offen ? 45 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="absolute top-5 right-5 md:top-6 md:right-6 text-xl leading-none"
          style={{ color: akzentFarbe, opacity: offen ? 0.85 : 0.45 }}
          aria-hidden="true"
        >
          +
        </motion.span>
        <div className="pr-7">{kopf}</div>
      </button>

      <AnimatePresence initial={false}>
        {offen && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-5 md:pb-6 border-t border-white/[0.05] pt-4">
              {detail}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </InfoKarte>
  );
}
