// ═══════════════════════════════════════════════════════════════════
// VIEW: Referenzen / Belege (Enterprise) — anonymisierte echte Befunde als
// aufklappbare volle Report-Dokumente (Zusammenfassung → Methodik → Finding
// → Impact → Remediation, Schwere/CVSS/CWE), Flaggschiff mit Diagramm, je
// Befund eine ausführbare Terminal-Demo (Mock-Daten). Keine Namen, keine Re-ID.
// ═══════════════════════════════════════════════════════════════════

import { useState } from "react";
import { Link } from "react-router-dom";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { InfoKarte } from "../bausteine/InfoKarte";
import { AusklappKarte } from "../bausteine/AusklappKarte";
import { TrustBoundaryDiagramm } from "../bausteine/TrustBoundaryDiagramm";
import { TerminalDemo } from "../bausteine/TerminalDemo";
import {
  REPORTE, WEITERE_BEFUNDE, BEISPIEL_BERICHT, SCHWERE_META,
} from "../models/referenzenDaten";
import type { AnonymerReport, BefundAmpel, KurzBefund, Schwere } from "../models/referenzenDaten";

const AMPEL: Record<BefundAmpel, { hex: string; label: string }> = {
  rot: { hex: "#f1646c", label: "Kritisch" },
  gelb: { hex: "#f5b544", label: "Beobachten" },
  gruen: { hex: "#34d399", label: "In Ordnung" },
};

function SchwereBadge({ schwere, cvss }: { schwere: Schwere; cvss?: string }) {
  const m = SCHWERE_META[schwere];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em]"
      style={{ color: m.hex, background: `rgba(${m.farbeRgb},0.12)`, border: `1px solid rgba(${m.farbeRgb},0.4)` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.hex }} />
      {schwere}{cvss ? ` · CVSS ${cvss}` : ""}
    </span>
  );
}

function Ampelpunkt({ ampel }: { ampel: BefundAmpel }) {
  const a = AMPEL[ampel];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: a.hex, boxShadow: `0 0 8px ${a.hex}66` }} />
      <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: a.hex }}>{a.label}</span>
    </span>
  );
}

function DokListe({ titel, hex, punkte }: { titel: string; hex: string; punkte: readonly string[] }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: `${hex}cc` }}>{titel}</p>
      <ul className="space-y-1.5">
        {punkte.map((p) => (
          <li key={p} className="flex items-start gap-2 text-sm text-white/70">
            <span className="mt-[3px] flex-shrink-0 text-[10px]" style={{ color: hex }}>›</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReportDoc({ r }: { r: AnonymerReport }) {
  const [offen, setOffen] = useState(false);
  const m = SCHWERE_META[r.schwere];
  return (
    <AusklappKarte
      lichtfarbe={m.farbeRgb}
      akzentFarbe={m.hex}
      offen={offen}
      onUmschalten={() => setOffen(!offen)}
      kopf={
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">{r.kennzeichen}</span>
            <span className="text-white/15">·</span>
            <SchwereBadge schwere={r.schwere} cvss={r.cvss} />
          </div>
          <h3 className="font-display text-lg md:text-xl font-bold text-white leading-snug">{r.titel}</h3>
          <p className="mt-1 font-mono text-[11px] text-white/45">{r.klasse}</p>
          <p className="mt-0.5 font-mono text-[11px] tracking-wide text-white/35">{r.cwe}</p>
          <p className="mt-3 text-sm text-white/65 leading-relaxed">{r.zusammenfassung}</p>
        </>
      }
      detail={
        <div className="space-y-5">
          {r.diagramm === "trust-boundary" && <TrustBoundaryDiagramm />}

          <DokListe titel="Scope & Methodik" hex={m.hex} punkte={r.methodik} />

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Ausgangslage", r.kontext],
              ["Der Fund", r.fund],
              ["Warum das zählt", r.impact],
              ["Nachweis", r.nachweis],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl2 border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40 mb-1">{k}</p>
                <p className="text-sm text-white/70 leading-relaxed">{v}</p>
              </div>
            ))}
          </div>

          <DokListe titel="Empfohlene Behebung" hex={m.hex} punkte={r.remediation} />

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40 mb-2">Live-Demo (Mock-Daten)</p>
            <TerminalDemo skript={r.demo} />
          </div>
        </div>
      }
    />
  );
}

function KurzBefundKarte({ b }: { b: KurzBefund }) {
  const [offen, setOffen] = useState(false);
  const m = SCHWERE_META[b.schwere];
  return (
    <AusklappKarte
      lichtfarbe={m.farbeRgb}
      akzentFarbe={m.hex}
      offen={offen}
      onUmschalten={() => setOffen(!offen)}
      kopf={
        <>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: m.hex }} />
            <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: m.hex }}>{b.schwere}</span>
            <span className="font-mono text-[10px] text-white/35">{b.cwe}</span>
          </div>
          <h3 className="font-display text-base font-semibold text-white leading-snug">{b.klasse}</h3>
          <p className="mt-1 text-[13px] text-white/60 leading-relaxed">{b.kurz}</p>
        </>
      }
      detail={
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40 mb-2">Live-Demo (Mock-Daten)</p>
          <TerminalDemo skript={b.demo} />
        </div>
      }
    />
  );
}

export default function ReferenzenView() {
  return (
    <section id="referenzen" className="py-16 px-6 max-w-5xl mx-auto">
      <AbschnittsTitel
        prefix="> referenzen"
        untertitel="Belege statt Behauptungen. Echte Befunde aus autorisierten Tests und Bug-Bounty-Programmen — anonymisiert, als aufklappbares Report-Dokument mit ausführbarer Demo. Namen und Einzelheiten nur auf Anfrage unter Vertraulichkeit."
        klassen="mb-8"
      />

      {/* Flaggschiff-Reporte */}
      <div className="space-y-4">
        {REPORTE.map((r) => (
          <ReportDoc key={r.id} r={r} />
        ))}
      </div>

      {/* Weitere bestätigte Befunde */}
      <div className="mt-12">
        <h3 className="font-display text-lg font-bold text-white mb-1">Weitere bestätigte Befunde</h3>
        <p className="text-sm text-white/50 mb-5">Auszug, anonymisiert — jeweils mit Demo zum Ausführen.</p>
        <div className="space-y-4">
          {WEITERE_BEFUNDE.map((b) => (
            <KurzBefundKarte key={b.id} b={b} />
          ))}
        </div>
      </div>

      {/* Beispiel-Bericht (erfundene Daten) */}
      <div className="mt-12">
        <h3 className="font-display text-lg font-bold text-white mb-1">So sieht ein Ergebnis aus</h3>
        <p className="text-sm text-white/50 mb-5">
          Ein Sicherheits-Check endet mit einer klaren Ampel und nachvollziehbaren Befunden, nicht mit einer
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

      {/* CTA */}
      <div className="mt-10 flex flex-wrap items-center gap-4 rounded-3xl2 border border-akzent-500/20 bg-akzent-500/[0.05] p-6">
        <div className="flex-1 min-w-[12rem]">
          <h3 className="font-display text-base font-bold text-white">Write-up und Nachweis auf Anfrage</h3>
          <p className="text-sm text-white/60 mt-1">
            Zu jedem Befund gibt es einen vollständigen, nachvollziehbaren Write-up — unter Vertraulichkeit,
            im Erstgespräch.
          </p>
        </div>
        <Link
          to="/kontakt"
          className="inline-flex items-center gap-2 rounded-full border border-akzent-500/40 bg-akzent-500/10 px-5 py-2.5 font-mono text-sm text-akzent-300 transition-colors hover:border-akzent-500/70 hover:text-white"
        >
          Erstgespräch anfragen
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </Link>
      </div>
    </section>
  );
}
