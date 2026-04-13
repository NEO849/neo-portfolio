// ═══════════════════════════════════════════════════════════════════
// BEWEGUNG: MagnetKnopf — Magnetischer Hover-Effekt
// Der Knopf folgt der Maus subtil — erzeugt Lebendigkeit & Identität.
// Aufgabe: Markengeste, Wiedererkennungswert, Handlungsaufforderung
// Verwendung: <MagnetKnopf> statt normalem <button> für CTAs
// ═══════════════════════════════════════════════════════════════════

import { useRef, useState, useCallback, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useBewegungErlaubt } from "./hooks/useBewegungErlaubt";
import { KURVEN } from "./varianten";

interface MagnetKnopfProps {
  children: ReactNode;
  klassen?: string;
  staerke?: number;     // 0–1, wie stark der Magnet-Effekt ist
  onClick?: () => void;
  typ?: "button" | "submit" | "reset";
  deaktiviert?: boolean;
  ariaLabel?: string;
}

export function MagnetKnopf({
  children,
  klassen = "",
  staerke = 0.35,
  onClick,
  typ = "button",
  deaktiviert = false,
  ariaLabel,
}: MagnetKnopfProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [versatz, setVersatz] = useState({ x: 0, y: 0 });
  const bewegungErlaubt = useBewegungErlaubt();

  const beimBewegen = useCallback((ereignis: React.MouseEvent<HTMLButtonElement>) => {
    if (!bewegungErlaubt || !ref.current || deaktiviert) return;
    const rahmen = ref.current.getBoundingClientRect();
    const mittelpunktX = rahmen.left + rahmen.width / 2;
    const mittelpunktY = rahmen.top + rahmen.height / 2;
    const deltaX = (ereignis.clientX - mittelpunktX) * staerke;
    const deltaY = (ereignis.clientY - mittelpunktY) * staerke;
    setVersatz({ x: deltaX, y: deltaY });
  }, [bewegungErlaubt, staerke, deaktiviert]);

  const beimVerlassen = useCallback(() => {
    setVersatz({ x: 0, y: 0 });
  }, []);

  return (
    <motion.button
      ref={ref}
      type={typ}
      disabled={deaktiviert}
      onClick={onClick}
      aria-label={ariaLabel}
      className={klassen}
      animate={{ x: versatz.x, y: versatz.y }}
      transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.5 }}
      whileTap={bewegungErlaubt ? { scale: 0.97 } : {}}
      onMouseMove={beimBewegen}
      onMouseLeave={beimVerlassen}
    >
      {children}
    </motion.button>
  );
}

// ─── Link-Variante (für Router-Links mit Magnet-Effekt) ──────────
interface MagnetLinkProps {
  children: ReactNode;
  klassen?: string;
  staerke?: number;
  href: string;
  extern?: boolean;
}

export function MagnetLink({
  children,
  klassen = "",
  staerke = 0.3,
  href,
  extern = false,
}: MagnetLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [versatz, setVersatz] = useState({ x: 0, y: 0 });
  const bewegungErlaubt = useBewegungErlaubt();

  const beimBewegen = useCallback((ereignis: React.MouseEvent<HTMLAnchorElement>) => {
    if (!bewegungErlaubt || !ref.current) return;
    const rahmen = ref.current.getBoundingClientRect();
    const deltaX = (ereignis.clientX - (rahmen.left + rahmen.width / 2)) * staerke;
    const deltaY = (ereignis.clientY - (rahmen.top + rahmen.height / 2)) * staerke;
    setVersatz({ x: deltaX, y: deltaY });
  }, [bewegungErlaubt, staerke]);

  const beimVerlassen = useCallback(() => setVersatz({ x: 0, y: 0 }), []);

  return (
    <motion.a
      ref={ref}
      href={href}
      target={extern ? "_blank" : undefined}
      rel={extern ? "noopener noreferrer" : undefined}
      className={klassen}
      animate={{ x: versatz.x, y: versatz.y }}
      transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.5 }}
      onMouseMove={beimBewegen}
      onMouseLeave={beimVerlassen}
    >
      {children}
    </motion.a>
  );
}
