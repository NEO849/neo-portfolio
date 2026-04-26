import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassTabs } from "../bausteine/GlassTabs";

// ═══════════════════════════════════════════════════════
// VIEW: Dokumente — Zeugnisse, Zertifikate, Lebenslauf, Anschreiben
// Einheitliches Karussell mit Swipe-Support
// ═══════════════════════════════════════════════════════

interface DokumentEintrag {
  readonly titel: string;
  readonly aussteller: string;
  readonly jahr: string;
  readonly beschreibung: string;
  readonly pdfPfad: string;
  readonly vorschauBild: string;
  readonly kategorie: "zeugnis" | "zertifikat" | "lebenslauf" | "anschreiben";
  readonly akzentFarbe: string;
}

const KATEGORIE_LABEL: Record<DokumentEintrag["kategorie"], string> = {
  zeugnis:     "Zeugnis",
  zertifikat:  "Zertifikat",
  lebenslauf:  "Lebenslauf",
  anschreiben: "Anschreiben",
};

// GlassTabs-Daten: id = String(index), label = Kategorie-Label
// Wird nach DOKUMENTE definiert — nach der DOKUMENTE-Konstante weiter unten genutzt.

const DOKUMENTE: DokumentEintrag[] = [
  {
    titel: "Gesellenbrief – Elektroinstallateur",
    aussteller: "Handwerkskammer Niederbayern-Oberpfalz, Straubing",
    jahr: "2003",
    beschreibung: "Gesellenprüfung im Ausbildungsberuf Elektroinstallateur mit Erfolg abgelegt. Ausbildung bei Fa. Freise, Deggendorf (1999–2003). Grundlage für 15 Jahre Berufserfahrung in Elektronik, IT-Infrastruktur und Netzwerktechnik.",
    pdfPfad: "/Gesellenbrief.pdf",
    vorschauBild: "/gesellenbrief.jpg",
    kategorie: "zeugnis",
    akzentFarbe: "#818cf8",
  },
  {
    titel: "IT-Fachkraft für App-Entwicklung (iOS & Android)",
    aussteller: "Syntax Institut Berlin – CERTQUA zertifiziert (DIN EN ISO 9001)",
    jahr: "2024",
    beschreibung: "2.300 Unterrichtseinheiten im Remote Learning. Module: Mobile UX/UI Design, Grundlagen Programmierung, Android App Development (Kotlin, MVVM, Room, Retrofit), iOS App Development (SwiftUI, Core Data, Firebase). Abschluss: 07. November 2024.",
    pdfPfad: "/Zertifikat_IT_Fachkraft.pdf",
    vorschauBild: "/zertifikat_vorschau.jpg",
    kategorie: "zertifikat",
    akzentFarbe: "#22d3ee",
  },
  {
    titel: "Lebenslauf",
    aussteller: "Michael Fleps",
    jahr: "2025",
    beschreibung: "Vollständiger tabellarischer Lebenslauf mit Berufserfahrung, Ausbildung, IT-Qualifikationen und persönlichen Stärken.",
    pdfPfad: "/Michael_Fleps_Lebenslauf.pdf",
    vorschauBild: "/lebenslauf_vorschau.jpg",
    kategorie: "lebenslauf",
    akzentFarbe: "#22c55e",
  },
  {
    titel: "Anschreiben",
    aussteller: "Michael Fleps",
    jahr: "2025",
    beschreibung: "Persönliches Anschreiben für Positionen im Bereich IT-Security, Fullstack Development und Software-Engineering.",
    pdfPfad: "/Michael_Fleps_Anschreiben.pdf",
    vorschauBild: "/anschreiben_vorschau.jpg",
    kategorie: "anschreiben",
    akzentFarbe: "#f59e0b",
  },
];

const DOKUMENT_TABS = DOKUMENTE.map((dok, index) => ({
  id: String(index),
  label: KATEGORIE_LABEL[dok.kategorie],
}));

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export default function ZeugnisseView() {
  const [aktuellerIndex, setAktuellerIndex] = useState(0);
  const [richtung, setRichtung] = useState(0);
  const [lightboxOffen, setLightboxOffen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const karussellRef = useRef<HTMLDivElement>(null);

  const navigiere = (neuerIndex: number) => {
    setRichtung(neuerIndex > aktuellerIndex ? 1 : -1);
    setAktuellerIndex((neuerIndex + DOKUMENTE.length) % DOKUMENTE.length);
  };

  const vorherige = () => navigiere(aktuellerIndex - 1);
  const naechste  = () => navigiere(aktuellerIndex + 1);

  // Tastatur
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")      { setLightboxOffen(false); return; }
      if (e.key === "ArrowLeft")   vorherige();
      if (e.key === "ArrowRight")  naechste();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [aktuellerIndex]);

  // Touch Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 48) delta > 0 ? naechste() : vorherige();
    touchStartX.current = null;
  };

  const aktuell = DOKUMENTE[aktuellerIndex];

  const kartenVarianten = {
    eintreten: (r: number) => ({ opacity: 0, x: r * 40 }),
    sichtbar:  { opacity: 1, x: 0, transition: { duration: 0.38, ease: EASE } },
    verlassen: (r: number) => ({ opacity: 0, x: r * -40, transition: { duration: 0.28, ease: EASE } }),
  };

  return (
    <section
      id="zeugnisse"
      className="py-16 px-6 max-w-5xl mx-auto"
    >
      {/* Titel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <p className="font-mono text-sm text-akzent-400 mb-2">&gt; dokumente</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Dokumente & Qualifikationen</h2>
        <p className="text-white/50 text-sm max-w-xl">
          Zeugnisse, Zertifikate und Bewerbungsunterlagen — klicke zur Vorschau.
        </p>
      </motion.div>

      <GlassTabs
        tabs={DOKUMENT_TABS}
        activeId={String(aktuellerIndex)}
        onTabChange={(id) => {
          const idx = Number(id);
          if (idx !== aktuellerIndex) navigiere(idx);
        }}
        layoutId="dokumente-tab-bg"
        ariaLabel="Dokument-Navigation"
        scrollable={false}
        buttonClassName="min-w-0 px-1.5 sm:px-4 text-[11px] sm:text-sm"
        className="mb-8 w-full"
      />

      {/* Karussell — px-10 auf Mobile hält Pfeile in der Padding-Zone */}
      <div
        ref={karussellRef}
        className="relative px-10 md:px-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pfeile */}
        {[
          { richtung: -1, fn: vorherige, pos: "left-0 md:-translate-x-5" },
          { richtung:  1, fn: naechste,  pos: "right-0 md:translate-x-5"  },
        ].map(({ fn, pos }) => (
          <button
            key={pos}
            onClick={fn}
            className={`absolute ${pos} top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm text-lg`}
          >
            {pos.startsWith("left") ? "‹" : "›"}
          </button>
        ))}

        <AnimatePresence mode="wait" custom={richtung}>
          <motion.div
            key={aktuellerIndex}
            custom={richtung}
            variants={kartenVarianten}
            initial="eintreten"
            animate="sichtbar"
            exit="verlassen"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

              {/* Vorschau-Karte */}
              <motion.div
                className="relative cursor-pointer group w-full min-w-0"
                onClick={() => setLightboxOffen(true)}
                whileHover={{ scale: 1.015 }}
                transition={{ duration: 0.25 }}
              >
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${aktuell.akzentFarbe}08, ${aktuell.akzentFarbe}03)`,
                    padding: "14px",
                    border: `1px solid ${aktuell.akzentFarbe}18`,
                    boxShadow: `0 0 60px ${aktuell.akzentFarbe}08, 0 20px 40px rgba(0,0,0,0.35)`,
                  }}
                >
                  <div className="rounded-xl overflow-hidden border border-white/5 bg-white shadow-inner">
                    <img
                      src={aktuell.vorschauBild}
                      alt={aktuell.titel}
                      className="w-full max-w-full h-auto object-contain block mx-auto"
                      style={{ maxHeight: "420px", objectPosition: "top" }}
                    />
                  </div>

                  {/* Hover-Overlay */}
                  <div
                    className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: `${aktuell.akzentFarbe}10`, backdropFilter: "blur(2px)" }}
                  >
                    <div
                      className="px-5 py-2.5 rounded-xl font-mono text-sm text-white"
                      style={{ background: `${aktuell.akzentFarbe}28`, border: `1px solid ${aktuell.akzentFarbe}45` }}
                    >
                      Vollbild öffnen
                    </div>
                  </div>
                </div>

                {/* Boden-Glow */}
                <div
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2/3 h-5 rounded-full blur-xl"
                  style={{ background: `${aktuell.akzentFarbe}15` }}
                />
              </motion.div>

              {/* Infospalte */}
              <div className="flex flex-col justify-start pt-2 min-w-0">
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="text-xs font-mono px-3 py-1 rounded-lg font-bold"
                    style={{
                      background: `${aktuell.akzentFarbe}15`,
                      color: aktuell.akzentFarbe,
                      border: `1px solid ${aktuell.akzentFarbe}28`,
                    }}
                  >
                    {KATEGORIE_LABEL[aktuell.kategorie]}
                  </span>
                  <span className="font-mono text-xs text-white/25">{aktuell.jahr}</span>
                </div>

                <h3 className="font-display text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
                  {aktuell.titel}
                </h3>
                <p className="font-mono text-xs text-white/30 mb-4">{aktuell.aussteller}</p>
                <p className="text-sm text-white/55 leading-relaxed">{aktuell.beschreibung}</p>

                {/* Swipe-Hinweis auf Mobile */}
                <p className="md:hidden mt-6 text-xs text-white/20 font-mono flex items-center gap-2">
                  <span>←</span>
                  <span>wischen zum Blättern</span>
                  <span>→</span>
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Punkt-Indikator */}
        <div className="flex justify-center gap-2.5 mt-8">
          {DOKUMENTE.map((dok, index) => (
            <button
              key={index}
              onClick={() => navigiere(index)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: index === aktuellerIndex ? "28px" : "6px",
                height: "6px",
                background: index === aktuellerIndex ? dok.akzentFarbe : "rgba(255,255,255,0.15)",
              }}
              aria-label={KATEGORIE_LABEL[dok.kategorie]}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOffen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/96 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
            onClick={() => setLightboxOffen(false)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="w-full max-w-3xl flex flex-col"
              style={{ maxHeight: "92vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Lightbox-Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div>
                  <h3 className="font-display text-base font-bold text-white">{aktuell.titel}</h3>
                  <p className="font-mono text-xs text-white/30 mt-0.5">{aktuell.aussteller}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={aktuell.pdfPfad}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all hover:scale-[1.03]"
                    style={{
                      background: `${aktuell.akzentFarbe}15`,
                      color: aktuell.akzentFarbe,
                      border: `1px solid ${aktuell.akzentFarbe}30`,
                    }}
                  >
                    ↓ Download
                  </a>
                  <button
                    onClick={() => setLightboxOffen(false)}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition text-lg font-light"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Bild */}
              <div
                className="flex-1 rounded-2xl overflow-hidden border border-white/10 bg-white flex items-start justify-center"
                style={{ boxShadow: `0 0 80px ${aktuell.akzentFarbe}12`, overflowY: "auto" }}
              >
                <img
                  src={aktuell.vorschauBild}
                  alt={aktuell.titel}
                  className="w-full h-auto object-contain block"
                />
              </div>

              {/* Lightbox-Navigation */}
              <div className="flex items-center justify-between mt-3 px-1">
                <button
                  onClick={(e) => { e.stopPropagation(); vorherige(); }}
                  className="text-xs text-white/30 hover:text-white transition font-mono"
                >
                  ← Vorheriges
                </button>
                <span className="text-xs text-white/15 font-mono">
                  {aktuellerIndex + 1} / {DOKUMENTE.length}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); naechste(); }}
                  className="text-xs text-white/30 hover:text-white transition font-mono"
                >
                  Nächstes →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
