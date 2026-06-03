export interface NavEintrag {
  readonly pfad: string;
  readonly label: string;
}

export const NAV_EINTRAEGE: NavEintrag[] = [
  { pfad: "/",              label: "Start" },
  { pfad: "/ueber-mich",    label: "Über mich" },
  { pfad: "/projekte",      label: "Projekte" },
  { pfad: "/security",      label: "Security" },
  { pfad: "/labor",         label: "Labor" },
  { pfad: "/osint-tools",   label: "OSINT Tools" },
  { pfad: "/kontakt",       label: "Kontakt" },
];
