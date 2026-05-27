// ═══════════════════════════════════════════════════════
// SEITE: ZeugnisseSeite
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import { SeitenMeta } from "../bausteine/SeitenMeta";
import ZeugnisseView from "../views/ZeugnisseView";

export default function ZeugnisseSeite() {
  return (
    <>
      <SeitenMeta
        titel="Dokumente & Zertifikate"
        beschreibung="Gesellenbrief Elektroinstallateur (HWK 2003) · Syntax Institut IT-Fachkraft App-Entwicklung iOS/Android (CERTQUA, DIN EN ISO 9001, 2.300 UE)."
        pfad="/zeugnisse"
      />
      <motion.div
        variants={SEITEN_EINGANG}
        initial="versteckt"
        animate="sichtbar"
        exit="verlassen"
        className="pt-16"
      >
        <ZeugnisseView />
      </motion.div>
    </>
  );
}
