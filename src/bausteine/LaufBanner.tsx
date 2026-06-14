// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: LaufBanner (Effekt A — nahtloser Info-Ticker)
// Ein endlos nach links laufendes Band mit kurzen Infrastruktur-/Projekt-
// Highlights. Technik: verdoppelte Sequenz + transform: translateX(0→-50%)
// (GPU, kein Layout-Shift). Ränder weich maskiert, Pause bei Hover/Fokus.
// Daten + Reduced-Motion kommen aus dem ViewModel — die View rendert nur.
// ═══════════════════════════════════════════════════════════════════

import { useLaufBanner } from "../viewmodels/useLaufBanner";
import type { BannerEintrag } from "../models/laufBannerDaten";

interface LaufBannerProps {
  /** Dauer eines vollen Durchlaufs in Sekunden (kleiner = schneller). */
  tempoSekunden?: number;
  klassen?: string;
}

// Ein einzelnes Item — Akzentpunkt + Text + optional hervorgehobener Wert.
function BannerStueck({ eintrag }: { eintrag: BannerEintrag }) {
  return (
    <span className="inline-flex items-center gap-2.5 px-5 whitespace-nowrap">
      <span aria-hidden className="text-akzent-400/70 text-[10px]">
        {eintrag.symbol ?? "•"}
      </span>
      <span className="text-[13px] text-white/65">{eintrag.text}</span>
      {eintrag.wert && (
        <span className="font-mono text-[13px] font-semibold text-akzent-300">{eintrag.wert}</span>
      )}
    </span>
  );
}

export function LaufBanner({ tempoSekunden = 44, klassen = "" }: LaufBannerProps) {
  const { eintraege, sequenz, bewegungReduziert } = useLaufBanner();

  // Weiche Ein-/Ausblendung an den Rändern (kein hartes Abschneiden).
  const randMaske =
    "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)";

  // Reduced-Motion: statische, lesbare Zeile ohne Endlosbewegung.
  if (bewegungReduziert) {
    return (
      <div
        className={`glass rounded-full px-5 py-2.5 overflow-x-auto scrollbar-none ${klassen}`}
        aria-label="Aktuelle Infrastruktur- und Projekt-Highlights"
      >
        <div className="flex items-center gap-1 w-max">
          {eintraege.map((eintrag) => (
            <BannerStueck key={eintrag.id} eintrag={eintrag} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group glass rounded-full py-2.5 overflow-hidden ${klassen}`}
      style={{ maskImage: randMaske, WebkitMaskImage: randMaske }}
      role="group"
      aria-label="Aktuelle Infrastruktur- und Projekt-Highlights"
      tabIndex={0}
    >
      {/* Sichtbare Laufspur — rein dekorativ (verdoppelt), daher vor AT verborgen.
          Pause bei Hover ODER Tastaturfokus auf dem Container. */}
      <div
        aria-hidden="true"
        className="flex w-max animate-band-laufen group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationDuration: `${tempoSekunden}s` }}
      >
        {sequenz.map((eintrag, index) => (
          <BannerStueck key={`${eintrag.id}-${index}`} eintrag={eintrag} />
        ))}
      </div>

      {/* Echte Inhalte für Screenreader (einmalig, ohne Bewegung). */}
      <ul className="sr-only">
        {eintraege.map((eintrag) => (
          <li key={eintrag.id}>
            {eintrag.text}
            {eintrag.wert ? ` ${eintrag.wert}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
