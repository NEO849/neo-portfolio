// ═══════════════════════════════════════════════════════════════════
// BEWEGUNG/HOOKS: Maus-Position relativ zu einem Element
// Wird von KartenLicht und MagnetKnopf verwendet.
// Gibt Koordinaten zwischen -1 und 1 zurück (normalisiert).
// ═══════════════════════════════════════════════════════════════════

import { useRef, useState, useCallback, type RefObject } from "react";

interface MausKoordinaten {
  x: number;  // -1 (links) bis 1 (rechts)
  y: number;  // -1 (oben) bis 1 (unten)
  rohX: number; // absolute Pixel-Position
  rohY: number;
  innerhalb: boolean;
}

const STARTWERT: MausKoordinaten = {
  x: 0, y: 0, rohX: 0, rohY: 0, innerhalb: false,
};

export function useMausPosition<T extends HTMLElement>(): {
  ref: RefObject<T | null>;
  koordinaten: MausKoordinaten;
} {
  const ref = useRef<T | null>(null);
  const [koordinaten, setKoordinaten] = useState<MausKoordinaten>(STARTWERT);

  const berechnePosition = useCallback((ereignis: MouseEvent) => {
    const element = ref.current;
    if (!element) return;

    const rahmen = element.getBoundingClientRect();
    const rohX = ereignis.clientX - rahmen.left;
    const rohY = ereignis.clientY - rahmen.top;

    // Normalisiert: 0 = Mitte, -1/1 = Rand
    const x = (rohX / rahmen.width - 0.5) * 2;
    const y = (rohY / rahmen.height - 0.5) * 2;

    setKoordinaten({ x, y, rohX, rohY, innerhalb: true });
  }, []);

  const beimVerlassen = useCallback(() => {
    setKoordinaten(STARTWERT);
  }, []);

  // Event-Listener direkt ans Ref-Element hängen
  const setzeRef = useCallback((element: T | null) => {
    if (ref.current) {
      ref.current.removeEventListener("mousemove", berechnePosition);
      ref.current.removeEventListener("mouseleave", beimVerlassen);
    }
    ref.current = element;
    if (element) {
      element.addEventListener("mousemove", berechnePosition, { passive: true });
      element.addEventListener("mouseleave", beimVerlassen);
    }
  }, [berechnePosition, beimVerlassen]);

  return { ref: { current: ref.current } as RefObject<T | null>, koordinaten };
}
