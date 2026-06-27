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
//   genug zum sauberen Anschneiden). Die Bild-Items sind TEXTFREI; der
//   Titel/Untertitel steht als ruhiger Caption-Block UNTER der Bühne.
//
// Zentrierung (auch erstes/letztes Item): leere Spacer-<li> links/rechts
// mit Breite = (100 − Item-Breite)/2 je Breakpoint. So snappt das erste
// Item bereits bei scrollLeft 0 in die Mitte — ohne Mess-Logik, ohne
// Rückkopplungs-Kreis. Alle Items sind gleich breit (kein Layout-Reflow),
// die Mitte wirkt allein über scale/opacity/blur prominent.
//
// Loop: nach dem letzten Item kommt wieder das erste (Pfeile/Tastatur).
//
// A11y: role="region" + aria-roledescription="Karussell", aria-current
// am aktiven Item, Live-Region (i/n + Titel), Dots (aktiv = Akzent-
// Pille), Pfeile (Desktop), Tastatur ←/→, sichtbarer Fokus-Ring,
// ≥44px Touch-Targets. prefers-reduced-motion → flach.
// ═══════════════════════════════════════════════════════════════════

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// ─── Daten-Vertrag ──────────────────────────────────────────────────

export interface PeekEintrag {
  /** Bildquelle (Pfad ab /public). */
  readonly quelle: string;
  /** Titel (Caption-Überschrift + A11y-Label). */
  readonly titel: string;
  /** Optionaler Untertitel (eine Zeile Kontext). */
  readonly untertitel?: string;
  /** Hex-Akzentfarbe (für Glow, aktiven Dot). */
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

  // ─── Start-Position: erstes Item ist via Spacer schon bei scrollLeft 0
  //     zentriert; nur bei startIndex > 0 einmal hinscrollen. ──────────
  const startGesetzt = useRef(false);
  useEffect(() => {
    if (startGesetzt.current || sicherStart === 0) return;
    const node = itemRefs.current[sicherStart];
    if (!node) return;
    node.scrollIntoView({ inline: "center", block: "nearest", behavior: "auto" });
    startGesetzt.current = true;
  }, [sicherStart]);

  // ─── IntersectionObserver: das mittige Item bestimmt aktiverIndex ──
  // root = Scroller, schmaler zentraler Trigger-Streifen (-45% L/R),
  // höchste Ratio gewinnt. Hält den Index beim manuellen Wischen in Sync.
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

  // ─── #1 Programmatisch zur Mitte scrollen — Index DIREKT setzen ────
  // Der ziel-Index ist bereits gültig (gewrappt vom Aufrufer); der Clamp
  // ist nur ein Sicherheitsnetz. setAktiverIndex DIREKT, damit Pfeile/Dots
  // zuverlässig weiterschalten (nicht aufs Observer-Timing warten). Der
  // Observer hält den Index beim manuellen Wischen weiter in Sync.
  const scrolleZu = useCallback(
    (index: number) => {
      const ziel = ((index % anzahl) + anzahl) % anzahl;
      const node = itemRefs.current[ziel];
      if (!node) return;
      setAktiverIndex(ziel);
      node.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    },
    [anzahl],
  );

  // ─── #4a LOOP: Pfeile/Tastatur wrappen am Rand ────────────────────
  const handleZurueck = useCallback(
    () => scrolleZu((aktiverIndex - 1 + anzahl) % anzahl),
    [aktiverIndex, anzahl, scrolleZu],
  );
  const handleWeiter = useCallback(
    () => scrolleZu((aktiverIndex + 1) % anzahl),
    [aktiverIndex, anzahl, scrolleZu],
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

  // ─── Nachbar-Bilder vorladen (ruckelfreies Wischen, inkl. Loop-Rand) ─
  useEffect(() => {
    if (!mehrere) return;
    const nachbarn = [
      (aktiverIndex - 1 + anzahl) % anzahl,
      (aktiverIndex + 1) % anzahl,
    ];
    nachbarn.forEach((i) => {
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
  // Spacer-Breiten = (100 − Item-Breite)/2 je Breakpoint → erstes/letztes
  // Item exakt zentriert, ohne Padding-Mess-Kreis. Passt zu `breite`.
  const spacerBreite = "w-[20%] sm:w-[28%] md:w-[32%] lg:w-[35%]";

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
            <NavPfeil richtung="zurueck" onClick={handleZurueck} label="Zurück" />
            <NavPfeil richtung="weiter" onClick={handleWeiter} label="Weiter" />
          </div>
        )}
      </div>

      {/* ─── Scroller: nativer Scroll-Snap, mittig angeschnittene Nachbarn ─ */}
      <div
        ref={scrollerRef}
        aria-labelledby={headerId}
        className="scrollbar-none overflow-x-auto snap-x snap-mandatory scroll-smooth"
      >
        <ul className="flex gap-4 md:gap-6 py-4 m-0 list-none">
          {/* Leading-Spacer: zentriert das erste Item (kein Mess-Padding). */}
          <li aria-hidden="true" className={`shrink-0 ${spacerBreite}`} />
          {eintraege.map((eintrag, index) => {
            const distanz = Math.abs(index - aktiverIndex);
            const stil = staggerFuer(distanz, reduziert);
            const schatten = schattenFuer(distanz, eintrag.akzentFarbe, reduziert);
            const istAktiv = index === aktiverIndex;
            const eager = Math.abs(index - sicherStart) <= 1;
            // #2 Kleinere Vorschaubilder: Mitte prominent, mehr Nachbarn
            //    lugen heraus. Mit gemessenem Padding zentriert alles korrekt.
            // Alle Items gleich breit → kein Layout-Reflow beim Blättern;
            // die Prominenz der Mitte kommt allein über scale/opacity/blur.
            const breite = "w-[60%] sm:w-[44%] md:w-[36%] lg:w-[30%]";
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
                {/* #3 TEXTFREIES Bild-Item — sauber, nur App-Store-Bild +
                    dezenter Akzent-Schimmer. Caption steht unter der Bühne. */}
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
                    {/* Dezenter Akzent-Schimmer oben (kein Text mehr im Bild). */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-1/3"
                      style={{
                        background: `linear-gradient(to bottom, ${eintrag.akzentFarbe}1f, transparent)`,
                      }}
                    />
                  </button>
                </motion.figure>
              </li>
            );
          })}
          {/* Trailing-Spacer: zentriert das letzte Item. */}
          <li aria-hidden="true" className={`shrink-0 ${spacerBreite}`} />
        </ul>
      </div>

      {/* ─── #3 Caption UNTER der Bühne — nur der aktive Eintrag, ruhig ──
          Konsistent über beide Ebenen: gleiche Schriftfarbe/-größe,
          zentriert, feste Mindesthöhe (kein Layout-Shift), sanfter
          Wechsel (reduced-motion = reines Fade). */}
      <div className="mt-5 min-h-[4.25rem] flex items-start justify-center text-center px-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={aktiverIndex}
            initial={reduziert ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={reduziert ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduziert ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: reduziert ? 0.2 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-md"
          >
            <h3 className="font-display font-bold text-white text-base sm:text-lg leading-tight text-balance">
              {aktiv.titel}
            </h3>
            {aktiv.untertitel && (
              <p className="mt-1 text-sm text-white/60 leading-snug text-pretty">
                {aktiv.untertitel}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Dots (aktiv = Akzent-Pille mit Glow) ─────────────────────── */}
      {mehrere && (
        <div className="mt-2 flex flex-wrap items-center justify-center max-w-full overflow-hidden">
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

// ─── Navigations-Pfeil (≥44px Touch-Target; loopt, daher nie disabled) ─

function NavPfeil({
  richtung,
  onClick,
  label,
}: {
  readonly richtung: "zurueck" | "weiter";
  readonly onClick: () => void;
  readonly label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full border border-white/10
                 bg-grund-950/70 text-white/70 backdrop-blur-sm transition-all
                 hover:border-white/25 hover:text-white
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
