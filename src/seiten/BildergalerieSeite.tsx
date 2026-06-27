// ═══════════════════════════════════════════════════════════════════
// SEITE: BildergalerieSeite
// Route-Hülle für die Bildergalerie-Übersicht ("/bilder" + "/bilder/:slug").
// Liest den optionalen Deep-Link-Slug, reicht ihn an die View und setzt
// die URL beim Schließen der Lightbox zurück auf "/bilder" (kein
// History-Spam). Unbekannter Slug → sanfte Umleitung auf "/bilder".
// ═══════════════════════════════════════════════════════════════════

import { useParams, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import { SeitenMeta } from "../bausteine/SeitenMeta";
import { GALERIE_BASIS } from "../hilfsmittel/galeriePfad";
import { galerienLaden } from "../views/BildergalerieView";
import BildergalerieView from "../views/BildergalerieView";

export default function BildergalerieSeite() {
  const { slug } = useParams<{ slug: string }>();
  const navigieren = useNavigate();

  // Deep-Link gesetzt, aber Slug existiert nicht → sanft zur Übersicht.
  if (slug && !galerienLaden().some((p) => p.galerieSlug === slug)) {
    return <Navigate to={GALERIE_BASIS} replace />;
  }

  return (
    <>
      <SeitenMeta
        titel="Bilder"
        beschreibung="Bildergalerien meiner Projekte: Screenshots und Einblicke aus iOS- und Android-Apps sowie eigenen Security- und KI-Tools — markmem, Sports Almanach, Z Almanach."
        pfad={GALERIE_BASIS}
      />
      <motion.div
        variants={SEITEN_EINGANG}
        initial="versteckt"
        animate="sichtbar"
        exit="verlassen"
        className="pt-16"
      >
        <BildergalerieView
          startSlug={slug}
          onLightboxSchliessen={() => navigieren(GALERIE_BASIS, { replace: true })}
        />
      </motion.div>
    </>
  );
}
