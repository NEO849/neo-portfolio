// ═══════════════════════════════════════════════════════════════════
// APP: Anbieter
// Bündelt alle Context-Provider an einem Ort.
// Reihenfolge ist wichtig: äußere Provider zuerst.
// ═══════════════════════════════════════════════════════════════════

import { type ReactNode } from "react";
import { PortfolioAnbieter } from "../zustaende/portfolioZustand";

interface AnbieterProps {
  children: ReactNode;
}

export function Anbieter({ children }: AnbieterProps) {
  return (
    <PortfolioAnbieter>
      {children}
    </PortfolioAnbieter>
  );
}
