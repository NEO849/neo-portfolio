// ═══════════════════════════════════════════════════════
// SEITE: SecuritySeite
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import { SeitenMeta } from "../bausteine/SeitenMeta";
import SecurityView from "../views/SecurityView";

export default function SecuritySeite() {
  return (
    <>
      <SeitenMeta
        titel="Security Research"
        beschreibung="7-Schritt Master-Pipeline · 12 Scoring-Kategorien · 13 Custom-Tools · 30+ Pipeline-Skripte · 12 Hard-Gates vor jedem Submit. Bug-Bounty-Workflow vom DNS-Query bis zum validierten Report."
        pfad="/security"
      />
      <motion.div
        variants={SEITEN_EINGANG}
        initial="versteckt"
        animate="sichtbar"
        exit="verlassen"
        className="pt-16"
      >
        <SecurityView />
      </motion.div>
    </>
  );
}
