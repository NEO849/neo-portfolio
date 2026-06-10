// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: AufklappIndikator
// Der EINE Aufklapp-Indikator der ganzen Website (Plus → Kreuz).
// Ein Akzent-„Chip": abgerundetes Feld mit dünnem, farbigem Rahmen +
// leichter Füllung. Drei Zustände, klar unterscheidbar:
//   zu            → dezenter Rahmen + Hauch Füllung
//   zu + Hover    → Rahmen/Füllung heller (group-hover der Karte)
//   offen         → Rahmen/Füllung kräftig (eindeutiges „aktiv")
// Das „+" dreht 45° zum „×". Eine Quelle → überall identisch.
//
// Farbsteuerung über die CSS-Variable `--ak` (RGB-Tripel) + Tailwind-
// Arbitrary-Werte, damit `group-hover` den Rahmen ohne JS aufhellen kann.
// Die umschließende Karte/Button muss dafür die Klasse `group` tragen.
// ═══════════════════════════════════════════════════════════════════

import { motion } from "framer-motion";

interface AufklappIndikatorProps {
  /** true = ausgeklappt (zeigt „×"). */
  offen: boolean;
  /** RGB-Tripel ohne Klammern, z.B. "99, 102, 241" — Rahmen & Füllung. */
  lichtfarbe: string;
  /** CSS-Farbe (Hex oder rgb()) für das Glyph. */
  akzentFarbe: string;
  /** "md" (Standard, große Karten) · "sm" (dichte Listen). */
  groesse?: "sm" | "md";
  /** Zusätzliche Klassen (z.B. absolute-Positionierung). */
  klassen?: string;
}

const FELD = {
  md: "w-7 h-7 rounded-lg text-lg",
  sm: "w-6 h-6 rounded-md text-base",
} as const;

// Rahmen + Füllung als Tailwind-Arbitrary über die `--ak`-Variable.
// Vollständige String-Literale, damit der JIT-Compiler sie sicher erfasst.
const ZU =
  "border-[rgba(var(--ak),0.28)] bg-[rgba(var(--ak),0.06)] " +
  "group-hover:border-[rgba(var(--ak),0.5)] group-hover:bg-[rgba(var(--ak),0.1)]";
const OFFEN = "border-[rgba(var(--ak),0.65)] bg-[rgba(var(--ak),0.16)]";

export function AufklappIndikator({
  offen,
  lichtfarbe,
  akzentFarbe,
  groesse = "md",
  klassen = "",
}: AufklappIndikatorProps) {
  return (
    <span
      aria-hidden="true"
      style={{ ["--ak" as string]: lichtfarbe }}
      className={`inline-flex items-center justify-center border flex-shrink-0 transition-colors duration-200 ${FELD[groesse]} ${offen ? OFFEN : ZU} ${klassen}`}
    >
      <motion.span
        animate={{ rotate: offen ? 45 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="leading-none font-light"
        style={{ color: akzentFarbe, opacity: offen ? 1 : 0.7 }}
      >
        +
      </motion.span>
    </span>
  );
}
