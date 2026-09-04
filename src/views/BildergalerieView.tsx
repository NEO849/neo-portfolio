// ═══════════════════════════════════════════════════════════════════
// VIEW: BildergalerieView
// Übersicht aller Projekt-Bildergalerien als edles Einzel-Frame-Karussell.
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
import { kategorieKonfig } from "../models/kategorieKonfiguration";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { PeekKarussell, type PeekEintrag } from "../bausteine/PeekKarussell";
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

  // Peek-Einträge je Projekt: Cover-Bild + Titel + Kategorie · n Bilder.
  // Akzentfarbe aus der Kategorie-Konfig (Single Source of Truth).
  const projektEintraege = useMemo<PeekEintrag[]>(
    () =>
      galerien.map((projekt) => {
        const konfig = kategorieKonfig(projekt.kategorie);
        const anzahl = projekt.bilder?.length ?? 0;
        return {
          quelle: projekt.bilder?.[0]?.quelle ?? "",
          titel: projekt.titel,
          // Kurzname (alles vor der Tagline „ – / — ") fürs mittige Köpfchen.
          kopfzeile: projekt.titel.split(/\s+[–—-]\s+/)[0].trim(),
          untertitel: `${konfig.label} · ${anzahl} ${anzahl === 1 ? "Bild" : "Bilder"}`,
          akzentFarbe: konfig.akzentFarbe,
        };
      }),
    [galerien],
  );

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
        untertitel="Screenshots und Einblicke aus meinen Projekten: iOS, Android, Tooling und meinem VPS-Ubuntu-Server, jeweils im Detail."
        klassen="mb-8"
      />

      {/* Peek-Karussell — mittiges Projekt prominent, Nachbarn angeschnitten.
          Tap/Enter auf die Mitte öffnet die Foto-Lightbox dieses Projekts. */}
      {galerien.length > 0 ? (
        <PeekKarussell
          eintraege={projektEintraege}
          startIndex={galerien.length > 1 ? 1 : 0}
          onOeffnen={(index) => setOffenesProjekt(galerien[index] ?? null)}
          ariaLabel="Projekt-Galerien durchblättern"
          titelOben
        />
      ) : (
        <p className="text-sm text-white/40 font-mono">Noch keine Galerien verfügbar.</p>
      )}

      {/* Lightbox — nur das geöffnete Karussell ist gemountet */}
      <BilderLightbox projekt={aktivesProjekt} onSchliessen={schliessen} />
    </section>
  );
}
