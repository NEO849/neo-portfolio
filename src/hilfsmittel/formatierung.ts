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

// Deutsche Grundzahlwörter 0–12 — für Fließtext, der eine Anzahl aus den
// Daten ableitet (Single Source of Truth statt hartkodierter Zahl).
const ZAHLWOERTER: readonly string[] = [
  "null", "eins", "zwei", "drei", "vier", "fünf", "sechs",
  "sieben", "acht", "neun", "zehn", "elf", "zwölf",
];

/**
 * Wandelt eine kleine Zahl in ihr deutsches Wort (0–12, kleingeschrieben).
 * Außerhalb des Bereichs wird die Ziffer als String zurückgegeben.
 */
export function zahlwort(zahl: number): string {
  return ZAHLWOERTER[zahl] ?? String(zahl);
}

/** Macht den ersten Buchstaben groß (z.B. für Satzanfang). */
export function grossErsterBuchstabe(text: string): string {
  if (text.length === 0) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
