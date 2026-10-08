// ═══════════════════════════════════════════════════════
// SEITE: VorgehensweiseSeite — Route: /vorgehensweise
// Zeigt die Arbeitsweise als interaktiven Prozess-Graph.
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import { SeitenMeta } from "../bausteine/SeitenMeta";
import VorgehensweiseView from "../views/VorgehensweiseView";

export default function VorgehensweiseSeite() {
  return (
    <>
      <SeitenMeta
        titel="Vorgehensweise"
        beschreibung="Sichere KI-Automation von Anfang bis Ende: in vier Phasen von der Idee zum laufenden Betrieb — Verstehen, Bauen, Absichern, Betrieb. Sicherheit ist fester Teil des Prozesses, nicht ein letzter Schritt."
        pfad="/vorgehensweise"
      />
      <motion.div
        variants={SEITEN_EINGANG}
        initial="versteckt"
        animate="sichtbar"
        exit="verlassen"
        className="pt-16"
      >
        <VorgehensweiseView />
      </motion.div>
    </>
  );
}
