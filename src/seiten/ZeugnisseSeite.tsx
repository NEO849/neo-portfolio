// ═══════════════════════════════════════════════════════
// SEITE: ZeugnisseSeite
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import ZeugnisseView from "../views/ZeugnisseView";

export default function ZeugnisseSeite() {
  return (
    <motion.div
      variants={SEITEN_EINGANG}
      initial="versteckt"
      animate="sichtbar"
      exit="verlassen"
      className="pt-16"
    >
      <ZeugnisseView />
    </motion.div>
  );
}
