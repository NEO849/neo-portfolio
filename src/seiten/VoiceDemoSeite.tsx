// ═══════════════════════════════════════════════════════════════════
// SEITE: VoiceDemoSeite
// ═══════════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import { SeitenMeta } from "../bausteine/SeitenMeta";
import VoiceDemoView from "../views/VoiceDemoView";

export default function VoiceDemoSeite() {
  return (
    <>
      <SeitenMeta
        titel="voice-bridge · Demo"
        beschreibung="Interaktive Simulation der voice-bridge: aufs Mikro drücken, Aufnahme-Animation, Wort-für-Wort-Transkription in die gewählte Claude-Sitzung. Reine Frontend-Demo, kein Backend."
        pfad="/voice-demo"
      />
      <motion.div
        variants={SEITEN_EINGANG}
        initial="versteckt"
        animate="sichtbar"
        exit="verlassen"
        className="pt-16"
      >
        <VoiceDemoView />
      </motion.div>
    </>
  );
}
