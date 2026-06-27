// ═══════════════════════════════════════════════════════
// SEITE: ProjekteSeite
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import { SeitenMeta } from "../bausteine/SeitenMeta";
import ProjekteView from "../views/ProjekteView";

export default function ProjekteSeite() {
  return (
    <>
      <SeitenMeta
        titel="Projekte"
        beschreibung="Neo Dev Stack · markmem KI-Gedächtnis (Open Source) · NeoRecon Research Pipeline · claude-bus Mac↔Server↔iPhone · Voice-Bridge · bb_recon OSINT-Toolkit · ONE iOS · Sports Almanach · Z Almanach · OSINT Toolkit."
        pfad="/projekte"
      />
      <motion.div
        variants={SEITEN_EINGANG}
        initial="versteckt"
        animate="sichtbar"
        exit="verlassen"
        className="pt-16"
      >
        <ProjekteView />
      </motion.div>
    </>
  );
}
