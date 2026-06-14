// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: ErgebnisUebersicht
// Premium-Zusammenfassung ganz oben über den OSINT-Resultaten:
//   • Schweregrad auf einen Blick (Farbe + Etikett)
//   • Verdikt + 1–2 Sätze Klartext („was bedeutet das?")
//   • severity-sortierte Kennzahlen (Kritisches zuerst)
//   • „Nächste Schritte"-Chips aus den Pivots (klare Folge-Aktionen)
// Reine Darstellung — die Logik liegt im Hilfsmittel (testbar, pur).
// ═══════════════════════════════════════════════════════════════════

import {
  fasseErgebnisZusammen,
  extrahierePivots,
  type Schwere,
} from "../../hilfsmittel/ergebnisZusammenfassung";

interface ErgebnisUebersichtProps {
  modulNummer: string;
  daten: object | null;
  onPivot?: (typ: string, wert: string) => void;
}

// Severity-Stilwelt — ruhig, nicht grell (Premium statt Alarm).
const STIL: Record<Schwere, { etikett: string; text: string; rand: string; flaeche: string; balken: string; punkt: string }> = {
  kritisch:   { etikett: "Kritisch",     text: "text-signal-rot",   rand: "border-signal-rot/30",   flaeche: "bg-signal-rot/[0.06]",   balken: "bg-signal-rot",   punkt: "bg-signal-rot" },
  auffaellig: { etikett: "Auffällig",    text: "text-signal-gelb",  rand: "border-signal-gelb/30",  flaeche: "bg-signal-gelb/[0.06]",  balken: "bg-signal-gelb",  punkt: "bg-signal-gelb" },
  neutral:    { etikett: "Hinweis",      text: "text-akzent-300",   rand: "border-akzent-500/25",   flaeche: "bg-akzent-500/[0.05]",   balken: "bg-akzent-500",   punkt: "bg-akzent-400" },
  ok:         { etikett: "Unauffällig",  text: "text-signal-gruen", rand: "border-signal-gruen/25", flaeche: "bg-signal-gruen/[0.05]", balken: "bg-signal-gruen", punkt: "bg-signal-gruen" },
};

function kuerzen(text: string, max = 26): string {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

export function ErgebnisUebersicht({ modulNummer, daten, onPivot }: ErgebnisUebersichtProps) {
  const zusammenfassung = fasseErgebnisZusammen(modulNummer, daten);
  if (!zusammenfassung) return null;

  const stil = STIL[zusammenfassung.schwere];
  const pivots = extrahierePivots(modulNummer, daten)
    .filter((p) => p.analysierbar)
    .slice(0, 5);

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${stil.rand} ${stil.flaeche} mb-5`}>
      {/* Schweregrad-Balken links */}
      <span className={`absolute inset-y-0 left-0 w-1 ${stil.balken}`} />

      <div className="pl-5 pr-4 py-4">
        {/* Kopf: Schweregrad-Etikett + Verdikt */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 rounded-full border ${stil.rand} px-2 py-0.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${stil.punkt}`} />
            <span className={`font-mono text-[10px] uppercase tracking-[0.16em] ${stil.text}`}>{stil.etikett}</span>
          </span>
          <span className="font-display font-semibold text-white text-[15px] md:text-base">{zusammenfassung.verdikt}</span>
        </div>

        {/* Klartext */}
        <p className="text-[13px] text-white/65 leading-relaxed mt-2 max-w-2xl">{zusammenfassung.kernaussage}</p>

        {/* Kennzahlen (severity-sortiert, Kritisches zuerst) */}
        {zusammenfassung.kennzahlen.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3.5">
            {zusammenfassung.kennzahlen.map((kennzahl) => {
              const ks = STIL[kennzahl.schwere];
              return (
                <span
                  key={kennzahl.etikett}
                  className={`inline-flex items-baseline gap-1.5 rounded-lg border ${ks.rand} bg-white/[0.02] px-2.5 py-1`}
                >
                  <span className={`font-mono text-[13px] font-semibold ${ks.text}`}>{kennzahl.wert}</span>
                  <span className="text-[11px] text-white/45">{kennzahl.etikett}</span>
                </span>
              );
            })}
          </div>
        )}

        {/* Nächste Schritte — klickbare Pivots */}
        {pivots.length > 0 && onPivot && (
          <div className="mt-4 pt-3.5 border-t border-white/[0.06]">
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 mb-2">Nächste Schritte</span>
            <div className="flex flex-wrap gap-2">
              {pivots.map((pivot, index) => (
                <button
                  key={`${pivot.typ}-${index}`}
                  type="button"
                  onClick={() => onPivot(pivot.typ, pivot.wert)}
                  className="group inline-flex items-center gap-1.5 rounded-lg border border-akzent-500/25 bg-akzent-500/[0.06] px-2.5 py-1.5 text-[12px] text-akzent-200 hover:text-white hover:bg-akzent-500/[0.14] hover:border-akzent-500/45 transition-colors"
                >
                  <span className="font-mono text-[10px] uppercase tracking-wider text-akzent-400/70">{pivot.typ}</span>
                  <span className="text-white/80">{kuerzen(pivot.wert)}</span>
                  <span className="text-akzent-300 group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
