import { motion } from "framer-motion";
import { LEISTUNGEN } from "../models/daten";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { InfoKarte } from "../bausteine/InfoKarte";
import { KnopfSekundaer } from "../bausteine/KnopfSekundaer";
import { KURVEN } from "../bewegung/varianten";
import { zahlwort, grossErsterBuchstabe } from "../hilfsmittel/formatierung";

// ═══════════════════════════════════════════════════════════════════
// VIEW: Leistungen — "Was ich für Sie tue"
// Konsistent zum Rest der Seite: AbschnittsTitel, InfoKarte, zentrale
// Animations-Kurven, Scroll-Reveal mit gestaffeltem Delay.
// ═══════════════════════════════════════════════════════════════════

// Anzahl der Schwerpunkte direkt aus den Daten ableiten — so können Untertitel
// und Karten nie auseinanderlaufen (Single Source of Truth).
const LEISTUNGEN_UNTERTITEL =
  `${grossErsterBuchstabe(zahlwort(LEISTUNGEN.length))} Schwerpunkte – jeweils ` +
  `darauf ausgerichtet, was dabei für Sie herauskommt. Keine Werkzeug-Show, ` +
  `sondern Systeme und Sicherheit, die im Alltag tragen.`;

export default function LeistungenView() {
  return (
    <section id="leistungen" className="py-16 px-6 max-w-5xl mx-auto">
      <AbschnittsTitel
        prefix="> leistungen"
        untertitel={LEISTUNGEN_UNTERTITEL}
        klassen="mb-8"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LEISTUNGEN.map((l, index) => (
          <motion.div
            key={l.titel}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: index * 0.08, duration: 0.5, ease: KURVEN.expressiv }}
            className="h-full"
          >
            <InfoKarte
              lichtfarbe={l.farbeRgb}
              akzentRand
              akzentFarbe={l.akzentHex}
              klassen="h-full"
            >
              <div className="p-5 md:p-6 flex flex-col h-full">
                <h3 className="font-display text-lg font-bold text-white leading-snug mb-2">
                  {l.titel}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed mb-4">
                  {l.nutzen}
                </p>

                <ul className="space-y-1.5 mb-5">
                  {l.leistungen.map((punkt) => (
                    <li key={punkt} className="text-sm text-white/60 flex items-start gap-2">
                      <span
                        className="flex-shrink-0 mt-[3px] text-[10px]"
                        style={{ color: l.akzentHex, opacity: 0.7 }}
                      >
                        ›
                      </span>
                      <span>{punkt}</span>
                    </li>
                  ))}
                </ul>

                <div
                  className="mt-auto pt-3 text-sm font-medium border-t border-white/[0.05]"
                  style={{ color: l.akzentHex }}
                >
                  {l.ergebnis}
                </div>
              </div>
            </InfoKarte>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: 0.1, ease: KURVEN.expressiv }}
        className="mt-8 flex justify-center"
      >
        <KnopfSekundaer zuRoute="/kontakt">Projekt besprechen →</KnopfSekundaer>
      </motion.div>
    </section>
  );
}
