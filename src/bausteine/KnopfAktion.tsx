// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: KnopfAktion
// Einheitliche Aktions-Schaltfläche (dezent umrandet, Mono-Label, Azur-
// Akzent) für wiederkehrende Aktionen: „Nachricht senden", „Analysieren",
// „Projekt unterstützen". Sorgt für ein konsistentes Button-Bild über alle
// Views hinweg. Bewusst plain (kein Magnet) — ruhig und sachlich.
// ═══════════════════════════════════════════════════════════════════

import { type ReactNode, type MouseEvent } from "react";

interface KnopfAktionProps {
  kinder: ReactNode;
  beimKlick?: (ereignis: MouseEvent<HTMLButtonElement>) => void;
  typ?: "button" | "submit";
  deaktiviert?: boolean;
  laedt?: boolean;
  ladeText?: string;
  vollBreite?: boolean;
  klassen?: string;
}

const AKTION_STIL =
  "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-mono " +
  "border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed " +
  "bg-akzent-500/[0.08] border-akzent-500/30 text-akzent-200 " +
  "hover:text-white hover:bg-akzent-500/[0.16] hover:border-akzent-500/50 " +
  "focus-visible:ring-2 focus-visible:ring-akzent-400/60 focus-visible:outline-none";

export function KnopfAktion({
  kinder,
  beimKlick,
  typ = "button",
  deaktiviert = false,
  laedt = false,
  ladeText = "Lädt…",
  vollBreite = false,
  klassen = "",
}: KnopfAktionProps) {
  return (
    <button
      type={typ}
      onClick={beimKlick}
      disabled={deaktiviert || laedt}
      className={`${AKTION_STIL} ${vollBreite ? "w-full" : ""} ${klassen}`}
    >
      {laedt ? (
        <>
          <span className="inline-block w-3 h-3 border border-akzent-200/60 border-t-transparent rounded-full animate-spin" />
          {ladeText}
        </>
      ) : (
        kinder
      )}
    </button>
  );
}
