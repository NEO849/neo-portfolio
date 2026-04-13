// ═══════════════════════════════════════════════════════════════════
// ZUSTÄNDE: Portfolio-Zustand
// Globaler App-Zustand: Navigation, Theme, aktive Sektion.
// Wird in Anbieter.tsx bereitgestellt, überall per Hook abrufbar.
// ═══════════════════════════════════════════════════════════════════

import {
  createContext, useContext, useMemo, useState, useCallback,
  type ReactNode,
} from "react";

// ─── Typ-Definition des Zustands ─────────────────────────────────
interface PortfolioZustandTyp {
  // Navigation
  mobileMenuOffen:   boolean;
  mobileMenuToggle:  () => void;
  mobileMenuSchliessen: () => void;

  // Aktive Seite (für Nav-Highlighting)
  aktiveRoute:       string;
  aktiveRouteSetzen: (route: string) => void;

  // Lade-Status (für Seitenübergänge)
  laedt: boolean;
  laedtSetzen: (wert: boolean) => void;
}

// ─── Context ──────────────────────────────────────────────────────
const PortfolioContext = createContext<PortfolioZustandTyp | null>(null);

// ─── Provider ─────────────────────────────────────────────────────
export function PortfolioAnbieter({ children }: { children: ReactNode }) {
  const [mobileMenuOffen, setMobileMenuOffen]   = useState(false);
  const [aktiveRoute, setAktiveRoute]           = useState("/");
  const [laedt, setLaedt]                       = useState(false);

  const mobileMenuToggle     = useCallback(() => setMobileMenuOffen(v => !v), []);
  const mobileMenuSchliessen = useCallback(() => setMobileMenuOffen(false), []);
  const aktiveRouteSetzen    = useCallback((route: string) => {
    setAktiveRoute(route);
    setMobileMenuOffen(false); // Menü schließen bei Navigation
  }, []);
  const laedtSetzen = useCallback((wert: boolean) => setLaedt(wert), []);

  const zustand = useMemo<PortfolioZustandTyp>(() => ({
    mobileMenuOffen,
    mobileMenuToggle,
    mobileMenuSchliessen,
    aktiveRoute,
    aktiveRouteSetzen,
    laedt,
    laedtSetzen,
  }), [
    mobileMenuOffen, mobileMenuToggle, mobileMenuSchliessen,
    aktiveRoute, aktiveRouteSetzen,
    laedt, laedtSetzen,
  ]);

  return (
    <PortfolioContext.Provider value={zustand}>
      {children}
    </PortfolioContext.Provider>
  );
}

// ─── Hook (mit Guard) ─────────────────────────────────────────────
export function usePortfolioZustand(): PortfolioZustandTyp {
  const kontext = useContext(PortfolioContext);
  if (!kontext) {
    throw new Error(
      "usePortfolioZustand muss innerhalb von PortfolioAnbieter verwendet werden"
    );
  }
  return kontext;
}
