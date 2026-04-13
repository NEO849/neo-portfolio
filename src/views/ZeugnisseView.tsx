import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ═══════════════════════════════════════════════════════
// VIEW: Zeugnisse – Premium-Karussell mit Bild/PDF-Vorschau
// ═══════════════════════════════════════════════════════

interface ZeugnisEintrag {
  readonly titel: string;
  readonly aussteller: string;
  readonly jahr: string;
  readonly beschreibung: string;
  readonly pdfPfad: string;
  readonly vorschauBild: string;
  readonly kategorie: "zeugnis" | "zertifikat";
  readonly akzentFarbe: string;
}

const ZEUGNISSE: ZeugnisEintrag[] = [
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
    vorschauBild: "",
    kategorie: "zertifikat",
    akzentFarbe: "#22d3ee",
  },
];

export default function ZeugnisseView() {
  const [aktuellerIndex, setAktuellerIndex] = useState(0);
  const [lightboxOffen, setLightboxOffen] = useState(false);

  const vorherige = () => setAktuellerIndex(index => (index - 1 + ZEUGNISSE.length) % ZEUGNISSE.length);
  const naechste = () => setAktuellerIndex(index => (index + 1) % ZEUGNISSE.length);

  useEffect(() => {
    if (!lightboxOffen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOffen(false);
      if (event.key === "ArrowLeft") vorherige();
      if (event.key === "ArrowRight") naechste();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOffen]);

  const aktuell = ZEUGNISSE[aktuellerIndex];

  // Vorschau-Komponente: Bild wenn vorhanden, sonst elegante PDF-Placeholder-Karte
  const VorschauElement = () => {
    if (aktuell.vorschauBild) {
      return (
        <img
          src={aktuell.vorschauBild}
          alt={aktuell.titel}
          className="w-full h-full object-contain"
        />
      );
    }
    // Kein Bild → elegante Darstellung statt iframe (iframe funktioniert auf Mobile nicht)
    return (
      <div
        className="w-full flex flex-col items-center justify-center gap-6 py-16 px-8"
        style={{ minHeight: "280px" }}
      >
        {/* PDF-Icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: `${aktuell.akzentFarbe}12`,
            border: `1px solid ${aktuell.akzentFarbe}25`,
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              stroke={aktuell.akzentFarbe}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fillOpacity="0"
            />
            <polyline
              points="14 2 14 8 20 8"
              stroke={aktuell.akzentFarbe}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x="12"
              y="17"
              textAnchor="middle"
              fontSize="5.5"
              fontFamily="monospace"
              fontWeight="700"
              fill={aktuell.akzentFarbe}
            >
              PDF
            </text>
          </svg>
        </div>

        <div className="text-center">
          <p className="font-mono text-xs text-white/30 mb-1">Dokument verfügbar</p>
          <p className="font-display text-sm font-semibold text-white/70">{aktuell.titel}</p>
        </div>

        <a
          href={aktuell.pdfPfad}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs px-5 py-2.5 rounded-lg transition-all hover:scale-[1.03]"
          style={{
            background: `${aktuell.akzentFarbe}15`,
            color: aktuell.akzentFarbe,
            border: `1px solid ${aktuell.akzentFarbe}30`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          PDF öffnen →
        </a>
      </div>
    );
  };

  return (
    <section id="zeugnisse" className="py-24 px-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-mono text-sm text-akzent-400 mb-2">&gt; zeugnisse</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Zeugnisse & Zertifikate</h2>
        <p className="text-white/50 max-w-2xl mb-10">Verifizierbare Nachweise meiner Qualifikationen.</p>
      </motion.div>

      <div className="relative">
        {ZEUGNISSE.length > 1 && (
          <>
            <button onClick={vorherige}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-6 z-10 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-lg backdrop-blur-sm">
              &#8249;
            </button>
            <button onClick={naechste}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-6 z-10 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-lg backdrop-blur-sm">
              &#8250;
            </button>
          </>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={aktuellerIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Vorschau */}
              <motion.div
                className="relative cursor-pointer group"
                onClick={() => setLightboxOffen(true)}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative rounded-xl overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${aktuell.akzentFarbe}08, ${aktuell.akzentFarbe}03)`,
                    padding: "16px",
                    border: `1px solid ${aktuell.akzentFarbe}15`,
                    boxShadow: `0 0 60px ${aktuell.akzentFarbe}08, 0 20px 40px rgba(0,0,0,0.4)`,
                  }}
                >
                  <div className="rounded-lg overflow-hidden border border-white/5 bg-white/95 shadow-inner"
                    style={{ aspectRatio: aktuell.vorschauBild ? "auto" : "0.71", maxHeight: "500px" }}>
                    <VorschauElement />
                  </div>

                  {/* Hover */}
                  <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: `${aktuell.akzentFarbe}12`, backdropFilter: "blur(2px)" }}>
                    <div className="px-4 py-2 rounded-lg font-mono text-sm text-white"
                      style={{ background: `${aktuell.akzentFarbe}30`, border: `1px solid ${aktuell.akzentFarbe}50` }}>
                      Dokument ansehen
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2/3 h-6 rounded-full blur-xl"
                  style={{ background: `${aktuell.akzentFarbe}15` }} />
              </motion.div>

              {/* Text */}
              <div className="flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="text-xs font-mono px-3 py-1 rounded-lg font-bold"
                    style={{ background: `${aktuell.akzentFarbe}15`, color: aktuell.akzentFarbe, border: `1px solid ${aktuell.akzentFarbe}25` }}>
                    {aktuell.kategorie === "zeugnis" ? "Zeugnis" : "Zertifikat"}
                  </span>
                  <span className="font-mono text-xs text-white/25">{aktuell.jahr}</span>
                </div>

                <h3 className="font-display text-xl md:text-2xl font-bold text-white mb-3 leading-tight">
                  {aktuell.titel}
                </h3>

                <p className="font-mono text-xs text-white/30 mb-4">{aktuell.aussteller}</p>
                <p className="text-sm text-white/50 leading-relaxed mb-6">{aktuell.beschreibung}</p>

                <a href={aktuell.pdfPfad} target="_blank" rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex items-center gap-2 text-sm font-mono px-4 py-2 rounded-lg transition-all w-fit"
                  style={{ background: `${aktuell.akzentFarbe}10`, color: aktuell.akzentFarbe, border: `1px solid ${aktuell.akzentFarbe}20` }}>
                  PDF in neuem Tab
                </a>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-3 mt-8">
          {ZEUGNISSE.map((zeugnis, index) => (
            <button key={index} onClick={() => setAktuellerIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === aktuellerIndex ? "w-8" : "w-1.5 hover:w-3 bg-white/15 hover:bg-white/30"
              }`}
              style={index === aktuellerIndex ? { background: zeugnis.akzentFarbe } : undefined}
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
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
            onClick={() => setLightboxOffen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-3xl max-h-[90vh] flex flex-col"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">{aktuell.titel}</h3>
                  <p className="font-mono text-xs text-white/30">{aktuell.aussteller}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={aktuell.pdfPfad} target="_blank" rel="noreferrer"
                    className="text-xs px-3 py-1.5 rounded-lg font-mono transition"
                    style={{ background: `${aktuell.akzentFarbe}15`, color: aktuell.akzentFarbe }}>
                    PDF
                  </a>
                  <button onClick={() => setLightboxOffen(false)}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition text-sm">
                    x
                  </button>
                </div>
              </div>

              <div className="flex-1 rounded-xl overflow-hidden border border-white/10 min-h-0"
                style={{ boxShadow: `0 0 80px ${aktuell.akzentFarbe}10` }}>
                {aktuell.vorschauBild ? (
                  <div className="w-full h-full bg-[#1a1a2e] flex items-center justify-center p-6" style={{ minHeight: "70vh" }}>
                    <img src={aktuell.vorschauBild} alt={aktuell.titel} className="max-w-full max-h-full object-contain rounded-lg" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }} />
                  </div>
                ) : (
                  <div className="bg-white" style={{ minHeight: "70vh" }}>
                    <iframe src={aktuell.pdfPfad} className="w-full h-full border-0" style={{ minHeight: "70vh" }} title={aktuell.titel} />
                  </div>
                )}
              </div>

              {ZEUGNISSE.length > 1 && (
                <div className="flex items-center justify-between mt-3">
                  <button onClick={(event) => { event.stopPropagation(); vorherige(); }}
                    className="text-xs text-white/30 hover:text-white transition font-mono">Vorheriges</button>
                  <span className="text-xs text-white/15 font-mono">{aktuellerIndex + 1} / {ZEUGNISSE.length}</span>
                  <button onClick={(event) => { event.stopPropagation(); naechste(); }}
                    className="text-xs text-white/30 hover:text-white transition font-mono">Naechstes</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
