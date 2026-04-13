// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: AbzeichenStatus
// Kleine Label-Chips für Status, Kategorien, Tags.
// ═══════════════════════════════════════════════════════════════════

type StatusVariante = "aktiv" | "abgeschlossen" | "entwicklung" | "geplant" | "neutral" | "akzent" | "cyber";

const VARIANTEN_STILE: Record<StatusVariante, string> = {
  aktiv:         "bg-signal-gruen/10 text-signal-gruen border-signal-gruen/20",
  abgeschlossen: "bg-white/5 text-white/40 border-white/10",
  entwicklung:   "bg-signal-gelb/10 text-signal-gelb border-signal-gelb/20",
  geplant:       "bg-white/5 text-white/30 border-white/8",
  neutral:       "bg-white/5 text-white/50 border-white/10",
  akzent:        "bg-akzent-500/10 text-akzent-400 border-akzent-400/20",
  cyber:         "bg-cyber-500/10 text-cyber-400 border-cyber-400/20",
};

const STATUS_LABEL: Record<string, string> = {
  aktiv:         "Aktiv",
  abgeschlossen: "Abgeschlossen",
  "in-entwicklung": "In Entwicklung",
  geplant:       "Geplant",
};

interface AbzeichenStatusProps {
  variante?: StatusVariante;
  text: string;
  mitPuls?: boolean;    // grüner Puls-Punkt für "live" Status
  klassen?: string;
}

export function AbzeichenStatus({
  variante = "neutral",
  text,
  mitPuls = false,
  klassen = "",
}: AbzeichenStatusProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
        text-xs font-mono font-medium border
        ${VARIANTEN_STILE[variante]}
        ${klassen}
      `}
    >
      {mitPuls && (
        <span className="relative flex w-1.5 h-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal-gruen opacity-60" />
          <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-signal-gruen" />
        </span>
      )}
      {STATUS_LABEL[text] ?? text}
    </span>
  );
}

// ─── Technologie-Tag (für Projekt-Karten) ────────────────────────
export function TechTag({ name, klassen = "" }: { name: string; klassen?: string }) {
  return (
    <span className={`
      px-2 py-0.5 text-xs font-mono rounded
      bg-white/5 text-white/40 border border-white/8
      hover:text-white/60 hover:bg-white/8 transition-colors
      ${klassen}
    `}>
      {name}
    </span>
  );
}
