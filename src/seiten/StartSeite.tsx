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
        titel="Sichere KI-Automation & KI-automatisierte Pentests"
        beschreibung="FREE DATA Solutions: Michael Fleps aus Nürnberg baut KI-Automation, sichert KI-Systeme ab und prüft sie mit KI-automatisierten Pentests — aus einer Hand. Remote im DACH-Raum."
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
