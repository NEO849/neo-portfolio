// ═══════════════════════════════════════════════════════
// SEITE: KontaktSeite
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import { SeitenMeta } from "../bausteine/SeitenMeta";
import KontaktView from "../views/KontaktView";

export default function KontaktSeite() {
  return (
    <>
      <SeitenMeta
        titel="Kontakt"
        beschreibung="Michael Fleps · Nürnberg · Freelance Security Engineer & Linux/DevOps Specialist. Verfügbar für Pentest-Subcontract, DevOps-Engineering und Direkt-Mandate. GPG-Mail unterstützt."
        pfad="/kontakt"
      />
      <motion.div
        variants={SEITEN_EINGANG}
        initial="versteckt"
        animate="sichtbar"
        exit="verlassen"
        className="pt-16"
      >
        <KontaktView />
      </motion.div>
    </>
  );
}
