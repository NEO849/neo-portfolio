// ═══════════════════════════════════════════════════════════════════
// VIEWMODEL: useLaufBanner
// Bereitet die Banner-Daten für die View auf (MVVM: ViewModel).
// Liefert die einfache Liste (für a11y/reduced-motion) UND die für die
// nahtlose Endlosschleife verdoppelte Sequenz. Die View rendert nur.
// ═══════════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useBewegungErlaubt } from "../bewegung/hooks/useBewegungErlaubt";
import { bannerEintraege, type BannerEintrag } from "../models/laufBannerDaten";

interface LaufBannerModell {
  readonly eintraege: readonly BannerEintrag[];   // Originalliste (Screenreader/statisch)
  readonly sequenz: readonly BannerEintrag[];     // 2× hintereinander → nahtlose Schleife
  readonly bewegungReduziert: boolean;
}

export function useLaufBanner(): LaufBannerModell {
  const bewegungErlaubt = useBewegungErlaubt();

  // Verdoppeln, damit translateX(-50%) exakt eine volle Sequenz weiterschiebt
  // und der Übergang nahtlos ist (kein sichtbarer Sprung).
  const sequenz = useMemo(() => [...bannerEintraege, ...bannerEintraege], []);

  return { eintraege: bannerEintraege, sequenz, bewegungReduziert: !bewegungErlaubt };
}
