// ═══════════════════════════════════════════════════════════════════
// BEWEGUNG/HOOKS: Reduced-Motion Erkennung
// Respektiert das Betriebssystem-Setting des Nutzers.
// Wird in JEDER Motion-Komponente als Wächter verwendet.
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";

export function useBewegungErlaubt(): boolean {
  const [erlaubt, setErlaubt] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const abfrage = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (ereignis: MediaQueryListEvent) => {
      setErlaubt(!ereignis.matches);
    };
    abfrage.addEventListener("change", handler);
    return () => abfrage.removeEventListener("change", handler);
  }, []);

  return erlaubt;
}
