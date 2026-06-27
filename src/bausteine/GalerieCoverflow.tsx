// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: GalerieCoverflow — filmische Auswahl-Ebene der Bildergalerie
//
// Cover-Flow als AUSWAHL zwischen Projekt-Galerien (NICHT die Bilder
// selbst): die Fokus-Karte steht scharf in der Mitte, Nachbarn ragen
// unscharf seitlich herein. Öffnen der Fokus-Karte ruft `onOeffnen`
// → die bestehende BilderLightbox zeigt dann die Bilder des Projekts.
//
// Interaktions-Vokabular bewusst konsistent zum BilderKarussell:
//   · Swipe/Drag (Overlay-Ebene, entkoppelt) · Pfeile · Dots · Zähler
//   · Tastatur (← / →) blättert, Enter/Leertaste öffnet den Fokus
//   · Nachbar-Preload via new Image() · Wrap-around (modulo) ab ≥3
//   · richtungsabhängige Varianten · useReducedMotion · Fenster-Render
//   · Akzent-Glow folgt der Fokus-Galerie und blendet sanft über
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type PanInfo,
} from "framer-motion";
import type { ProjektModel } from "../models/typen";
import { kategorieKonfig } from "../models/kategorieKonfiguration";
import { KURVEN } from "../bewegung/varianten";

// Swipe-Schwellen identisch zum BilderKarussell (konsistentes Gefühl).
const SWIPE_DISTANZ = 60;
const SWIPE_GESCHWINDIGKEIT = 400;
// Wie viele Nachbarn je Seite überhaupt ins DOM kommen (Fenster-Render).
const FENSTER = 1;

interface GalerieCoverflowProps {
  /** Bereits gefilterte Galerien (ProjektModel mit galerieSlug + Bildern). */
  galerien: ProjektModel[];
  /** Fokus-Karte öffnen → bestehende Lightbox zeigt die Bilder. */
  onOeffnen: (projekt: ProjektModel) => void;
  /** Start-Fokus-Index (Default 0). */
  startIndex?: number;
}

export function GalerieCoverflow({ galerien, onOeffnen, startIndex = 0 }: GalerieCoverflowProps) {
  const reduziert = useReducedMotion();
  const anzahl = galerien.length;
  const sicherStart = anzahl > 0 ? ((startIndex % anzahl) + anzahl) % anzahl : 0;
  const [[index, richtung], setZustand] = useState<[number, number]>([sicherStart, 0]);
  const mehrere = anzahl > 1;
  // Wrap-around erst ab 3 Galerien (bei n=2 kein Endlos-Spam in eine Richtung).
  const wrap = anzahl >= 3;

  const gehe = useCallback(
    (zu: number, dir: number) => {
      if (anzahl === 0) return;
      const ziel = wrap
        ? ((zu % anzahl) + anzahl) % anzahl
        : Math.min(Math.max(zu, 0), anzahl - 1);
      setZustand([ziel, dir]);
    },
    [anzahl, wrap],
  );
  const weiter = useCallback(() => gehe(index + 1, 1), [gehe, index]);
  const zurueck = useCallback(() => gehe(index - 1, -1), [gehe, index]);

  const fokus = anzahl > 0 ? galerien[index] : null;
  const konfig = fokus ? kategorieKonfig(fokus.kategorie) : null;

  // ─── Tastatur: ←/→ blättert, Enter/Space öffnet den Fokus ─────────
  // Sauber entkoppelt: blättert NICHT, während ein modaler Dialog offen ist
  // (die Lightbox-BilderKarussell lauscht ebenfalls auf window — sonst würde
  // die Auswahl hinter der offenen Lightbox unbemerkt wechseln).
  useEffect(() => {
    if (anzahl === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      if (e.key === "ArrowRight") { weiter(); }
      else if (e.key === "ArrowLeft") { zurueck(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [anzahl, weiter, zurueck]);

  // ─── Nachbar-Cover vorladen (ruckelfreies Blättern) ───────────────
  useEffect(() => {
    if (!mehrere) return;
    const nachbarn = [
      ((index + 1) % anzahl + anzahl) % anzahl,
      ((index - 1) % anzahl + anzahl) % anzahl,
    ];
    nachbarn.forEach((i) => {
      const quelle = galerien[i]?.bilder?.[0]?.quelle;
      if (quelle) {
        const img = new Image();
        img.src = quelle;
      }
    });
  }, [index, anzahl, mehrere, galerien]);

  const onDragEnd = useCallback(
    (_e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      if (offset.x < -SWIPE_DISTANZ || velocity.x < -SWIPE_GESCHWINDIGKEIT) weiter();
      else if (offset.x > SWIPE_DISTANZ || velocity.x > SWIPE_GESCHWINDIGKEIT) zurueck();
    },
    [weiter, zurueck],
  );

  if (anzahl === 0 || !fokus || !konfig) return null;

  // Fenster der sichtbaren Karten: relative Versätze um den Fokus.
  // Bei wrap voll bis ±FENSTER; ohne wrap an den Rändern abgeschnitten.
  const versaetze: number[] = [];
  for (let off = -FENSTER; off <= FENSTER; off += 1) {
    const roh = index + off;
    if (wrap) {
      versaetze.push(off);
    } else if (roh >= 0 && roh < anzahl) {
      versaetze.push(off);
    }
  }

  return (
    <div
      role="group"
      aria-roledescription="Karussell"
      aria-label="Projekt-Galerien durchblättern"
      className="relative select-none"
    >
      {/* ─── Live-Region: kündigt Fokuswechsel an ─────────────────── */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {`Galerie ${index + 1} von ${anzahl}: ${fokus.titel}, ${
          fokus.bilder?.length ?? 0
        } Bilder`}
      </p>

      {/* ─── Akzent-Glow (Cross-Fade beim Wechsel) ────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <AnimatePresence initial={false}>
          <motion.div
            key={konfig.akzentFarbe}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduziert ? 0.2 : 0.7, ease: KURVEN.expressiv }}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(58% 50% at 50% 38%, ${konfig.akzentFarbe}26, transparent 72%)`,
            }}
          />
        </AnimatePresence>
        {/* Sehr subtiler Lichtbogen oben mittig (kein Neon). */}
        <div
          className="absolute -top-px left-1/2 h-px w-2/3 -translate-x-1/2"
          style={{
            background: `linear-gradient(90deg, transparent, ${konfig.akzentFarbe}55, transparent)`,
          }}
        />
      </div>

      {/* ─── Caption-Block über der Bühne (wechselt beim Blättern) ──
          Bewusst VOM Cover-Bild gelöst und sauber zentriert darüber
          gesetzt — Muster wie die Caption im BilderKarussell. Feste
          Mindesthöhe gegen Layout-Shift. */}
      <div className="relative z-30 min-h-[6.5rem] flex flex-col items-center justify-end text-center px-4 mb-5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={fokus.galerieSlug ?? index}
            initial={reduziert ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={reduziert ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduziert ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: reduziert ? 0.2 : 0.32, ease: KURVEN.expressiv }}
          >
            <span
              className="font-mono text-[10px] tracking-[0.24em] uppercase"
              style={{ color: konfig.akzentFarbe }}
            >
              {konfig.label}
            </span>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white leading-snug mt-1.5">
              <span style={{ color: konfig.akzentFarbe }} className="font-mono text-sm">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-white/30"> · </span>
              {fokus.titel}
            </h3>
            <span className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] text-white/50">
              <span>{`${fokus.bilder?.length ?? 0} ${(fokus.bilder?.length ?? 0) === 1 ? "Bild" : "Bilder"}`}</span>
              <span className="text-white/25" aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-white/55">
                Galerie öffnen
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Zähler oben links ───────────────────────────────────── */}
      {mehrere && (
        <div className="absolute top-0 left-0 z-30 font-mono text-[11px] text-white/45 tracking-wide">
          {String(index + 1).padStart(2, "0")} / {String(anzahl).padStart(2, "0")}
        </div>
      )}

      {/* ─── Bühne ───────────────────────────────────────────────── */}
      <div
        className="relative mx-auto overflow-hidden"
        style={{ perspective: 1400 }}
      >
        {/* feste Bühnenhöhe gegen Layout-Shift.
            Drag/Swipe liegt DIREKT auf der Fokus-Karte (KartenSchicht) —
            keine ganzflächige Overlay-Ebene mehr, sonst würde sie den Tap
            auf die Fokus-Karte schlucken (Mobil = nicht öffenbar). Framer
            unterdrückt den Click nach echtem Drag → Tap öffnet, Wisch blättert. */}
        <div className="relative h-[clamp(15rem,46vw,24rem)]">
          <AnimatePresence custom={richtung} initial={false}>
            {versaetze.map((off) => {
              const realIndex = ((index + off) % anzahl + anzahl) % anzahl;
              const projekt = galerien[realIndex];
              const istFokus = off === 0;
              return (
                <KartenSchicht
                  key={projekt.galerieSlug ?? realIndex}
                  projekt={projekt}
                  off={off}
                  istFokus={istFokus}
                  richtung={richtung}
                  reduziert={!!reduziert}
                  ziehbar={istFokus && mehrere}
                  onDragEnd={onDragEnd}
                  onAktivieren={() => {
                    if (istFokus) onOeffnen(projekt);
                    else gehe(realIndex, off > 0 ? 1 : -1);
                  }}
                />
              );
            })}
          </AnimatePresence>
        </div>

        {/* Pfeile (Desktop, on-stage) */}
        {mehrere && (
          <>
            <NavPfeil seite="links" onClick={zurueck} label="Vorherige Galerie" />
            <NavPfeil seite="rechts" onClick={weiter} label="Nächste Galerie" />
          </>
        )}
      </div>

      {/* ─── Dots ────────────────────────────────────────────────── */}
      {mehrere && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {galerien.map((p, i) => {
            const aktiv = i === index;
            return (
              <button
                key={p.galerieSlug ?? i}
                type="button"
                onClick={() => gehe(i, i > index ? 1 : -1)}
                aria-label={`Galerie ${i + 1}: ${p.titel}`}
                aria-current={aktiv ? "true" : undefined}
                className="h-1.5 rounded-full transition-all duration-300 focus:outline-none
                           focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2
                           focus-visible:ring-offset-grund-950"
                style={{
                  width: aktiv ? 26 : 6,
                  background: aktiv ? konfig.akzentFarbe : "rgba(255,255,255,0.18)",
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Eine Karte in der Bühne (Fokus oder Nachbar) ───────────────────

interface KartenSchichtProps {
  projekt: ProjektModel;
  /** Versatz zum Fokus: 0 = Fokus, ±1 = direkte Nachbarn. */
  off: number;
  istFokus: boolean;
  richtung: number;
  reduziert: boolean;
  /** Diese Karte trägt die Swipe-/Drag-Geste (nur die Fokus-Karte bei n>1). */
  ziehbar: boolean;
  onDragEnd: (e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => void;
  onAktivieren: () => void;
}

function KartenSchicht({
  projekt,
  off,
  istFokus,
  richtung,
  reduziert,
  ziehbar,
  onDragEnd,
  onAktivieren,
}: KartenSchichtProps) {
  const cover = projekt.bilder?.[0];
  const anzahlBilder = projekt.bilder?.length ?? 0;

  // ─── Pointer-Parallax (nur Fokus, nur ohne Reduced-Motion) ───────
  const zeigerX = useMotionValue(0);
  const zeigerY = useMotionValue(0);
  const neigeX = useSpring(useTransform(zeigerY, [-0.5, 0.5], [6, -6]), {
    stiffness: 150,
    damping: 18,
  });
  const neigeY = useSpring(useTransform(zeigerX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 150,
    damping: 18,
  });

  const parallaxAktiv = istFokus && !reduziert;

  function onZeiger(e: ReactPointerEvent<HTMLButtonElement>) {
    if (!parallaxAktiv) return;
    const box = e.currentTarget.getBoundingClientRect();
    zeigerX.set((e.clientX - box.left) / box.width - 0.5);
    zeigerY.set((e.clientY - box.top) / box.height - 0.5);
  }
  function onZeigerWeg() {
    zeigerX.set(0);
    zeigerY.set(0);
  }

  // Ziel-Transform je Position. Nachbarn skaliert/unscharf an den Kanten.
  const seitenVersatz = reduziert ? 0 : off * 78; // % der eigenen Breite
  const zielScale = istFokus ? 1 : 0.8;
  const zielOpacity = istFokus ? 1 : reduziert ? 0 : 0.35;
  const zielRotateY = istFokus || reduziert ? 0 : off > 0 ? -8 : 8;
  const zielBlur = istFokus ? 0 : 12;

  // Eintritt richtungsabhängig (reduced-motion = reines Fade).
  const eintritt = reduziert
    ? { opacity: 0 }
    : { opacity: 0, x: `${richtung >= 0 ? 60 : -60}%`, scale: 0.7 };
  const austritt = reduziert
    ? { opacity: 0 }
    : { opacity: 0, x: `${richtung >= 0 ? -60 : 60}%`, scale: 0.7 };

  if (!cover) return null;

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      style={{
        zIndex: istFokus ? 10 : 5 - Math.abs(off),
        width: "clamp(17rem, 62%, 32rem)",
        x: "-50%",
        y: "-50%",
      }}
      initial={eintritt}
      animate={{
        opacity: zielOpacity,
        x: `calc(-50% + ${seitenVersatz}%)`,
        y: "-50%",
        scale: zielScale,
        rotateY: zielRotateY,
        filter: `blur(${zielBlur}px)`,
      }}
      exit={austritt}
      transition={{ duration: reduziert ? 0.25 : 0.6, ease: KURVEN.expressiv }}
    >
      <motion.button
        type="button"
        onClick={onAktivieren}
        onPointerMove={onZeiger}
        onPointerLeave={onZeigerWeg}
        aria-hidden={istFokus ? undefined : true}
        tabIndex={istFokus ? 0 : -1}
        aria-label={
          istFokus
            ? `Galerie öffnen: ${projekt.titel} (${anzahlBilder} Bilder)`
            : undefined
        }
        whileHover={parallaxAktiv ? { y: -6 } : undefined}
        drag={ziehbar ? "x" : false}
        dragConstraints={ziehbar ? { left: 0, right: 0 } : undefined}
        dragElastic={ziehbar ? 0.16 : undefined}
        dragSnapToOrigin={ziehbar || undefined}
        dragMomentum={ziehbar ? false : undefined}
        onDragEnd={ziehbar ? onDragEnd : undefined}
        style={parallaxAktiv ? { rotateX: neigeX, rotateY: neigeY, transformStyle: "preserve-3d" } : undefined}
        className={`group relative block w-full text-left rounded-[20px] overflow-hidden
                    border ${istFokus ? "border-white/10" : "border-white/[0.06]"}
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50
                    focus-visible:ring-offset-2 focus-visible:ring-offset-grund-950
                    ${ziehbar ? "touch-pan-y" : ""} cursor-pointer`}
      >
        {/* Cover — einheitliches 16/10, fester Rahmen gegen Layout-Shift */}
        <div className="relative aspect-[16/10] bg-grund-900 overflow-hidden"
          style={istFokus ? { boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 8px 20px rgba(0,0,0,0.35)" } : undefined}
        >
          {/* Sauberes Cover — Text steht jetzt im Caption-Block über der
              Bühne, daher kein Overlay/Scrim mehr auf dem Bild. */}
          <img
            src={cover.quelle}
            alt={istFokus ? `Vorschau ${projekt.titel}: ${cover.titel}` : ""}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover object-top
                       transition-transform duration-500 ease-out
                       group-hover:scale-[1.03]"
          />
        </div>
      </motion.button>
    </motion.div>
  );
}

// ─── Navigations-Pfeil (Stil aus BilderKarussell) ───────────────────

function NavPfeil({ seite, onClick, label }: {
  seite: "links" | "rechts"; onClick: () => void; label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`hidden sm:grid absolute top-1/2 -translate-y-1/2 z-30 place-items-center
                  w-10 h-10 rounded-full bg-grund-950/70 border border-white/10 backdrop-blur-sm
                  text-white/70 hover:text-white hover:border-white/25 transition-all
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40
                  ${seite === "links" ? "left-1 sm:left-3" : "right-1 sm:right-3"}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: seite === "links" ? "rotate(180deg)" : "none" }} aria-hidden="true">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}
