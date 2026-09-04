// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: FehlerGrenze (React Error Boundary)
//
// Letztes Sicherheitsnetz: wirft IRGENDEINE Route beim Rendern einen Fehler
// (oder scheitert ein Lazy-Chunk-Load endgültig), reißt React sonst den GANZEN
// Baum ab — sichtbar bleibt nur der Body-Hintergrund ("nur Hintergrund"-Bug).
// Diese Grenze fängt das ab und zeigt stattdessen eine ruhige, bedienbare
// Meldung — visuell exakt im Stil der 404-Seite (kein neues Design).
//
// `resetSchluessel` (z.B. der Pfadname) setzt den Fehler-Zustand bei einem
// Routenwechsel automatisch zurück → nach dem Navigieren wird neu versucht.
// Error Boundaries MÜSSEN Klassen-Komponenten sein (React-Vorgabe).
// ═══════════════════════════════════════════════════════════════════

import { Component, type ErrorInfo, type ReactNode } from "react";

interface FehlerGrenzeProps {
  children: ReactNode;
  /** Wechselt dieser Wert (z.B. pathname), wird ein vorhandener Fehler verworfen. */
  resetSchluessel?: unknown;
}

interface FehlerGrenzeState {
  hatFehler: boolean;
}

export class FehlerGrenze extends Component<FehlerGrenzeProps, FehlerGrenzeState> {
  state: FehlerGrenzeState = { hatFehler: false };

  static getDerivedStateFromError(): FehlerGrenzeState {
    return { hatFehler: true };
  }

  componentDidCatch(fehler: Error, info: ErrorInfo): void {
    // Bewusst nur Konsole: kein externer Call, keine Daten verlassen das Gerät.
    // eslint-disable-next-line no-console
    console.error("[FehlerGrenze] Render-Fehler abgefangen:", fehler, info.componentStack);
  }

  componentDidUpdate(vorherigeProps: FehlerGrenzeProps): void {
    if (this.state.hatFehler && vorherigeProps.resetSchluessel !== this.props.resetSchluessel) {
      this.setState({ hatFehler: false });
    }
  }

  private neuLaden = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hatFehler) return this.props.children;

    return (
      <div className="min-h-screen pt-16 flex flex-col items-center justify-center text-center px-6">
        <p className="font-mono text-5xl font-bold text-white/10 mb-4 select-none">!</p>
        <h1 className="font-display text-2xl font-bold text-white mb-3">
          Etwas ist schiefgelaufen
        </h1>
        <p className="text-white/40 text-sm mb-8 max-w-sm leading-relaxed">
          Diese Ansicht konnte nicht geladen werden. Häufig hilft schon ein Neuladen,
          dabei wird die aktuelle Version frisch geholt.
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={this.neuLaden}
            className="text-xs px-3 py-1.5 rounded-lg bg-akzent-500/20 border border-akzent-400/30 text-akzent-400 hover:bg-akzent-500/30 transition font-mono"
          >
            Neu laden
          </button>
          <a href="/" className="text-akzent-400 font-mono text-sm hover:underline">
            ← Zur Startseite
          </a>
        </div>
      </div>
    );
  }
}
