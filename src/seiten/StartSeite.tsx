// ═══════════════════════════════════════════════════════════════════
// SEITE: StartSeite — Route: /
// Montiert die Hero-Sektion und weitere Start-Inhalte.
// ═══════════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import { SeitenMeta } from "../bausteine/SeitenMeta";
import HeroView from "../views/HeroView";

export default function StartSeite() {
  return (
    <>
      <SeitenMeta
        titel="Security Researcher & iOS Developer"
        beschreibung="Michael Fleps — Security-Researcher (HackerOne · Intigriti · YesWeHack), iOS-Entwickler und Linux-Specialist aus Nürnberg. AI-augmentierte Security-Pipeline, Custom OSINT-Toolkit, eigene MCP-Server."
        pfad="/"
      />
      <motion.div
        variants={SEITEN_EINGANG}
        initial="versteckt"
        animate="sichtbar"
        exit="verlassen"
      >
        <HeroView />
      </motion.div>
    </>
  );
}
