// ═══════════════════════════════════════════════════════════════════
// APP: Chunk-Selbstheilung
// Schützt die SPA gegen "Stale Chunks" nach einem Deploy.
//
// Problem: Lazy-Routen werden als gehashte JS-Chunks ausgeliefert. Hält ein
// Browser (typisch iOS-Safari) noch ein altes Bundle, zeigt aber der erste
// dynamische import() auf einen Chunk-Hash, den der neue Deploy nicht mehr
// kennt → 404 → unbehandelter Reject → die FehlerGrenze fängt es, doch der
// Nutzer sieht eine Fehlermeldung statt der Seite.
//
// Lösung: Bei einem fehlgeschlagenen Chunk-Load EINMAL hart neu laden. Das
// holt frisches index.html + frische Chunk-Hashes — die Seite repariert sich
// selbst, ohne dass jemand den Cache leeren muss. Ein sessionStorage-Wächter
// verhindert Reload-Schleifen (falls der Fehler doch dauerhaft ist).
// ═══════════════════════════════════════════════════════════════════

import { lazy, type ComponentType, type LazyExoticComponent } from "react";

const NEULADE_SCHLUESSEL = "neo:chunk-neuladen-ts";
const NEULADE_FENSTER_MS = 10_000;

/**
 * Lädt die Seite genau EINMAL pro 10-Sekunden-Fenster neu — als Selbstheilung
 * gegen veraltete Chunks. Gibt `true` zurück, wenn ein Reload ausgelöst wurde.
 * Schlägt sessionStorage fehl (z.B. iOS-Privatmodus), wird bewusst NICHT
 * automatisch neu geladen — dann übernimmt die FehlerGrenze die UX.
 */
export function neuLadenGegenStaleChunk(): boolean {
  try {
    const zuletzt = Number(window.sessionStorage.getItem(NEULADE_SCHLUESSEL) ?? 0);
    if (Date.now() - zuletzt > NEULADE_FENSTER_MS) {
      window.sessionStorage.setItem(NEULADE_SCHLUESSEL, String(Date.now()));
      window.location.reload();
      return true;
    }
  } catch {
    // sessionStorage blockiert → kein Auto-Reload, kein harter Fehler
  }
  return false;
}

/**
 * Wie React.lazy(), aber robust: ein fehlgeschlagener dynamischer Import wird
 * nach kurzer Pause EINMAL wiederholt (fängt transiente Netz-Flakes ab).
 * Scheitert auch der zweite Versuch, liegt meist ein Stale-Chunk vor → ein
 * einmaliger Hard-Reload heilt das. Bleibt es dabei, fliegt der Fehler an die
 * FehlerGrenze (sichtbare, bedienbare Meldung statt leerer Seite).
 *
 * Verhalten im Erfolgsfall ist IDENTISCH zu React.lazy() — kein Unterschied
 * für die laufende Seite.
 */
export function lazyMitNeuversuch<T extends ComponentType<unknown>>(
  importieren: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await importieren();
    } catch (ersterFehler) {
      try {
        await new Promise((aufloesen) => setTimeout(aufloesen, 350));
        return await importieren();
      } catch (zweiterFehler) {
        neuLadenGegenStaleChunk();
        throw zweiterFehler ?? ersterFehler;
      }
    }
  });
}
