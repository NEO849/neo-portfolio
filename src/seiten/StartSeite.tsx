// ═══════════════════════════════════════════════════════════════════
// SEITE: StartSeite — Route: /
// Montiert die Hero-Sektion und weitere Start-Inhalte.
// ═══════════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import HeroView from "../views/HeroView";

export default function StartSeite() {
  return (
    <motion.div
      variants={SEITEN_EINGANG}
      initial="versteckt"
      animate="sichtbar"
      exit="verlassen"
    >
      <HeroView />
    </motion.div>
  );
}
