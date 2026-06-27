// ═══════════════════════════════════════════════════════════════════
// VIEW: BildergalerieView
// Übersicht aller Projekt-Bildergalerien als filmischer Cover-Flow.
//
// Galerien werden DYNAMISCH aus PROJEKTE abgeleitet (galerieSlug + Bilder
// vorhanden) — nichts hartkodiert. Klick auf die Fokus-Karte öffnet das
// jeweilige Projekt in der fokus-getrappten BilderLightbox; nur das
// geöffnete Karussell ist gemountet.
//
// Trennstelle für spätere Server-Galerien: der Selektor `galerienLaden`
// liefert die Datenform (ProjektModel[]); ein künftiger Adapter kann hier
// dieselbe Form aus einer API liefern, ohne die View zu ändern.
// ═══════════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { PROJEKTE } from "../models/daten";
import type { ProjektModel } from "../models/typen";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { GalerieCoverflow } from "../bausteine/GalerieCoverflow";
import { BilderLightbox } from "../bausteine/BilderLightbox";

// ─── Daten-Selektor (Adapter-Trennstelle) ─────────────────────────
// Einzige Stelle, die entscheidet, welche Projekte eine Galerie haben.
// Lokale Quelle heute; ein Server-Adapter liefert später dieselbe Form.
export function galerienLaden(quelle: ProjektModel[] = PROJEKTE): ProjektModel[] {
  return quelle.filter((p) => p.galerieSlug && (p.bilder?.length ?? 0) > 0);
}

interface BildergalerieViewProps {
  /** Deep-Link-Slug: die passende Galerie wird automatisch geöffnet. */
  startSlug?: string;
  /** Aufgerufen, wenn die Lightbox geschlossen wird (URL zurücksetzen). */
  onLightboxSchliessen?: () => void;
}

// ─── Haupt-View ───────────────────────────────────────────────────

export default function BildergalerieView({ startSlug, onLightboxSchliessen }: BildergalerieViewProps) {
  const galerien = useMemo(() => galerienLaden(), []);
  const [offenesProjekt, setOffenesProjekt] = useState<ProjektModel | null>(null);

  // Deep-Link: das per startSlug referenzierte Projekt öffnen.
  // Über useMemo abgeleitet — kein Effect-State-Echo, kein History-Spam.
  const deepLinkProjekt = useMemo(
    () => (startSlug ? galerien.find((p) => p.galerieSlug === startSlug) ?? null : null),
    [startSlug, galerien],
  );

  // Effektiv geöffnet: explizit angeklickt ODER per Deep-Link.
  const aktivesProjekt = offenesProjekt ?? deepLinkProjekt;

  function schliessen() {
    setOffenesProjekt(null);
    onLightboxSchliessen?.();
  }

  return (
    <section id="bilder" className="py-16 px-6 max-w-5xl mx-auto">
      <AbschnittsTitel
        prefix="> bilder"
        untertitel="Screenshots und Einblicke aus meinen Projekten – iOS, Android, Tooling und meinem VPS-Ubuntu-Server, jeweils im Detail."
        klassen="mb-8"
      />

      {/* Cover-Flow — filmische Auswahl zwischen den Galerien */}
      {galerien.length > 0 ? (
        <GalerieCoverflow galerien={galerien} onOeffnen={setOffenesProjekt} />
      ) : (
        <p className="text-sm text-white/40 font-mono">Noch keine Galerien verfügbar.</p>
      )}

      {/* Lightbox — nur das geöffnete Karussell ist gemountet */}
      <BilderLightbox projekt={aktivesProjekt} onSchliessen={schliessen} />
    </section>
  );
}
