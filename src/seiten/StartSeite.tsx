// ═══════════════════════════════════════════════════════════════════
// SEITE: StartSeite — Route: /
// Montiert die Hero-Sektion und weitere Start-Inhalte.
// ═══════════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import { SeitenMeta } from "../bausteine/SeitenMeta";
import HeroView from "../views/HeroView";
import LeistungenView from "../views/LeistungenView";

export default function StartSeite() {
  return (
    <>
      <SeitenMeta
        titel="KI-Automation, Infrastruktur & Security"
        beschreibung="FREE DATA Solutions: Michael Fleps aus Nürnberg baut und betreibt produktive KI-Automation, gehärtete Linux-Infrastruktur und Security-Reviews. Remote, sofort verfügbar."
        pfad="/"
      />
      <motion.div
        variants={SEITEN_EINGANG}
        initial="versteckt"
        animate="sichtbar"
        exit="verlassen"
      >
        <HeroView />
        <LeistungenView />
      </motion.div>
    </>
  );
}
