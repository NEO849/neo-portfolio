// ═══════════════════════════════════════════════════════════════════
// APP: Anbieter
// Bündelt alle Context-Provider an einem Ort.
// Reihenfolge ist wichtig: äußere Provider zuerst.
// ═══════════════════════════════════════════════════════════════════

import { type ReactNode } from "react";
import { HelmetProvider } from "react-helmet-async";
import { PortfolioAnbieter } from "../zustaende/portfolioZustand";

interface AnbieterProps {
  children: ReactNode;
}

export function Anbieter({ children }: AnbieterProps) {
  return (
    <HelmetProvider>
      <PortfolioAnbieter>
        {children}
      </PortfolioAnbieter>
    </HelmetProvider>
  );
}
