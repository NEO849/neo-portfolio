// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: Augenbraue (Eyebrow)
// Einheitliches Abschnitts-Label: feine Akzentlinie LINKS vor dem Text +
// ruhiges Mono-Kategorie-Label in Akzentfarbe. Eine einzige Quelle der
// Wahrheit für alle Eyebrows (AbschnittsTitel, Hero-„Bereiche entdecken", …),
// damit Farbe, Linie, Schriftgröße und Laufweite überall identisch sind.
// ═══════════════════════════════════════════════════════════════════

interface AugenbraueEigenschaften {
  text: string;            // Label-Text — wird per CSS in Großschreibung gesetzt
  zentriert?: boolean;     // mittig statt linksbündig ausrichten
  klassen?: string;        // zusätzliche Klassen für den Container (z. B. Abstand)
}

export function Augenbraue({ text, zentriert = false, klassen = "" }: AugenbraueEigenschaften) {
  return (
    <span className={`flex items-center gap-2.5 ${zentriert ? "justify-center" : ""} ${klassen}`}>
      {/* feine Akzentlinie LINKS vor dem Text */}
      <span className="h-px w-7 bg-gradient-to-r from-akzent-500/0 via-akzent-500/80 to-akzent-500/0" />
      {/* ruhiges Kategorie-Label in Akzentfarbe */}
      <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-akzent-400/90">
        {text}
      </span>
    </span>
  );
}
