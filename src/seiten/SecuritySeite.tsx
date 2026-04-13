// ═══════════════════════════════════════════════════════
// SEITE: SecuritySeite
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import SecurityView from "../views/SecurityView";

export default function SecuritySeite() {
  return (
    <motion.div
      variants={SEITEN_EINGANG}
      initial="versteckt"
      animate="sichtbar"
      exit="verlassen"
      className="pt-16"
    >
      <SecurityView />
    </motion.div>
  );
}
