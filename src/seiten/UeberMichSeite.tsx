// ═══════════════════════════════════════════════════════
// SEITE: UeberMichSeite
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import { SeitenMeta } from "../bausteine/SeitenMeta";
import UeberMichView from "../views/UeberMichView";

export default function UeberMichSeite() {
  return (
    <>
      <SeitenMeta
        titel="Über mich"
        beschreibung="15 Jahre Systemverständnis aus der Elektronik, moderne Software-Architektur und offensive Security Research. Werdegang von Elektroinstallateur über iOS-Entwicklung bis Security-Researcher."
        pfad="/ueber-mich"
      />
      <motion.div
        variants={SEITEN_EINGANG}
        initial="versteckt"
        animate="sichtbar"
        exit="verlassen"
        className="pt-16"
      >
        <UeberMichView />
      </motion.div>
    </>
  );
}
