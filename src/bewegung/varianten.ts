// ═══════════════════════════════════════════════════════════════════
// BEWEGUNG: Varianten-System
// Alle Framer Motion Variants zentral definiert.
// Jede Variante hat eine klare Aufgabe:
//   EINBLENDEN      → Orientierung (Inhalte erscheinen strukturiert)
//   TEXTREVEAL      → Fokus (Wichtiges wird bewusst enthüllt)
//   TIEFENKARTE     → Tiefe (Raum entsteht durch Licht & Skala)
//   IDENTITAET_*    → Identität (wiedererkennbare Markengesten)
// ═══════════════════════════════════════════════════════════════════

import type { Variants } from "framer-motion";

// ─── Easing-Kurven ─────────────────────────────────────────────────
// Einmal definiert, überall konsistent verwendet.
type KubischeBezier = [number, number, number, number];

export const KURVEN = {
  sanft:      [0.25, 0.1, 0.25, 1]     as KubischeBezier,  // Standard CSS ease
  expressiv:  [0.16, 1, 0.3, 1]        as KubischeBezier,  // Schnell rein, weich auslaufen
  fedrig:     [0.34, 1.56, 0.64, 1]    as KubischeBezier,  // Leichter Überschwinger
  praezise:   [0.4, 0, 0.2, 1]         as KubischeBezier,  // Material Design Standard
} as const;

// ─── Orientierung: Einblend-Varianten ─────────────────────────────
export const EINBLENDEN: Variants = {
  versteckt: { opacity: 0, y: 24 },
  sichtbar: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: KURVEN.expressiv },
  },
};

export const EINBLENDEN_LINKS: Variants = {
  versteckt: { opacity: 0, x: -32 },
  sichtbar: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: KURVEN.expressiv },
  },
};

export const EINBLENDEN_RECHTS: Variants = {
  versteckt: { opacity: 0, x: 32 },
  sichtbar: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: KURVEN.expressiv },
  },
};

// Gestaffelt: Kinder erscheinen nacheinander
export const STAFFEL_CONTAINER: Variants = {
  versteckt: {},
  sichtbar: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const STAFFEL_KIND: Variants = {
  versteckt: { opacity: 0, y: 20 },
  sichtbar: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: KURVEN.expressiv },
  },
};

// ─── Fokus: Text-Enthüllung ────────────────────────────────────────
// Wörter erscheinen aus einer Clip-Maske heraus — kontrolliert & präzise
export const TEXTREVEAL_CONTAINER: Variants = {
  versteckt: {},
  sichtbar: {
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.05,
    },
  },
};

export const TEXTREVEAL_WORT: Variants = {
  versteckt: {
    y: '110%',
    opacity: 0,
  },
  sichtbar: {
    y: '0%',
    opacity: 1,
    transition: {
      duration: 0.65,
      ease: KURVEN.expressiv,
    },
  },
};

// ─── Tiefe: Karten-Varianten ───────────────────────────────────────
export const TIEFENKARTE: Variants = {
  normal: {
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: KURVEN.sanft },
  },
  hover: {
    scale: 1.015,
    y: -3,
    transition: { duration: 0.3, ease: KURVEN.sanft },
  },
  gedrueckt: {
    scale: 0.99,
    y: 0,
    transition: { duration: 0.1, ease: KURVEN.praezise },
  },
};

// ─── Identität: Navigation ────────────────────────────────────────
export const NAV_UNTERLINE: Variants = {
  versteckt: { scaleX: 0, opacity: 0 },
  sichtbar: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: KURVEN.expressiv },
  },
};

// ─── Identität: Seiten-Übergang ───────────────────────────────────
export const SEITEN_EINGANG: Variants = {
  versteckt: { opacity: 0, y: 16 },
  sichtbar: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: KURVEN.expressiv,
      when: 'beforeChildren',
      staggerChildren: 0.06,
    },
  },
  verlassen: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.25, ease: KURVEN.praezise },
  },
};

// ─── Mobile Menu ──────────────────────────────────────────────────
export const MOBILE_MENU: Variants = {
  geschlossen: {
    opacity: 0,
    y: -12,
    scale: 0.97,
    pointerEvents: 'none' as const,
    transition: { duration: 0.2, ease: KURVEN.sanft },
  },
  offen: {
    opacity: 1,
    y: 0,
    scale: 1,
    pointerEvents: 'auto' as const,
    transition: { duration: 0.3, ease: KURVEN.expressiv },
  },
};

export const MOBILE_MENU_EINTRAG: Variants = {
  geschlossen: { opacity: 0, x: -12 },
  offen: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      delay: 0.05 + index * 0.04,
      ease: KURVEN.expressiv,
    },
  }),
};
