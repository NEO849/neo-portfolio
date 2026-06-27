// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: GalerieBanner — edles Einzel-Frame-Premium-Karussell
//
// Eine saubere Cover-Bühne pro Projekt-Galerie (KEIN Cover-Flow mit
// unscharfen Nachbarn mehr): ein premium gerahmtes Frame, Swipe/Pfeile/
// Dots blättern, beim Blättern wechselt der Akzent sanft, Tap öffnet die
// bestehende BilderLightbox. Vorbild ist das Yormas-Karussell
// (BannerKarussell/BannerStory) — Aufbau/Motion/Material übernommen,
// Farben/Texte aus UNSEREM Design-System (kategorieKonfig + Tokens).
//
// Portrait-Präsentation (unsere Cover sind Phone-Screenshots ~0.46):
//   App-Store-/Apple-Music-Stil — das Cover unscharf gezoomt als
//   Hintergrund FÜLLT den Frame, das scharfe Screenshot-Bild liegt
//   CONTAINED/zentriert darüber. So gibt es keinen hässlichen Crop und
//   trotzdem eine voll gefüllte, teure Bühne.
//
// State-Maschine (Single Source of Truth, Muster aus BannerKarussell):
//   ┌──────────────────────────────────────────────────────────┐
//   │ aktiverIndex   0..anzahl-1                                 │
//   │ istDraggend    true während der Finger das Frame zieht     │
//   │ istAnimierend  true während der Slide-Wechsel animiert     │
//   │ richtung       +1 / -1 — für richtungsabhängige Varianten  │
//   └──────────────────────────────────────────────────────────┘
//
// Interaktion: Tap öffnet (Framer unterdrückt Click nach echtem Drag),
// Wisch/Pfeil/Dot/Tastatur ←→ blättert, Enter/Leertaste öffnet den Fokus.
// Wrap-around ab ≥2. Nachbar-Cover werden vorgeladen (new Image()).
// ═══════════════════════════════════════════════════════════════════

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import type { ProjektModel } from "../models/typen";
import { kategorieKonfig } from "../models/kategorieKonfiguration";

// ─── Konstanten (Yormas-Hochwert-Rezept, reife Drag-Physik) ─────────
/** Wisch-Distanz in px ab der geblättert wird. */
const SWIPE_DISTANZ = 60;
/** Wisch-Geschwindigkeit in px/s ab der geblättert wird. */
const SWIPE_GESCHWINDIGKEIT = 400;
/** Slide-Wechsel-Dauer in Sekunden. */
const SLIDE_DAUER = 0.45;
/** Apple-iOS-Spring-Kurve fürs Bild (Ken-Burns). */
const BILD_KURVE = [0.32, 0.72, 0, 1] as const;
/** Schnellere Text-Kurve (Text staffelt vor dem Bild). */
const TEXT_KURVE = [0.25, 0.1, 0.25, 1] as const;
/** Bottom-Heavy-Vignette für Text-Lesbarkeit (grund-950-getönt). */
const VIGNETTE =
  "linear-gradient(to top, rgba(7,10,18,0.92) 0%, rgba(7,10,18,0.30) 38%, transparent 70%)";

// ═══════════════════════════════════════════════════════════════════
// REDUCER — eine Quelle für den Frame-Wechsel
// ═══════════════════════════════════════════════════════════════════

interface BannerState {
  aktiverIndex: number;
  richtung: number;
  istDraggend: boolean;
  istAnimierend: boolean;
}

type BannerAktion =
  | { typ: "WEITER"; anzahl: number; wrap: boolean }
  | { typ: "ZURUECK"; anzahl: number; wrap: boolean }
  | { typ: "SPRINGEN"; zu: number; anzahl: number }
  | { typ: "DRAG_START" }
  | { typ: "DRAG_ENDE" }
  | { typ: "ANIM_ENDE" };

function bannerReducer(state: BannerState, aktion: BannerAktion): BannerState {
  switch (aktion.typ) {
    case "WEITER": {
      const roh = state.aktiverIndex + 1;
      const zu = aktion.wrap
        ? roh % aktion.anzahl
        : Math.min(roh, aktion.anzahl - 1);
      if (zu === state.aktiverIndex) return state;
      return { ...state, aktiverIndex: zu, richtung: 1, istAnimierend: true, istDraggend: false };
    }
    case "ZURUECK": {
      const roh = state.aktiverIndex - 1;
      const zu = aktion.wrap
        ? (roh + aktion.anzahl) % aktion.anzahl
        : Math.max(roh, 0);
      if (zu === state.aktiverIndex) return state;
      return { ...state, aktiverIndex: zu, richtung: -1, istAnimierend: true, istDraggend: false };
    }
    case "SPRINGEN": {
      if (aktion.zu === state.aktiverIndex || aktion.zu < 0 || aktion.zu >= aktion.anzahl) {
        return state;
      }
      return {
        ...state,
        aktiverIndex: aktion.zu,
        richtung: aktion.zu > state.aktiverIndex ? 1 : -1,
        istAnimierend: true,
        istDraggend: false,
      };
    }
    case "DRAG_START":
      return { ...state, istDraggend: true };
    case "DRAG_ENDE":
      return state.istDraggend ? { ...state, istDraggend: false } : state;
    case "ANIM_ENDE":
      return state.istAnimierend ? { ...state, istAnimierend: false } : state;
    default:
      return state;
  }
}

// ═══════════════════════════════════════════════════════════════════
// GalerieBanner
// ═══════════════════════════════════════════════════════════════════

interface GalerieBannerProps {
  /** Bereits gefilterte Galerien (ProjektModel mit galerieSlug + Bildern). */
  galerien: ProjektModel[];
  /** Fokus-Frame öffnen → bestehende Lightbox zeigt die Bilder. */
  onOeffnen: (projekt: ProjektModel) => void;
  /** Start-Fokus-Index (Default 0). */
  startIndex?: number;
}

export function GalerieBanner({ galerien, onOeffnen, startIndex = 0 }: GalerieBannerProps) {
  const reduziert = useReducedMotion();
  const anzahl = galerien.length;
  const mehrere = anzahl > 1;
  // Wrap-around ab ≥2 Galerien (Endlos-Blättern wie im Yormas-Karussell).
  const wrap = anzahl >= 2;
  const sicherStart = anzahl > 0 ? ((startIndex % anzahl) + anzahl) % anzahl : 0;

  const [state, dispatch] = useReducer(bannerReducer, {
    aktiverIndex: sicherStart,
    richtung: 0,
    istDraggend: false,
    istAnimierend: false,
  });
  const { aktiverIndex, richtung, istDraggend } = state;

  // Ref auf den Index — schützt async AnimationComplete vor Rapid-Swipe-Race.
  const indexRef = useRef(aktiverIndex);
  useEffect(() => {
    indexRef.current = aktiverIndex;
  }, [aktiverIndex]);

  const weiter = useCallback(() => dispatch({ typ: "WEITER", anzahl, wrap }), [anzahl, wrap]);
  const zurueck = useCallback(() => dispatch({ typ: "ZURUECK", anzahl, wrap }), [anzahl, wrap]);

  const fokus = anzahl > 0 ? galerien[aktiverIndex] : null;
  const konfig = fokus ? kategorieKonfig(fokus.kategorie) : null;
  const anzahlBilder = fokus?.bilder?.length ?? 0;

  // ─── Reset wenn sich die Galerie-Liste ändert (out-of-bounds-Schutz) ─
  // Erster Mount übersprungen, sonst würde sicherStart/startIndex sofort
  // auf 0 überschrieben. Nur ein echter Listen-Wechsel setzt zurück.
  const galerieIds = useMemo(() => galerien.map((p) => p.galerieSlug ?? "").join("|"), [galerien]);
  const ersterLauf = useRef(true);
  useEffect(() => {
    if (ersterLauf.current) {
      ersterLauf.current = false;
      return;
    }
    dispatch({ typ: "SPRINGEN", zu: 0, anzahl });
    dispatch({ typ: "ANIM_ENDE" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [galerieIds]);

  // ─── Tastatur: ←/→ blättert, hinter offenem Dialog gesperrt ──────────
  useEffect(() => {
    if (anzahl === 0) return;
    const onKey = (event: KeyboardEvent) => {
      // keydown-Guard: blättert NICHT, während die Lightbox (modaler Dialog) offen ist.
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      if (event.key === "ArrowRight") weiter();
      else if (event.key === "ArrowLeft") zurueck();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [anzahl, weiter, zurueck]);

  // ─── Nachbar-Cover vorladen (ruckelfreies Blättern) ──────────────────
  useEffect(() => {
    if (!mehrere) return;
    const nachbarn = [(aktiverIndex + 1) % anzahl, (aktiverIndex - 1 + anzahl) % anzahl];
    nachbarn.forEach((i) => {
      const quelle = galerien[i]?.bilder?.[0]?.quelle;
      if (quelle) {
        const bild = new Image();
        bild.src = quelle;
      }
    });
  }, [aktiverIndex, anzahl, mehrere, galerien]);

  // ─── Drag-Geste auf dem Frame (Tap öffnet, Wisch blättert) ───────────
  const draggedDistanz = useRef(0);
  const handleDragStart = useCallback(() => {
    dispatch({ typ: "DRAG_START" });
  }, []);
  const handleDrag = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      draggedDistanz.current = info.offset.x;
    },
    [],
  );
  const handleDragEnd = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      const ueberSchwelle =
        Math.abs(info.offset.x) > SWIPE_DISTANZ ||
        Math.abs(info.velocity.x) > SWIPE_GESCHWINDIGKEIT;
      if (ueberSchwelle && mehrere) {
        if (info.offset.x < 0) weiter();
        else zurueck();
      } else {
        dispatch({ typ: "DRAG_ENDE" });
      }
    },
    [mehrere, weiter, zurueck],
  );

  const handleAnimationComplete = useCallback((fuerIndex: number) => {
    if (indexRef.current !== fuerIndex) return;
    dispatch({ typ: "ANIM_ENDE" });
  }, []);

  // ─── Frame öffnen (Tap/Enter/Leertaste auf der Bühne) ────────────────
  const oeffneFokus = useCallback(() => {
    if (fokus) onOeffnen(fokus);
  }, [fokus, onOeffnen]);

  if (anzahl === 0 || !fokus || !konfig) return null;

  const cover = fokus.bilder?.[0];
  const akzent = konfig.akzentFarbe;

  // Richtungsabhängiger Slide (reduced-motion = reines Fade, kein Versatz/Scale).
  const eintritt = reduziert
    ? { opacity: 0 }
    : { opacity: 0, scale: 1.02, x: richtung >= 0 ? 36 : -36 };
  const austritt = reduziert
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.99, x: richtung >= 0 ? -36 : 36 };

  return (
    <section
      role="region"
      aria-roledescription="Karussell"
      aria-label="Projekt-Galerien durchblättern"
      className="relative select-none"
    >
      {/* Live-Region: kündigt Fokuswechsel an (Galerie i von n: Titel, n Bilder). */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {`Galerie ${aktiverIndex + 1} von ${anzahl}: ${fokus.titel}, ${anzahlBilder} ${
          anzahlBilder === 1 ? "Bild" : "Bilder"
        }`}
      </p>

      {/* Zähler oben links (i/n). */}
      {mehrere && (
        <div className="absolute top-0 left-0 z-30 font-mono text-[11px] text-white/45 tracking-wide pointer-events-none">
          {String(aktiverIndex + 1).padStart(2, "0")} / {String(anzahl).padStart(2, "0")}
        </div>
      )}

      {/* ─── Premium-Frame (eine saubere Cover-Bühne) ───────────────────
          rounded-3xl + feine Lichtkante. Doppelter Schatten = Außen-Glow
          (in der Fokus-Akzentfarbe getönt) + innere Lichtkante = der
          „teure" Look. Akzent-Glow wechselt sanft beim Blättern. */}
      <motion.div
        className="relative mx-auto w-full max-w-2xl"
        animate={{
          boxShadow: `0 24px 70px -24px ${akzent}55, 0 24px 70px -24px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.07)`,
        }}
        transition={{ duration: reduziert ? 0.2 : 0.7, ease: BILD_KURVE }}
        style={{ borderRadius: "1.5rem" }}
      >
        <div
          className="group relative isolate overflow-hidden select-none rounded-3xl border border-white/12
                     bg-grund-900 aspect-[4/5]"
        >
          {/* Drag/Tap-Träger DIREKT auf dem Frame — Tap öffnet, Wisch blättert.
              Bild + Vignette + Text liegen darunter (pointer-events-none),
              Dots/Pfeile mit höherem z-Index darüber bleiben klickbar. */}
          <motion.button
            type="button"
            onClick={oeffneFokus}
            aria-label={`Galerie öffnen: ${fokus.titel} (${anzahlBilder} Bilder)`}
            drag={mehrere ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            dragSnapToOrigin
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{ touchAction: mehrere ? "pan-y" : "auto" }}
            className="absolute inset-0 z-20 block w-full cursor-pointer text-left
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60
                       focus-visible:ring-offset-2 focus-visible:ring-offset-grund-950
                       rounded-3xl"
          />

          {/* BILD-Schicht mit Cross-Fade + Ken-Burns + richtungs-Slide. */}
          <AnimatePresence custom={richtung} initial={false} mode="popLayout">
            <motion.div
              key={fokus.galerieSlug ?? aktiverIndex}
              initial={eintritt}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={austritt}
              transition={{ duration: reduziert ? 0 : SLIDE_DAUER, ease: BILD_KURVE }}
              onAnimationComplete={() => handleAnimationComplete(aktiverIndex)}
              className="absolute inset-0 z-0 pointer-events-none"
              aria-hidden="true"
            >
              {cover && (
                <>
                  {/* Unscharfes gezoomtes Cover als Hintergrund (App-Store-Stil) —
                      füllt den Frame, damit nichts hässlich abgeschnitten wird. */}
                  <img
                    src={cover.quelle}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="absolute inset-0 h-full w-full scale-110 object-cover object-center
                               blur-2xl saturate-[1.15] opacity-60"
                  />
                  <div className="absolute inset-0 bg-grund-950/40" />
                  {/* Scharfes Screenshot-Bild contained/zentriert darüber. */}
                  <img
                    src={cover.quelle}
                    alt={`Vorschau ${fokus.titel}: ${cover.titel}`}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-contain
                               drop-shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
                  />
                </>
              )}
              {/* Bottom-Heavy-Vignette für Textlesbarkeit. */}
              <div className="absolute inset-0" style={{ background: VIGNETTE }} />
              {/* Akzent-getönter Schimmer oben (dezent, kein Neon) — folgt dem Fokus. */}
              <div
                className="absolute inset-x-0 top-0 h-1/3"
                style={{
                  background: `linear-gradient(to bottom, ${akzent}1f, transparent)`,
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* TEXT-Overlay unten (staffelt schneller als das Bild). */}
          <div className="absolute inset-x-0 bottom-0 z-30 p-5 sm:p-6 pointer-events-none">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`txt-${fokus.galerieSlug ?? aktiverIndex}`}
                initial={reduziert ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={reduziert ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduziert ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: reduziert ? 0.2 : 0.28, ease: TEXT_KURVE }}
              >
                {/* Eyebrow = Kategorie in der Akzentfarbe. */}
                <span
                  className="inline-block text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ color: akzent }}
                >
                  {konfig.label}
                </span>
                {/* Titel OHNE jede Zahl davor. */}
                <h3 className="mt-1.5 font-display text-xl sm:text-2xl md:text-3xl font-extrabold leading-[1.1] text-balance text-white">
                  {fokus.titel}
                </h3>
                {/* Bilderzähler + dezenter CTA (bei Hover/Fokus klarer). */}
                <span className="mt-2 flex items-center gap-2 font-mono text-[11px] text-white/70">
                  <span>{`${anzahlBilder} ${anzahlBilder === 1 ? "Bild" : "Bilder"}`}</span>
                  <span className="text-white/25" aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-white/55 transition-colors duration-300 group-hover:text-white/90 group-focus-within:text-white/90">
                    Galerie öffnen
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pfeile (Desktop, on-stage). */}
          {mehrere && (
            <>
              <NavPfeil seite="links" onClick={zurueck} label="Vorherige Galerie" />
              <NavPfeil seite="rechts" onClick={weiter} label="Nächste Galerie" />
            </>
          )}
        </div>
      </motion.div>

      {/* ─── Dots (Buttons mit aria-label + aria-current) ───────────────
          Yormas-Stil: inaktiv mattglasig, aktiv = Akzent-Pille mit Glow. */}
      {mehrere && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {galerien.map((projekt, i) => {
            const aktiv = i === aktiverIndex;
            return (
              <button
                key={projekt.galerieSlug ?? i}
                type="button"
                onClick={() => dispatch({ typ: "SPRINGEN", zu: i, anzahl })}
                aria-label={`Galerie ${i + 1}: ${projekt.titel}`}
                aria-current={aktiv ? "true" : undefined}
                className="grid place-items-center rounded-full transition-all duration-300
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40
                           focus-visible:ring-offset-2 focus-visible:ring-offset-grund-950"
                style={{ minWidth: 44, minHeight: 44 }}
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    aktiv ? "" : "bg-white/[0.22] backdrop-blur-sm"
                  }`}
                  style={{
                    width: aktiv ? 26 : 6,
                    background: aktiv ? akzent : undefined,
                    boxShadow: aktiv ? `0 0 12px ${akzent}88` : undefined,
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ─── Navigations-Pfeil (Yormas/NavPfeil-Stil, ≥44px Touch-Target) ────

function NavPfeil({
  seite,
  onClick,
  label,
}: {
  seite: "links" | "rechts";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`hidden sm:grid absolute top-1/2 -translate-y-1/2 z-40 place-items-center
                  h-11 w-11 rounded-full bg-grund-950/70 border border-white/10 backdrop-blur-sm
                  text-white/70 hover:text-white hover:border-white/25 transition-all
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40
                  ${seite === "links" ? "left-3" : "right-3"}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: seite === "links" ? "rotate(180deg)" : "none" }}
        aria-hidden="true"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}
