// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: MikrofonOrb
// 1:1-Nachbau des echten voice-bridge-Orbs — drei Zustände mit den
// Original-Radialverläufen, Halo-Ringen und dem Mikrofon-Icon. Während
// der Aufnahme legen sich die Audio-Balken über den Orb. Größe und Glow
// skalieren responsiv (clamp), damit der Orb auf dem iPhone kompakter
// sitzt, ohne die Proportionen oder Animationen zu verändern.
// ═══════════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import type { AufnahmeZustand } from "../models/voiceDemo";
import { useBewegungErlaubt } from "../bewegung/hooks/useBewegungErlaubt";
import { AudioPegel } from "./AudioPegel";

// Responsive Kantenlänge des Orb-Bereichs; Insets sind prozentual und
// skalieren dadurch automatisch mit.
const GROESSE = "clamp(176px, 50vw, 260px)";

const VERLAUF: Record<AufnahmeZustand, string> = {
  bereit: "radial-gradient(circle at 35% 30%, #2a2c33 0%, #14151a 65%, #0a0b0e 100%)",
  aufnahme: "radial-gradient(circle at 35% 30%, #6a1814 0%, #3a0c0a 65%, #1a0504 100%)",
  verarbeitung: "radial-gradient(circle at 35% 30%, #0e3060 0%, #061a36 65%, #03101f 100%)",
};
const GLUEHEN: Record<AufnahmeZustand, string> = {
  bereit: "inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.4)",
  aufnahme: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 clamp(28px, 9vw, 60px) rgba(255,69,58,0.45)",
  verarbeitung: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 clamp(24px, 8vw, 50px) rgba(10,132,255,0.4)",
};
const ICON_FARBE: Record<AufnahmeZustand, string> = {
  bereit: "#c6c8ce",
  aufnahme: "#ffffff",
  verarbeitung: "#9ec5ff",
};
const BESCHRIFTUNG: Record<AufnahmeZustand, string> = {
  bereit: "Aufnahme starten",
  aufnahme: "Aufnahme stoppen",
  verarbeitung: "Wird transkribiert …",
};

interface MikrofonOrbProps {
  zustand: AufnahmeZustand;
  onClick: () => void;
}

export function MikrofonOrb({ zustand, onClick }: MikrofonOrbProps) {
  const bewegung = useBewegungErlaubt();
  const istAufnahme = zustand === "aufnahme";
  const istVerarbeitung = zustand === "verarbeitung";

  const orbAnimation =
    !bewegung
      ? {}
      : istVerarbeitung
        ? { scale: [1, 1.025, 1] }
        : zustand === "bereit"
          ? { scale: [1, 1.015, 1] }
          : {};
  const orbDauer = istVerarbeitung ? 1.4 : 4;

  return (
    <div className="relative" style={{ width: GROESSE, height: GROESSE }}>
      {/* Halo-Ringe */}
      {bewegung && istAufnahme && (
        <>
          <HaloRing farbe="#ff453a" dauer={1.6} verzoegerung={0} />
          <HaloRing farbe="#ff453a" dauer={1.6} verzoegerung={0.5} />
        </>
      )}
      {bewegung && istVerarbeitung && (
        <HaloRing farbe="#0a84ff" dauer={2.4} verzoegerung={0} />
      )}
      {bewegung && zustand === "bereit" && (
        <motion.span
          aria-hidden
          className="absolute rounded-full border"
          style={{ inset: 0, borderColor: "rgba(255,255,255,0.08)" }}
          animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.15, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Orb */}
      <motion.button
        type="button"
        onClick={onClick}
        aria-label={BESCHRIFTUNG[zustand]}
        aria-pressed={istAufnahme}
        whileTap={{ scale: 0.95 }}
        animate={orbAnimation}
        transition={{ duration: orbDauer, repeat: Infinity, ease: "easeInOut" }}
        className="absolute grid place-items-center rounded-full border focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        style={{
          inset: "11.5%",
          background: VERLAUF[zustand],
          borderColor: "rgba(255,255,255,0.13)",
          boxShadow: GLUEHEN[zustand],
        }}
      >
        <svg viewBox="0 0 32 32" aria-hidden style={{ width: "clamp(44px, 13vw, 64px)", height: "clamp(44px, 13vw, 64px)", color: ICON_FARBE[zustand] }}>
          <path d="M16 4a5 5 0 015 5v8a5 5 0 11-10 0V9a5 5 0 015-5z" fill={ICON_FARBE[zustand]} />
          <path
            d="M9 17a7 7 0 0014 0M16 24v4M11 28h10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.button>

      {/* Audio-Balken-Overlay (nur während der Aufnahme) */}
      <div
        className="absolute grid place-items-center pointer-events-none transition-opacity duration-200"
        style={{ inset: "30.8%", opacity: istAufnahme ? 1 : 0 }}
      >
        <AudioPegel aktiv={istAufnahme} />
      </div>
    </div>
  );
}

function HaloRing({
  farbe,
  dauer,
  verzoegerung,
}: {
  farbe: string;
  dauer: number;
  verzoegerung: number;
}) {
  return (
    <motion.span
      aria-hidden
      className="absolute rounded-full border-2"
      style={{ inset: 0, borderColor: farbe }}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: [0.85, 1.6], opacity: [0, 0.9, 0] }}
      transition={{ duration: dauer, repeat: Infinity, ease: "easeOut", delay: verzoegerung }}
    />
  );
}
