// ═══════════════════════════════════════════════════════════════════
// VIEW: BildergalerieView
// Übersicht aller Projekt-Bildergalerien als Cover-Kachel-Raster.
//
// Galerien werden DYNAMISCH aus PROJEKTE abgeleitet (galerieSlug + Bilder
// vorhanden) — nichts hartkodiert. Klick auf eine Kachel öffnet das
// jeweilige Projekt in der fokus-getrappten BilderLightbox; nur das
// geöffnete Karussell ist gemountet.
//
// Trennstelle für spätere Server-Galerien: der Selektor `galerienLaden`
// liefert die Datenform (ProjektModel[]); ein künftiger Adapter kann hier
// dieselbe Form aus einer API liefern, ohne die View zu ändern.
// ═══════════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PROJEKTE } from "../models/daten";
import type { ProjektModel } from "../models/typen";
import { zahlwort } from "../hilfsmittel/formatierung";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { GlassTabs, type GlassTab } from "../bausteine/GlassTabs";
import { GalerieCoverflow } from "../bausteine/GalerieCoverflow";
import { BilderLightbox } from "../bausteine/BilderLightbox";

// ─── Daten-Selektor (Adapter-Trennstelle) ─────────────────────────
// Einzige Stelle, die entscheidet, welche Projekte eine Galerie haben.
// Lokale Quelle heute; ein Server-Adapter liefert später dieselbe Form.
export function galerienLaden(quelle: ProjektModel[] = PROJEKTE): ProjektModel[] {
  return quelle.filter((p) => p.galerieSlug && (p.bilder?.length ?? 0) > 0);
}

const FILTER_TABS: GlassTab[] = [
  { id: "alle",        label: "Alle" },
  { id: "security",    label: "Security" },
  { id: "development", label: "Mobil" },
  { id: "tooling",     label: "Tooling" },
];

interface BildergalerieViewProps {
  /** Deep-Link-Slug: die passende Galerie wird automatisch geöffnet. */
  startSlug?: string;
  /** Aufgerufen, wenn die Lightbox geschlossen wird (URL zurücksetzen). */
  onLightboxSchliessen?: () => void;
}

// ─── Haupt-View ───────────────────────────────────────────────────

export default function BildergalerieView({ startSlug, onLightboxSchliessen }: BildergalerieViewProps) {
  const galerien = useMemo(() => galerienLaden(), []);
  const [aktiverFilter, setAktiverFilter] = useState<string>("alle");
  const [offenesProjekt, setOffenesProjekt] = useState<ProjektModel | null>(null);

  // Deep-Link: das per startSlug referenzierte Projekt öffnen.
  // Über useMemo abgeleitet — kein Effect-State-Echo, kein History-Spam.
  const deepLinkProjekt = useMemo(
    () => (startSlug ? galerien.find((p) => p.galerieSlug === startSlug) ?? null : null),
    [startSlug, galerien],
  );

  // Effektiv geöffnet: explizit angeklickt ODER per Deep-Link.
  const aktivesProjekt = offenesProjekt ?? deepLinkProjekt;

  const gefiltert =
    aktiverFilter === "alle"
      ? galerien
      : galerien.filter((p) => p.kategorie === aktiverFilter);

  function schliessen() {
    setOffenesProjekt(null);
    onLightboxSchliessen?.();
  }

  return (
    <section id="bilder" className="py-16 px-6 max-w-5xl mx-auto">
      <AbschnittsTitel
        prefix="> bilder"
        untertitel={`Screenshots und Einblicke aus ${zahlwort(galerien.length)} Projekten – iOS, Android und Tooling, jeweils im Detail.`}
        klassen="mb-8"
      />

      {/* Filter-Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mb-7"
      >
        <GlassTabs
          tabs={FILTER_TABS}
          activeId={aktiverFilter}
          onTabChange={setAktiverFilter}
          layoutId="bilder-filter"
          scrollable={true}
          ariaLabel="Galerien nach Kategorie filtern"
          buttonClassName="min-w-[80px] px-4 text-sm"
        />
      </motion.div>

      {/* Cover-Flow — filmische Auswahl zwischen den Galerien */}
      {gefiltert.length > 0 ? (
        <GalerieCoverflow
          key={aktiverFilter}
          galerien={gefiltert}
          onOeffnen={setOffenesProjekt}
        />
      ) : (
        <p className="text-sm text-white/40 font-mono">Keine Galerien in dieser Kategorie.</p>
      )}

      {/* Lightbox — nur das geöffnete Karussell ist gemountet */}
      <BilderLightbox projekt={aktivesProjekt} onSchliessen={schliessen} />
    </section>
  );
}
