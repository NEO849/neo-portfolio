// ═══════════════════════════════════════════════════════════════════
// DIENST: OSINT-API
// TypeScript-Client für das FastAPI-Backend auf dem VPS.
// Typsichere Fetch-Funktionen für alle OSINT-Werkzeuge.
// ═══════════════════════════════════════════════════════════════════

const API_BASIS = import.meta.env.VITE_OSINT_API_URL ?? "https://api.cyp-hr.com";
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

// ─── Typ: VirusTotal-Reputation (optional, nur wenn Backend-Key gesetzt) ──

export interface VtReputation {
  geprueft: boolean;
  hinweis?: string;
  stufe?: "Schädlich" | "Verdächtig" | "Sauber" | "Unbekannt";
  malicious?: number;
  suspicious?: number;
  harmless?: number;
  undetected?: number;
  gesamt_engines?: number;
  reputation?: number | null;
  kategorien?: string[];
  quelle?: string;
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
  pivots?: Pivot[];
  vt?: VtReputation;
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

// ─── Typ: Pivot (verknüpfbarer Datenpunkt für "weiter analysieren") ──

export type PivotTyp = "username" | "email" | "domain" | "ip" | "account" | "image";

export interface Pivot {
  typ: PivotTyp;
  wert: string;
  quelle: string;
  konfidenz: "hoch" | "mittel" | "niedrig";
  analysierbar: boolean;   // true = eigenes Analyse-Werkzeug verfügbar
  url?: string | null;
}

// ─── Typ: Schutz-Empfehlung ("was kann ich dagegen tun?") ──────────

export interface SchutzEmpfehlung {
  titel: string;
  was: string;          // konkrete Handlung
  warum: string;        // das Risiko / der Grund
  prioritaet: "hoch" | "mittel" | "niedrig";
  kategorie: string;    // Themen-Label (Passwörter, Privatsphäre, …)
}

export interface ProfilDaten {
  anzeigename?: string;
  beschreibung?: string;
  avatar?: string;
}

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
  profil?: ProfilDaten;
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
  identitaet?: {
    profile_gefunden: number;
    anzeigenamen: string[];
    avatare: Array<{ plattform: string; avatar: string }>;
    profile: Array<{ plattform: string; url: string } & ProfilDaten>;
  };
  plattformen?: {
    gefunden: PlattformErgebnis[];
    nicht_gefunden: Array<{ plattform: string; kategorie: string; url: string }>;
    fehler: PlattformErgebnis[];
  };
  nach_kategorie?: Record<string, PlattformErgebnis[]>;
  pivots?: Pivot[];
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
  live_status?: {
    aktiv: boolean;
    hinweis?: string;
    status?: string;
    status_text?: string;
    erreichbar?: boolean;
    carrier?: string | null;
    ursprungs_carrier?: string | null;
    portiert?: boolean | null;
    roaming?: boolean | null;
    roaming_netz?: string | null;
    mccmnc?: string | null;
    kosten_eur?: string | null;
    quelle?: string;
  };
  numverify?: {
    geprueft: boolean;
    valid?: boolean;
    carrier?: string | null;
    line_type?: string | null;
    location?: string | null;
    land?: string | null;
    hinweis?: string;
    quelle?: string;
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
    seriennummer?: string | null;
    objektiv?: string | null;
    kuenstler?: string | null;
    copyright?: string | null;
    benutzerkommentar?: string | null;
    gps?: {
      lat: number;
      lon: number;
      maps_link: string;
      hinweis: string;
      hoehe_meter?: number;
      blickrichtung_grad?: number;
      gps_datum?: string;
      ort_name?: string | null;
      adresse?: string | null;
      osm_link?: string;
      geocoding_quelle?: string;
      komponenten?: Record<string, string | null>;
    } | null;
  };
  bewertung?: {
    stufe: "Hoch" | "Mittel" | "Gering" | "Unkritisch";
    punkte: number;
    zusammenfassung: string;
    befunde: Array<{ stufe: string; kategorie?: string; meldung: string }>;
    empfehlungen: string[];
  };
  suchlinks?: Array<{ name: string; url: string; kategorie?: string }>;
  sicherheits_hinweise?: Array<{ stufe: string; meldung: string }>;
  pivots?: Pivot[];
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

const ANFRAGE_TIMEOUT_DEFAULT_MS = 15_000;   // Schnelle Endpoints (Email/Domain/Telefon/Bild)
const ANFRAGE_TIMEOUT_LANG_MS = 75_000;      // Vollscan / Orchestrator (600+ Plattformen parallel)
const MAX_VERSUCHE = 3;                      // 1 initial + 2 Retries
const BACKOFF_BASIS_MS = 500;                // 500ms → 1000ms → 2000ms

// Endpoints die deutlich länger laufen — bekommen großzügiges Timeout.
const LANGE_ENDPOINTS = new Set([
  "/benutzername",      // 600+ Plattform-Pings, ~20–30s typisch
  "/orchestrator",      // alle Module parallel + Graph-Aufbau
  "/email-recon",       // 7 Quellen parallel, kann auch >15s ziehen
  "/soziale-praesenz",  // ~14 Plattformen parallel (offen + walled)
]);

function warte(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

// ─── Hilfsfunktion: Fetch mit Retry + Fehlerklassifikation ────────

async function apiFetch<T>(endpunkt: string, koerper: unknown): Promise<T> {
  const timeoutMs = LANGE_ENDPOINTS.has(endpunkt)
    ? ANFRAGE_TIMEOUT_LANG_MS
    : ANFRAGE_TIMEOUT_DEFAULT_MS;

  let letzterFehler: Apifehler | null = null;

  for (let versuch = 1; versuch <= MAX_VERSUCHE; versuch++) {
    const abbrecher = new AbortController();
    const timeoutId = setTimeout(() => abbrecher.abort(), timeoutMs);

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
        ? `Zeitüberschreitung nach ${timeoutMs / 1000}s.`
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
    nutzer?: Array<{ login: string; url: string; avatar: string; typ: string; quelle?: string }>;
    klarnamen?: string[];
    repositories?: Array<{ name: string; url: string }>;
    authentifiziert?: boolean;
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
  aus_cache?: boolean;
  pivots?: Pivot[];
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

// ─── Censys Platform Recon (key-gated) ────────────────────────────

export interface CensysDienst {
  port: number;
  protokoll: string | null;
  transport: string | null;
  gefaehrlich: boolean;
  service: string | null;
}

export interface CensysHost {
  ip: string | null;
  in_censys: boolean;
  fehler?: string;
  standort?: {
    stadt?: string | null; provinz?: string | null; land?: string | null;
    land_code?: string | null; kontinent?: string | null; zeitzone?: string | null;
    koordinaten?: { lat: number; lon: number } | null;
  };
  autonomes_system?: {
    asn?: number | null; name?: string | null; beschreibung?: string | null;
    bgp_prefix?: string | null; land_code?: string | null;
  };
  whois_organisation?: { name?: string | null; land?: string | null; abuse_kontakte?: string[] };
  ports?: number[];
  ports_anzahl?: number;
  dienste?: CensysDienst[];
  reverse_dns?: string[];
}

export interface CensysErgebnis {
  ziel: string;
  eingabe_typ?: "ip" | "domain";
  analysiert_am: string;
  verfuegbar: boolean;
  hinweis?: string;
  fehler?: string;
  ip_count?: number;
  ips?: string[];
  hosts?: CensysHost[];
  aggregiert?: {
    ports: number[];
    ports_anzahl: number;
    gefaehrliche_ports: Array<{ port: number; service: string }>;
    laender: string[];
    autonome_systeme: string[];
  };
  quelle?: string;
}

/**
 * Censys Platform Host-Recon (key-gated) — Komplement zu Shodan.
 * Liefert Services (Port/Protokoll), Standort, Autonomous System,
 * WHOIS-Organisation inkl. Abuse-Kontakten und Reverse-DNS.
 */
export async function censysAbfragen(ziel: string): Promise<CensysErgebnis> {
  return apiFetch<CensysErgebnis>("/censys", { ziel });
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

// ─── Typen: Subdomain-Recon ───────────────────────────────────────

export interface SubdomainEintrag {
  host: string;
  quellen: string[];           // ["crt.sh", "wayback", "commoncrawl"]
  aktiv: boolean | null;       // null = nicht aufgelöst
  ip: string | null;
}

export interface SubdomainQuelleMeta {
  ok: boolean;
  anzahl?: number;
  hinweis?: string;
}

export interface SubdomainErgebnis {
  domain: string;
  analysiert_am: string;
  fehler?: string;
  zusammenfassung?: {
    gesamt_eindeutig: number;
    angezeigt: number;
    live_aufgeloest: number | null;
    limit_erreicht: boolean;
  };
  quellen?: {
    "crt.sh": SubdomainQuelleMeta;
    wayback: SubdomainQuelleMeta;
    commoncrawl: SubdomainQuelleMeta;
  };
  subdomains?: SubdomainEintrag[];
}

// ─── Typen: IP-Intel (RIPEstat) ───────────────────────────────────

export interface IpIntelErgebnis {
  ziel: string;
  ip?: string;
  eingabe_typ?: "ip" | "domain";
  analysiert_am: string;
  fehler?: string;
  routing?: {
    asns: Array<string | number>;
    prefix: string | null;
    prefix_inhaber: string | null;
    announced: boolean | null;
  };
  as?: {
    asn: string | number | null;
    holder: string | null;
    typ: string | null;
    announced: boolean | null;
  };
  abuse_kontakte?: string[];
  links?: { ripestat: string; bgp_he: string };
  quelle?: string;
  vt?: VtReputation;
}

/**
 * Subdomain-Recon — keyless, multi-source (crt.sh + Wayback + CommonCrawl).
 * Mit aufloesen=true werden bis zu 75 Subdomains live A-Record-aufgelöst.
 */
export async function subdomainsFinden(
  domain: string,
  aufloesen = false,
): Promise<SubdomainErgebnis> {
  return apiFetch<SubdomainErgebnis>("/subdomains", { domain, aufloesen });
}

/**
 * IP-Intel via RIPEstat (keyless) — Routing, AS-Holder, Prefix, Abuse-Kontakt.
 * Akzeptiert IP-Adresse oder Domain.
 */
export async function ipIntelAbfragen(ziel: string): Promise<IpIntelErgebnis> {
  return apiFetch<IpIntelErgebnis>("/ip-intel", { ziel });
}

// ─── Typen: Soziale Präsenz (Social-Media-Recon) ──────────────────

export interface DorkLink {
  name: string;
  url: string;
}

export interface SozialesKontoOffen {
  plattform: string;
  kategorie: "offen";
  gefunden: boolean;
  profil_url: string;
  anzeigename?: string;
  bio?: string;
  follower?: number;
  avatar?: string;
  extra?: Record<string, unknown>;
}

export interface SozialesKontoWalled {
  plattform: string;
  kategorie: "walled";
  login_geschuetzt: true;
  profil_url: string;
  existenz: boolean | null;   // true/false via oEmbed, null = nur Link
  anzeigename?: string;
  dork_links: DorkLink[];
  hinweis: string;
}

// WhatsMyName-Breitentreffer (Existenz, ohne tiefe Profildaten)
export interface SozialeWeitereTreffer {
  plattform: string;
  url: string;
  kategorie?: string;
  konfidenz?: "hoch" | "mittel" | "niedrig";
}

export interface SozialePraesenzErgebnis {
  benutzername: string;
  analysiert_am: string;
  modus?: "schnell" | "vollscan";
  fehler?: string;
  aus_cache?: boolean;
  zusammenfassung?: {
    offen_gefunden: number;
    geprueft_offen: number;
    walled_geprueft: number;
    walled_gesamt: number;
    weitere_gefunden?: number;
    weitere_geprueft?: number;
    vollscan?: boolean;
  };
  offene_plattformen?: SozialesKontoOffen[];
  walled_gardens?: SozialesKontoWalled[];
  weitere_plattformen?: SozialeWeitereTreffer[];
  wer_ist_das?: Array<{ quelle: string; wert: string; konfidenz: string; url?: string }>;
  quellen?: string[];
  pivots?: Pivot[];
}

/**
 * Soziale Präsenz zu einem Benutzernamen — offene Plattformen (echte Daten via
 * freie APIs) + Walled Gardens (Existenz/Link/Dork, kein Scraping) + WhatsMyName-
 * Breitenscan. `vollscan=true` scannt 600+ Plattformen (langsamer).
 */
export async function sozialePraesenzSuchen(
  benutzername: string,
  vollscan = false,
): Promise<SozialePraesenzErgebnis> {
  return apiFetch<SozialePraesenzErgebnis>("/soziale-praesenz", { benutzername, vollscan });
}

// ─── Transparenz / Datenfluss (DSGVO Art. 13/14) ──────────────────

export interface DatenflussDienst {
  dienst: string;
  uebermittelte_daten: string;
  zweck: string;
  datenschutz_url: string;
  region: string;
}

export interface WerkzeugDatenfluss {
  beschreibung: string;
  sendet_an: DatenflussDienst[];
  nur_links: string[];
  hinweis?: string;
  speicherung: string;
}

export interface TransparenzUebersicht {
  hinweis: string;
  speicherung: string;
  werkzeuge: Record<string, WerkzeugDatenfluss>;
}

/**
 * Holt die maschinenlesbare Datenfluss-Deklaration (welche Drittdienste pro
 * Werkzeug serverseitig kontaktiert werden). Read-only GET, gecacht im Modul.
 */
let _transparenzCache: TransparenzUebersicht | null = null;

export async function transparenzLaden(): Promise<TransparenzUebersicht | null> {
  if (_transparenzCache) return _transparenzCache;
  const abbrecher = new AbortController();
  const timeoutId = setTimeout(() => abbrecher.abort(), 8_000);
  try {
    const antwort = await fetch(`${API_PFAD}/transparenz`, { signal: abbrecher.signal });
    clearTimeout(timeoutId);
    if (!antwort.ok) return null;
    _transparenzCache = (await antwort.json()) as TransparenzUebersicht;
    return _transparenzCache;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}
