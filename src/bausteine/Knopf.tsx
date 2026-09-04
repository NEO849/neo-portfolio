// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: Knopf
// Vereinheitlichter Button-Baustein — ersetzt KnopfPrimaer/KnopfSekundaer/
// KnopfAktion (drei divergierende Interfaces, ein Design-Vokabular).
// variante="primaer"   → gefüllt, Magnet-Effekt, Glow (ehem. KnopfPrimaer)
// variante="sekundaer" → Ghost/Outline, ohne Magnet (ehem. KnopfSekundaer)
// variante="aktion"    → dezent umrandet, Mono-Label (ehem. KnopfAktion)
// ═══════════════════════════════════════════════════════════════════

import { type ReactNode, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { MagnetKnopf } from "../bewegung/MagnetKnopf";

type KnopfVariante = "primaer" | "sekundaer" | "aktion";

interface KnopfProps {
  children: ReactNode;
  variante?: KnopfVariante;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  zuRoute?: string;       // interner React Router Link
  zuUrl?: string;         // externer Link
  typ?: "button" | "submit";
  deaktiviert?: boolean;
  laedt?: boolean;
  ladeText?: string;
  magnet?: boolean;       // default: true nur bei variante="primaer"
  klassen?: string;
  vollBreite?: boolean;
}

const VARIANTEN_STIL: Record<KnopfVariante, string> = {
  primaer: `
    relative inline-flex items-center justify-center gap-2
    px-6 py-3 rounded-xl font-semibold text-sm text-white
    bg-akzent-500 border border-akzent-400/30
    transition-all duration-200
    hover:bg-akzent-400 hover:shadow-[0_0_30px_rgba(79,124,251,0.40)]
    focus:outline-none focus:ring-2 focus:ring-akzent-400 focus:ring-offset-2 focus:ring-offset-grund-950
    disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
  `,
  sekundaer: `
    inline-flex items-center justify-center gap-2
    px-6 py-3 rounded-xl font-semibold text-sm
    text-white/70 border border-white/10 bg-white/[0.04]
    backdrop-blur-sm
    transition-all duration-200
    hover:text-white hover:border-white/20 hover:bg-white/[0.08]
    focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-grund-950
    disabled:opacity-40 disabled:cursor-not-allowed
  `,
  aktion:
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-mono " +
    "border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed " +
    "bg-akzent-500/[0.08] border-akzent-500/30 text-akzent-200 " +
    "hover:text-white hover:bg-akzent-500/[0.16] hover:border-akzent-500/50 " +
    "focus-visible:ring-2 focus-visible:ring-akzent-400/60 focus-visible:outline-none",
};

export function Knopf({
  children,
  variante = "primaer",
  onClick,
  zuRoute,
  zuUrl,
  typ = "button",
  deaktiviert = false,
  laedt = false,
  ladeText = "Lädt…",
  magnet = variante === "primaer",
  klassen = "",
  vollBreite = false,
}: KnopfProps) {
  const stilKlassen = `${VARIANTEN_STIL[variante]} ${vollBreite ? "w-full" : ""} ${klassen}`;

  const inhalt = laedt ? (
    <>
      <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      {ladeText}
    </>
  ) : children;

  // Als interner Link
  if (zuRoute && !deaktiviert && !laedt) {
    return (
      <Link to={zuRoute} className={stilKlassen}>
        {inhalt}
      </Link>
    );
  }

  // Als externer Link
  if (zuUrl && !deaktiviert && !laedt) {
    if (magnet) {
      return (
        <MagnetKnopf klassen={stilKlassen}>
          <a href={zuUrl} target="_blank" rel="noopener noreferrer">
            {inhalt}
          </a>
        </MagnetKnopf>
      );
    }
    return (
      <a href={zuUrl} target="_blank" rel="noopener noreferrer" className={stilKlassen}>
        {inhalt}
      </a>
    );
  }

  // Als Button
  if (magnet) {
    return (
      <MagnetKnopf
        klassen={stilKlassen}
        onClick={onClick as unknown as () => void}
        typ={typ}
        deaktiviert={deaktiviert || laedt}
      >
        {inhalt}
      </MagnetKnopf>
    );
  }

  return (
    <button type={typ} onClick={onClick} disabled={deaktiviert || laedt} className={stilKlassen}>
      {inhalt}
    </button>
  );
}
