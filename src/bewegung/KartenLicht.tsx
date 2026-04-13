// ═══════════════════════════════════════════════════════════════════
// BEWEGUNG: KartenLicht — Maus-Licht-Effekt
// Erzeugt einen subtilen Lichtschein der der Maus folgt.
// Aufgabe: Tiefe & Materialität suggerieren
// Verwendung: <KartenLicht> um jede interaktive Karte wrappen
// ═══════════════════════════════════════════════════════════════════

import { useRef, useState, useCallback, type ReactNode, type CSSProperties } from "react";
import { useBewegungErlaubt } from "./hooks/useBewegungErlaubt";

interface KartenLichtProps {
  children: ReactNode;
  lichtfarbe?: string;
  intensitaet?: number;   // 0–1
  radius?: number;         // in px
  klassen?: string;
  stil?: CSSProperties;
}

export function KartenLicht({
  children,
  lichtfarbe = "99, 102, 241",
  intensitaet = 0.12,
  radius = 280,
  klassen = "",
  stil,
}: KartenLichtProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [lichtPosition, setLichtPosition] = useState({ x: -999, y: -999 });
  const [sichtbar, setSichtbar] = useState(false);
  const bewegungErlaubt = useBewegungErlaubt();

  const beimBewegen = useCallback((ereignis: React.MouseEvent<HTMLDivElement>) => {
    if (!bewegungErlaubt || !elementRef.current) return;
    const rahmen = elementRef.current.getBoundingClientRect();
    setLichtPosition({
      x: ereignis.clientX - rahmen.left,
      y: ereignis.clientY - rahmen.top,
    });
    setSichtbar(true);
  }, [bewegungErlaubt]);

  const beimVerlassen = useCallback(() => {
    setSichtbar(false);
    setLichtPosition({ x: -999, y: -999 });
  }, []);

  return (
    <div
      ref={elementRef}
      className={`relative overflow-hidden ${klassen}`}
      style={stil}
      onMouseMove={beimBewegen}
      onMouseLeave={beimVerlassen}
    >
      {/* Lichtschein — folgt der Maus */}
      {bewegungErlaubt && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: lichtPosition.x - radius / 2,
            top: lichtPosition.y - radius / 2,
            width: radius,
            height: radius,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(${lichtfarbe}, ${sichtbar ? intensitaet : 0}) 0%, transparent 70%)`,
            pointerEvents: "none",
            transition: "opacity 0.2s ease",
            zIndex: 0,
          }}
        />
      )}

      {/* Inhalt über dem Licht */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
