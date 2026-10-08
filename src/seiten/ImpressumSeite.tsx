// ═══════════════════════════════════════════════════════
// SEITE: ImpressumSeite — Route: /impressum
// Pflichtangaben nach § 5 DDG. ENTHÄLT PLATZHALTER — vor Go-Live mit
// echten Daten füllen und vom Legal-Gate (legal-compliance-advisor)
// prüfen lassen. Dies ist kein Rechtsrat.
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import { SeitenMeta } from "../bausteine/SeitenMeta";
import { PERSOENLICH } from "../models/daten";

const PLATZHALTER = "〈PLATZHALTER: bitte ergänzen〉";

export default function ImpressumSeite() {
  return (
    <>
      <SeitenMeta titel="Impressum" beschreibung="Impressum und Anbieterkennzeichnung nach § 5 DDG für FREE DATA Solutions, Michael Fleps." pfad="/impressum" />
      <motion.div variants={SEITEN_EINGANG} initial="versteckt" animate="sichtbar" exit="verlassen" className="pt-24 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-white mb-8">Impressum</h1>

          <div className="space-y-6 text-sm leading-relaxed text-white/70">
            <section>
              <h2 className="font-display text-base font-bold text-white mb-2">Angaben gemäß § 5 DDG</h2>
              <p>
                {PERSOENLICH.name}<br />
                {PERSOENLICH.firma}<br />
                {PLATZHALTER} (Straße und Hausnummer)<br />
                {PLATZHALTER} (PLZ und Ort)<br />
                Deutschland
              </p>
            </section>

            <section>
              <h2 className="font-display text-base font-bold text-white mb-2">Kontakt</h2>
              <p>
                Telefon: {PERSOENLICH.telefon}<br />
                E-Mail: {PERSOENLICH.email}
              </p>
            </section>

            <section>
              <h2 className="font-display text-base font-bold text-white mb-2">Umsatzsteuer</h2>
              <p>
                {PLATZHALTER}: Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG, falls vorhanden.
                Andernfalls Hinweis auf Kleinunternehmerregelung nach § 19 UStG.
              </p>
            </section>

            <section>
              <h2 className="font-display text-base font-bold text-white mb-2">Verantwortlich für den Inhalt</h2>
              <p>{PERSOENLICH.name}, Anschrift wie oben.</p>
            </section>

            <section>
              <h2 className="font-display text-base font-bold text-white mb-2">Streitbeilegung</h2>
              <p>
                Ich bin nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen. {PLATZHALTER}: vor Go-Live rechtlich prüfen lassen.
              </p>
            </section>

            <p className="text-xs text-white/40 italic pt-4 border-t border-white/[0.06]">
              Entwurf mit Platzhaltern. Vor Veröffentlichung mit echten Daten füllen und rechtlich prüfen lassen.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
