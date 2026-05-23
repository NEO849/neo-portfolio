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
  konfidenz?: "hoch" | "mittel" | "niedrig";
  tier?: number;
  fehler?: string;
  hinweis?: string;
}

export interface BenutzerErgebnis {
  benutzername: string;
  analysiert_am: string;
  modus?: "tier1" | "vollscan";
  fehler?: string;
  zusammenfassung?: {
    geprueft: number;
    gefunden: number;
    nicht_gefunden: number;
    fehler: number;
    treffer_rate: number;
    konfidenz_hoch?: number;
    konfidenz_mittel?: number;
    konfidenz_niedrig?: number;
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

export type FehlerArt =
  | "netzwerk"      // DNS, TCP, TLS — connection-level
  | "timeout"       // AbortController hit
  | "rate_limit"    // 429
  | "server"        // 5xx
  | "client"        // 4xx (außer 429)
  | "unbekannt";

export class Apifehler extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly art: FehlerArt = "unbekannt",
    public readonly versuche: number = 1,
  ) {
    super(message);
    this.name = "Apifehler";
  }

  get istRateLimit(): boolean {
    return this.art === "rate_limit";
  }
}

// ─── Konfiguration: Retry & Timeout ───────────────────────────────

const ANFRAGE_TIMEOUT_MS = 15_000;       // Pro-Versuch-Hardlimit
const MAX_VERSUCHE = 3;                  // 1 initial + 2 Retries
const BACKOFF_BASIS_MS = 500;            // 500ms → 1000ms → 2000ms

function warte(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

// ─── Hilfsfunktion: Fetch mit Retry + Fehlerklassifikation ────────

async function apiFetch<T>(endpunkt: string, koerper: unknown): Promise<T> {
  let letzterFehler: Apifehler | null = null;

  for (let versuch = 1; versuch <= MAX_VERSUCHE; versuch++) {
    const abbrecher = new AbortController();
    const timeoutId = setTimeout(() => abbrecher.abort(), ANFRAGE_TIMEOUT_MS);

    let antwort: Response;
    try {
      antwort = await fetch(`${API_PFAD}${endpunkt}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(koerper),
        signal: abbrecher.signal,
      });
    } catch (ursache) {
      clearTimeout(timeoutId);

      const istTimeout = (ursache as Error)?.name === "AbortError";
      const art: FehlerArt = istTimeout ? "timeout" : "netzwerk";
      const meldung = istTimeout
        ? `Zeitüberschreitung nach ${ANFRAGE_TIMEOUT_MS / 1000}s.`
        : "Verbindung zur API fehlgeschlagen (DNS/Netzwerk).";

      letzterFehler = new Apifehler(meldung, 0, art, versuch);

      // Netzwerk/Timeout → Retry mit exponential backoff
      if (versuch < MAX_VERSUCHE) {
        await warte(BACKOFF_BASIS_MS * 2 ** (versuch - 1));
        continue;
      }
      throw letzterFehler;
    }
    clearTimeout(timeoutId);

    // Rate-Limit: kein Retry, sofort weitergeben
    if (antwort.status === 429) {
      throw new Apifehler(
        "Zu viele Anfragen. Bitte warte einen Moment.",
        429,
        "rate_limit",
        versuch,
      );
    }

    // 5xx Server-Fehler → Retry
    if (antwort.status >= 500 && antwort.status < 600) {
      letzterFehler = new Apifehler(
        `Backend-Fehler (HTTP ${antwort.status}). Wird wiederholt …`,
        antwort.status,
        "server",
        versuch,
      );
      if (versuch < MAX_VERSUCHE) {
        await warte(BACKOFF_BASIS_MS * 2 ** (versuch - 1));
        continue;
      }
      throw letzterFehler;
    }

    // 4xx Client-Fehler → sofort durchreichen (kein Retry sinnvoll)
    if (!antwort.ok) {
      let detail = `Anfrage abgelehnt (HTTP ${antwort.status}).`;
      try {
        const fehlerDaten = await antwort.json();
        detail = fehlerDaten.detail ?? detail;
      } catch {
        // ignore
      }
      throw new Apifehler(detail, antwort.status, "client", versuch);
    }

    return antwort.json() as Promise<T>;
  }

  // Sollte unerreichbar sein, aber TypeScript happy machen
  throw letzterFehler ?? new Apifehler("Unbekannter Fehler", 0, "unbekannt");
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
 * Prüft ob die API erreichbar ist. Macht bis zu 2 Versuche mit kurzem Backoff,
 * damit ein DNS-Flake nicht die ganze UI als "offline" markiert.
 */
export async function apiGesund(): Promise<boolean> {
  for (let versuch = 1; versuch <= 2; versuch++) {
    const abbrecher = new AbortController();
    const timeoutId = setTimeout(() => abbrecher.abort(), 8_000);
    try {
      const antwort = await fetch(`${API_PFAD}/gesundheit`, {
        signal: abbrecher.signal,
      });
      clearTimeout(timeoutId);
      if (antwort.ok) return true;
    } catch {
      clearTimeout(timeoutId);
      if (versuch < 2) await warte(750);
    }
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════════
// SENIOR-ELITE ERWEITERUNGEN
// Shodan InternetDB, Email-Recon (GHunt/Epieos), Aggregator, Orchestrator
// ═══════════════════════════════════════════════════════════════════

// ─── Typen: Shodan InternetDB ─────────────────────────────────────

export interface ShodanPortDetail {
  port: number;
  gefaehrlich: boolean;
  service: string | null;
}

export interface ShodanTagDetail {
  tag: string;
  bedeutung: string;
}

export interface ShodanRisiko {
  punkte: number;
  max: number;
  stufe: "Kritisch" | "Hoch" | "Mittel" | "Gering" | "Keines";
  details: Array<{ stufe: string; meldung: string }>;
}

export interface ShodanErgebnis {
  ziel: string;
  eingabe_typ: "ip" | "domain";
  analysiert_am: string;
  fehler?: string;
  ip_count?: number;
  ips?: string[];
  ergebnisse_pro_ip?: Array<{
    ip: string;
    in_shodan: boolean;
    ports?: number[];
    vulns?: string[];
    tags?: string[];
    hostnames?: string[];
    cpes?: string[];
    fehler?: string;
  }>;
  aggregiert?: {
    ports: ShodanPortDetail[];
    ports_anzahl: number;
    vulns: string[];
    vulns_anzahl: number;
    tags: ShodanTagDetail[];
    hostnames: string[];
    cpes: string[];
  };
  risiko?: ShodanRisiko;
  quelle?: string;
}

// ─── Typen: Email-Recon ───────────────────────────────────────────

export interface EmailReconErgebnis {
  email: string;
  gueltig: boolean;
  fehler?: string;
  analysiert_am: string;
  domain?: string;
  hashes?: { md5: string; sha1: string; sha256: string };
  gravatar?: {
    gefunden: boolean;
    hash_md5: string;
    profil_url: string;
    avatar_url: string;
    avatar_existiert?: boolean;
    profil_daten?: {
      anzeigename?: string | null;
      benutzername?: string | null;
      ort?: string | null;
      bio?: string | null;
      verifizierte_konten?: Array<{ name: string; url: string; verifiziert: boolean }>;
      urls?: string[];
    };
    fehler?: string;
  };
  google?: {
    google_konto_wahrscheinlich: boolean;
    hinweis?: string;
    links?: Record<string, string>;
  };
  hibp?: {
    geprueft: boolean;
    domain_betroffen?: boolean;
    anzahl_breaches?: number;
    breaches?: Array<{
      name: string;
      titel: string;
      datum: string;
      betroffene: number;
      datenklassen: string[];
    }>;
    hinweis?: string;
  };
  github?: {
    gefunden: boolean;
    treffer?: number;
    nutzer?: Array<{ login: string; url: string; avatar: string; typ: string }>;
    hinweis?: string;
  };
  xposedornot?: {
    geprueft: boolean;
    anzahl_breaches?: number;
    breaches?: string[];
    exposed_fields?: string[];
    pastes_count?: number;
    hinweis?: string;
  };
  leakcheck?: {
    geprueft: boolean;
    anzahl?: number;
    sources?: Array<{ name: string; datum: string }>;
    hinweis?: string;
  };
  pgp?: {
    geprueft: boolean;
    hat_pgp_key?: boolean;
    anzahl?: number;
    keys?: Array<{ fingerprint: string; created: string }>;
    hinweis?: string;
  };
  wer_ist_das?: Array<{ quelle: string; wert: string; konfidenz: string; url?: string }>;
  risiko?: {
    stufe: string;
    punkte: number;
    details: string[];
  };
  quellen?: string[];
}

// ─── Typen: Search-Aggregator ─────────────────────────────────────

export interface AggregatorLink {
  name: string;
  kategorie: string;
  url: string;
}

export interface AggregatorErgebnis {
  typ: string;
  wert: string;
  analysiert_am: string;
  anzahl: number;
  links: AggregatorLink[];
  nach_kategorie: Record<string, AggregatorLink[]>;
  hinweis?: string;
  fehler?: string;
}

// ─── Typen: Orchestrator ──────────────────────────────────────────

export interface GraphNode {
  id: string;
  label: string;
  typ: string;  // email|domain|username|ip|account|cve|asn|nameserver|carrier|land|phone
  daten: Record<string, unknown>;
}

export interface GraphEdge {
  von: string;
  zu: string;
  beziehung: string;
}

export interface OrchestratorErgebnis {
  eingabe: string;
  typ: "email" | "domain" | "username" | "ip" | "phone" | "unknown";
  tiefe?: number;
  fehler?: string;
  analysiert_am: string;
  module?: Record<string, unknown>;
  graph?: {
    nodes: GraphNode[];
    edges: GraphEdge[];
    statistik: {
      knoten_gesamt: number;
      kanten_gesamt: number;
      nach_typ: Record<string, number>;
    };
  };
  zusammenfassung?: {
    module_ausgefuehrt: string[];
    pivots_entdeckt: number;
  };
}

// ─── Neue API-Funktionen ──────────────────────────────────────────

/**
 * Shodan InternetDB Recon — kostenlos, kein Key.
 * Liefert offene Ports, CVEs, Tags für eine IP oder Domain.
 */
export async function shodanAbfragen(ziel: string): Promise<ShodanErgebnis> {
  return apiFetch<ShodanErgebnis>("/shodan", { ziel });
}

/**
 * E-Mail Tiefen-Recon (Epieos/GHunt-Style).
 * Gravatar + Google + HIBP + GitHub parallel.
 */
export async function emailReconnaissance(email: string): Promise<EmailReconErgebnis> {
  return apiFetch<EmailReconErgebnis>("/email-recon", { email });
}

/**
 * IntelTechniques-Style Search-Aggregator.
 * Generiert 50+ kuratierte Search-Links pro Target-Typ.
 */
export async function searchAggregator(
  typ: "email" | "username" | "domain" | "phone" | "image" | "ip",
  wert: string,
): Promise<AggregatorErgebnis> {
  return apiFetch<AggregatorErgebnis>("/aggregator", { typ, wert });
}

/**
 * SpiderFoot-Style Orchestrator — Vollanalyse mit automatischer Typ-Erkennung.
 */
export async function orchestrator(
  eingabe: string,
  tiefe: 1 | 2 | 3 = 2,
): Promise<OrchestratorErgebnis> {
  return apiFetch<OrchestratorErgebnis>("/orchestrator", { eingabe, tiefe });
}

/**
 * Benutzername-Vollscan (WhatsMyName-DB, 600+ Plattformen).
 * Variante von benutzernameSuchen() mit vollscan=true.
 */
export async function benutzernameVollscan(benutzername: string): Promise<BenutzerErgebnis> {
  return apiFetch<BenutzerErgebnis>("/benutzername", { benutzername, vollscan: true });
}
