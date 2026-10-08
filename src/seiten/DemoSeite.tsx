// ═══════════════════════════════════════════════════════
// SEITE: DemoSeite — Route: /demo
// Interaktive, clientseitige Prompt-Injection-Demo.
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import { SeitenMeta } from "../bausteine/SeitenMeta";
import DemoView from "../views/DemoView";

export default function DemoSeite() {
  return (
    <>
      <SeitenMeta
        titel="Prompt-Injection-Demo"
        beschreibung="Prompt-Injection zum Anfassen: dieselbe Attacke gegen einen ungeschützten und einen abgesicherten KI-Chatbot, direkt im Browser. Simulation mit erfundenen Daten."
        pfad="/demo"
      />
      <motion.div
        variants={SEITEN_EINGANG}
        initial="versteckt"
        animate="sichtbar"
        exit="verlassen"
        className="pt-16"
      >
        <DemoView />
      </motion.div>
    </>
  );
}
