// ═══════════════════════════════════════════════════════
// SEITE: LaborSeite
// Architektur-Manifest des Senior-Elite-Setups.
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import { SeitenMeta } from "../bausteine/SeitenMeta";
import LaborView from "../views/LaborView";

export default function LaborSeite() {
  return (
    <>
      <SeitenMeta
        titel="Labor — Senior-Elite Architektur"
        beschreibung="Selbst-lernendes Memory-System v2 · 25 MCP-Server · 32 Pentest-Agents · 11 Skills · 11 Slash-Commands · 12 systemd-Workflows · 12 Hard-Gates. Architektur-Manifest eines Senior-Security-Engineering-Setups."
        pfad="/labor"
      />
      <motion.div
        variants={SEITEN_EINGANG}
        initial="versteckt"
        animate="sichtbar"
        exit="verlassen"
        className="pt-16"
      >
        <LaborView />
      </motion.div>
    </>
  );
}
