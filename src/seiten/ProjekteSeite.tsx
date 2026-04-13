// ═══════════════════════════════════════════════════════
// SEITE: ProjekteSeite
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import ProjekteView from "../views/ProjekteView";

export default function ProjekteSeite() {
  return (
    <motion.div
      variants={SEITEN_EINGANG}
      initial="versteckt"
      animate="sichtbar"
      exit="verlassen"
      className="pt-16"
    >
      <ProjekteView />
    </motion.div>
  );
}
