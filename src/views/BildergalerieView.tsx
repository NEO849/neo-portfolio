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
import { kategorieKonfig } from "../models/kategorieKonfiguration";
import { zahlwort } from "../hilfsmittel/formatierung";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { GlassTabs, type GlassTab } from "../bausteine/GlassTabs";
import { STAFFEL_CONTAINER, STAFFEL_KIND } from "../bewegung/varianten";
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

// ─── Cover-Kachel ─────────────────────────────────────────────────

function GalerieKachel({
  projekt,
  onOeffnen,
}: {
  projekt: ProjektModel;
  onOeffnen: (projekt: ProjektModel) => void;
}) {
  const konfig = kategorieKonfig(projekt.kategorie);
  const cover = projekt.bilder?.[0];
  const anzahl = projekt.bilder?.length ?? 0;
  if (!cover) return null;

  return (
    <button
      type="button"
      onClick={() => onOeffnen(projekt)}
      aria-label={`Bildergalerie öffnen: ${projekt.titel} (${anzahl} Bilder)`}
      className="group text-left w-full rounded-2xl border border-white/[0.08] bg-grund-950 overflow-hidden
                 transition-all duration-200 hover:border-white/20
                 focus:outline-none focus:ring-2 focus:ring-white/25 focus:ring-offset-2 focus:ring-offset-grund-950"
    >
      {/* Cover — festes Seitenverhältnis gegen Layout-Shift */}
      <div className="relative aspect-[16/10] overflow-hidden bg-grund-900">
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-60"
          style={{ background: `radial-gradient(70% 60% at 50% 0%, ${konfig.akzentFarbe}1f, transparent 72%)` }}
          aria-hidden="true"
        />
        <img
          src={cover.quelle}
          alt={`Vorschau ${projekt.titel}: ${cover.titel}`}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover object-top
                     transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        {/* Bilderzähler */}
        <span
          className="absolute top-2.5 right-2.5 z-20 font-mono text-[11px] px-2 py-1 rounded-md
                     bg-grund-950/75 border border-white/10 text-white/75 backdrop-blur-sm"
        >
          {anzahl} {anzahl === 1 ? "Bild" : "Bilder"}
        </span>
      </div>

      {/* Fuß: Badge + Titel */}
      <div className="px-4 py-3.5">
        <span
          className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wide
                     rounded-full px-2 py-0.5 border"
          style={{
            color: konfig.akzentFarbe,
            borderColor: `${konfig.akzentFarbe}3a`,
            background: `${konfig.akzentFarbe}12`,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: konfig.akzentFarbe }} aria-hidden="true" />
          {konfig.label}
        </span>
        <h3 className="font-display text-base font-bold text-white leading-snug mt-2 group-hover:text-white">
          {projekt.titel}
        </h3>
      </div>
    </button>
  );
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

      {/* Kachel-Raster — gestaffelt */}
      {gefiltert.length > 0 ? (
        <motion.div
          key={aktiverFilter}
          variants={STAFFEL_CONTAINER}
          initial="versteckt"
          animate="sichtbar"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {gefiltert.map((projekt) => (
            <motion.div key={projekt.galerieSlug} variants={STAFFEL_KIND}>
              <GalerieKachel projekt={projekt} onOeffnen={setOffenesProjekt} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="text-sm text-white/40 font-mono">Keine Galerien in dieser Kategorie.</p>
      )}

      {/* Lightbox — nur das geöffnete Karussell ist gemountet */}
      <BilderLightbox projekt={aktivesProjekt} onSchliessen={schliessen} />
    </section>
  );
}
