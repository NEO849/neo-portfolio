// ═══════════════════════════════════════════════════════════════════
// APP: Anbieter
// Bündelt alle Context-Provider an einem Ort.
// Reihenfolge ist wichtig: äußere Provider zuerst.
// ═══════════════════════════════════════════════════════════════════

import { type ReactNode } from "react";
import { HelmetProvider } from "react-helmet-async";
import { MotionConfig } from "framer-motion";
import { PortfolioAnbieter } from "../zustaende/portfolioZustand";

interface AnbieterProps {
  children: ReactNode;
}

export function Anbieter({ children }: AnbieterProps) {
  // reducedMotion="user": Framer respektiert global das OS-Setting — bei
  // aktivierter Bewegungsreduktion entfallen Transform-/Opacity-Animationen
  // seitenweit (ergänzt die CSS-Guards für Sweep/Ticker/Matrix).
  return (
    <HelmetProvider>
      <MotionConfig reducedMotion="user">
        <PortfolioAnbieter>
          {children}
        </PortfolioAnbieter>
      </MotionConfig>
    </HelmetProvider>
  );
}
