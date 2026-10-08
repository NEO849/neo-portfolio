// ═══════════════════════════════════════════════════════════════════
// VIEW: Referenzen / Proof — Case-Study, Beispiel-Bericht, Demo-Verweis.
// Ehrlichkeit: Case-Study anonymisiert, Beispiel-Bericht klar als
// erfundene Daten gekennzeichnet. Kein erfundener Kundenbeleg.
// ═══════════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { InfoKarte } from "../bausteine/InfoKarte";
import { TrustBoundaryDiagramm } from "../bausteine/TrustBoundaryDiagramm";
import { KURVEN } from "../bewegung/varianten";
import { CASE_STUDIES, BEISPIEL_BERICHT, KEY_FALLSTUDIE } from "../models/referenzenDaten";
import type { BefundAmpel } from "../models/referenzenDaten";

const AMPEL: Record<BefundAmpel, { hex: string; label: string }> = {
  rot: { hex: "#f1646c", label: "Kritisch" },
  gelb: { hex: "#f5b544", label: "Beobachten" },
  gruen: { hex: "#34d399", label: "In Ordnung" },
};

function Ampelpunkt({ ampel }: { ampel: BefundAmpel }) {
  const a = AMPEL[ampel];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: a.hex, boxShadow: `0 0 8px ${a.hex}66` }} />
      <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: a.hex }}>{a.label}</span>
    </span>
  );
}

export default function ReferenzenView() {
  return (
    <section id="referenzen" className="py-16 px-6 max-w-5xl mx-auto">
      <AbschnittsTitel
        prefix="> referenzen"
        untertitel="Belege statt Behauptungen. Ein anonymisierter echter Fund, ein Beispiel dafür, was Sie als Bericht bekommen, und eine Demo zum Anfassen."
        klassen="mb-8"
      />

      {/* Flaggschiff-Fallstudie (de-identifiziert) mit Diagramm */}
      <div className="mb-12">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.16em] rounded-full px-2.5 py-1"
            style={{ color: "#7aa2ff", background: "rgba(122,162,255,0.1)", border: "1px solid rgba(122,162,255,0.28)" }}
          >
            {KEY_FALLSTUDIE.kennzeichen}
          </span>
          <h3 className="font-display text-lg md:text-xl font-bold text-white">{KEY_FALLSTUDIE.titel}</h3>
        </div>

        <TrustBoundaryDiagramm />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ["Ausgangslage", KEY_FALLSTUDIE.situation],
            ["Der Fund", KEY_FALLSTUDIE.fund],
            ["Warum das zählt", KEY_FALLSTUDIE.warum],
            ["Nachweis", KEY_FALLSTUDIE.nachweis],
            ["Vertraulichkeit", KEY_FALLSTUDIE.verantwortung],
            ["Einordnung", KEY_FALLSTUDIE.norm],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl2 border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40 mb-1">{k}</p>
              <p className="text-sm text-white/70 leading-relaxed">{v}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-white/40 italic">
          Anbieter: {KEY_FALLSTUDIE.anbieter}. Anonymisiert — Name und technische Details nur auf Anfrage unter Vertraulichkeit.
        </p>
      </div>

      {/* Case-Studies */}
      <div className="space-y-5">
        {CASE_STUDIES.map((cs, i) => (
          <motion.div
            key={cs.titel}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.08, duration: 0.6, ease: KURVEN.expressiv }}
          >
            <InfoKarte lichtfarbe={cs.farbeRgb} akzentRand akzentFarbe={cs.akzentHex}>
              <div className="p-6 md:p-7">
                <span
                  className="inline-block font-mono text-[10px] uppercase tracking-[0.16em] rounded-full px-2.5 py-1 mb-3"
                  style={{ color: cs.akzentHex, background: `rgba(${cs.farbeRgb},0.1)`, border: `1px solid rgba(${cs.farbeRgb},0.28)` }}
                >
                  {cs.kennzeichen}
                </span>
                <h3 className="font-display text-lg md:text-xl font-bold text-white leading-snug mb-4">{cs.titel}</h3>
                <dl className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Situation", cs.situation],
                    ["Vorgehen", cs.vorgehen],
                    ["Ergebnis", cs.ergebnis],
                    ["Was das für Sie heisst", cs.lehre],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40 mb-1">{k}</dt>
                      <dd className="text-sm text-white/70 leading-relaxed">{v}</dd>
                    </div>
                  ))}
                </dl>
                {cs.hinweis && (
                  <p className="mt-4 text-xs text-white/40 italic">{cs.hinweis}</p>
                )}
              </div>
            </InfoKarte>
          </motion.div>
        ))}
      </div>

      {/* Beispiel-Bericht */}
      <div className="mt-12">
        <h3 className="font-display text-lg font-bold text-white mb-1">So sieht ein Ergebnis aus</h3>
        <p className="text-sm text-white/50 mb-5">
          Ein KI-Sicherheits-Check endet mit einer klaren Ampel und nachvollziehbaren Befunden, nicht mit einer
          Scanner-Liste. Das folgende Beispiel zeigt die Form —{" "}
          <span className="text-white/70">die Daten darin sind erfunden.</span>
        </p>

        <InfoKarte lichtfarbe="79, 124, 251">
          <div className="p-6 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-4 mb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">Geprüftes System</p>
                <p className="text-sm text-white/80">{BEISPIEL_BERICHT.system}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40 mb-1">Gesamt-Ampel</p>
                <Ampelpunkt ampel={BEISPIEL_BERICHT.gesamtampel} />
              </div>
            </div>

            <ul className="space-y-4">
              {BEISPIEL_BERICHT.befunde.map((b) => (
                <li key={b.titel} className="rounded-2xl2 border border-white/[0.07] bg-white/[0.02] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-display text-sm font-semibold text-white">{b.titel}</span>
                    <Ampelpunkt ampel={b.ampel} />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3 text-[13px]">
                    <p className="text-white/60"><span className="text-white/40">Beobachtet: </span>{b.was}</p>
                    <p className="text-white/60"><span className="text-white/40">Risiko: </span>{b.risiko}</p>
                    <p className="text-white/60"><span className="text-white/40">Fix: </span>{b.fix}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </InfoKarte>
      </div>

      {/* Demo-Verweis */}
      <div className="mt-10 flex flex-wrap items-center gap-4 rounded-3xl2 border border-akzent-500/20 bg-akzent-500/[0.05] p-6">
        <div className="flex-1 min-w-[12rem]">
          <h3 className="font-display text-base font-bold text-white">Prompt-Injection zum Anfassen</h3>
          <p className="text-sm text-white/60 mt-1">
            Probieren Sie selbst aus, wie ein ungeschützter Chatbot aus der Spur zu bringen ist — und was ein
            abgesicherter anders macht.
          </p>
        </div>
        <Link
          to="/demo"
          className="inline-flex items-center gap-2 rounded-full border border-akzent-500/40 bg-akzent-500/10 px-5 py-2.5 font-mono text-sm text-akzent-300 transition-colors hover:border-akzent-500/70 hover:text-white"
        >
          Zur Demo
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </Link>
      </div>
    </section>
  );
}
