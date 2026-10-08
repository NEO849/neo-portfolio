// ═══════════════════════════════════════════════════════
// SEITE: DatenschutzSeite — Route: /datenschutz
// Orientierungs-Entwurf nach DSGVO. ENTHÄLT PLATZHALTER und ist KEIN
// Rechtsrat. Vor Go-Live vom Legal-Gate prüfen und anwaltlich abnehmen
// lassen (verbindlich bei Haftung).
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import { SeitenMeta } from "../bausteine/SeitenMeta";
import { PERSOENLICH } from "../models/daten";

const PLATZHALTER = "〈PLATZHALTER: bitte prüfen/ergänzen〉";

function Abschnitt({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-base font-bold text-white mb-2">{titel}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export default function DatenschutzSeite() {
  return (
    <>
      <SeitenMeta titel="Datenschutzerklärung" beschreibung="Datenschutzerklärung nach DSGVO für f3-data-solutions.com." pfad="/datenschutz" />
      <motion.div variants={SEITEN_EINGANG} initial="versteckt" animate="sichtbar" exit="verlassen" className="pt-24 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-white mb-8">Datenschutzerklärung</h1>

          <div className="space-y-6 text-sm leading-relaxed text-white/70">
            <Abschnitt titel="Verantwortlicher">
              <p>{PERSOENLICH.name}, {PERSOENLICH.firma}. Kontakt: {PERSOENLICH.email}. Anschrift siehe Impressum.</p>
            </Abschnitt>

            <Abschnitt titel="Hosting">
              <p>
                Diese Website wird über Cloudflare Pages (Cloudflare, Inc., USA) bereitgestellt. Dabei werden
                technisch notwendige Server-Logdaten (z. B. IP-Adresse, Zeitpunkt, abgerufene Seite) verarbeitet.
                Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (sicherer, stabiler Betrieb). Cloudflare ist
                Auftragsverarbeiter (Art. 28 DSGVO); da es sich um einen US-Anbieter handelt, erfolgt die
                Übermittlung auf Grundlage der EU-Standardvertragsklauseln (Art. 46 DSGVO). {PLATZHALTER}:
                Abschluss des Auftragsverarbeitungsvertrags mit Cloudflare bestätigen.
              </p>
            </Abschnitt>

            <Abschnitt titel="Kontaktformular">
              <p>
                Wenn Sie das Kontaktformular nutzen, verarbeite ich die von Ihnen eingegebenen Daten (Name,
                E-Mail, Nachricht), um Ihre Anfrage zu beantworten. Der Versand der Benachrichtigung erfolgt über
                den E-Mail-Dienst Resend (Resend, Inc., USA) als Auftragsverarbeiter (Art. 28 DSGVO; Übermittlung
                auf Grundlage der EU-Standardvertragsklauseln, Art. 46 DSGVO). Rechtsgrundlage: Art. 6 Abs. 1
                lit. b und f DSGVO. {PLATZHALTER}: Auftragsverarbeitungsvertrag mit Resend bestätigen.
              </p>
            </Abschnitt>

            <Abschnitt titel="Speicherdauer">
              <p>
                Kontaktanfragen und die dabei übermittelten Daten werden gelöscht, sobald Ihre Anfrage
                abschließend bearbeitet ist, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
              </p>
            </Abschnitt>

            <Abschnitt titel="Keine Tracker, kein Cookie-Banner">
              <p>
                Diese Website setzt keine Analyse-, Marketing- oder Tracking-Cookies ein und lädt keine externen
                Ressourcen von Drittanbietern; Schriften sind lokal eingebunden. Eine Einwilligung nach § 25
                TDDDG und ein Cookie-Banner sind daher nicht erforderlich.
              </p>
            </Abschnitt>

            <Abschnitt titel="Ihre Rechte">
              <p>
                Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und
                Widerspruch sowie das Recht auf Beschwerde bei einer Aufsichtsbehörde. Wenden Sie sich dazu an
                {" "}{PERSOENLICH.email}.
              </p>
            </Abschnitt>

            <p className="text-xs text-white/40 italic pt-4 border-t border-white/[0.06]">
              Orientierungs-Entwurf mit Platzhaltern, kein Rechtsrat. Vor Veröffentlichung vollständigen und
              anwaltlich prüfen lassen.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
