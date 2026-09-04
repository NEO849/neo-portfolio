// ═══════════════════════════════════════════════════════════════════
// SEITE: OsintToolSeite — Route: /osint-tools
// Zeigt die interaktive OSINT-Demo — das Herzstück des Portfolios.
// ═══════════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import { SeitenMeta } from "../bausteine/SeitenMeta";
import OsintDemoView from "../views/OsintDemoView";

export default function OsintToolSeite() {
  return (
    <>
      <SeitenMeta
        titel="OSINT-Lab"
        beschreibung="Interaktive OSINT-Demo: 30+ keyless Quellen für E-Mail-, Domain-, IP-, Subdomain- und Username-Analyse. Breach-Daten, Reverse-Image, PGP-Lookup, alles in einem Interface, kostenlos und passiv."
        pfad="/osint-tools"
      />
      <motion.div
        variants={SEITEN_EINGANG}
        initial="versteckt"
        animate="sichtbar"
        exit="verlassen"
        className="pt-16"
      >
        <OsintDemoView />
      </motion.div>
    </>
  );
}
