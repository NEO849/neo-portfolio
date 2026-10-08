// ═══════════════════════════════════════════════════════
// SEITE: LeistungenSeite — Route: /leistungen
// Angebote (LeistungenView) + Vertrauens-Versprechen + CTA.
// Preise bewusst nicht genannt: "Festpreis nach Erstgespräch".
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import { SeitenMeta } from "../bausteine/SeitenMeta";
import LeistungenView from "../views/LeistungenView";

const VERTRAUEN: readonly string[] = [
  "Read-only zuerst — keine Änderung an Produktivsystemen ohne Ihre ausdrückliche Freigabe.",
  "Klarer Scope und unterschriebene Testfreigabe (Rules of Engagement) vor jedem Sicherheits-Auftrag.",
  "Berufshaftpflicht, NDA und Auftragsverarbeitungsvertrag standardmäßig. Führungszeugnis auf Wunsch.",
];

export default function LeistungenSeite() {
  return (
    <>
      <SeitenMeta
        titel="Leistungen"
        beschreibung="KI-Automation-Sprint, Copilot-/ChatGPT-Freigabe-Check, KI-Sicherheits-Check und Schatten-KI-Check für den Mittelstand. Festpreis nach Erstgespräch, aus Nürnberg, remote im DACH-Raum."
        pfad="/leistungen"
      />
      <motion.div
        variants={SEITEN_EINGANG}
        initial="versteckt"
        animate="sichtbar"
        exit="verlassen"
        className="pt-16"
      >
        <LeistungenView />

        {/* Vertrauens-Versprechen */}
        <section className="px-6 max-w-5xl mx-auto pb-4">
          <div className="rounded-3xl2 border border-white/[0.08] bg-white/[0.02] p-6 md:p-8">
            <h2 className="font-display text-lg font-bold text-white mb-4">So schütze ich Ihre Systeme und Daten</h2>
            <ul className="space-y-2.5">
              {VERTRAUEN.map((v) => (
                <li key={v} className="flex items-start gap-2.5 text-sm text-white/70">
                  <span className="mt-[3px] flex-shrink-0 text-akzent-400 text-[11px]">✓</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 max-w-5xl mx-auto py-10">
          <div className="flex flex-wrap items-center justify-between gap-5 rounded-3xl2 border border-akzent-500/20 bg-akzent-500/[0.05] p-6 md:p-8">
            <div className="flex-1 min-w-[14rem]">
              <h2 className="font-display text-xl font-bold text-white">Jedes Angebot: Festpreis nach Erstgespräch.</h2>
              <p className="text-sm text-white/60 mt-1.5">
                Ein kurzes, kostenloses Gespräch klärt, was sich für Sie lohnt — danach ein klares Angebot ohne Überraschungen.
              </p>
            </div>
            <Link
              to="/kontakt"
              className="inline-flex items-center gap-2 rounded-full border border-akzent-500/40 bg-akzent-500/10 px-6 py-3 font-mono text-sm text-akzent-300 transition-colors hover:border-akzent-500/70 hover:text-white"
            >
              Erstgespräch anfragen
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
          </div>
        </section>
      </motion.div>
    </>
  );
}
