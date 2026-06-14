// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: DatenflussHinweis — DSGVO-Transparenz (Art. 13/14)
//
// Zeigt aufklappbar, welche Drittdienste das gewählte Werkzeug
// SERVERSEITIG kontaktiert (= wohin Daten fließen) — gespeist aus der
// maschinenlesbaren Backend-Deklaration (/transparenz).
// Visuell konsistent zur Seite (Indigo-/Lila-Akzent, Glas-Karten-Stil).
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { transparenzLaden, type WerkzeugDatenfluss } from "../../dienste/osintApi";

// Marken-Palette (konsistent mit dem Design-System / ErgebnisReport)
const INDIGO = "#7aa2ff";   // akzent-400
const GRUEN = "#22c55e";    // signal-gruen (semantisch: positiv)

// Modul-Nummer (UI) → Werkzeug-Schlüssel (Backend-Deklaration)
const MODUL_ZU_WERKZEUG: Record<string, string> = {
  "2": "email-recon",
  "3": "benutzername",
  "4": "telefon",
  "5": "domain",
  "6": "bild",
  "8": "orchestrator",
  "9": "subdomains",
  "10": "ip-intel",
  "11": "censys",
};

function SchildIkon({ farbe }: { farbe: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      style={{ filter: `drop-shadow(0 0 4px ${farbe}66)` }}>
      <path d="M12 2.5 4.5 5.5v5c0 4.4 3.1 8.4 7.5 9.8 4.4-1.4 7.5-5.4 7.5-9.8v-5L12 2.5Z"
        stroke={farbe} strokeWidth="1.6" strokeLinejoin="round" fill={`${farbe}1a`} />
      <path d="m9 12 2 2 4-4" stroke={farbe} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DatenflussHinweis({ nummer }: { nummer: string }) {
  const [wz, setWz] = useState<WerkzeugDatenfluss | null>(null);
  const [offen, setOffen] = useState(false);

  useEffect(() => {
    let aktiv = true;
    const key = MODUL_ZU_WERKZEUG[nummer];
    setWz(null);
    setOffen(false);
    if (!key) return;
    transparenzLaden().then((t) => {
      if (aktiv && t) setWz(t.werkzeuge?.[key] ?? null);
    });
    return () => { aktiv = false; };
  }, [nummer]);

  if (!wz) return null;
  const anzahl = wz.sendet_an.length;
  const lokal = anzahl === 0;

  return (
    <div className="mt-4 font-mono">
      <button
        onClick={() => setOffen((o) => !o)}
        aria-expanded={offen}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-colors"
        style={{
          borderColor: offen ? `${INDIGO}55` : `${INDIGO}26`,
          background: offen ? `${INDIGO}14` : `${INDIGO}08`,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${INDIGO}55`; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = offen ? `${INDIGO}55` : `${INDIGO}26`; }}
      >
        <span className="flex items-center gap-2 text-[11px] min-w-0">
          <SchildIkon farbe={INDIGO} />
          <span className="text-white/75">Datenfluss-Transparenz</span>
          <span className="text-[9.5px] px-1.5 py-0.5 rounded-full shrink-0"
            style={{
              color: lokal ? GRUEN : INDIGO,
              border: `1px solid ${(lokal ? GRUEN : INDIGO)}40`,
              background: `${(lokal ? GRUEN : INDIGO)}12`,
            }}>
            {lokal ? "nur lokal" : `${anzahl} Drittdienst${anzahl > 1 ? "e" : ""}`}
          </span>
        </span>
        <span className="text-[10px] shrink-0 transition-transform" style={{ color: INDIGO, transform: offen ? "rotate(180deg)" : "none" }}>▾</span>
      </button>

      <AnimatePresence initial={false}>
        {offen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden">
            <div className="mt-2 rounded-lg border p-3.5 space-y-3"
              style={{ borderColor: `${INDIGO}1f`, background: `${INDIGO}06` }}>
              <p className="text-[11px] text-white/55 leading-relaxed">{wz.beschreibung}</p>

              {lokal ? (
                <div className="flex items-start gap-2 text-[11px] leading-relaxed"
                  style={{ color: `${GRUEN}cc` }}>
                  <SchildIkon farbe={GRUEN} />
                  <span>Es wird serverseitig kein Drittdienst kontaktiert — die Analyse läuft lokal auf unserem Server.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-[9.5px] tracking-[0.16em] uppercase text-white/40">Daten gehen an</div>
                  {wz.sendet_an.map((d, i) => (
                    <div key={i} className="flex items-start gap-2.5 pl-2.5 border-l"
                      style={{ borderColor: `${INDIGO}40` }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <a href={d.datenschutz_url} target="_blank" rel="noopener noreferrer"
                            className="text-[12px] hover:underline underline-offset-2 break-all"
                            style={{ color: INDIGO }}>{d.dienst}</a>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0 text-white/55"
                            style={{ border: `1px solid ${INDIGO}33` }}>{d.region}</span>
                        </div>
                        <div className="text-[10.5px] text-white/45 leading-snug mt-0.5">{d.uebermittelte_daten}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {wz.hinweis && (
                <p className="text-[10.5px] text-white/50 leading-relaxed border-t pt-2.5"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}>{wz.hinweis}</p>
              )}
              <p className="text-[9.5px] text-white/35 leading-relaxed flex items-start gap-1.5">
                <span style={{ color: `${INDIGO}99` }}>●</span>{wz.speicherung}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
