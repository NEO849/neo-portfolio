// ═══════════════════════════════════════════════════════
// SEITE: KontaktSeite
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import KontaktView from "../views/KontaktView";

export default function KontaktSeite() {
  return (
    <motion.div
      variants={SEITEN_EINGANG}
      initial="versteckt"
      animate="sichtbar"
      exit="verlassen"
      className="pt-16"
    >
      <KontaktView />
    </motion.div>
  );
}
