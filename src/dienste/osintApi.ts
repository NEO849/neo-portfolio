// ═══════════════════════════════════════════════════════════════════
// DIENST: OSINT-API
// TypeScript-Client für das FastAPI-Backend auf dem VPS.
// Typsichere Fetch-Funktionen für alle OSINT-Werkzeuge.
// ═══════════════════════════════════════════════════════════════════

const API_BASIS = import.meta.env.VITE_OSINT_API_URL ?? "https://michael-fleps.duckdns.org";
const API_PFAD = `${API_BASIS}/api/v1/osint`;

// ─── Typen: Domain-Analyse ────────────────────────────────────────

export interface SicherheitsDetail {
  check: string;
  ok: boolean;
}

export interface SicherheitsBewertung {
  punkte: number;
  max: number;
  prozent: number;
  note: "Gut" | "Mittel" | "Schwach";
  details: SicherheitsDetail[];
}

export interface DomainErgebnis {
  domain: string;
  analysiert_am: string;
  dns: {
    a: string[];
    aaaa: string[];
    mx: string[];
    ns: string[];
    txt: string[];
    spf: string | null;
    dmarc: string | null;
  };
  asn: string;
  whois: {
    registrar: string | null;
    registrant: string | null;
    registriert_am: string | null;
    ablauf_am: string | null;
    nameserver: string[];
    land: string | null;
    status: string | string[] | null;
    fehler?: string;
  };
  http: {
    erreichbar: boolean;
    status: number | null;
    server: string | null;
    sicherheit: string[];
    weiterleitungsziel: string | null;
  };
  sicherheits_bewertung: SicherheitsBewertung;
}

// ─── Typen: E-Mail-Analyse ────────────────────────────────────────

export interface EmailErgebnis {
  adresse: string;
  gueltig: boolean;
  analysiert_am: string;
  fehler?: string;
  syntax?: {
    lokal_teil: string;
    domain: string;
  };
  domain?: {
    mx_records: string[];
    hat_mx: boolean;
    a_records: string[];
    spf: string | null;
    dmarc: string | null;
  };
  klassifikation?: {
    wegwerf: boolean;
    zustellbar: boolean;
  };
  datenleck?: {
    geprueft: boolean;
    domain_betroffen?: boolean;
    anzahl_nutzer?: number;
    hinweis?: string;
  };
  risiko?: {
    stufe: "Hoch" | "Mittel" | "Gering" | "Keines";
    punkte: number;
    details: string[];
  };
}

// ─── Typen: Benutzername-Suche ────────────────────────────────────

export interface PlattformErgebnis {
  plattform: string;
  kategorie: string;
  url: string;
  gefunden: boolean | null;
  status?: number;
  fehler?: string;
  hinweis?: string;
}

export interface BenutzerErgebnis {
  benutzername: string;
  analysiert_am: string;
  fehler?: string;
  zusammenfassung?: {
    geprueft: number;
    gefunden: number;
    nicht_gefunden: number;
    fehler: number;
    treffer_rate: number;
  };
  plattformen?: {
    gefunden: PlattformErgebnis[];
    nicht_gefunden: Array<{ plattform: string; kategorie: string; url: string }>;
    fehler: PlattformErgebnis[];
  };
  nach_kategorie?: Record<string, PlattformErgebnis[]>;
}

// ─── Typen: Telefon-Analyse ───────────────────────────────────────

export interface TelefonErgebnis {
  nummer: string;
  analysiert_am: string;
  gueltig: boolean;
  moeglich?: boolean;
  fehler?: string;
  format?: {
    international: string;
    national: string;
    e164: string;
    rfc3966: string;
  };
  metadaten?: {
    land_code: string;
    leitungstyp: string;
    region: string;
    carrier: string;
    zeitzonen: string[];
  };
  suchlinks?: {
    gesamt: number;
    nach_kategorie: Record<string, Array<{ name: string; url: string; kategorie: string }>>;
  };
  risiko?: {
    stufe: string;
    details: string[];
  };
}

// ─── Typen: Bild-Analyse ──────────────────────────────────────────

export interface BildErgebnis {
  url: string;
  analysiert_am: string;
  fehler?: string;
  bild?: {
    format: string;
    breite: number;
    hoehe: number;
    modus: string;
    groesse_kb: number;
    groesse_mb: number;
  };
  hashes?: {
    md5: string;
    sha256: string;
    phash: string;
    ahash: string;
    dhash: string;
  };
  exif?: {
    verfuegbar: boolean;
    kamera?: string | null;
    aufnahmedatum?: string | null;
    software?: string | null;
    blende?: string | null;
    iso?: number | null;
    gps?: {
      lat: number;
      lon: number;
      maps_link: string;
      hinweis: string;
    } | null;
  };
  suchlinks?: Array<{ name: string; url: string }>;
  sicherheits_hinweise?: Array<{ stufe: string; meldung: string }>;
}

// ─── API-Fehler-Klasse ────────────────────────────────────────────

export class Apifehler extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly istRateLimit = false,
  ) {
    super(message);
    this.name = "Apifehler";
  }
}

// ─── Hilfsfunktion: Fetch mit Fehlerbehandlung ────────────────────

async function apiFetch<T>(endpunkt: string, koerper: unknown): Promise<T> {
  let antwort: Response;
  try {
    antwort = await fetch(`${API_PFAD}${endpunkt}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(koerper),
    });
  } catch {
    throw new Apifehler(
      "API nicht erreichbar. Bitte später erneut versuchen.",
      0,
    );
  }

  if (antwort.status === 429) {
    throw new Apifehler(
      "Zu viele Anfragen. Bitte warte einen Moment.",
      429,
      true,
    );
  }

  if (!antwort.ok) {
    let detail = "Unbekannter Fehler";
    try {
      const fehlerDaten = await antwort.json();
      detail = fehlerDaten.detail ?? detail;
    } catch {
      // ignore
    }
    throw new Apifehler(detail, antwort.status);
  }

  return antwort.json() as Promise<T>;
}

// ─── Öffentliche API-Funktionen ───────────────────────────────────

/**
 * Analysiert eine Domain auf DNS, WHOIS, ASN und Sicherheitsheader.
 */
export async function domainAnalysieren(domain: string): Promise<DomainErgebnis> {
  return apiFetch<DomainErgebnis>("/domain", { domain });
}

/**
 * Analysiert eine E-Mail-Adresse auf Validität, MX, Datenlecks und Risiko.
 */
export async function emailAnalysieren(email: string): Promise<EmailErgebnis> {
  return apiFetch<EmailErgebnis>("/email", { email });
}

/**
 * Sucht einen Benutzernamen auf bekannten Plattformen.
 */
export async function benutzernameSuchen(benutzername: string): Promise<BenutzerErgebnis> {
  return apiFetch<BenutzerErgebnis>("/benutzername", { benutzername });
}

/**
 * Analysiert eine Telefonnummer auf Format, Land, Carrier und Suchlinks.
 */
export async function telefonAnalysieren(nummer: string): Promise<TelefonErgebnis> {
  return apiFetch<TelefonErgebnis>("/telefon", { nummer });
}

/**
 * Analysiert ein Bild von einer URL: EXIF, Hashes, Reverse-Image-Links.
 */
export async function bildAnalysieren(url: string): Promise<BildErgebnis> {
  return apiFetch<BildErgebnis>("/bild", { url });
}

/**
 * Prüft ob die API erreichbar ist.
 */
export async function apiGesund(): Promise<boolean> {
  try {
    const antwort = await fetch(`${API_PFAD}/gesundheit`);
    return antwort.ok;
  } catch {
    return false;
  }
}
