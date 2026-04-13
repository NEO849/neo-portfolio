// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: KnopfPrimaer
// Primäre CTA-Schaltfläche mit Magnet-Effekt und Glow.
// Für alle Haupt-Handlungsaufforderungen der Website.
// ═══════════════════════════════════════════════════════════════════

import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { MagnetKnopf } from "../bewegung/MagnetKnopf";

interface KnopfPrimaerProps {
  children: ReactNode;
  onClick?: () => void;
  zuRoute?: string;       // interner React Router Link
  zuUrl?: string;         // externer Link
  typ?: "button" | "submit";
  deaktiviert?: boolean;
  laedt?: boolean;
  klassen?: string;
  vollBreite?: boolean;
}

const BASIS_STIL = `
  relative inline-flex items-center justify-center gap-2
  px-6 py-3 rounded-xl font-semibold text-sm text-white
  bg-akzent-500 border border-akzent-400/30
  transition-all duration-200
  hover:bg-akzent-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.35)]
  focus:outline-none focus:ring-2 focus:ring-akzent-400 focus:ring-offset-2 focus:ring-offset-grund-950
  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
`;

export function KnopfPrimaer({
  children,
  onClick,
  zuRoute,
  zuUrl,
  typ = "button",
  deaktiviert = false,
  laedt = false,
  klassen = "",
  vollBreite = false,
}: KnopfPrimaerProps) {
  const stilKlassen = `${BASIS_STIL} ${vollBreite ? "w-full" : ""} ${klassen}`;
  const inhalt = laedt ? (
    <>
      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      Lädt…
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
    return (
      <MagnetKnopf klassen={stilKlassen}>
        <a href={zuUrl} target="_blank" rel="noopener noreferrer">
          {inhalt}
        </a>
      </MagnetKnopf>
    );
  }

  // Als Button mit Magnet-Effekt
  return (
    <MagnetKnopf
      klassen={stilKlassen}
      onClick={onClick}
      typ={typ}
      deaktiviert={deaktiviert || laedt}
    >
      {inhalt}
    </MagnetKnopf>
  );
}
