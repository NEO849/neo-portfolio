// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: BilderLightbox
// Fokus-getrapptes Vollbild-Overlay für die Projekt-Bildergalerie.
//
// A11y-Muster bewusst konsistent zu LegalModal:
//   · Portal-artiges fixed-Overlay + Backdrop mit Blur
//   · role="dialog" + aria-modal, beschriftet über den Projekt-Titel
//   · ESC / Backdrop-Klick / SchliessenKnopf schließen
//   · Scroll-Lock am <body>, solange offen
//   · Fokus-Falle (Tab/Shift+Tab zirkulär), Fokus-Rückgabe an den Auslöser
//   · prefers-reduced-motion respektiert (Framer Motion automatisch)
//
// Darin dasselbe PeekKarussell wie in der Auswahl — hier für ALLE Fotos
// des Projekts (kein onOeffnen = reines Durchblättern). So sehen Auswahl
// und Fotos identisch aus (konsistenter Flow).
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProjektModel } from "../models/typen";
import { kategorieKonfig } from "../models/kategorieKonfiguration";
import { PeekKarussell, type PeekEintrag } from "./PeekKarussell";
import { SchliessenKnopf } from "./SchliessenKnopf";

interface BilderLightboxProps {
  /** Das anzuzeigende Projekt — null/ohne Bilder = Overlay zu. */
  projekt: ProjektModel | null;
  onSchliessen: () => void;
}

// Alle fokussierbaren Elemente innerhalb eines Containers.
const FOKUSSIERBAR =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function BilderLightbox({ projekt, onSchliessen }: BilderLightboxProps) {
  const offen = !!projekt && (projekt.bilder?.length ?? 0) > 0;
  const panelRef = useRef<HTMLDivElement>(null);
  // Element, das vor dem Öffnen fokussiert war — bekommt den Fokus zurück.
  const ausloeserRef = useRef<HTMLElement | null>(null);
  const titelId = "bilder-lightbox-titel";

  // ─── Scroll-Lock + Fokus-Management ──────────────────────────────
  useEffect(() => {
    if (!offen) return;

    ausloeserRef.current = document.activeElement as HTMLElement | null;

    const vorherigerOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Fokus initial ins Panel setzen (erstes fokussierbares Element).
    const erstesFokus = panelRef.current?.querySelector<HTMLElement>(FOKUSSIERBAR);
    erstesFokus?.focus();

    return () => {
      document.body.style.overflow = vorherigerOverflow;
      // Fokus zurück an den Auslöser (z.B. die Galerie-Kachel).
      ausloeserRef.current?.focus?.();
    };
  }, [offen]);

  // ─── ESC schließt + Fokus-Falle (Tab zirkulär) ───────────────────
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onSchliessen();
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const elemente = Array.from(panel.querySelectorAll<HTMLElement>(FOKUSSIERBAR));
      if (elemente.length === 0) return;

      const erstes = elemente[0];
      const letztes = elemente[elemente.length - 1];
      const aktiv = document.activeElement;

      if (e.shiftKey && (aktiv === erstes || !panel.contains(aktiv))) {
        e.preventDefault();
        letztes.focus();
      } else if (!e.shiftKey && aktiv === letztes) {
        e.preventDefault();
        erstes.focus();
      }
    },
    [onSchliessen],
  );

  useEffect(() => {
    if (!offen) return;
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [offen, onKey]);

  const konfig = projekt ? kategorieKonfig(projekt.kategorie) : null;

  // Foto-Einträge: jedes Bild des Projekts mit dem Kategorie-Akzent.
  const fotoEintraege = useMemo<PeekEintrag[]>(() => {
    if (!projekt?.bilder || !konfig) return [];
    return projekt.bilder.map((bild) => ({
      quelle: bild.quelle,
      titel: bild.titel,
      untertitel: bild.text,
      akzentFarbe: konfig.akzentFarbe,
    }));
  }, [projekt, konfig]);

  return (
    <AnimatePresence>
      {offen && projekt && projekt.bilder && konfig && (
        <>
          {/* Backdrop */}
          <motion.div
            key="lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            onClick={onSchliessen}
          />

          {/* Panel-Ebene */}
          <motion.div
            key="lightbox-panel"
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none"
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titelId}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-3xl rounded-2xl border border-white/[0.08]
                         bg-[#09090f] shadow-[0_32px_80px_rgba(0,0,0,0.85)] flex flex-col max-h-[92vh]"
            >
              {/* Kopf: Eyebrow + Titel + Kurzbeschreibung + Schließen */}
              <div className="px-5 sm:px-7 pt-5 pb-4 flex items-start gap-4 flex-shrink-0">
                <div className="flex-1 min-w-0">
                  <p
                    className="font-mono text-[11px] tracking-[0.2em] mb-1.5"
                    style={{ color: `${konfig.akzentFarbe}aa` }}
                  >
                    {konfig.label.toUpperCase()}
                  </p>
                  <h2
                    id={titelId}
                    className="font-display text-lg sm:text-xl font-bold text-white leading-snug"
                  >
                    {projekt.titel}
                  </h2>
                  <p className="text-sm text-white/55 mt-1.5 leading-relaxed">
                    {projekt.kurzbeschreibung}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <SchliessenKnopf onSchliessen={onSchliessen} />
                </div>
              </div>

              <div className="border-t border-white/[0.05] flex-shrink-0" />

              {/* Scrollbarer Inhalt: dasselbe Peek-Karussell, hier für alle
                  Fotos des Projekts (reines Blättern, kein onOeffnen). */}
              <div className="overflow-y-auto px-5 sm:px-7 py-5 flex-1">
                <PeekKarussell
                  eintraege={fotoEintraege}
                  ariaLabel={`Fotos von ${projekt.titel} durchblättern`}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
