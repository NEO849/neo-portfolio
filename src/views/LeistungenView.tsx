import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LEISTUNGEN } from "../models/daten";
import { KartenLicht } from "../bewegung/KartenLicht";

// ═══════════════════════════════════════════════════════
// VIEW: Leistungen — "Was ich für Sie tue" (kundenorientiert)
// Erste Sektion nach dem Hero: macht den Mehrwert sofort sichtbar.
// ═══════════════════════════════════════════════════════

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const karte = (i: number) => ({
  versteckt: { opacity: 0, y: 28 },
  sichtbar: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 * i, ease: EASE } },
});

export default function LeistungenView() {
  return (
    <section id="leistungen" className="relative px-6 py-24 sm:py-28">
      <div className="max-w-6xl mx-auto">

        {/* Section-Kopf */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-14"
        >
          <p className="font-mono text-xs text-akzent-400 tracking-[0.28em] uppercase mb-3">
            Was ich für Sie tue
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Leistungen mit klarem Ergebnis
          </h2>
          <p className="text-white/65 max-w-2xl mx-auto leading-relaxed">
            Drei Schwerpunkte – jeweils auf das ausgerichtet, was Sie konkret davon haben.
            Keine Tool-Show, sondern Systeme und Sicherheit, die im Alltag tragen.
          </p>
        </motion.div>

        {/* Leistungs-Karten */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {LEISTUNGEN.map((l, i) => (
            <motion.div
              key={l.titel}
              variants={karte(i)}
              initial="versteckt"
              whileInView="sichtbar"
              viewport={{ once: true, margin: "-60px" }}
              whileHover={{ y: -4, transition: { duration: 0.25, ease: EASE } }}
              className="rounded-2xl overflow-hidden backdrop-blur-sm h-full"
              style={{
                background: "linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
                border: `1px solid rgba(${l.farbeRgb}, 0.22)`,
                boxShadow: `0 0 40px rgba(${l.farbeRgb}, 0.05), 0 12px 36px rgba(0,0,0,0.35)`,
              }}
            >
              <KartenLicht lichtfarbe={l.farbeRgb} intensitaet={0.1} radius={320}>
                <div className="p-7 flex flex-col h-full">
                  <div
                    className="w-10 h-1 rounded-full mb-5"
                    style={{ background: `rgb(${l.farbeRgb})`, boxShadow: `0 0 12px rgba(${l.farbeRgb},0.6)` }}
                  />
                  <h3 className="font-display text-xl font-bold text-white mb-2.5">{l.titel}</h3>
                  <p className="text-sm text-white/75 leading-relaxed mb-5">{l.nutzen}</p>

                  <ul className="space-y-2.5 mb-6">
                    {l.leistungen.map((punkt) => (
                      <li key={punkt} className="flex gap-2.5 text-sm text-white/70 leading-snug">
                        <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: `rgb(${l.farbeRgb})` }} />
                        <span>{punkt}</span>
                      </li>
                    ))}
                  </ul>

                  <div
                    className="mt-auto pt-4 text-sm font-medium"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.07)", color: `rgb(${l.farbeRgb})` }}
                  >
                    → {l.ergebnis}
                  </div>
                </div>
              </KartenLicht>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-14 text-center"
        >
          <p className="text-white/70 mb-5">
            Nicht sicher, was am meisten bringt? Im Erstgespräch finden wir den Hebel mit dem schnellsten Effekt.
          </p>
          <Link
            to="/kontakt"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-medium text-white transition-transform duration-200 hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, #6366f1, #06b6d4)",
              boxShadow: "0 8px 30px rgba(99,102,241,0.3)",
            }}
          >
            Kostenloses Erstgespräch anfragen
            <span aria-hidden>→</span>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
