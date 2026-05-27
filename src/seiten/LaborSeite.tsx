// ═══════════════════════════════════════════════════════
// SEITE: LaborSeite
// Architektur-Manifest des Senior-Elite-Setups.
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import LaborView from "../views/LaborView";

export default function LaborSeite() {
  return (
    <motion.div
      variants={SEITEN_EINGANG}
      initial="versteckt"
      animate="sichtbar"
      exit="verlassen"
      className="pt-16"
    >
      <LaborView />
    </motion.div>
  );
}
