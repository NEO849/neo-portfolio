// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: KnopfSekundaer
// Sekundäre Schaltfläche — Ghost/Outline-Stil, weniger Gewicht.
// ═══════════════════════════════════════════════════════════════════

import { type ReactNode } from "react";
import { Link } from "react-router-dom";

interface KnopfSekundaerProps {
  children: ReactNode;
  onClick?: () => void;
  zuRoute?: string;
  zuUrl?: string;
  typ?: "button" | "submit";
  deaktiviert?: boolean;
  klassen?: string;
  vollBreite?: boolean;
}

const BASIS_STIL = `
  inline-flex items-center justify-center gap-2
  px-6 py-3 rounded-xl font-semibold text-sm
  text-white/70 border border-white/10 bg-white/[0.04]
  backdrop-blur-sm
  transition-all duration-200
  hover:text-white hover:border-white/20 hover:bg-white/[0.08]
  focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-grund-950
  disabled:opacity-40 disabled:cursor-not-allowed
`;

export function KnopfSekundaer({
  children,
  onClick,
  zuRoute,
  zuUrl,
  typ = "button",
  deaktiviert = false,
  klassen = "",
  vollBreite = false,
}: KnopfSekundaerProps) {
  const stilKlassen = `${BASIS_STIL} ${vollBreite ? "w-full" : ""} ${klassen}`;

  if (zuRoute && !deaktiviert) {
    return <Link to={zuRoute} className={stilKlassen}>{children}</Link>;
  }

  if (zuUrl && !deaktiviert) {
    return (
      <a href={zuUrl} target="_blank" rel="noopener noreferrer" className={stilKlassen}>
        {children}
      </a>
    );
  }

  return (
    <button type={typ} onClick={onClick} disabled={deaktiviert} className={stilKlassen}>
      {children}
    </button>
  );
}
