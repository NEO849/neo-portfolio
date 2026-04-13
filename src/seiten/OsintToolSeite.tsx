// ═══════════════════════════════════════════════════════════════════
// SEITE: OsintToolSeite — Route: /osint-tools
// Zeigt die interaktive OSINT-Demo — das Herzstück des Portfolios.
// In Phase 4 wird hier das echte Backend angebunden.
// ═══════════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import OsintDemoView from "../views/OsintDemoView";

export default function OsintToolSeite() {
  return (
    <motion.div
      variants={SEITEN_EINGANG}
      initial="versteckt"
      animate="sichtbar"
      exit="verlassen"
      className="pt-16"
    >
      <OsintDemoView />
    </motion.div>
  );
}
