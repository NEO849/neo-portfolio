// ═══════════════════════════════════════════════════════════════════
// BEWEGUNG: GlanzUeberschrift (Effekt B — Shine-Sweep)
// Wiederverwendbarer Text-Wrapper: ein heller Reflex gleitet periodisch
// wie auf einer Spiegelfläche über die Schrift. Veredelt Überschriften
// in jeder View einheitlich. Animiert nur background-position (günstig),
// respektiert prefers-reduced-motion (dann statischer, klarer Text).
// ═══════════════════════════════════════════════════════════════════

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useBewegungErlaubt } from "./hooks/useBewegungErlaubt";

type Markierung = "h1" | "h2" | "h3" | "h4" | "span" | "p";

interface GlanzUeberschriftProps {
  kinder: ReactNode;
  /** Semantisches Element (Standard h2). */
  element?: Markierung;
  /** Shine-Sweep an/aus (Standard an). */
  glanzAktiv?: boolean;
  /** Dauer eines Durchlaufs in Sekunden (Standard 7 — ruhig, nicht hektisch). */
  dauerSekunden?: number;
  /** Akzentfarbe des Reflex-Bands; Standard aus Theme-Akzent (Azur). */
  akzentFarbe?: string;
  klassen?: string;
}

export function GlanzUeberschrift({
  kinder,
  element = "h2",
  glanzAktiv = true,
  dauerSekunden = 7,
  akzentFarbe,
  klassen = "",
}: GlanzUeberschriftProps) {
  const bewegungErlaubt = useBewegungErlaubt();
  const Markierung = element as ElementType;

  // Glanz nur, wenn gewünscht UND Bewegung erlaubt — sonst klarer Text.
  const glanzAn = glanzAktiv && bewegungErlaubt;

  const stil: CSSProperties | undefined = glanzAn
    ? ({
        "--glanz-dauer": `${dauerSekunden}s`,
        ...(akzentFarbe ? { "--glanz-akzent": akzentFarbe } : {}),
      } as CSSProperties)
    : undefined;

  return (
    <Markierung className={`${glanzAn ? "glanz-text" : ""} ${klassen}`.trim()} style={stil}>
      {kinder}
    </Markierung>
  );
}
