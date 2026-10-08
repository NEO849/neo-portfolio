// ═══════════════════════════════════════════════════════
// SEITE: ImpressumSeite — Route: /impressum
// Pflichtangaben nach § 5 DDG.
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import { SeitenMeta } from "../bausteine/SeitenMeta";
import { PERSOENLICH } from "../models/daten";

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
                Ludwigstraße 61<br />
                90429 Nürnberg<br />
                Deutschland
              </p>
            </section>

            <section>
              <h2 className="font-display text-base font-bold text-white mb-2">Kontakt</h2>
              <p>E-Mail: {PERSOENLICH.email}</p>
            </section>

            <section>
              <h2 className="font-display text-base font-bold text-white mb-2">Umsatzsteuer</h2>
              <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE459129384</p>
            </section>

            <section>
              <h2 className="font-display text-base font-bold text-white mb-2">Verantwortlich i. S. d. § 18 Abs. 2 MStV</h2>
              <p>{PERSOENLICH.name} (Anschrift wie oben).</p>
            </section>

            <section>
              <h2 className="font-display text-base font-bold text-white mb-2">Verbraucherstreitbeilegung</h2>
              <p>
                Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>
          </div>
        </div>
      </motion.div>
    </>
  );
}
