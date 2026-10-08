// ═══════════════════════════════════════════════════════
// SEITE: ReferenzenSeite — Route: /referenzen
// Proof: Case-Study, Beispiel-Bericht, Demo-Verweis.
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import { SeitenMeta } from "../bausteine/SeitenMeta";
import ReferenzenView from "../views/ReferenzenView";

export default function ReferenzenSeite() {
  return (
    <>
      <SeitenMeta
        titel="Referenzen & Belege"
        beschreibung="Belege statt Behauptungen: ein anonymisierter echter Fund aus einem autorisierten KI-Sicherheits-Wettbewerb, ein Beispiel-Bericht und eine Prompt-Injection-Demo zum Anfassen."
        pfad="/referenzen"
      />
      <motion.div
        variants={SEITEN_EINGANG}
        initial="versteckt"
        animate="sichtbar"
        exit="verlassen"
        className="pt-16"
      >
        <ReferenzenView />
      </motion.div>
    </>
  );
}
