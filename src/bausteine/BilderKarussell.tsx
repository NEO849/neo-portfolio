// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: BilderKarussell — Projekt-Screenshot-Galerie
//
// Eigenständige, barrierearme Galerie im neo-portfolio-Designsystem.
// Interaktions-Vokabular bewusst konsistent zum Yormas-Karussell:
//   · Cross-Fade + richtungsabhängiger Slide (reduced-motion-sicher)
//   · Swipe (Drag über eine Overlay-Ebene — entkoppelt vom Bild)
//   · Pfeile · Dots · Thumbnail-Streifen · Zähler
//   · Tastatur (← / →) · Caption (Titel + ein Satz) pro Bild
//   · Adjacent-Preload für ruckelfreies Blättern
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "framer-motion";
import type { ProjektBild } from "../models/typen";

const SWIPE_DISTANZ = 60;
const SWIPE_GESCHWINDIGKEIT = 400;

interface Props {
  bilder: ProjektBild[];
  /** Akzentfarbe (aus der Projekt-Kategorie). */
  akzentFarbe?: string;
}

export function BilderKarussell({ bilder, akzentFarbe = "#7aa2ff" }: Props) {
  const reduziert = useReducedMotion();
  const anzahl = bilder.length;
  const [[index, richtung], setZustand] = useState<[number, number]>([0, 0]);

  const gehe = useCallback(
    (zu: number, dir: number) => setZustand([(zu + anzahl) % anzahl, dir]),
    [anzahl],
  );
  const weiter  = useCallback(() => gehe(index + 1, 1), [gehe, index]);
  const zurueck = useCallback(() => gehe(index - 1, -1), [gehe, index]);

  // ─── Tastatur-Navigation ─────────────────────────────────────────
  useEffect(() => {
    if (anzahl <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") weiter();
      else if (e.key === "ArrowLeft") zurueck();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [anzahl, weiter, zurueck]);

  // ─── Nachbarbilder vorladen ──────────────────────────────────────
  useEffect(() => {
    if (anzahl <= 1) return;
    [(index + 1) % anzahl, (index - 1 + anzahl) % anzahl].forEach((i) => {
      const img = new Image();
      img.src = bilder[i].quelle;
    });
  }, [index, anzahl, bilder]);

  const aktiv = bilder[index];

  const onDragEnd = useCallback(
    (_e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      if (offset.x < -SWIPE_DISTANZ || velocity.x < -SWIPE_GESCHWINDIGKEIT) weiter();
      else if (offset.x > SWIPE_DISTANZ || velocity.x > SWIPE_GESCHWINDIGKEIT) zurueck();
    },
    [weiter, zurueck],
  );

  const varianten = useMemo(() => ({
    enter:  (dir: number) => ({ opacity: 0, x: reduziert ? 0 : dir * 48 }),
    center: { opacity: 1, x: 0 },
    exit:   (dir: number) => ({ opacity: 0, x: reduziert ? 0 : dir * -48 }),
  }), [reduziert]);

  if (anzahl === 0) return null;

  return (
    <div className="select-none">
      {/* ─── Bühne ─────────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl border border-white/[0.08] bg-grund-950 overflow-hidden"
        style={{ boxShadow: "0 24px 70px -28px rgba(0,0,0,0.7)" }}
      >
        {/* Ambient-Glow in Akzentfarbe */}
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{ background: `radial-gradient(65% 55% at 50% 0%, ${akzentFarbe}22, transparent 70%)` }}
          aria-hidden="true"
        />

        <div className="relative h-[62vh] min-h-[420px] max-h-[660px] flex items-center justify-center px-4 py-6">
          <AnimatePresence custom={richtung} mode="popLayout" initial={false}>
            <motion.img
              key={aktiv.quelle}
              src={aktiv.quelle}
              alt={aktiv.titel}
              custom={richtung}
              variants={varianten}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduziert ? 0 : 0.34, ease: [0.32, 0.72, 0, 1] }}
              draggable={false}
              loading="eager"
              decoding="async"
              className="max-h-full max-w-full w-auto object-contain rounded-xl pointer-events-none"
              style={{ filter: "drop-shadow(0 12px 30px rgba(0,0,0,0.55))" }}
            />
          </AnimatePresence>

          {/* Drag-/Swipe-Ebene — entkoppelt vom animierten Bild */}
          {anzahl > 1 && (
            <motion.div
              className="absolute inset-0 z-10"
              style={{ touchAction: "pan-y" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              dragSnapToOrigin
              dragMomentum={false}
              onDragEnd={onDragEnd}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Pfeile */}
        {anzahl > 1 && (
          <>
            <NavPfeil seite="links"  onClick={zurueck} label="Vorheriges Bild" />
            <NavPfeil seite="rechts" onClick={weiter}  label="Nächstes Bild" />
          </>
        )}

        {/* Zähler */}
        <div className="absolute top-3 right-3 z-20 font-mono text-[11px] px-2 py-1 rounded-md
                        bg-grund-950/70 border border-white/10 text-white/70 backdrop-blur-sm">
          {index + 1} / {anzahl}
        </div>
      </div>

      {/* ─── Caption ───────────────────────────────────────────── */}
      <div className="mt-4 min-h-[3.75rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={aktiv.quelle}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: reduziert ? 0 : 0.25 }}
          >
            <h3 className="font-display font-bold text-white text-base leading-snug">
              <span style={{ color: akzentFarbe }} className="font-mono text-sm">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-white/30"> · </span>
              {aktiv.titel}
            </h3>
            <p className="text-sm text-white/60 leading-relaxed mt-1">{aktiv.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Dots ──────────────────────────────────────────────── */}
      {anzahl > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4" role="tablist" aria-label="Bild auswählen">
          {bilder.map((b, i) => (
            <button
              key={b.quelle}
              onClick={() => gehe(i, i > index ? 1 : -1)}
              role="tab"
              aria-selected={i === index}
              aria-label={`Bild ${i + 1}: ${b.titel}`}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === index ? 24 : 6,
                background: i === index ? akzentFarbe : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>
      )}

      {/* ─── Thumbnail-Streifen ────────────────────────────────── */}
      {anzahl > 1 && (
        <div className="mt-5 flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {bilder.map((b, i) => (
            <button
              key={b.quelle}
              onClick={() => gehe(i, i > index ? 1 : -1)}
              aria-label={`Zu Bild ${i + 1}: ${b.titel}`}
              className="flex-shrink-0 rounded-lg overflow-hidden border transition-all duration-200"
              style={{
                borderColor: i === index ? akzentFarbe : "rgba(255,255,255,0.08)",
                opacity: i === index ? 1 : 0.55,
              }}
            >
              <img src={b.quelle} alt="" loading="lazy" decoding="async"
                className="h-20 w-auto object-contain block bg-grund-900" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Navigations-Pfeil ──────────────────────────────────────────────

function NavPfeil({ seite, onClick, label }: {
  seite: "links" | "rechts"; onClick: () => void; label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 -translate-y-1/2 z-20 grid place-items-center
                  w-10 h-10 rounded-full bg-grund-950/70 border border-white/10 backdrop-blur-sm
                  text-white/70 hover:text-white hover:border-white/25 transition-all
                  ${seite === "links" ? "left-3" : "right-3"}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: seite === "links" ? "rotate(180deg)" : "none" }} aria-hidden="true">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}
