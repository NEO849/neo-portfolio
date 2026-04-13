import { createContext, useContext, useMemo, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { ProjektModel } from "../models/typen";
import { PROJEKTE, SKILLS } from "../models/daten";

// ═══════════════════════════════════════════════════════
// VIEWMODEL: Geschäftslogik + Zustandsverwaltung
// Analog zu ObservableObject in SwiftUI
// ═══════════════════════════════════════════════════════

type ProjektFilter = "alle" | "security" | "development" | "tooling";
type SkillFilter   = "alle" | "security" | "development" | "infrastructure" | "tools";

interface PortfolioState {
  // Navigation
  readonly aktiveSektion: string;
  readonly mobileMenuOffen: boolean;
  readonly sektionWechseln: (sektion: string) => void;
  readonly mobileMenuToggle: () => void;

  // Projekte
  readonly projektFilter: ProjektFilter;
  readonly gefilterteProjekte: ProjektModel[];
  readonly projektFilterSetzen: (filter: ProjektFilter) => void;

  // Skills
  readonly skillFilter: SkillFilter;
  readonly gefiltereSkills: typeof SKILLS;
  readonly skillFilterSetzen: (filter: SkillFilter) => void;
}

const PortfolioContext = createContext<PortfolioState | null>(null);

/** Provider – umhüllt die gesamte App */
export function PortfolioProvider({ children }: { children: ReactNode }) {
  // ── Navigation State ──
  const [aktiveSektion, setAktiveSektion] = useState("hero");
  const [mobileMenuOffen, setMobileMenuOffen] = useState(false);

  const sektionWechseln = useCallback((sektion: string) => {
    setAktiveSektion(sektion);
    setMobileMenuOffen(false); // Menü schließen bei Navigation
  }, []);

  const mobileMenuToggle = useCallback(() => {
    setMobileMenuOffen(vorher => !vorher);
  }, []);

  // ── Projekt-Filter ──
  const [projektFilter, setProjektFilter] = useState<ProjektFilter>("alle");

  const gefilterteProjekte = useMemo(() => {
    if (projektFilter === "alle") return PROJEKTE;
    return PROJEKTE.filter(projekt => projekt.kategorie === projektFilter);
  }, [projektFilter]);

  const projektFilterSetzen = useCallback((filter: ProjektFilter) => {
    setProjektFilter(filter);
  }, []);

  // ── Skill-Filter ──
  const [skillFilter, setSkillFilter] = useState<SkillFilter>("alle");

  const gefiltereSkills = useMemo(() => {
    if (skillFilter === "alle") return SKILLS;
    return SKILLS.filter(skill => skill.kategorie === skillFilter);
  }, [skillFilter]);

  const skillFilterSetzen = useCallback((filter: SkillFilter) => {
    setSkillFilter(filter);
  }, []);

  // ── Memoized Value ──
  const state = useMemo<PortfolioState>(() => ({
    aktiveSektion,
    mobileMenuOffen,
    sektionWechseln,
    mobileMenuToggle,
    projektFilter,
    gefilterteProjekte,
    projektFilterSetzen,
    skillFilter,
    gefiltereSkills,
    skillFilterSetzen,
  }), [
    aktiveSektion, mobileMenuOffen, sektionWechseln, mobileMenuToggle,
    projektFilter, gefilterteProjekte, projektFilterSetzen,
    skillFilter, gefiltereSkills, skillFilterSetzen,
  ]);

  return (
    <PortfolioContext.Provider value={state}>
      {children}
    </PortfolioContext.Provider>
  );
}

/** Hook – Guard falls Provider fehlt */
export function usePortfolio(): PortfolioState {
  const kontext = useContext(PortfolioContext);
  if (!kontext) throw new Error("usePortfolio muss innerhalb von PortfolioProvider verwendet werden");
  return kontext;
}
