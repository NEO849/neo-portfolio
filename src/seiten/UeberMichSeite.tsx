// ═══════════════════════════════════════════════════════
// SEITE: UeberMichSeite
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import UeberMichView from "../views/UeberMichView";

export default function UeberMichSeite() {
  return (
    <motion.div
      variants={SEITEN_EINGANG}
      initial="versteckt"
      animate="sichtbar"
      exit="verlassen"
      className="pt-16"
    >
      <UeberMichView />
    </motion.div>
  );
}
