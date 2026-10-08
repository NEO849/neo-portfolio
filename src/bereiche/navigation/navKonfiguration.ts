export interface NavEintrag {
  readonly pfad: string;
  readonly label: string;
}

// Primäre Navigation (Kopfzeile + Fußzeile) — auf das Verkaufs-Narrativ fokussiert.
export const NAV_EINTRAEGE: NavEintrag[] = [
  { pfad: "/",               label: "Start" },
  { pfad: "/vorgehensweise", label: "Vorgehensweise" },
  { pfad: "/leistungen",     label: "Leistungen" },
  { pfad: "/security",       label: "Security" },
  { pfad: "/referenzen",     label: "Referenzen" },
  { pfad: "/ueber-mich",     label: "Über mich" },
  { pfad: "/kontakt",        label: "Kontakt" },
];

// Sekundäre Seiten (nur Fußzeile) — Fähigkeits-Beweis, nicht im Haupt-Menü.
export const NAV_SEKUNDAER: NavEintrag[] = [
  { pfad: "/projekte",     label: "Projekte" },
  { pfad: "/demo",         label: "Prompt-Injection-Demo" },
  { pfad: "/labor",        label: "Labor" },
  { pfad: "/osint-tools",  label: "OSINT Tools" },
  { pfad: "/bilder",       label: "Bilder" },
];
