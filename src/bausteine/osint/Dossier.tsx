// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: Dossier — zusammengeführte Forensik-Ansicht (Hero über dem Ergebnis)
// Identität (Subjekt/Namen/Avatare) + Risiko + Kennzahl-Heatmap (Balken!) +
// Karte (GPS/IP) + Timeline + Nächste-Schritte. Konsistent zur Severity-Farbwelt.
// Reine Darstellung; Logik liegt in den puren Hilfsmitteln.
// ═══════════════════════════════════════════════════════════════════

import {
  fasseErgebnisZusammen,
  extrahierePivots,
  dossierExtrakt,
  type Schwere,
} from "../../hilfsmittel/ergebnisZusammenfassung";

interface DossierProps {
  modulNummer: string;
  daten: object | null;
  onPivot?: (typ: string, wert: string) => void;
}

const STIL: Record<Schwere, { text: string; balken: string; punkt: string; breite: string }> = {
  kritisch:   { text: "text-signal-rot",   balken: "bg-signal-rot",   punkt: "bg-signal-rot",   breite: "100%" },
  auffaellig: { text: "text-signal-gelb",  balken: "bg-signal-gelb",  punkt: "bg-signal-gelb",  breite: "70%" },
  neutral:    { text: "text-akzent-300",   balken: "bg-akzent-500",   punkt: "bg-akzent-400",   breite: "45%" },
  ok:         { text: "text-signal-gruen", balken: "bg-signal-gruen", punkt: "bg-signal-gruen", breite: "22%" },
};

const ETIKETT: Record<Schwere, string> = {
  kritisch: "Kritisch", auffaellig: "Auffällig", neutral: "Hinweis", ok: "Unauffällig",
};

export function Dossier({ modulNummer, daten, onPivot }: DossierProps) {
  const z = fasseErgebnisZusammen(modulNummer, daten);
  if (!z) return null;
  const ex = dossierExtrakt(modulNummer, daten);
  const pivots = extrahierePivots(modulNummer, daten).filter((p) => p.analysierbar).slice(0, 6);
  const stil = STIL[z.schwere];

  return (
    <div className="relative overflow-hidden rounded-2xl2 border border-white/[0.08] bg-white/[0.025] mb-5 kante-licht">
      <span aria-hidden className={`absolute inset-x-0 top-0 h-0.5 ${stil.balken} opacity-80`} />

      {/* ── Identitäts-Kopf ── */}
      <div className="px-5 pt-5 pb-4 flex items-start gap-4 flex-wrap">
        {/* Avatare */}
        {ex.avatare.length > 0 && (
          <div className="flex -space-x-2 flex-shrink-0">
            {ex.avatare.slice(0, 4).map((a, i) => (
              <img key={i} src={a} alt="" loading="lazy" referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-xl border border-white/15 object-cover bg-grund-800"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            ))}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">Dossier</span>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 ${stil.text}`}
              style={{ borderColor: "currentColor" }}>
              <span className={`w-1.5 h-1.5 rounded-full ${stil.punkt}`} />
              <span className="font-mono text-[10px] uppercase tracking-wider">{ETIKETT[z.schwere]}</span>
            </span>
          </div>
          {ex.subjekt && (
            <div className="font-display font-bold text-white text-lg md:text-xl tracking-[-0.01em] truncate mt-0.5">
              {ex.subjekt}
            </div>
          )}
          {ex.namen.length > 0 && (
            <div className="text-[12.5px] text-white/65 mt-0.5">
              <span className="text-white/45">Namen/Aliase: </span>{ex.namen.join(" · ")}
            </div>
          )}
          <div className="font-display font-semibold text-white/90 text-[14px] mt-2">{z.verdikt}</div>
          <p className="text-[13px] text-white/70 leading-relaxed mt-1 max-w-2xl">{z.kernaussage}</p>
        </div>
      </div>

      {/* ── Risiko-Heatmap (die coolen Balken, severity-gefärbt) ── */}
      {z.kennzahlen.length > 0 && (
        <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
          {z.kennzahlen.map((k) => {
            const ks = STIL[k.schwere];
            return (
              <div key={k.etikett}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12px] text-white/65 truncate">{k.etikett}</span>
                  <span className={`font-mono text-[13px] font-semibold ${ks.text}`}>{k.wert}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] mt-1 overflow-hidden">
                  <div className={`h-full rounded-full ${ks.balken} transition-all duration-700`} style={{ width: ks.breite }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Karte (GPS aus Bild / IP-Geo) ── */}
      {ex.koordinaten && (
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">Standort</span>
            {ex.koordinaten.label && <span className="text-[12px] text-white/70">{ex.koordinaten.label}</span>}
            <span className="font-mono text-[11px] text-white/45 ml-auto">{ex.koordinaten.lat.toFixed(4)}, {ex.koordinaten.lon.toFixed(4)}</span>
          </div>
          <div className="rounded-xl overflow-hidden border border-white/10">
            <iframe
              title="Standort-Karte"
              className="w-full h-44 grayscale-[0.25] contrast-[1.05]"
              loading="lazy"
              referrerPolicy="no-referrer"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${ex.koordinaten.lon - 0.03}%2C${ex.koordinaten.lat - 0.02}%2C${ex.koordinaten.lon + 0.03}%2C${ex.koordinaten.lat + 0.02}&layer=mapnik&marker=${ex.koordinaten.lat}%2C${ex.koordinaten.lon}`}
            />
          </div>
        </div>
      )}

      {/* ── Timeline (datierte Funde) ── */}
      {ex.zeitpunkte.length > 0 && (
        <div className="px-5 pb-4">
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/50 mb-2">Zeitleiste</span>
          <div className="flex items-stretch gap-1.5 overflow-x-auto scrollbar-none">
            {ex.zeitpunkte.map((t, i) => (
              <div key={i} className="flex-shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 min-w-[92px]">
                <div className="font-mono text-[10px] text-akzent-300">{(t.datum || "").slice(0, 10)}</div>
                <div className="text-[11px] text-white/70 truncate max-w-[120px]">{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Nächste Schritte (Pivots) ── */}
      {pivots.length > 0 && onPivot && (
        <div className="px-5 pb-4 pt-1 border-t border-white/[0.06]">
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/50 mb-2 mt-3">Nächste Schritte</span>
          <div className="flex flex-wrap gap-2">
            {pivots.map((p, i) => (
              <button key={`${p.typ}-${i}`} type="button" onClick={() => onPivot(p.typ, p.wert)}
                className="group inline-flex items-center gap-1.5 rounded-lg border border-akzent-500/25 bg-akzent-500/[0.06] px-2.5 py-1.5 text-[12px] text-akzent-200 hover:text-white hover:bg-akzent-500/[0.14] hover:border-akzent-500/45 transition-colors">
                <span className="font-mono text-[10px] uppercase tracking-wider text-akzent-400/70">{p.typ}</span>
                <span className="text-white/80">{p.wert.length > 26 ? p.wert.slice(0, 25) + "…" : p.wert}</span>
                <span className="text-akzent-300 group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
