// ═══════════════════════════════════════════════════════════════════
// HILFSMITTEL: Validierungsfunktionen
// Für Formulare und OSINT-Tool-Eingaben.
// ═══════════════════════════════════════════════════════════════════

/** Prüft ob ein String eine gültige E-Mail-Adresse ist */
export function istGueltigeEmail(wert: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wert.trim());
}

/** Prüft ob ein String eine gültige Domain ist (z.B. example.com) */
export function istGueltigeDomain(wert: string): boolean {
  const bereinigt = wert.trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
  return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/.test(bereinigt);
}

/** Extrahiert Domain aus URL oder gibt sie zurück */
export function extrahiereDomain(eingabe: string): string {
  const bereinigt = eingabe.trim().toLowerCase();
  try {
    const url = bereinigt.startsWith("http") ? bereinigt : `https://${bereinigt}`;
    return new URL(url).hostname;
  } catch {
    return bereinigt.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
}

/** Prüft ob ein Username valide ist (keine Sonderzeichen außer - und _) */
export function istGueltigerUsername(wert: string): boolean {
  return /^[a-zA-Z0-9_\-\.]{2,50}$/.test(wert.trim());
}

/** Prüft ob ein String nicht leer ist (nach Trimmen) */
export function nichtLeer(wert: string): boolean {
  return wert.trim().length > 0;
}

/** Fehlermeldung für Eingabefeld — gibt undefined zurück wenn valide */
export function validiereEingabe(
  typ: "email" | "domain" | "username" | "text",
  wert: string
): string | undefined {
  if (!nichtLeer(wert)) return "Pflichtfeld";
  switch (typ) {
    case "email":    return istGueltigeEmail(wert)    ? undefined : "Ungültige E-Mail-Adresse";
    case "domain":   return istGueltigeDomain(wert)   ? undefined : "Ungültige Domain (z.B. example.com)";
    case "username": return istGueltigerUsername(wert) ? undefined : "Ungültiger Username (2–50 Zeichen, a-z, 0-9, _ -)";
    default:         return undefined;
  }
}
