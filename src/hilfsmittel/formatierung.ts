// ═══════════════════════════════════════════════════════════════════
// HILFSMITTEL: Formatierungsfunktionen
// Kleine, reine Funktionen ohne Seiteneffekte.
// ═══════════════════════════════════════════════════════════════════

/** Kürzt Text auf maximal n Zeichen mit Auslassungszeichen */
export function kuerze(text: string, maxZeichen: number): string {
  if (text.length <= maxZeichen) return text;
  return text.slice(0, maxZeichen - 1) + "…";
}

/** Formatiert eine Zahl mit Tausender-Trennzeichen */
export function formatierteZahl(zahl: number): string {
  return new Intl.NumberFormat("de-DE").format(zahl);
}

/** Erzeugt eine URL-freundliche Version eines Textes (Slug) */
export function zuSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Gibt aktuelles Jahr zurück */
export function aktuellesJahr(): number {
  return new Date().getFullYear();
}

/** Verbindet CSS-Klassen-Strings sauber (filtert falsy-Werte) */
export function klassen(...teile: (string | undefined | null | false)[]): string {
  return teile.filter(Boolean).join(" ");
}

/** Verzögerung in Millisekunden (für async/await) */
export function warte(millisekunden: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, millisekunden));
}
