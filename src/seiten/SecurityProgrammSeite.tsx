// ═══════════════════════════════════════════════════════
// SEITE: SecurityProgrammSeite
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import { SeitenMeta } from "../bausteine/SeitenMeta";
import SecurityProgrammView from "../views/SecurityProgrammView";

export default function SecurityProgrammSeite() {
  return (
    <>
      <SeitenMeta
        titel="Security-Programm · Sicherheit auf Erfolgsbasis"
        beschreibung="Autorisiertes Sicherheits-Testprogramm mit schriftlicher Freigabe, Prämie nur bei nachgewiesenem Fund. Web-/API- und KI-Sicherheit. Region Nürnberg + Remote."
        pfad="/security-programm"
      />
      <motion.div
        variants={SEITEN_EINGANG}
        initial="versteckt"
        animate="sichtbar"
        exit="verlassen"
        className="pt-16"
      >
        <SecurityProgrammView />
      </motion.div>
    </>
  );
}
