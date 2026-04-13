// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: LadeanzeigePuls
// Animierter Ladeindikator für asynchrone Operationen.
// Wird im OSINT-Tool während API-Aufrufen angezeigt.
// ═══════════════════════════════════════════════════════════════════

import { motion } from "framer-motion";

interface LadeanzeigePulsProps {
  text?: string;
  groesse?: "klein" | "mittel" | "gross";
  farbe?: string;
}

const GROESSEN = {
  klein:  "w-4 h-4",
  mittel: "w-6 h-6",
  gross:  "w-8 h-8",
};

export function LadeanzeigePuls({
  text,
  groesse = "mittel",
  farbe = "#6366f1",
}: LadeanzeigePulsProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Drei springende Punkte */}
      <div className="flex gap-1">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className={`rounded-full ${GROESSEN[groesse]}`}
            style={{ backgroundColor: farbe }}
            animate={{
              y: ["0%", "-60%", "0%"],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {text && (
        <span className="font-mono text-sm text-white/50">{text}</span>
      )}
    </div>
  );
}

// ─── Skeleton-Platzhalter für Karten-Inhalte ─────────────────────
export function KartenSkeleton({ zeilen = 3 }: { zeilen?: number }) {
  return (
    <div className="animate-pulse space-y-3 p-6">
      <div className="h-4 bg-white/5 rounded w-3/4" />
      {Array.from({ length: zeilen }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-white/5 rounded"
          style={{ width: `${85 - i * 15}%` }}
        />
      ))}
    </div>
  );
}
