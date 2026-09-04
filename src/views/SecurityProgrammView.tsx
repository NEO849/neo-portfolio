import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PERSOENLICH } from "../models/daten";
import {
  PROGRAMM_KOMPETENZEN,
  PROGRAMM_ABLAUF,
  PROGRAMM_VERTRAUEN,
  PROGRAMM_ERGEBNIS,
  PROGRAMM_FAQ,
  PROGRAMM_VERGUETUNG,
} from "../models/programmDaten";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { Augenbraue } from "../bausteine/Augenbraue";
import { InfoKarte } from "../bausteine/InfoKarte";
import { Knopf } from "../bausteine/Knopf";
import { AbzeichenStatus, TechTag } from "../bausteine/AbzeichenStatus";
import { AufklappIndikator } from "../bausteine/AufklappIndikator";
import { ScrollReveal } from "../bewegung/ScrollReveal";
import { KURVEN } from "../bewegung/varianten";

// ═══════════════════════════════════════════════════════════════════
// VIEW: Security-Programm — private Bug-Bounty-Landing-Page
// „Sie zahlen für Ergebnisse — nicht für Aufwand." Zehn Sektionen, aus
// ausschließlich bestehenden Bausteinen (AbschnittsTitel/InfoKarte/…)
// und Varianten zusammengesetzt — kein neues visuelles Vokabular.
// ═══════════════════════════════════════════════════════════════════

function zuVerguetungScrollen() {
  document.getElementById("verguetung")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function SecurityProgrammView() {
  const [aktiveFaq, setAktiveFaq] = useState<number | null>(null);

  return (
    <>
      {/* ── 0 · Hero ─────────────────────────────────────────────── */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: KURVEN.expressiv }}
            className="mb-5"
          >
            <Augenbraue text="Sicherheit auf Erfolgsbasis" zentriert />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.08, ease: KURVEN.expressiv }}
            className="mb-6"
          >
            <AbzeichenStatus variante="aktiv" text="Neue Programme buchbar" mitPuls />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.14, ease: KURVEN.expressiv }}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-[-0.03em] leading-[1.02] text-white max-w-3xl mb-6"
          >
            Sie zahlen für Ergebnisse, nicht für bloßen Aufwand.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.22, ease: KURVEN.expressiv }}
            className="text-base md:text-lg text-white/70 leading-relaxed max-w-2xl mb-9"
          >
            Ihr eigenes, privates Sicherheits-Testprogramm: Ich prüfe Ihre Systeme mit ausdrücklicher,
            schriftlicher Freigabe, und Sie vergüten nur echte, nachgewiesene Sicherheitslücken. Ein
            namentlich bekannter Prüfer, klassische Web-/API-Sicherheit und KI-/LLM-Sicherheit in einer
            Person.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: KURVEN.expressiv }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <Knopf variante="primaer" zuRoute="/kontakt">15-Minuten-Gespräch vereinbaren →</Knopf>
            <Knopf variante="sekundaer" onClick={zuVerguetungScrollen}>So funktioniert das Modell</Knopf>
          </motion.div>
        </div>
      </section>

      {/* ── 1 · Ehrlicher Hook ───────────────────────────────────── */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <AbschnittsTitel
          prefix="> warum überhaupt"
          untertitel="Ein bestandenes Audit sagt, dass Ihre Prozesse stimmen. Es sagt nichts darüber, ob Ihre Anwendung einem echten Angriff standhält."
          klassen="mb-8"
        />
        <ScrollReveal>
          <InfoKarte lichtfarbe="79, 124, 251" klassen="p-6 md:p-8">
            <p className="text-sm md:text-base text-white/70 leading-relaxed">
              Zertifikate, Compliance-Nachweise und automatisierte Scanner prüfen gegen Checklisten.
              Ein Angreifer hält sich an keine Checkliste. Er kombiniert kleine Schwächen zu echtem
              Schaden: fremde Datensätze abrufen, Rechte ausweiten, eine KI-Funktion zu etwas bringen,
              das sie nicht tun sollte. Genau diese Schicht (die konkrete Logik Ihrer Anwendung)
              bleibt bei reinen Audits meist ungetestet. Dieses Programm schließt die Lücke: ein
              manueller Test aus der Angreifer-Perspektive, mit dem klaren Ziel, reale, ausnutzbare
              Schwachstellen zu zeigen, bevor es jemand anderes tut.
            </p>
          </InfoKarte>
        </ScrollReveal>
      </section>

      {/* ── 2 · Fusion-Kompetenz ─────────────────────────────────── */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <AbschnittsTitel
          prefix="> das angebot"
          untertitel="Zwei Kompetenzen, ein Ansprechpartner. Das spart Ihnen einen zweiten Dienstleister und schließt die Lücke, die reine Netzwerk-Tester bei KI übersehen."
          klassen="mb-8"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROGRAMM_KOMPETENZEN.map((k, index) => (
            <motion.div
              key={k.titel}
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: index * 0.08, duration: 0.7, ease: KURVEN.expressiv }}
              className="h-full"
            >
              <InfoKarte lichtfarbe={k.farbeRgb} akzentRand akzentFarbe={k.akzentHex} klassen="h-full">
                <div className="p-5 md:p-6 flex flex-col h-full">
                  <h3 className="font-display text-lg font-bold text-white leading-snug mb-2">
                    {k.titel}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed mb-4">{k.nutzen}</p>

                  <ul className="space-y-1.5 mb-5">
                    {k.leistungen.map((punkt) => (
                      <li key={punkt} className="text-sm text-white/60 flex items-start gap-2">
                        <span
                          className="flex-shrink-0 mt-[3px] text-[10px]"
                          style={{ color: k.akzentHex, opacity: 0.7 }}
                        >
                          ›
                        </span>
                        <span>{punkt}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-3 border-t border-white/[0.06]">
                    <p
                      className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] mb-1.5"
                      style={{ color: k.akzentHex, opacity: 0.75 }}
                    >
                      Ergebnis
                    </p>
                    <p className="text-[13px] text-white/70 leading-relaxed">{k.ergebnis}</p>
                  </div>
                </div>
              </InfoKarte>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 3 · Vergütungsmodell ─────────────────────────────────── */}
      <section id="verguetung" className="py-16 px-6 max-w-5xl mx-auto">
        <AbschnittsTitel
          prefix="> vergütung"
          untertitel="Sie vergüten je nachgewiesener Schwachstelle, gestaffelt nach Schweregrad (wie ein privates Bug-Bounty mit einem einzigen, bekannten Tester). Konkrete Beträge legen wir gemeinsam im Gespräch fest, samt planbarer Obergrenze pro Programm."
          klassen="mb-8"
        />

        <div className="space-y-2 mb-4">
          {PROGRAMM_VERGUETUNG.staffel.map((stufe, index) => (
            <motion.div
              key={stufe.severity}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: index * 0.06, duration: 0.4, ease: KURVEN.expressiv }}
            >
              <InfoKarte lichtfarbe="122, 162, 255" mitHoverAnimation={false} klassen="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
                  <AbzeichenStatus
                    variante={stufe.abzeichenVariante}
                    text={stufe.severity}
                    klassen="flex-shrink-0 self-start sm:self-auto"
                  />
                  <p className="text-sm text-white/60 flex-1 leading-relaxed">{stufe.beschreibung}</p>
                  <span className="font-mono text-xs text-white/40 flex-shrink-0 uppercase tracking-wide">
                    {stufe.stufe}
                  </span>
                </div>
              </InfoKarte>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-white/40 leading-relaxed mb-10">{PROGRAMM_VERGUETUNG.fussnote}</p>

        <ScrollReveal klassen="mb-6">
          <InfoKarte lichtfarbe="79, 124, 251" klassen="p-6 md:p-8">
            <p className="text-sm text-white/70 leading-relaxed mb-4">
              {PROGRAMM_VERGUETUNG.validesFinding.einleitung}
            </p>
            <ul className="space-y-1.5 mb-4">
              {PROGRAMM_VERGUETUNG.validesFinding.kriterien.map((punkt) => (
                <li key={punkt} className="text-sm text-white/60 flex items-start gap-2">
                  <span
                    className="flex-shrink-0 mt-[3px] text-[10px]"
                    style={{ color: "#7aa2ff", opacity: 0.7 }}
                  >
                    ›
                  </span>
                  <span>{punkt}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-white/40 leading-relaxed">
              {PROGRAMM_VERGUETUNG.validesFinding.abschluss}
            </p>
          </InfoKarte>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROGRAMM_VERGUETUNG.varianten.map((v, index) => (
            <motion.div
              key={v.titel}
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: index * 0.08, duration: 0.6, ease: KURVEN.expressiv }}
            >
              <InfoKarte lichtfarbe="79, 124, 251" klassen="p-5 h-full">
                <h3 className="font-display text-lg font-bold text-white mb-2">{v.titel}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{v.text}</p>
              </InfoKarte>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 4 · Ablauf ────────────────────────────────────────────── */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <AbschnittsTitel
          prefix="> so läuft es ab"
          untertitel="Die Reihenfolge ist der ganze Unterschied: erst die schriftliche Erlaubnis, dann der Test. Das macht die Prüfung sauber, planbar und rechtlich eindeutig."
          klassen="mb-8"
        />
        <div className="space-y-2">
          {PROGRAMM_ABLAUF.map((schritt, index) => (
            <motion.div
              key={schritt.nr}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: index * 0.06, duration: 0.45, ease: KURVEN.expressiv }}
            >
              <InfoKarte lichtfarbe="122, 162, 255" mitHoverAnimation={false} klassen="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-akzent-400/10 border border-akzent-400/20 flex items-center justify-center font-mono text-sm text-akzent-400 font-bold flex-shrink-0">
                    {schritt.nr}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg font-bold text-white mb-1.5">{schritt.titel}</h3>
                    <p className="text-sm text-white/60 leading-relaxed mb-3">{schritt.beschreibung}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {schritt.tags.map((tag) => (
                        <TechTag key={tag} name={tag} />
                      ))}
                    </div>
                  </div>
                </div>
              </InfoKarte>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 5 · Vertrauens-Versprechen ────────────────────────────── */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <AbschnittsTitel
          prefix="> ihr schutz"
          untertitel="So schütze ich Ihre Systeme und Daten, während ich sie prüfe."
          klassen="mb-8"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROGRAMM_VERTRAUEN.map((punkt, index) => (
            <motion.div
              key={punkt.titel}
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: index * 0.06, duration: 0.6, ease: KURVEN.expressiv }}
            >
              <InfoKarte lichtfarbe="79, 124, 251" klassen="p-5 h-full">
                <h3 className="font-display text-lg font-bold text-white mb-2">{punkt.titel}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{punkt.text}</p>
              </InfoKarte>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 6 · Was Sie bekommen ─────────────────────────────────── */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <AbschnittsTitel prefix="> ergebnis" klassen="mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROGRAMM_ERGEBNIS.map((eintrag, index) => (
            <motion.div
              key={eintrag.titel}
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: index * 0.08, duration: 0.6, ease: KURVEN.expressiv }}
            >
              <InfoKarte lichtfarbe="79, 124, 251" klassen="p-5 h-full">
                <h3 className="font-display text-lg font-bold text-white mb-2">{eintrag.titel}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{eintrag.text}</p>
              </InfoKarte>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 7 · Kurz zu mir ───────────────────────────────────────── */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <AbschnittsTitel prefix="> kurz zu mir" klassen="mb-8" />
        <ScrollReveal>
          <InfoKarte lichtfarbe="79, 124, 251" klassen="p-6 md:p-8">
            <p className="text-sm md:text-base text-white/70 leading-relaxed mb-5">
              Michael Fleps, Hintergrund in Sicherheitsforschung und im Bau von KI-Systemen. Ich
              entwickle orchestrierte Multi-Agent-Systeme und robuste Anwendungen, und prüfe sie mit
              demselben Blick, den ein Angreifer hätte. Dokumentierte Prüf-Praxis auf anerkannten
              Bug-Bounty-Plattformen; Nachweise auf Anfrage.
            </p>
          </InfoKarte>
        </ScrollReveal>
      </section>

      {/* ── 8 · FAQ ───────────────────────────────────────────────── */}
      <section className="py-16 px-6 max-w-3xl mx-auto">
        <AbschnittsTitel prefix="> häufige fragen" klassen="mb-8" />
        <div className="space-y-2">
          {PROGRAMM_FAQ.map((eintrag, index) => (
            <motion.div
              key={eintrag.frage}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: index * 0.05, duration: 0.35, ease: KURVEN.expressiv }}
            >
              <InfoKarte
                lichtfarbe="138, 160, 200"
                mitHoverAnimation={false}
                akzentRand={aktiveFaq === index}
                akzentFarbe="#7aa2ff"
                onClick={() => setAktiveFaq(aktiveFaq === index ? null : index)}
                klassen="cursor-pointer group"
              >
                <div className={`p-4 transition-colors ${aktiveFaq === index ? "bg-akzent-400/4" : ""}`}>
                  <div className="flex items-center gap-4">
                    <span className="flex-1 text-sm font-semibold text-white">{eintrag.frage}</span>
                    <AufklappIndikator
                      offen={aktiveFaq === index}
                      lichtfarbe="122, 162, 255"
                      akzentFarbe="#7aa2ff"
                      groesse="sm"
                    />
                  </div>
                  <AnimatePresence>
                    {aktiveFaq === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-white/60 leading-relaxed mt-3 pt-3 border-t border-akzent-400/10">
                          {eintrag.antwort}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </InfoKarte>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 9 · CTA ───────────────────────────────────────────────── */}
      <section className="py-16 px-6 max-w-3xl mx-auto">
        <AbschnittsTitel
          prefix="> nächster schritt"
          untertitel="15 Minuten genügen, um Ihren Scope zu klären. Danach erhalten Sie ein konkretes, unverbindliches Angebot."
          zentriert
          klassen="mb-8"
        />
        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Knopf variante="primaer" zuRoute="/kontakt">Gespräch vereinbaren →</Knopf>
            <Knopf variante="sekundaer" zuUrl={`mailto:${PERSOENLICH.email}`}>Direkt schreiben</Knopf>
          </div>
          <p className="font-mono text-xs text-white/40 tracking-wide">Region Nürnberg + Remote (DACH)</p>
        </div>
      </section>
    </>
  );
}
