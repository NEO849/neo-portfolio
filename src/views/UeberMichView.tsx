import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ZEITSTRAHL } from "../models/daten";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { InfoKarte } from "../bausteine/InfoKarte";
import { AbzeichenStatus } from "../bausteine/AbzeichenStatus";

// ═══════════════════════════════════════════════════════════════════
// VIEW: Über mich — Profil + mein_weg mit Year-Wheel Zeitstrahl
// ═══════════════════════════════════════════════════════════════════

// ─── Wheel-Konstanten ────────────────────────────────────────────
const ITEM_H   = 56;                       // Pixel pro Slot
const SICHTBAR = 5;                        // Sichtbare Slots (2 + aktiv + 2)
const WHEEL_H  = ITEM_H * SICHTBAR;       // 280 px Gesamthöhe
const HALBRAD  = Math.floor(SICHTBAR / 2); // 2 — Slots über dem aktiven Item

// ─── Kategorie-Konfiguration ─────────────────────────────────────
type ZeitstrahlKat = "beruf" | "bildung" | "security" | "meilenstein";

const KATEGORIE_CFG: Record<ZeitstrahlKat, {
  variante: "akzent" | "cyber" | "aktiv" | "entwicklung";
  lichtfarbe: string;
  akzentFarbe: string;
  label: string;
}> = {
  beruf:       { variante: "akzent",      lichtfarbe: "99, 102, 241",  akzentFarbe: "#6366f1", label: "Beruf"       },
  bildung:     { variante: "cyber",       lichtfarbe: "34, 211, 238",  akzentFarbe: "#22d3ee", label: "Bildung"     },
  security:    { variante: "aktiv",       lichtfarbe: "148, 163, 184", akzentFarbe: "#94a3b8", label: "Security"    },
  meilenstein: { variante: "entwicklung", lichtfarbe: "34, 197, 94",   akzentFarbe: "#22c55e", label: "Meilenstein" },
};

// ─── YearWheel ───────────────────────────────────────────────────
interface YearWheelProps {
  eintraege: typeof ZEITSTRAHL;
  aktiversIndex: number;
  onSelect: (idx: number) => void;
}

function YearWheel({ eintraege, aktiversIndex, onSelect }: YearWheelProps) {
  return (
    <div
      className="relative select-none"
      style={{
        height: WHEEL_H,
        overflow: "hidden",
        maskImage:
          "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 18%, black 32%, black 68%, rgba(0,0,0,0.5) 82%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 18%, black 32%, black 68%, rgba(0,0,0,0.5) 82%, transparent 100%)",
      }}
    >
      {/* Aktiv-Slot Highlight */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: HALBRAD * ITEM_H,
          height: ITEM_H,
          background: "linear-gradient(90deg, rgba(99,102,241,0.08), transparent 75%)",
          borderTop: "1px solid rgba(99,102,241,0.15)",
          borderBottom: "1px solid rgba(99,102,241,0.15)",
        }}
      />

      {eintraege.map((eintrag, i) => {
        const abstand    = i - aktiversIndex;
        const absAbstand = Math.abs(abstand);
        const istAktiv   = abstand === 0;

        return (
          <motion.button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`${eintrag.jahr} — ${eintrag.titel}`}
            aria-pressed={istAktiv}
            className="absolute inset-x-0 flex items-center justify-end pr-5 focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-akzent-400/30"
            style={{ height: ITEM_H, top: 0 }}
            animate={{
              y:       (HALBRAD + abstand) * ITEM_H,
              scale:   Math.max(0.60, 1 - absAbstand * 0.13),
              opacity: Math.max(0.06, 1 - absAbstand * 0.33),
              filter:  `blur(${Math.min(absAbstand * 1.5, 6)}px)`,
            }}
            transition={{ type: "spring", stiffness: 280, damping: 30, mass: 0.85 }}
          >
            <span
              className="font-mono leading-none"
              style={{
                fontSize:      istAktiv ? 15 : 12,
                fontWeight:    istAktiv ? 700 : 400,
                color:         istAktiv ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)",
                letterSpacing: istAktiv ? "0.06em" : "0.02em",
              }}
            >
              {eintrag.jahr}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── TimelineCard ────────────────────────────────────────────────
interface TimelineCardProps {
  eintrag: typeof ZEITSTRAHL[number];
  aktiv: boolean;
}

function TimelineCard({ eintrag, aktiv }: TimelineCardProps) {
  const cfg = KATEGORIE_CFG[eintrag.kategorie as ZeitstrahlKat] ?? KATEGORIE_CFG.beruf;

  return (
    <div className={`transition-opacity duration-500 ${aktiv ? "opacity-100" : "opacity-55"}`}>
      <InfoKarte
        lichtfarbe={cfg.lichtfarbe}
        akzentRand
        akzentFarbe={cfg.akzentFarbe}
        mitHoverAnimation={false}
        klassen="p-4"
        stil={aktiv ? { boxShadow: `0 0 32px ${cfg.akzentFarbe}20` } : undefined}
      >
        <div className="flex items-center gap-3 mb-2">
          <AbzeichenStatus variante={cfg.variante} text={cfg.label} klassen="uppercase" />
          <span className="font-mono text-xs text-white/45">{eintrag.jahr}</span>
        </div>
        <h3 className="font-display text-base font-bold text-white mb-1.5">
          {eintrag.titel}
        </h3>
        <p className="text-sm text-white/65 leading-relaxed">
          {eintrag.beschreibung}
        </p>
      </InfoKarte>
    </div>
  );
}

// ─── View ────────────────────────────────────────────────────────
export default function UeberMichView() {
  const [aktiversIndex, setAktiversIndex] = useState(0);
  const kartenRefs = useRef<(HTMLDivElement | null)[]>([]);

  // IntersectionObserver: aktive Card → Wheel synchronisieren
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = kartenRefs.current.findIndex((r) => r === entry.target);
          if (idx !== -1) setAktiversIndex(idx);
        });
      },
      { rootMargin: "-28% 0px -55% 0px", threshold: 0 },
    );
    const snapshot = [...kartenRefs.current];
    snapshot.forEach((ref) => ref && observer.observe(ref));
    return () => observer.disconnect();
  }, []);

  const scrollToCard = (idx: number) => {
    setAktiversIndex(idx);
    kartenRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section id="ueber" className="py-16 px-6 max-w-5xl mx-auto">
      <AbschnittsTitel prefix="> ueber_mich" klassen="mb-10" />

      {/* Profil-Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="mb-4"
      >
        <InfoKarte lichtfarbe="99, 102, 241" klassen="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-[11px] text-akzent-400/55">› profil</span>
            <div className="h-px flex-1 bg-white/[0.04]" />
          </div>
          <div className="space-y-4">
            <p className="text-white/80 leading-relaxed">
              Ich arbeite strukturiert, analytisch und mit dem Anspruch, Systeme wirklich zu verstehen. Neue Themen erschließe ich mir nicht oberflächlich, sondern Schritt für Schritt – durch Recherche, Dokumentation, Tests und praktische Umsetzung. Genau so habe ich mir in den letzten Jahren ein breites technisches Fundament aufgebaut: IT-Infrastruktur, Linux- und Server-Administration, iOS-Entwicklung mit SwiftUI und MVVM, moderne Web-Anwendungen, Security Research und eigene Bug-Bounty-Pipelines.
            </p>
            <p className="text-white/70 leading-relaxed">
              Meine Stärke liegt darin, komplexe Zusammenhänge greifbar zu machen. Ich denke in Architekturen, Protokollen, Repositories, ViewModels, Services, APIs, Datenflüssen und klar getrennten Verantwortlichkeiten. Dabei ist mir wichtig, dass Anwendungen nicht nur funktionieren, sondern verständlich, wartbar, testbar und langfristig erweiterbar bleiben.
            </p>
            <p className="text-white/70 leading-relaxed">
              Aus der Arbeit in interdisziplinären Teams bringe ich Erfahrung im Umgang mit unterschiedlichen Perspektiven, Anforderungen und Kommunikationsstilen mit. Ich habe gelernt, aufmerksam zuzuhören, Verantwortung zu übernehmen und auch in anspruchsvollen Situationen klar und lösungsorientiert zu handeln. Diese Kombination aus technischer Tiefe, analytischem Denken, sauberer Struktur und Besonnenheit prägt meine Arbeitsweise.
            </p>
          </div>
        </InfoKarte>
      </motion.div>

      {/* Hobbys */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-14"
      >
        <InfoKarte lichtfarbe="34, 211, 238" mitHoverAnimation={false} klassen="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[11px] text-cyber-400/50">› außerhalb_der_technik</span>
            <div className="h-px flex-1 bg-white/[0.04]" />
          </div>
          <p className="text-white/70 leading-relaxed text-sm">
            Auch abseits der Technik ist mir Ausdauer wichtig. In den Bergen bin ich zuhause – beim Wandern, Klettern und auf Klettersteigen. Diese Erfahrungen schärfen meinen Fokus, meine Geduld und meine Fähigkeit, in anspruchsvollen Situationen ruhig und entschlossen zu handeln.
          </p>
        </InfoKarte>
      </motion.div>

      {/* mein_weg Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="mb-8"
      >
        <h3 className="font-mono text-base md:text-lg font-semibold tracking-wider">
          <span className="text-akzent-400">&gt;</span>
          <span className="text-white/70"> mein_weg</span>
        </h3>
      </motion.div>

      {/* Mobile: kompakte horizontale Jahres-Auswahl */}
      <div className="md:hidden flex items-center gap-5 overflow-x-auto scrollbar-none mb-6 pb-1">
        {ZEITSTRAHL.map((e, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollToCard(i)}
            className={`flex-shrink-0 font-mono text-[11px] transition-all duration-300 focus:outline-none ${
              i === aktiversIndex
                ? "text-akzent-400 font-bold"
                : "text-white/30 hover:text-white/55"
            }`}
          >
            {e.jahr}
          </button>
        ))}
      </div>

      {/* Year Wheel + Cards */}
      <div className="flex gap-0 md:gap-10">

        {/* Linke Spalte: sticky Year Wheel (nur Desktop) */}
        <div className="hidden md:block flex-shrink-0 w-[108px] relative">
          {/* Vertikale Verbindungslinie */}
          <div
            className="absolute right-0 top-0 bottom-0 w-px pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(99,102,241,0.22) 15%, rgba(99,102,241,0.22) 85%, transparent 100%)",
            }}
          />
          {/* Aktiv-Punkt auf der Linie (klebt am Wheel) */}
          <div
            className="sticky pointer-events-none"
            style={{ top: `calc(50vh - ${WHEEL_H / 2}px)` }}
          >
            <motion.div
              className="absolute rounded-full bg-akzent-400 z-10"
              style={{
                right: -3,
                top:   HALBRAD * ITEM_H + ITEM_H / 2 - 3.5,
                width:  7,
                height: 7,
              }}
              animate={{
                boxShadow: [
                  "0 0 4px rgba(99,102,241,0.45)",
                  "0 0 12px rgba(99,102,241,0.85)",
                  "0 0 4px rgba(99,102,241,0.45)",
                ],
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Wheel selbst */}
          <div
            className="sticky"
            style={{ top: `calc(50vh - ${WHEEL_H / 2}px)` }}
          >
            <YearWheel
              eintraege={ZEITSTRAHL}
              aktiversIndex={aktiversIndex}
              onSelect={scrollToCard}
            />
          </div>
        </div>

        {/* Rechte Spalte: Timeline Cards */}
        <div className="flex-1 min-w-0 space-y-8">
          {ZEITSTRAHL.map((eintrag, i) => (
            <div
              key={`${eintrag.kategorie}-${i}`}
              ref={(el) => { kartenRefs.current[i] = el; }}
            >
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <TimelineCard eintrag={eintrag} aktiv={i === aktiversIndex} />
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
