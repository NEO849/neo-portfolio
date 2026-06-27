// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: PeekKarussell — horizontales Peek-Karussell mit Scroll-Snap
//
// Ein Vorschaubild prominent in der MITTE, die Nachbarn links/rechts
// ANGESCHNITTEN sichtbar, smooth horizontal scroll-/wischbar mit Snap.
// 1:1-Mechanik-Vorbild: Yormas „PlattlingKarussell" (nativer Scroll-Snap
// + IntersectionObserver bestimmt das mittige Item + Stagger je Distanz).
//
// Zwei Einsatzarten über EINE Komponente:
//   (1) Mit `onOeffnen`: Tap/Enter auf das MITTIGE Item öffnet (z.B.
//       Projekt). Tap auf einen Nachbarn zentriert ihn nur.
//   (2) Ohne `onOeffnen`: reines Durchblättern (Foto-Ebene) — Tap auf
//       Nachbarn zentriert, Tap auf die Mitte tut nichts.
//
// Portrait-Präsentation (unsere Bilder sind Phone-Screenshots ~0.46):
//   App-Store-/Apple-Music-Stil — das Cover unscharf gezoomt als
//   Hintergrund FÜLLT das aspect-[3/4]-Item, das scharfe Bild liegt
//   CONTAINED darüber. So kein hässlicher Crop, trotzdem volle Bühne.
//   Item-Breiten an Portrait angepasst (Mitte breit, Nachbarn schmal
//   genug zum sauberen Anschneiden).
//
// A11y: role="region" + aria-roledescription="Karussell", aria-current
// am aktiven Item, Live-Region (i/n + Titel), Dots (aktiv = Akzent-
// Pille), Pfeile (Desktop, Ränder disabled), Tastatur ←/→, sichtbarer
// Fokus-Ring, ≥44px Touch-Targets. prefers-reduced-motion → flach.
// ═══════════════════════════════════════════════════════════════════

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "framer-motion";

// ─── Daten-Vertrag ──────────────────────────────────────────────────

export interface PeekEintrag {
  /** Bildquelle (Pfad ab /public). */
  readonly quelle: string;
  /** Titel (Caption-Überschrift + A11y-Label). */
  readonly titel: string;
  /** Optionaler Untertitel (eine Zeile Kontext). */
  readonly untertitel?: string;
  /** Hex-Akzentfarbe (für Glow, Eyebrow-Pille, aktiven Dot). */
  readonly akzentFarbe: string;
}

interface PeekKarussellProps {
  /** Die anzuzeigenden Einträge (Mitte = aktiv). */
  readonly eintraege: PeekEintrag[];
  /** Start-Index (Default 0). */
  readonly startIndex?: number;
  /**
   * Wenn gesetzt: Tap/Enter auf das MITTIGE (aktive) Item ruft dies
   * (z.B. Projekt öffnen). Tap auf einen Nachbarn zentriert ihn nur.
   * Ohne onOeffnen = reines Durchblättern (Foto-Ebene).
   */
  readonly onOeffnen?: (index: number) => void;
  /** Pflicht-Label der Karussell-Region (Screenreader). */
  readonly ariaLabel: string;
}

// ─── Stagger-Stufen (Yormas-Rezept, in Akzentfarbe getönt) ──────────

interface StaggerStil {
  readonly scale: number;
  readonly opacity: number;
  readonly filter: string;
}

/** Geometrie je Distanz zur Mitte (0 = Mitte). */
function staggerFuer(distanz: number, reduziert: boolean): StaggerStil {
  if (reduziert) return { scale: 1, opacity: 1, filter: "blur(0px)" };
  if (distanz === 0) return { scale: 1, opacity: 1, filter: "blur(0px)" };
  if (distanz === 1) return { scale: 0.94, opacity: 0.78, filter: "blur(3px)" };
  if (distanz === 2) return { scale: 0.88, opacity: 0.52, filter: "blur(6px)" };
  return { scale: 0.84, opacity: 0.32, filter: "blur(9px)" };
}

/** Außen-Glow je Distanz — in der Akzentfarbe des Items getönt. */
function schattenFuer(distanz: number, akzent: string, reduziert: boolean): string {
  if (reduziert) {
    return `0 8px 24px -10px ${akzent}40, 0 6px 24px -10px rgba(0,0,0,0.4)`;
  }
  if (distanz === 0) {
    return `0 22px 60px -18px ${akzent}8c, 0 8px 24px -10px rgba(0,0,0,0.45)`;
  }
  if (distanz === 1) {
    return `0 14px 36px -16px ${akzent}52, 0 4px 14px -6px rgba(0,0,0,0.28)`;
  }
  if (distanz === 2) {
    return `0 8px 22px -12px ${akzent}33`;
  }
  return `0 4px 14px -10px ${akzent}1f`;
}

// ═══════════════════════════════════════════════════════════════════
// PeekKarussell
// ═══════════════════════════════════════════════════════════════════

export function PeekKarussell({
  eintraege,
  startIndex = 0,
  onOeffnen,
  ariaLabel,
}: PeekKarussellProps) {
  const reduziert = useReducedMotion() ?? false;
  const anzahl = eintraege.length;
  const mehrere = anzahl > 1;
  const sicherStart =
    anzahl > 0 ? Math.max(0, Math.min(startIndex, anzahl - 1)) : 0;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [aktiverIndex, setAktiverIndex] = useState(sicherStart);
  const [istMobile, setIstMobile] = useState(false);
  const headerId = useMemo(
    () => `peek-karussell-${Math.random().toString(36).slice(2, 8)}`,
    [],
  );

  // ─── Viewport-Detection für Pfeile (Desktop-only) ─────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 767px)");
    const sync = () => setIstMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  // ─── IntersectionObserver: das mittige Item bestimmt aktiverIndex ──
  // root = Scroller, schmaler zentraler Trigger-Streifen (-45% L/R),
  // höchste Ratio gewinnt. Reduced-Motion deaktiviert den Stagger nicht,
  // braucht den aktiven Index aber weiterhin für Dots/Pfeile/A11y.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || anzahl === 0) return;

    const beobachter = new IntersectionObserver(
      (eintraegeIO) => {
        let kandidat: { index: number; ratio: number } | null = null;
        for (const eintrag of eintraegeIO) {
          const indexAttr = (eintrag.target as HTMLElement).dataset.index;
          if (!indexAttr) continue;
          const index = Number.parseInt(indexAttr, 10);
          if (Number.isNaN(index)) continue;
          if (!eintrag.isIntersecting) continue;
          if (!kandidat || eintrag.intersectionRatio > kandidat.ratio) {
            kandidat = { index, ratio: eintrag.intersectionRatio };
          }
        }
        if (kandidat) setAktiverIndex(kandidat.index);
      },
      {
        root: scroller,
        rootMargin: "0px -45% 0px -45%",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    itemRefs.current.forEach((node) => {
      if (node) beobachter.observe(node);
    });
    return () => beobachter.disconnect();
  }, [anzahl]);

  // ─── Out-of-bounds-Schutz bei Listenwechsel ───────────────────────
  useEffect(() => {
    setAktiverIndex((alt) => Math.max(0, Math.min(alt, anzahl - 1)));
  }, [anzahl]);

  // ─── Programmatisch zur Mitte scrollen ────────────────────────────
  const scrolleZu = useCallback(
    (index: number) => {
      const ziel = Math.max(0, Math.min(index, anzahl - 1));
      const node = itemRefs.current[ziel];
      if (!node) return;
      node.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    },
    [anzahl],
  );

  const handleZurueck = useCallback(
    () => scrolleZu(aktiverIndex - 1),
    [aktiverIndex, scrolleZu],
  );
  const handleWeiter = useCallback(
    () => scrolleZu(aktiverIndex + 1),
    [aktiverIndex, scrolleZu],
  );

  // ─── Tastatur ←/→ (hinter offenem modalem Dialog gesperrt, außer wir
  //     SIND der Dialog-Inhalt → onOeffnen fehlt = Foto-Ebene). ───────
  useEffect(() => {
    if (anzahl === 0) return;
    const onKey = (event: KeyboardEvent) => {
      // Nur die Projekt-Ebene (onOeffnen gesetzt) ruht hinter dem Dialog;
      // die Foto-Ebene LEBT im Dialog und darf weiter blättern.
      if (
        onOeffnen &&
        document.querySelector('[role="dialog"][aria-modal="true"]')
      ) {
        return;
      }
      if (event.key === "ArrowRight") handleWeiter();
      else if (event.key === "ArrowLeft") handleZurueck();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [anzahl, onOeffnen, handleWeiter, handleZurueck]);

  // ─── Nachbar-Bilder vorladen (ruckelfreies Wischen) ───────────────
  useEffect(() => {
    if (!mehrere) return;
    const nachbarn = [aktiverIndex - 1, aktiverIndex + 1];
    nachbarn.forEach((i) => {
      if (i < 0 || i >= anzahl) return;
      const quelle = eintraege[i]?.quelle;
      if (quelle) {
        const bild = new Image();
        bild.src = quelle;
      }
    });
  }, [aktiverIndex, anzahl, mehrere, eintraege]);

  // ─── Tap auf ein Item: Mitte öffnet, Nachbar zentriert ────────────
  const handleItemKlick = useCallback(
    (index: number) => {
      if (index === aktiverIndex) {
        if (onOeffnen) onOeffnen(index);
      } else {
        scrolleZu(index);
      }
    },
    [aktiverIndex, onOeffnen, scrolleZu],
  );

  if (anzahl === 0) return null;

  const aktiv = eintraege[aktiverIndex];

  return (
    <section
      role="region"
      aria-roledescription="Karussell"
      aria-label={ariaLabel}
      className="relative select-none"
    >
      <h2 id={headerId} className="sr-only">
        {ariaLabel}
      </h2>

      {/* Live-Region: kündigt den mittigen Eintrag an. */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {`${aktiverIndex + 1} von ${anzahl}: ${aktiv.titel}`}
      </p>

      {/* Kopfzeile: Zähler (links) + Pfeile (Desktop, rechts). */}
      <div className="flex items-center justify-between gap-4 mb-3 px-1">
        {mehrere ? (
          <p className="font-mono text-[11px] text-white/45 tracking-wide">
            {String(aktiverIndex + 1).padStart(2, "0")} /{" "}
            {String(anzahl).padStart(2, "0")}
          </p>
        ) : (
          <span />
        )}
        {mehrere && !istMobile && (
          <div className="flex gap-2">
            <NavPfeil
              richtung="zurueck"
              onClick={handleZurueck}
              disabled={aktiverIndex === 0}
              label="Vorheriges Bild"
            />
            <NavPfeil
              richtung="weiter"
              onClick={handleWeiter}
              disabled={aktiverIndex === anzahl - 1}
              label="Nächstes Bild"
            />
          </div>
        )}
      </div>

      {/* ─── Scroller: nativer Scroll-Snap, mittig angeschnittene Nachbarn ─ */}
      <div
        ref={scrollerRef}
        aria-labelledby={headerId}
        className="scrollbar-none overflow-x-auto snap-x snap-mandatory scroll-smooth"
        style={{ scrollPaddingInline: "10%" }}
      >
        <ul className="flex gap-4 md:gap-6 px-[10%] py-4 m-0 list-none">
          {eintraege.map((eintrag, index) => {
            const distanz = Math.abs(index - aktiverIndex);
            const stil = staggerFuer(distanz, reduziert);
            const schatten = schattenFuer(distanz, eintrag.akzentFarbe, reduziert);
            const istAktiv = index === aktiverIndex;
            const eager = Math.abs(index - sicherStart) <= 1;
            // Portrait-Breiten: Mitte prominent, Nachbarn schneiden schön an.
            const breite = istAktiv
              ? "w-[72%] sm:w-[54%] md:w-[44%] lg:w-[36%]"
              : "w-[64%] sm:w-[48%] md:w-[40%] lg:w-[33%]";
            // Tap-Label spiegelt das Verhalten (öffnen vs. zentrieren).
            const tapLabel = istAktiv
              ? onOeffnen
                ? `Öffnen: ${eintrag.titel}`
                : eintrag.titel
              : `Zu „${eintrag.titel}" wechseln`;

            return (
              <li
                key={eintrag.quelle}
                data-index={index}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                className={`snap-center shrink-0 ${breite}`}
                aria-current={istAktiv ? "true" : undefined}
              >
                <motion.figure
                  className="relative m-0 overflow-hidden rounded-3xl border border-white/12 bg-grund-900"
                  animate={{
                    scale: stil.scale,
                    opacity: stil.opacity,
                    filter: stil.filter,
                    boxShadow: schatten,
                  }}
                  transition={{
                    duration: reduziert ? 0 : 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleItemKlick(index)}
                    aria-label={tapLabel}
                    /* Mittiges Item ohne onOeffnen ist nicht „klickbar" —
                       bleibt fokussierbar fürs Tastatur-Blättern, tut aber
                       beim Aktivieren nichts (kein Cursor-Hinweis). */
                    className={`group block w-full aspect-[3/4] text-left
                                focus:outline-none focus-visible:ring-2
                                focus-visible:ring-white/70 focus-visible:ring-offset-2
                                focus-visible:ring-offset-grund-950 rounded-3xl
                                ${istAktiv && !onOeffnen ? "cursor-default" : "cursor-pointer"}`}
                  >
                    {/* Unscharfes gezoomtes Cover als Hintergrund (App-Store-Stil). */}
                    <img
                      src={eintrag.quelle}
                      alt=""
                      aria-hidden="true"
                      loading={eager ? "eager" : "lazy"}
                      decoding="async"
                      draggable={false}
                      className="absolute inset-0 h-full w-full scale-110 object-cover object-center
                                 blur-2xl saturate-[1.15] opacity-60"
                    />
                    <div className="absolute inset-0 bg-grund-950/40" aria-hidden="true" />
                    {/* Scharfes Screenshot-Bild contained/zentriert darüber. */}
                    <img
                      src={eintrag.quelle}
                      alt={eintrag.titel}
                      loading={eager ? "eager" : "lazy"}
                      decoding="async"
                      draggable={false}
                      className="absolute inset-0 h-full w-full object-contain
                                 drop-shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
                    />
                    {/* Akzent-Schimmer oben + Bottom-Vignette für Lesbarkeit. */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-1/3"
                      style={{
                        background: `linear-gradient(to bottom, ${eintrag.akzentFarbe}1f, transparent)`,
                      }}
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t
                                 from-grund-950/90 via-grund-950/15 to-transparent"
                    />
                  </button>

                  {/* Caption nur am aktiven (mittigen) Item — ruhig, kein Gewimmel. */}
                  <figcaption
                    className={`pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-5
                                transition-opacity duration-500 ${
                                  istAktiv ? "opacity-100" : "opacity-0"
                                }`}
                  >
                    <span
                      className="inline-block font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em]"
                      style={{ color: eintrag.akzentFarbe }}
                    >
                      {String(index + 1).padStart(2, "0")} / {String(anzahl).padStart(2, "0")}
                    </span>
                    <h3 className="mt-1 font-display font-bold text-white text-base sm:text-lg leading-tight text-balance">
                      {eintrag.titel}
                    </h3>
                    {eintrag.untertitel && (
                      <p className="mt-1 text-xs sm:text-sm text-white/75 leading-snug text-pretty line-clamp-2">
                        {eintrag.untertitel}
                      </p>
                    )}
                  </figcaption>
                </motion.figure>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ─── Dots (aktiv = Akzent-Pille mit Glow) ─────────────────────── */}
      {mehrere && (
        <div className="mt-4 flex flex-wrap items-center justify-center max-w-full overflow-hidden">
          {eintraege.map((eintrag, index) => {
            const aktivDot = index === aktiverIndex;
            return (
              <button
                key={eintrag.quelle}
                type="button"
                onClick={() => scrolleZu(index)}
                aria-label={`Zu ${index + 1}: ${eintrag.titel}`}
                aria-current={aktivDot ? "true" : undefined}
                className="grid place-items-center rounded-full transition-all duration-200
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40
                           focus-visible:ring-offset-2 focus-visible:ring-offset-grund-950"
                style={{ minWidth: 32, minHeight: 36 }}
              >
                <span
                  aria-hidden="true"
                  className="block h-1.5 rounded-full transition-all duration-200"
                  style={{
                    width: aktivDot ? 26 : 6,
                    background: aktivDot ? eintrag.akzentFarbe : "rgba(255,255,255,0.22)",
                    boxShadow: aktivDot ? `0 0 12px ${eintrag.akzentFarbe}88` : undefined,
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

// ─── Navigations-Pfeil (≥44px Touch-Target, Rand disabled) ──────────

function NavPfeil({
  richtung,
  onClick,
  disabled,
  label,
}: {
  readonly richtung: "zurueck" | "weiter";
  readonly onClick: () => void;
  readonly disabled: boolean;
  readonly label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full border border-white/10
                 bg-grund-950/70 text-white/70 backdrop-blur-sm transition-all
                 hover:border-white/25 hover:text-white
                 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-white/70
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
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
        style={{ transform: richtung === "zurueck" ? "rotate(180deg)" : "none" }}
        aria-hidden="true"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}
