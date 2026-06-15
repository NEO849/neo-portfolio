import { useState, useEffect, useRef, useCallback, Fragment, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PHASEN_WECHSEL, FEDERN } from "../bewegung/varianten";
import { GlanzUeberschrift } from "../bewegung/GlanzUeberschrift";
import { KnopfAktion } from "../bausteine/KnopfAktion";
import {
  domainAnalysieren, emailAnalysieren,
  telefonAnalysieren, bildAnalysieren,
  shodanAbfragen, censysAbfragen, emailReconnaissance, orchestrator,
  subdomainsFinden, ipIntelAbfragen,
  sozialePraesenzSuchen,
  gesundheitLaden,
  Apifehler,
  type DomainErgebnis, type EmailErgebnis,
  type TelefonErgebnis, type BildErgebnis,
  type ShodanErgebnis, type CensysErgebnis, type EmailReconErgebnis,
  type OrchestratorErgebnis,
  type SubdomainErgebnis, type IpIntelErgebnis,
  type SozialePraesenzErgebnis,
  type GesundheitErgebnis,
  type Pivot,
} from "../dienste/osintApi";
import { DatenschutzModal } from "../bausteine/DatenschutzModal";
import OsintGraph from "../bausteine/OsintGraph";
import ErgebnisReport from "../bausteine/osint/ErgebnisReport";
import { Dossier } from "../bausteine/osint/Dossier";
import { StatusKarte } from "../bausteine/osint/StatusKarte";
import { SchutzEmpfehlungen } from "../bausteine/osint/SchutzEmpfehlungen";
import { fasseErgebnisZusammen, extrahiereSchutz } from "../hilfsmittel/ergebnisZusammenfassung";
import DatenflussHinweis from "../bausteine/osint/DatenflussHinweis";

// ═══════════════════════════════════════════════════════
// OSINT TOOLKIT – LIVE TERMINAL MIT ECHTEM BACKEND
// Echte Daten von der FastAPI auf dem VPS.
// ═══════════════════════════════════════════════════════

interface DemoModul {
  readonly nummer: string;
  readonly name: string;
  readonly farbe: string;
  readonly eingabeLabel: string;
  readonly beispielEingabe: string;
  readonly eingabeTyp: "text" | "none" | "demo";
  readonly ziel: string;          // Nutzen in einem klaren Satz (Mehrwert)
  readonly beschreibung: string;  // technische Details / Quellen
}

// 9 Module (1 Status + 8 Analyse-Werkzeuge), gruppiert nach Domäne:
// Identität/Person · Infrastruktur · Aggregation/Meta. Die Menü-Nummer ist die
// Anzeige-Position (Index); `nummer` bleibt die stabile interne ID für die Logik.
const DEMO_MODULE: DemoModul[] = [
  {
    nummer: "1", name: "Status pruefen", farbe: "#9ca3af",
    eingabeLabel: "", beispielEingabe: "", eingabeTyp: "none",
    ziel: "Prüft auf einen Blick, ob alle 8 Analyse-Werkzeuge gerade live und einsatzbereit sind.",
    beschreibung: "Liveness-Check für FastAPI, dnspython, httpx (mit SSRF-Guard), WhatsMyName-DB, Shodan InternetDB, RIPEstat und die CT/Archiv-Quellen (crt.sh/Wayback/CommonCrawl) — bestätigt dass alle 8 Analyse-Werkzeuge live und produktiv sind.",
  },
  {
    nummer: "2", name: "E-Mail Vollanalyse", farbe: "#7aa2ff",
    eingabeLabel: "E-Mail eingeben", beispielEingabe: "demo@example.com", eingabeTyp: "text",
    ziel: "Zeigt, ob eine E-Mail-Adresse in bekannten Datenlecks auftaucht und welche Profile & Spuren öffentlich daran hängen.",
    beschreibung: "Aggregiert MX / SPF / DMARC, HIBP, XposedOrNot, LeakCheck, Gravatar, Google-GAIA, GitHub-Discovery und PGP-Keyserver parallel. Liefert einen konsolidierten Risk-Score über alle Quellen.",
  },
  {
    nummer: "12", name: "Soziale Präsenz", farbe: "#c084fc",
    eingabeLabel: "Username eingeben", beispielEingabe: "torvalds", eingabeTyp: "text",
    ziel: "Findet den kompletten digitalen Fußabdruck eines Benutzernamens — echte Profildaten auf offenen Plattformen + Existenz auf den großen Netzwerken und Hunderten weiteren Seiten.",
    beschreibung: "Offene Plattformen mit echten Daten (Bluesky, GitHub, GitLab, Reddit, Mastodon, Keybase, Hacker News, Dev.to — Anzeigename, Bio, Follower, Avatar, verknüpfte Konten) + Breitenscan über WhatsMyName (Schnell ~12 / Vollscan 600+, Konfidenz pro Treffer). Große Netzwerke (X, LinkedIn, Facebook, Instagram, TikTok, YouTube) login-/anti-bot-geschützt: nur ToS-sauber — Existenz via öffentliche oEmbed-Endpunkte (YouTube/TikTok) bzw. Profil-Link + Google-/Bing-Dork. Kein Scraping.",
  },
  {
    nummer: "4", name: "Telefon Analyse", farbe: "#eab308",
    eingabeLabel: "Telefonnummer", beispielEingabe: "+12025550143", eingabeTyp: "text",
    ziel: "Verrät Land, Anbieter und Leitungstyp hinter einer Telefonnummer und bündelt seriöse Such-Quellen dazu.",
    beschreibung: "Validiert Format via libphonenumber, ermittelt Land, Carrier, Leitungstyp und Zeitzone. Generiert kuratierte Suchlinks zu Truecaller, Tellows, sync.me, WhatsApp und Telegram — kein automatischer Aufruf.",
  },
  {
    nummer: "6", name: "Reverse Image", farbe: "#22c55e",
    eingabeLabel: "Bild-URL", beispielEingabe: "https://upload.wikimedia.org/wikipedia/commons/7/79/Tesla_circa_1890.jpeg", eingabeTyp: "text",
    ziel: "Liest versteckte Foto-Daten (inkl. GPS-Aufnahmeort) aus und liefert Reverse-Image-Suchen, um die Bildquelle zu finden. (Beispiel: Porträt von Nikola Tesla — die Reverse-Suchen finden zahlreiche Fundstellen.)",
    beschreibung: "Extrahiert EXIF-Metadaten und GPS-Koordinaten, berechnet pHash / aHash / dHash. Generiert 14 Suchlinks über 5 Kategorien: Mainstream (Google Lens / TinEye / Bing), Regional (Yandex / Baidu), Face (PimEyes / FaceCheck / Search4Faces), Art (SauceNAO / IQDB) und Celebrity (PicTriev).",
  },
  {
    nummer: "5", name: "Domain & Shodan", farbe: "#8aa0c8",
    eingabeLabel: "Domain eingeben", beispielEingabe: "github.com", eingabeTyp: "text",
    ziel: "Bewertet, wie gut eine Domain abgesichert ist und welche Ports & Schwachstellen nach außen sichtbar sind.",
    beschreibung: "Parallel: DNS (A / AAAA / MX / NS / SPF / DMARC), WHOIS, ASN via Team Cymru, HTTP-Security-Header-Audit und Shodan InternetDB (offene Ports, bekannte CVEs, Tags). Liefert zwei Risk-Scores: HTTP-Sec und Network-Exposure.",
  },
  {
    nummer: "9", name: "Subdomain-Recon", farbe: "#2dd4bf",
    eingabeLabel: "Domain eingeben", beispielEingabe: "github.com", eingabeTyp: "text",
    ziel: "Deckt versteckte Subdomains einer Domain auf — die oft übersehene, eigentliche Angriffsfläche.",
    beschreibung: "Sammelt Subdomains aus drei unabhängigen keyless-Quellen parallel — Certificate-Transparency (crt.sh), Wayback Machine und CommonCrawl — und führt sie dedupliziert zusammen, mit Quellen-Herkunft pro Treffer und optionalem Live-Resolve (A-Record-Check). Jede Quelle ist fehler-isoliert: fällt eine aus, liefern die anderen weiter.",
  },
  {
    nummer: "10", name: "IP-Intel (RIPEstat)", farbe: "#fbbf24",
    eingabeLabel: "IP oder Domain", beispielEingabe: "1.1.1.1", eingabeTyp: "text",
    ziel: "Beantwortet: Wem gehört diese IP-Adresse und wie wird sie im Internet geroutet?",
    beschreibung: "Autoritative Routing- und Ownership-Daten via RIPEstat (RIPE NCC, keyless): announced Prefix, ASN(s), AS-Holder (Betreiber) und der Abuse-Kontakt der IP. Ergänzt Shodan (Ports/CVEs) um die Frage: WEM gehört diese IP und WIE wird sie geroutet?",
  },
  {
    nummer: "11", name: "Censys Host-Intel", farbe: "#38bdf8",
    eingabeLabel: "IP oder Domain", beispielEingabe: "8.8.8.8", eingabeTyp: "text",
    ziel: "Zeigt, welche Dienste ein Server nach außen offen hat, wo er steht und wem er gehört — die autoritative Host-Sicht, die Shodan ergänzt.",
    beschreibung: "Censys Platform: Services (Port/Protokoll/Transport), Standort (Stadt/Land/Koordinaten), Autonomous System, WHOIS-Organisation inkl. Abuse-Kontakt und Reverse-DNS. Akzeptiert IP oder Domain (wird aufgelöst).",
  },
  {
    nummer: "8", name: "Orchestrator", farbe: "#10b981",
    eingabeLabel: "Beliebiges Target", beispielEingabe: "cloudflare.com", eingabeTyp: "text",
    ziel: "Führt alle passenden Module automatisch zusammen und zeigt die gefundenen Verbindungen als interaktiven Graph.",
    beschreibung: "SpiderFoot-Style Orchestrator: erkennt Typ automatisch, führt alle relevanten Module parallel aus und entdeckt Pivots (E-Mail → Domain → ASN → IP → CVE). Visualisiert alle Beziehungen als Maltego-Style Graph mit interaktiver Detail-Anzeige.",
  },
];

// ─── Premium-UI: Icons je Modul (schlanke Inline-SVGs, keine Dependency) ──
// Strich als hell→azur-Verlauf (Def in der Section, einmal pro Seite) statt
// flacher Einfarbigkeit — identisch zu den Bereichs-Icons im Hero.
const ICO = {
  width: 20, height: 20, viewBox: "0 0 24 24", fill: "none",
  stroke: "url(#osint-icon-grad)", strokeWidth: 1.6,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
};
const MODUL_ICON: Record<string, ReactNode> = {
  "1": (<svg {...ICO}><path d="M3 12h4l2 6 4-14 2 8h6" /></svg>),                                   // Status / Liveness
  "2": (<svg {...ICO}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>), // E-Mail
  "3": (<svg {...ICO}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5" /></svg>), // Username
  "4": (<svg {...ICO}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>), // Telefon
  "6": (<svg {...ICO}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="9.5" r="1.6" /><path d="m4 17 5-5 4 4 3-3 4 4" /></svg>), // Bild
  "5": (<svg {...ICO}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>), // Domain
  "9": (<svg {...ICO}><rect x="9" y="3" width="6" height="5" rx="1" /><rect x="3" y="16" width="6" height="5" rx="1" /><rect x="15" y="16" width="6" height="5" rx="1" /><path d="M12 8v4M6 16v-2h12v2" /></svg>), // Subdomains
  "10": (<svg {...ICO}><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="6" r="2.5" /><path d="M8 16 16 8M8 8h8v8" /></svg>), // IP-Intel
  "11": (<svg {...ICO}><rect x="3" y="4" width="18" height="6" rx="1.5" /><rect x="3" y="14" width="18" height="6" rx="1.5" /><path d="M7 7h.01M7 17h.01" /></svg>), // Censys / Host
  "8": (<svg {...ICO}><circle cx="6" cy="6" r="2.2" /><circle cx="18" cy="7" r="2.2" /><circle cx="12" cy="18" r="2.2" /><path d="M7.6 7.6 11 16M16.6 8.6 13 16M8 6h8" /></svg>), // Orchestrator / Graph
  "12": (<svg {...ICO}><circle cx="9" cy="8" r="3" /><path d="M3.5 19c0-3 2.5-4.8 5.5-4.8s5.5 1.8 5.5 4.8" /><circle cx="18" cy="9.5" r="2" /><path d="M16.5 14.5c2.2.3 3.5 1.7 3.5 3.8" /></svg>), // Soziale Präsenz (Personen-Netz)
};

// 3-Schritt-Indikator (Auswahl → Eingabe → Ergebnis). EIN responsives Layout
// für alle Größen: die vollen nummerierten Schritte + Labels bleiben immer
// sichtbar — auf Mobile nur kompakter dimensioniert (kleinere Kreise/Labels,
// Verbinder schrumpfen via flex-1). Schritte selbst sind flex-shrink-0, werden
// also nie abgeschnitten. Kein horizontaler Scroll, kein Cutoff.
const FLOW_SCHRITTE = ["Auswahl", "Eingabe", "Ergebnis"] as const;

function FlowStepper({ phase }: { phase: "menue" | "eingabe" | "laden" | "ausgabe" }) {
  const aktiv = phase === "menue" ? 0 : phase === "eingabe" ? 1 : 2;

  return (
    <div className="flex items-center gap-1.5 sm:gap-3 w-full sm:w-auto min-w-0">
      {FLOW_SCHRITTE.map((s, i) => {
        // Indigo (#6D7CFF) → Cyan (#33D6FF) → Teal (#19D3B4) — Premium-Designsystem.
        const zustand = i < aktiv ? "erledigt" : i === aktiv ? "aktiv" : "offen";
        const kreisStil =
          zustand === "aktiv"
            ? { backgroundImage: "linear-gradient(135deg, #6D7CFF, #33D6FF)", boxShadow: "0 0 0 4px rgba(51,214,255,0.12), 0 6px 18px rgba(51,214,255,0.35)" }
            : zustand === "erledigt"
            ? { backgroundColor: "rgba(25,211,180,0.15)", border: "1px solid rgba(25,211,180,0.45)" }
            : { backgroundColor: "rgba(109,124,255,0.08)", border: "1px solid rgba(51,214,255,0.18)" };
        const kreisText = zustand === "aktiv" ? "text-white" : zustand === "erledigt" ? "text-[#19D3B4]" : "text-white/65";
        return (
          <Fragment key={s}>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 group">
              <span
                style={kreisStil}
                className={`grid place-items-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-[11px] font-semibold flex-shrink-0 transition-all duration-[250ms] ease-out group-hover:brightness-110 ${kreisText}`}
              >
                {zustand === "erledigt" ? "✓" : i + 1}
              </span>
              <span className={`text-[11px] sm:text-[13px] whitespace-nowrap transition-colors duration-200 ${zustand === "aktiv" ? "text-white/90" : "text-white/55"}`}>
                {s}
              </span>
            </div>
            {i < FLOW_SCHRITTE.length - 1 && (
              <span className="h-px flex-1 min-w-[8px] sm:flex-none sm:w-8 rounded-full transition-all duration-300"
                style={{ background: i < aktiv ? "linear-gradient(90deg, rgba(25,211,180,0.5), rgba(51,214,255,0.5))" : "rgba(51,214,255,0.12)" }} />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

// ─── Datenschutz-Konfiguration für sensitive Module ──────────────

const DATENSCHUTZ_HINWEISE: Record<string, string[]> = {
  "4": [
    "Die Telefonnummer wird zur Analyse einmalig an den Server übertragen.",
    "Es werden ausschließlich öffentliche Metadaten ausgewertet (Format, Land, Carrier-Typ).",
    "Suchlinks werden generiert aber nicht automatisch aufgerufen — du entscheidest, welche du öffnest.",
    "Keine Datenspeicherung — die Nummer wird nach der Analyse nicht aufbewahrt.",
    "Nutze dieses Tool nur für Nummern, für deren Analyse du berechtigt bist.",
  ],
  "6": [
    "Die Bild-URL wird einmalig an den Server übertragen, um das Bild herunterzuladen.",
    "Das Bild wird zur EXIF-Analyse und Hash-Berechnung temporär im Arbeitsspeicher verarbeitet.",
    "GPS-Koordinaten im Bild können den Aufnahmeort preisgeben — überprüfe sensible Bilder mit Bedacht.",
    "Keine Speicherung — weder URL noch Bilddaten werden dauerhaft aufbewahrt.",
    "Reverse-Image-Links werden generiert aber nicht automatisch aufgerufen.",
    "Nutze dieses Tool nur für Bilder, für deren Analyse du berechtigt bist.",
  ],
};

const BITCOIN_ADDRESS = "bc1qf666x5l4zs6tm9w69jsr9mn5glvf97fk9z6zs8";

// Pro Modul ein kurzer, handlungsorientierter Hinweis: was bedeuten die
// Ergebnisse und was macht man als Nächstes damit? Wird als horizontaler
// Führungs-Banner über den Resultaten gezeigt (Nutzer-Orientierung).
const ERGEBNIS_HINWEIS: Record<string, string> = {
  "1": "Grün = live und einsatzbereit. Wähle ein Modul und starte deine erste Analyse.",
  "2": "Rote Treffer zuerst: Datenlecks und exponierte Profile. Klicke einen Pivot, um einen Fund weiter zu verfolgen.",
  "3": "Jeder Treffer ist ein Profil auf einer Plattform. Achte auf die Konfidenz (hoch / mittel / niedrig), bevor du folgst.",
  "4": "Land, Anbieter und Leitungstyp geben Kontext. Die Such-Links öffnest nur du selbst — nichts wird automatisch aufgerufen.",
  "6": "Prüfe die EXIF-Daten auf GPS (Aufnahmeort) und nutze die Reverse-Image-Suchen, um die Bildquelle zu finden.",
  "5": "Ordne zuerst die beiden Risk-Scores ein. Rote/gelbe Ports und fehlende Security-Header sind die relevanten Schwachstellen.",
  "9": "Jede Subdomain ist potenzielle Angriffsfläche. Live aufgelöste (mit A-Record) zuerst ansehen.",
  "10": "Zeigt Eigentümer und Routing der IP — die Basis, um Zuständigkeit und Abuse-Kontakt zu bestimmen.",
  "11": "Offene Dienste und Standort des Hosts — die autoritative Sicht, die Shodan ergänzt.",
  "8": "Unten erscheint der Beziehungs-Graph: Knoten anklicken und Verbindungen folgen — so werden die Zusammenhänge sichtbar.",
  "12": "Offene Plattformen liefern echte Profildaten (Name/Bio/Follower). Große Netzwerke sind login-geschützt — nutze dort Profil-Link + Dork. Klicke einen Treffer, um ihn weiterzuverfolgen.",
};

// ─── Terminal-Hilfsfunktionen ─────────────────────────────────────
// Box: 36 Zeichen breit — passt auf Mobile ohne horizontalen Scroll.

const R  = "+----------------------------------+";
const K  = (t: string) => `|  ${t.substring(0, 32).padEnd(32)}|`;
const S  = (n: string) => { const p = `--- ${n} `; return p + "-".repeat(Math.max(2, 34 - p.length)); };
const WW = (key: string, val: string, kw = 11) => `  ${key.padEnd(kw)}: ${val}`;
const trunc = (s: string, n: number) => s.length > n ? s.substring(0, n - 1) + "…" : s;

// Weicher Zeilenumbruch für längere Fließtexte (Verdikt/Empfehlungen).
function wrap(text: string, breite = 32, pfx = "  "): string[] {
  const woerter = text.split(" ");
  const out: string[] = [];
  let zeile = "";
  for (const w of woerter) {
    if ((zeile + " " + w).trim().length > breite) {
      if (zeile) out.push(pfx + zeile.trim());
      zeile = w;
    } else {
      zeile = (zeile + " " + w).trim();
    }
  }
  if (zeile) out.push(pfx + zeile.trim());
  return out;
}

// Pivots ("weiter analysieren") für die Raw-Ansicht.
function pivotsZuTerminal(pivots?: Pivot[]): string[] {
  if (!pivots?.length) return [];
  const z = ["", S("WEITER ANALYSIEREN")];
  for (const p of pivots) z.push(`  [>]  ${p.typ}: ${trunc(p.wert, 24)}`);
  return z;
}

// ─── Telefon ─────────────────────────────────────────────────────

function telefonZuTerminal(t: TelefonErgebnis): string[] {
  if (!t.gueltig || t.fehler) {
    return [R, K("TELEFON ANALYSE -- Fehler"), R, "", `  ${t.fehler ?? "Ungültige Nummer"}`];
  }
  const zeilen: string[] = [
    R, K(`TELEFON ANALYSE -- ${(t.format?.e164 ?? t.nummer).substring(0, 17)}`), R,
    "", S("FORMAT"),
    WW("Internat.", t.format?.international ?? ""),
    WW("National",  t.format?.national ?? ""),
    WW("E.164",     t.format?.e164 ?? ""),
    "", S("METADATEN"),
    WW("Land",    `${t.metadaten?.land_code} (${t.metadaten?.laendervorwahl ?? ""}) ${trunc(t.metadaten?.region ?? "", 12)}`),
    WW("Typ",     t.metadaten?.leitungstyp ?? ""),
    WW("Carrier", trunc(t.metadaten?.carrier ?? "", 20)),
    WW("Zeitzone",trunc((t.metadaten?.zeitzonen ?? []).join(", "), 20)),
  ];
  if (t.live_status?.aktiv) {
    zeilen.push("", S("LIVE-STATUS (HLR)"));
    zeilen.push(WW("Status", trunc(t.live_status.status_text ?? t.live_status.status ?? "", 20)));
    if (t.live_status.carrier) zeilen.push(WW("Carrier", trunc(t.live_status.carrier, 20)));
    if (t.live_status.roaming)  zeilen.push("  [!]  Roaming aktiv");
    if (t.live_status.portiert) zeilen.push("  [i]  Nummer portiert");
  }
  if (t.suchlinks?.nach_kategorie) {
    zeilen.push("", S("SUCHLINKS"));
    for (const [kat, links] of Object.entries(t.suchlinks.nach_kategorie)) {
      zeilen.push(`  ${kat}`);
      for (const link of links as Array<{ name: string }>) {
        zeilen.push(`    [+]  ${trunc(link.name, 22)}`);
      }
    }
    zeilen.push("", `  ${t.suchlinks.gesamt} Links generiert`);
  }
  if (t.risiko?.details.length) {
    zeilen.push("", S("HINWEISE"));
    for (const d of t.risiko.details) zeilen.push(`  [!]  ${trunc(d, 26)}`);
  }
  zeilen.push("", `  Analysiert: ${t.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
  return zeilen;
}

// ─── Bild ────────────────────────────────────────────────────────

function bildZuTerminal(b: BildErgebnis): string[] {
  if (b.fehler) {
    return [R, K("BILD ANALYSE -- Fehler"), R, "", `  ${trunc(b.fehler, 30)}`];
  }
  const dateiname = trunc(b.url.split("/").pop()?.split("?")[0] ?? "bild", 18);
  const zeilen: string[] = [
    R, K(`BILD ANALYSE -- ${dateiname}`), R,
    "", S("BILD-INFO"),
    WW("Format",    b.bild?.format ?? ""),
    WW("Auflösung", `${b.bild?.breite} x ${b.bild?.hoehe} px`),
    WW("Größe",     `${b.bild?.groesse_kb} KB`),
    "", S("HASHES"),
    WW("MD5",    trunc(b.hashes?.md5 ?? "", 22)),
    WW("SHA256", trunc(b.hashes?.sha256 ?? "", 22)),
    WW("pHash",  trunc(b.hashes?.phash ?? "", 22)),
  ];
  if (b.bewertung) {
    zeilen.push("", S(`VERDIKT: ${b.bewertung.stufe.toUpperCase()}`));
    zeilen.push(...wrap(b.bewertung.zusammenfassung));
  }
  if (b.exif?.verfuegbar) {
    zeilen.push("", S("EXIF-METADATEN"));
    if (b.exif.kamera)        zeilen.push(WW("Kamera",   trunc(b.exif.kamera, 20)));
    if (b.exif.objektiv)      zeilen.push(WW("Objektiv", trunc(b.exif.objektiv, 20)));
    if (b.exif.seriennummer)  zeilen.push(WW("Serien-Nr", trunc(b.exif.seriennummer, 19)));
    if (b.exif.aufnahmedatum) zeilen.push(WW("Datum",    trunc(b.exif.aufnahmedatum, 20)));
    if (b.exif.software)      zeilen.push(WW("Software", trunc(b.exif.software, 20)));
    if (b.exif.kuenstler)     zeilen.push(WW("Künstler", trunc(b.exif.kuenstler, 20)));
    if (b.exif.copyright)     zeilen.push(WW("Copyright",trunc(b.exif.copyright, 19)));
    if (b.exif.iso)           zeilen.push(WW("ISO",      String(b.exif.iso)));
    if (b.exif.blende)        zeilen.push(WW("Blende",   `f/${b.exif.blende}`));
    if (b.exif.gps) {
      zeilen.push(WW("GPS", `${b.exif.gps.lat}, ${b.exif.gps.lon}`));
      if (b.exif.gps.ort_name) zeilen.push(WW("Ort", trunc(b.exif.gps.ort_name, 22)));
      zeilen.push(`  Maps-Link  : (generiert)`);
    }
  } else {
    zeilen.push("", "  EXIF: Keine Metadaten vorhanden");
  }
  if (b.bewertung?.befunde.length) {
    zeilen.push("", S("BEFUNDE"));
    for (const h of b.bewertung.befunde) {
      const pfx = h.stufe === "hoch" ? "[!]" : h.stufe === "mittel" ? "[*]" : "[i]";
      zeilen.push(`  ${pfx}  ${trunc(h.meldung, 26)}`);
    }
  } else if (b.sicherheits_hinweise?.length) {
    zeilen.push("", S("SICHERHEITSANALYSE"));
    for (const h of b.sicherheits_hinweise) {
      const pfx = h.stufe === "hoch" ? "[!]" : "[i]";
      zeilen.push(`  ${pfx}  ${trunc(h.meldung, 26)}`);
    }
  }
  if (b.bewertung?.empfehlungen.length) {
    zeilen.push("", S("HANDLUNGSEMPFEHLUNGEN"));
    for (const e of b.bewertung.empfehlungen) zeilen.push(...wrap(e, 30, "  - "));
  }
  // Senior-Forensik 2026: Herkunft (C2PA), KI-Erzeugung, versteckte Daten
  const cc = b.content_credentials;
  if (cc?.hat_manifest) {
    zeilen.push("", S("HERKUNFT (C2PA)"));
    if (cc.erzeugt_von)   zeilen.push(WW("Erzeugt von", trunc(cc.erzeugt_von, 20)));
    if (cc.signiert_von)  zeilen.push(WW("Signiert", trunc(cc.signiert_von, 20)));
    if (cc.aktionen?.length) zeilen.push(WW("Aktionen", trunc(cc.aktionen.join(", "), 20)));
  }
  if (b.xmp?.ki_erzeugt) {
    zeilen.push("", S("AUTHENTIZITÄT"));
    zeilen.push("  [!]  Als KI-/algorithmisch erzeugt markiert");
  }
  if (b.versteckte_daten?.hat_trailing_data) {
    zeilen.push("", S("VERSTECKTE DATEN"));
    zeilen.push(`  [!]  ${b.versteckte_daten.trailing_bytes} Byte nach Datei-Ende`);
  }
  const ela = b.tiefenforensik?.ela;
  if (ela?.anwendbar) {
    zeilen.push("", S("TIEFEN-FORENSIK (ELA)"));
    zeilen.push(WW("Ø-Abweichung", String(ela.mittlere_abweichung)));
    if (ela.verdacht_auf_bearbeitung) zeilen.push("  [!]  Hinweis auf Bearbeitung");
  }
  if (b.suchlinks?.length) {
    zeilen.push("", S("REVERSE IMAGE LINKS"));
    for (const link of b.suchlinks) zeilen.push(`  [+]  ${trunc(link.name, 26)}`);
  }
  zeilen.push(...pivotsZuTerminal(b.pivots));
  zeilen.push("", `  Analysiert: ${b.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
  return zeilen;
}

// ─── Demo-Ausgaben für Module ohne Backend ────────────────────────

function erstelleDemoAusgabe(modulNummer: string, eingabe: string): string[] {
  const rahmen = (text: string) => [R, K(text), R];

  if (modulNummer === "1") return [
    ...rahmen("STATUS -- Systempruefung"),
    "", S("LIVE-BACKEND (Contabo VPS)"),
    "  [ok]  FastAPI · uvicorn · slowapi",
    "  [ok]  dnspython · python-whois",
    "  [ok]  httpx (TLS-verify + SSRF-Guard)",
    "  [ok]  WhatsMyName-DB cached",
    "  [ok]  Shodan InternetDB",
    "  [ok]  RIPEstat (RIPE NCC)",
    "  [ok]  crt.sh · Wayback · CommonCrawl",
    "", S("IDENTITAET / PERSON"),
    "  [ok]  [2] E-Mail Vollanalyse",
    "  ›  DNS · SPF · DMARC · Gravatar · GHunt · HIBP · XposedOrNot · LeakCheck · PGP · GitHub",
    "  [ok]  [12] Soziale Präsenz",
    "  ›  Bluesky · GitHub · Reddit · Mastodon · Keybase + Netzwerke + WhatsMyName 600+",
    "  [ok]  [4] Telefon Analyse",
    "  ›  Format · Carrier · Land · Zeitzone · Suchlinks",
    "  [ok]  [5] Reverse Image",
    "  ›  EXIF · GPS-Karte · pHash/aHash/dHash · 14 Reverse-Engines",
    "", S("INFRASTRUKTUR"),
    "  [ok]  [6] Domain & Shodan",
    "  ›  DNS · WHOIS · ASN · HTTP-Sec · Ports · CVEs",
    "  [ok]  [7] Subdomain-Recon",
    "  ›  crt.sh · Wayback · CommonCrawl · Live-Resolve",
    "  [ok]  [8] IP-Intel (RIPEstat)",
    "  ›  ASN · Prefix · AS-Holder · Abuse-Kontakt",
    "", S("AGGREGATION / META"),
    "  [ok]  [9] Orchestrator",
    "  ›  Auto-Pivot · Subdomains · Maltego-Graph",
  ];

  if (modulNummer === "4") {
    const landCode = eingabe.startsWith("+49") ? "DE" : eingabe.startsWith("+1") ? "US" : "XX";
    const carrier  = landCode === "DE" ? "T-Mobile / Telekom" : "Unknown Carrier";
    return [
      ...rahmen(`TELEFON -- ${eingabe.substring(0, 20)}`),
      "", "  [Demo-Modus]",
      "", S("BASISDATEN"),
      WW("Gueltig", "Ja"),
      WW("Land",    landCode),
      WW("Carrier", trunc(carrier, 20)),
      WW("Typ",     "mobile"),
      "", S("SUCHLINKS"),
      `  [1]  Facebook`,
      `  [2]  Truecaller`,
      "", "  Demo / keine echten Daten",
    ];
  }

  if (modulNummer === "6") {
    const dateiname = trunc(eingabe.split("/").pop() || "bild.jpg", 18);
    return [
      ...rahmen(`REVERSE IMAGE -- ${dateiname}`),
      "", "  [Demo-Modus]",
      "", S("BILD-HASHES"),
      WW("MD5",   "a1b2c3d4e5f6 (Demo)"),
      WW("pHash", "d4e5f6a1b2c3 (Demo)"),
      "", S("SUCHLINKS"),
      "  [1]  Google Lens",
      "  [2]  TinEye",
      "  [3]  Yandex Images",
      "", "  Demo / keine echten Daten",
    ];
  }

  return ["  Modul nicht verfuegbar"];
}

// ─── Echte API → Terminal-Format ─────────────────────────────────

function domainZuTerminal(d: DomainErgebnis): string[] {
  const zeilen: string[] = [
    R, K(`DOMAIN ANALYSE -- ${trunc(d.domain, 14)}`), R,
    "", S("DNS-RECORDS"),
  ];
  d.dns.a.slice(0, 3).forEach((ip, i) => zeilen.push(`  A  [${i + 1}]  ${ip}`));
  if (d.dns.aaaa.length) zeilen.push(`  AAAA  ${trunc(d.dns.aaaa[0], 24)}`);
  d.dns.mx.slice(0, 2).forEach(mx => zeilen.push(`  MX    ${trunc(mx, 24)}`));
  d.dns.ns.slice(0, 2).forEach(ns => zeilen.push(`  NS    ${trunc(ns, 24)}`));
  if (d.dns.spf)   zeilen.push(`  SPF   ${trunc(d.dns.spf, 26)}`);
  if (d.dns.dmarc) zeilen.push(`  DMARC ${trunc(d.dns.dmarc, 26)}`);

  zeilen.push("", S("PROVIDER / ASN"));
  zeilen.push(`  ${trunc(d.asn, 30)}`);

  zeilen.push("", S("WHOIS"));
  if (d.whois.registrar)      zeilen.push(WW("Registrar", trunc(String(d.whois.registrar), 18)));
  if (d.whois.registriert_am) zeilen.push(WW("Erstellt",  trunc(d.whois.registriert_am, 18)));
  if (d.whois.ablauf_am)      zeilen.push(WW("Ablauf",    trunc(d.whois.ablauf_am, 18)));
  if (d.whois.fehler)         zeilen.push(`  ${trunc(d.whois.fehler, 30)}`);

  zeilen.push("", S("HTTP"));
  zeilen.push(WW("Erreichbar", d.http.erreichbar ? "Ja" : "Nein"));
  if (d.http.status) zeilen.push(WW("Status",    String(d.http.status)));
  if (d.http.server) zeilen.push(WW("Server",    trunc(d.http.server, 20)));
  if (d.http.weiterleitungsziel) zeilen.push(WW("Redirect", trunc(d.http.weiterleitungsziel, 18)));

  const sv = d.sicherheits_bewertung;
  zeilen.push("", S("SICHERHEITSBEWERTUNG"));
  zeilen.push(`  Score: ${sv.punkte}/${sv.max} (${sv.prozent}%) — ${sv.note.toUpperCase()}`);
  for (const det of sv.details) {
    zeilen.push(`  ${det.ok ? "[ok]" : "[--]"}  ${trunc(det.check, 24)}`);
  }

  zeilen.push("", `  Analysiert: ${d.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
  return zeilen;
}

function emailZuTerminal(e: EmailErgebnis): string[] {
  if (!e.gueltig) {
    return [R, K("E-MAIL ANALYSE -- Fehler"), R, "", `  ${trunc(e.fehler ?? "Ungueltige Adresse", 30)}`];
  }
  const zeilen: string[] = [
    R, K(`E-MAIL -- ${trunc(e.adresse ?? "", 22)}`), R,
    "", S("SYNTAX"),
    WW("Format",   "Gueltig"),
    WW("Domain",   trunc(e.syntax?.domain ?? "?", 20)),
    WW("Lokal",    trunc(e.syntax?.lokal_teil ?? "?", 20)),
    "", S("DOMAIN-DNS"),
    WW("MX-Records", e.domain?.hat_mx ? `Ja (${e.domain.mx_records.length})` : "Nein"),
  ];
  if (e.domain?.spf)   zeilen.push(`  SPF   ${trunc(e.domain.spf, 26)}`);
  if (e.domain?.dmarc) zeilen.push(`  DMARC ${trunc(e.domain.dmarc, 26)}`);

  zeilen.push("", S("KLASSIFIKATION"));
  zeilen.push(WW("Wegwerf",    e.klassifikation?.wegwerf ? "JA" : "Nein"));
  zeilen.push(WW("Zustellbar", e.klassifikation?.zustellbar ? "Ja" : "Nein"));

  if (e.datenleck) {
    zeilen.push("", S("DATENLECK (HIBP)"));
    if (!e.datenleck.geprueft) {
      zeilen.push("  Status: HIBP nicht erreichbar");
    } else if (e.datenleck.domain_betroffen) {
      zeilen.push("  [!]  In oeffentlichen Leaks");
      if (e.datenleck.anzahl_nutzer) zeilen.push(`  Nutzer: ~${e.datenleck.anzahl_nutzer}`);
    } else {
      zeilen.push("  [ok]  Keine bekannten Leaks");
    }
  }

  if (e.risiko) {
    const rm: Record<string, string> = { Hoch: "HOCH", Mittel: "MITTEL", Gering: "GERING", Keines: "KEINES" };
    zeilen.push("", S("RISIKOBEWERTUNG"));
    zeilen.push(`  ${rm[e.risiko.stufe] ?? e.risiko.stufe} (${e.risiko.punkte} Punkte)`);
    for (const det of e.risiko.details) zeilen.push(`  [!]  ${trunc(det, 26)}`);
  }

  zeilen.push("", `  Analysiert: ${e.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
  return zeilen;
}

// ─── Soziale Präsenz (offene Plattformen + Walled Gardens) ──────────

function sozialePraesenzZuTerminal(s: SozialePraesenzErgebnis): string[] {
  if (s.fehler) {
    return [R, K("SOZIALE PRAESENZ -- Fehler"), R, "", `  ${trunc(s.fehler, 30)}`];
  }
  const z = s.zusammenfassung;
  const zeilen: string[] = [
    R, K(`SOZIALE PRAESENZ -- ${trunc(s.benutzername, 14)}`), R,
  ];
  if (z) {
    zeilen.push("", S("ZUSAMMENFASSUNG"));
    zeilen.push(WW("Modus", s.modus === "vollscan" ? "Vollscan (600+)" : "Schnell"));
    zeilen.push(WW("Offen", `${z.offen_gefunden}/${z.geprueft_offen} gefunden`));
    zeilen.push(WW("Netzwerke", `${z.walled_geprueft}/${z.walled_gesamt} geprüft`));
    if ((z.weitere_geprueft ?? 0) > 0) {
      zeilen.push(WW("Weitere", `${z.weitere_gefunden}/${z.weitere_geprueft} (WhatsMyName)`));
    }
  }

  zeilen.push("", S("OFFENE PLATTFORMEN"));
  const offen = s.offene_plattformen ?? [];
  const treffer = offen.filter((p) => p.gefunden);
  if (treffer.length === 0) {
    zeilen.push("  Keine offenen Profile gefunden");
  } else {
    for (const p of treffer) {
      zeilen.push(`  [+]  ${trunc(p.plattform, 12)}${p.anzeigename ? "  " + trunc(p.anzeigename, 14) : ""}`);
      if (typeof p.follower === "number") zeilen.push(`         ${p.follower} Follower/Karma`);
    }
  }

  zeilen.push("", S("GROSSE NETZWERKE (login-geschützt)"));
  for (const w of s.walled_gardens ?? []) {
    const sym = w.existenz === true ? "[+]" : w.existenz === false ? "[-]" : "[?]";
    const zusatz = w.existenz === true && w.anzeigename ? "  " + trunc(w.anzeigename, 14)
      : w.existenz === null ? "  (nur Link/Dork)" : "";
    zeilen.push(`  ${sym}  ${trunc(w.plattform, 12)}${zusatz}`);
  }

  const weitere = s.weitere_plattformen ?? [];
  if (weitere.length) {
    zeilen.push("", S("WEITERE PLATTFORMEN (WhatsMyName)"));
    for (const w of weitere.slice(0, 20)) {
      const kSym = w.konfidenz === "hoch" ? "[++]" : w.konfidenz === "mittel" ? "[+]" : "[?]";
      zeilen.push(`  ${kSym}  ${trunc(w.plattform ?? "", 26)}`);
    }
    if (weitere.length > 20) zeilen.push(`  ... +${weitere.length - 20} weitere`);
  }

  if (s.wer_ist_das?.length) {
    zeilen.push("", S("WER IST DAS?"));
    for (const w of s.wer_ist_das.slice(0, 6)) {
      const kSym = w.konfidenz === "hoch" ? "[++]" : "[+]";
      zeilen.push(`  ${kSym}  ${trunc(w.quelle + ": " + w.wert, 28)}`);
    }
  }

  zeilen.push(...pivotsZuTerminal(s.pivots));
  zeilen.push("", `  Analysiert: ${s.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
  return zeilen;
}

// ═══════════════════════════════════════════════════════════════════
// SENIOR-ELITE RENDERER — konsolidiert (8 Module)
// ═══════════════════════════════════════════════════════════════════

// ─── E-Mail VOLLANALYSE: merge Basis (DNS/MX/SPF) + Recon (GHunt) ──

function emailVollZuTerminal(e: EmailErgebnis, r: EmailReconErgebnis | null): string[] {
  if (!e.gueltig) {
    return [R, K("E-MAIL VOLLANALYSE -- Fehler"), R, "", `  ${trunc(e.fehler ?? "Ungueltige Adresse", 30)}`];
  }
  const zeilen: string[] = [
    R, K(`E-MAIL VOLL -- ${trunc(e.adresse ?? "", 18)}`), R,
    "", S("SYNTAX & KLASSIFIKATION"),
    WW("Format",     "Gueltig"),
    WW("Domain",     trunc(e.syntax?.domain ?? "?", 20)),
    WW("Lokal",      trunc(e.syntax?.lokal_teil ?? "?", 20)),
    WW("Wegwerf",    e.klassifikation?.wegwerf ? "JA" : "Nein"),
    WW("Zustellbar", e.klassifikation?.zustellbar ? "Ja" : "Nein"),
  ];

  // DNS aus Basis
  zeilen.push("", S("DOMAIN-DNS"));
  zeilen.push(WW("MX-Records", e.domain?.hat_mx ? `Ja (${e.domain.mx_records.length})` : "Nein"));
  if (e.domain?.spf)   zeilen.push(`  SPF   ${trunc(e.domain.spf, 26)}`);
  if (e.domain?.dmarc) zeilen.push(`  DMARC ${trunc(e.domain.dmarc, 26)}`);

  // Hashes aus Recon
  if (r?.hashes) {
    zeilen.push("", S("HASHES (Cross-Ref)"));
    zeilen.push(WW("MD5",    trunc(r.hashes.md5, 22)));
    zeilen.push(WW("SHA-1",  trunc(r.hashes.sha1, 22)));
  }

  // Gravatar aus Recon
  if (r?.gravatar) {
    zeilen.push("", S("GRAVATAR"));
    if (r.gravatar.gefunden) {
      zeilen.push("  [ok]  Profil gefunden");
      const pd = r.gravatar.profil_daten;
      if (pd?.anzeigename)  zeilen.push(WW("Name", trunc(pd.anzeigename, 20)));
      if (pd?.benutzername) zeilen.push(WW("User", trunc(pd.benutzername, 20)));
      if (pd?.ort)          zeilen.push(WW("Ort",  trunc(pd.ort, 20)));
      const konten = pd?.verifizierte_konten ?? [];
      if (konten.length) {
        zeilen.push("  Verknuepfte Konten:");
        for (const k of konten.slice(0, 4)) {
          zeilen.push(`    ${k.verifiziert ? "[++]" : "[+]"}  ${trunc(k.name, 22)}`);
        }
      }
    } else {
      zeilen.push("  [-]  Kein Gravatar-Profil");
    }
  }

  // Google GAIA aus Recon
  if (r?.google) {
    zeilen.push("", S("GOOGLE (GAIA)"));
    if (r.google.google_konto_wahrscheinlich) {
      zeilen.push("  [+]  Gmail-Konto wahrscheinlich");
      zeilen.push("  Pivot-Links:");
      for (const key of Object.keys(r.google.links ?? {}).slice(0, 4)) {
        zeilen.push(`    [+]  ${trunc(key.replace(/_/g, " "), 22)}`);
      }
    } else {
      zeilen.push("  [-]  Kein Google-Signal");
    }
  }

  // HIBP — nutze tiefere Recon-Variante falls verfügbar, sonst Basis-Variante
  zeilen.push("", S("HIBP DATENLECKS"));
  if (r?.hibp?.geprueft && r.hibp.domain_betroffen) {
    zeilen.push(`  [!]  ${r.hibp.anzahl_breaches} Breach(es) fuer Domain`);
    for (const b of (r.hibp.breaches ?? []).slice(0, 4)) {
      zeilen.push(`    [!]  ${trunc(b.titel, 18)} (${b.datum})`);
    }
  } else if (r?.hibp?.geprueft) {
    zeilen.push("  [ok]  Keine bekannten Breaches");
  } else if (e.datenleck?.domain_betroffen) {
    zeilen.push("  [!]  In oeffentlichen Leaks");
    if (e.datenleck.anzahl_nutzer) zeilen.push(`  Nutzer: ~${e.datenleck.anzahl_nutzer}`);
  } else {
    zeilen.push("  HIBP nicht erreichbar");
  }

  // XposedOrNot — Email-Level Breach (HIBP-Replacement)
  if (r?.xposedornot?.geprueft) {
    zeilen.push("", S("XPOSEDORNOT BREACHES"));
    const n = r.xposedornot.anzahl_breaches ?? 0;
    if (n > 0) {
      zeilen.push(`  [!]  ${n} Email-Level Breach(es)`);
      for (const name of (r.xposedornot.breaches ?? []).slice(0, 5)) {
        zeilen.push(`    [!]  ${trunc(name, 26)}`);
      }
      const exposed = r.xposedornot.exposed_fields ?? [];
      if (exposed.length) {
        zeilen.push("  Exposed Fields:");
        for (const f of exposed.slice(0, 4)) {
          const clean = f.replace(/^data_/, "");
          zeilen.push(`    [+]  ${trunc(clean, 26)}`);
        }
      }
      if ((r.xposedornot.pastes_count ?? 0) > 0) {
        zeilen.push(`  Pastes: ${r.xposedornot.pastes_count}`);
      }
    } else {
      zeilen.push("  [ok]  Email nicht in Breach-DBs");
    }
  }

  // LeakCheck — 3. Index-Quelle
  if (r?.leakcheck?.geprueft) {
    zeilen.push("", S("LEAKCHECK"));
    const n = r.leakcheck.anzahl ?? 0;
    if (n > 0) {
      zeilen.push(`  [!]  ${n} weitere Breach-Quelle(n)`);
      for (const s of (r.leakcheck.sources ?? []).slice(0, 4)) {
        const ds = s.datum ? ` (${s.datum})` : "";
        zeilen.push(`    [!]  ${trunc(s.name + ds, 26)}`);
      }
    } else {
      zeilen.push("  [ok]  Keine LeakCheck-Treffer");
    }
  }

  // PGP Keyserver — Existenz-Check
  if (r?.pgp?.geprueft) {
    zeilen.push("", S("PGP KEYSERVER"));
    if (r.pgp.hat_pgp_key) {
      zeilen.push(`  [+]  ${r.pgp.anzahl} PGP-Key(s) - sicherheitsaffin`);
      for (const k of (r.pgp.keys ?? []).slice(0, 2)) {
        zeilen.push(`    Fingerprint: ${trunc(k.fingerprint, 20)}`);
      }
    } else {
      zeilen.push("  [-]  Kein PGP-Key gefunden");
    }
  }

  // GitHub aus Recon
  if (r?.github) {
    zeilen.push("", S("GITHUB-DISCOVERY"));
    if (r.github.gefunden) {
      zeilen.push(`  [+]  ${r.github.treffer} GitHub-Konto(s)`);
      for (const n of (r.github.nutzer ?? []).slice(0, 3)) {
        zeilen.push(`    [+]  @${trunc(n.login, 22)}`);
      }
      for (const name of (r.github.klarnamen ?? []).slice(0, 3)) {
        zeilen.push(`    Name: ${trunc(name, 24)}`);
      }
      if ((r.github.repositories?.length ?? 0) > 0) {
        zeilen.push("  Repos:");
        for (const repo of r.github.repositories!.slice(0, 4)) {
          zeilen.push(`    [+]  ${trunc(repo.name, 26)}`);
        }
      }
    } else {
      zeilen.push(`  [-]  ${trunc(r.github.hinweis ?? "Keine GitHub-Treffer", 30)}`);
    }
  }

  // WER IST DAS aus Recon
  if ((r?.wer_ist_das?.length ?? 0) > 0) {
    zeilen.push("", S("WER IST DAS?"));
    for (const w of r!.wer_ist_das!.slice(0, 6)) {
      const kSym = w.konfidenz === "hoch" ? "[++]" : "[+]";
      zeilen.push(`  ${kSym}  ${trunc(w.quelle + ": " + w.wert, 28)}`);
    }
  }

  // Risiko — nimm den höheren der beiden
  const rmBasis  = e.risiko?.punkte ?? 0;
  const rmRecon  = r?.risiko?.punkte ?? 0;
  if (e.risiko || r?.risiko) {
    zeilen.push("", S("RISIKO-BEWERTUNG"));
    const stufe = rmRecon >= rmBasis ? (r?.risiko?.stufe ?? "?") : (e.risiko?.stufe ?? "?");
    const total = rmBasis + rmRecon;
    zeilen.push(`  ${String(stufe).toUpperCase()} (${total} Punkte gesamt)`);
    for (const d of e.risiko?.details ?? [])    zeilen.push(`  [!]  ${trunc(d, 26)}`);
    for (const d of r?.risiko?.details ?? [])   zeilen.push(`  [!]  ${trunc(d, 26)}`);
  }

  // EmailRep.io — Reputation + verknüpfte Profile
  if (r?.emailrep?.geprueft) {
    zeilen.push("", S("EMAILREP REPUTATION"));
    if (r.emailrep.reputation) zeilen.push(WW("Reputation", String(r.emailrep.reputation)));
    if (r.emailrep.data_breach || r.emailrep.credentials_leaked)
      zeilen.push("  [!]  In Breach-/Leak-Daten gesehen");
    if (r.emailrep.boesartige_aktivitaet) zeilen.push("  [!]  Bösartige Aktivität gemeldet");
    for (const p of (r.emailrep.profile ?? []).slice(0, 6)) zeilen.push(`  [+]  Profil: ${trunc(String(p), 22)}`);
  }

  // Exponierte Datenklassen (was wurde konkret geleakt?)
  if (r?.exponierte_datenklassen?.length) {
    zeilen.push("", S("EXPONIERTE DATENKLASSEN"));
    for (const k of r.exponierte_datenklassen.slice(0, 12)) zeilen.push(`  [!]  ${trunc(k, 28)}`);
  }

  zeilen.push(...pivotsZuTerminal(r?.pivots));
  zeilen.push("", `  Analysiert: ${e.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
  return zeilen;
}

// ─── Username Vollscan (WhatsMyName 600+) ───────────────────────

// ─── Domain & Shodan VOLLANALYSE: merge DNS/WHOIS/HTTP + Shodan ─

function domainVollZuTerminal(d: DomainErgebnis, s: ShodanErgebnis | null): string[] {
  const zeilen: string[] = [
    R, K(`DOMAIN VOLL -- ${trunc(d.domain, 18)}`), R,
    "", S("DNS-RECORDS"),
  ];
  d.dns.a.slice(0, 3).forEach((ip, i) => zeilen.push(`  A  [${i + 1}]  ${ip}`));
  if (d.dns.aaaa.length) zeilen.push(`  AAAA  ${trunc(d.dns.aaaa[0], 24)}`);
  d.dns.mx.slice(0, 2).forEach(mx => zeilen.push(`  MX    ${trunc(mx, 24)}`));
  d.dns.ns.slice(0, 2).forEach(ns => zeilen.push(`  NS    ${trunc(ns, 24)}`));
  if (d.dns.spf)   zeilen.push(`  SPF   ${trunc(d.dns.spf, 26)}`);
  if (d.dns.dmarc) zeilen.push(`  DMARC ${trunc(d.dns.dmarc, 26)}`);

  zeilen.push("", S("PROVIDER / ASN"));
  zeilen.push(`  ${trunc(d.asn, 30)}`);

  zeilen.push("", S("WHOIS"));
  if (d.whois.registrar)      zeilen.push(WW("Registrar", trunc(String(d.whois.registrar), 18)));
  if (d.whois.registriert_am) zeilen.push(WW("Erstellt",  trunc(d.whois.registriert_am, 18)));
  if (d.whois.ablauf_am)      zeilen.push(WW("Ablauf",    trunc(d.whois.ablauf_am, 18)));
  if (d.whois.fehler)         zeilen.push(`  ${trunc(d.whois.fehler, 30)}`);

  zeilen.push("", S("HTTP"));
  zeilen.push(WW("Erreichbar", d.http.erreichbar ? "Ja" : "Nein"));
  if (d.http.status) zeilen.push(WW("Status", String(d.http.status)));
  if (d.http.server) zeilen.push(WW("Server", trunc(d.http.server, 20)));
  if (d.http.weiterleitungsziel) zeilen.push(WW("Redirect", trunc(d.http.weiterleitungsziel, 18)));

  const sv = d.sicherheits_bewertung;
  zeilen.push("", S("HTTP-SICHERHEIT"));
  zeilen.push(`  Score: ${sv.punkte}/${sv.max} (${sv.prozent}%) -- ${sv.note.toUpperCase()}`);
  for (const det of sv.details) {
    zeilen.push(`  ${det.ok ? "[ok]" : "[--]"}  ${trunc(det.check, 24)}`);
  }

  // ─── Shodan-Ergänzung ─────────────────────────────────────────
  if (s && !s.fehler && s.aggregiert) {
    const a = s.aggregiert;
    zeilen.push("", S("SHODAN: OFFENE PORTS"));
    if (a.ports_anzahl === 0) {
      zeilen.push("  [ok]  Keine Ports in Shodan-DB");
    } else {
      zeilen.push(WW("Anzahl", String(a.ports_anzahl)));
      for (const p of a.ports.slice(0, 8)) {
        const pSym = p.gefaehrlich ? "[!]" : "[+]";
        const svc  = p.service ? trunc(p.service, 18) : "";
        zeilen.push(`  ${pSym}  ${String(p.port).padEnd(6)} ${svc}`);
      }
      if (a.ports.length > 8) zeilen.push(`  ... +${a.ports.length - 8} weitere`);
    }

    zeilen.push("", S("SHODAN: VULNS (CVE)"));
    if (a.vulns_anzahl === 0) {
      zeilen.push("  [ok]  Keine bekannten CVEs");
    } else {
      zeilen.push(WW("Anzahl", String(a.vulns_anzahl)));
      for (const v of a.vulns.slice(0, 6)) zeilen.push(`  [!]  ${trunc(v, 26)}`);
      if (a.vulns.length > 6) zeilen.push(`  ... +${a.vulns.length - 6} weitere`);
    }

    if (a.tags.length) {
      zeilen.push("", S("SHODAN: TAGS"));
      for (const t of a.tags.slice(0, 5)) zeilen.push(`  [#]  ${trunc(t.tag + ": " + t.bedeutung, 28)}`);
    }

    if (s.risiko) {
      zeilen.push("", S("SHODAN-RISIKO"));
      zeilen.push(`  Score: ${s.risiko.punkte}/${s.risiko.max} -- ${s.risiko.stufe.toUpperCase()}`);
      for (const dt of s.risiko.details) {
        const dSym = dt.stufe === "hoch" ? "[!]" : "[i]";
        zeilen.push(`  ${dSym}  ${trunc(dt.meldung, 26)}`);
      }
    }
  } else if (s?.fehler) {
    zeilen.push("", S("SHODAN"));
    zeilen.push(`  ${trunc(s.fehler, 30)}`);
  }

  zeilen.push(...pivotsZuTerminal(d.pivots));
  zeilen.push("", `  Analysiert: ${d.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
  return zeilen;
}

// ─── Shodan standalone (für Orchestrator-Reuse) ─────────────────

function shodanZuTerminal(s: ShodanErgebnis): string[] {
  if (s.fehler) return [R, K("SHODAN -- Fehler"), R, "", `  ${trunc(s.fehler, 30)}`];
  const r = s.risiko!;
  const a = s.aggregiert!;
  const zeilen: string[] = [
    R, K(`SHODAN -- ${trunc(s.ziel, 25)}`), R,
    "", S("ZIEL"),
    WW("Typ",       s.eingabe_typ ?? "?"),
    WW("IPs",       `${s.ip_count ?? 0} aufgeloest`),
    "", S("OFFENE PORTS"),
    WW("Anzahl",    String(a.ports_anzahl)),
  ];
  for (const p of a.ports.slice(0, 8)) {
    const pSym = p.gefaehrlich ? "[!]" : "[+]";
    const svc  = p.service ? trunc(p.service, 18) : "";
    zeilen.push(`  ${pSym}  ${String(p.port).padEnd(6)} ${svc}`);
  }
  if (a.ports.length > 8) zeilen.push(`  ... +${a.ports.length - 8} weitere`);

  zeilen.push("", S("VULNS (CVE)"));
  if (a.vulns_anzahl === 0) {
    zeilen.push("  [ok]  Keine bekannten CVEs");
  } else {
    zeilen.push(WW("Anzahl", String(a.vulns_anzahl)));
    for (const v of a.vulns.slice(0, 6)) zeilen.push(`  [!]  ${trunc(v, 26)}`);
    if (a.vulns.length > 6) zeilen.push(`  ... +${a.vulns.length - 6} weitere`);
  }

  if (a.tags.length) {
    zeilen.push("", S("TAGS"));
    for (const t of a.tags.slice(0, 6)) zeilen.push(`  [#]  ${trunc(t.tag + ": " + t.bedeutung, 28)}`);
  }
  if (a.hostnames.length) {
    zeilen.push("", S("rDNS-HOSTNAMES"));
    for (const h of a.hostnames.slice(0, 4)) zeilen.push(`  ${trunc(h, 30)}`);
  }

  zeilen.push("", S("RISIKO"));
  zeilen.push(`  Score: ${r.punkte}/${r.max} -- ${r.stufe.toUpperCase()}`);
  for (const d of r.details) {
    const dSym = d.stufe === "hoch" ? "[!]" : d.stufe === "mittel" ? "[!]" : "[i]";
    zeilen.push(`  ${dSym}  ${trunc(d.meldung, 26)}`);
  }
  zeilen.push("", `  Quelle: Shodan InternetDB`,
              `  Analysiert: ${s.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
  return zeilen;
}

// ─── Modul 9: E-Mail Tiefen-Recon ───────────────────────────────

function emailReconZuTerminal(e: EmailReconErgebnis): string[] {
  if (!e.gueltig) return [R, K("EMAIL-RECON -- Fehler"), R, "", `  ${trunc(e.fehler ?? "ungueltig", 30)}`];
  const zeilen: string[] = [
    R, K(`EMAIL-RECON -- ${trunc(e.email, 18)}`), R,
    "", S("BASIS"),
    WW("Domain",  trunc(e.domain ?? "", 20)),
    WW("MD5",     trunc(e.hashes?.md5 ?? "", 20)),
  ];

  zeilen.push("", S("GRAVATAR"));
  if (e.gravatar?.gefunden) {
    zeilen.push("  [ok]  Profil gefunden");
    if (e.gravatar.profil_daten?.anzeigename) zeilen.push(WW("Name", trunc(e.gravatar.profil_daten.anzeigename, 20)));
    if (e.gravatar.profil_daten?.benutzername) zeilen.push(WW("User", trunc(e.gravatar.profil_daten.benutzername, 20)));
    if (e.gravatar.profil_daten?.ort) zeilen.push(WW("Ort", trunc(e.gravatar.profil_daten.ort, 20)));
    const konten = e.gravatar.profil_daten?.verifizierte_konten ?? [];
    if (konten.length) {
      zeilen.push("  Verknuepfte Konten:");
      for (const k of konten.slice(0, 4)) {
        const vSym = k.verifiziert ? "[++]" : "[+]";
        zeilen.push(`    ${vSym}  ${trunc(k.name, 22)}`);
      }
    }
  } else {
    zeilen.push("  [-]  Kein Gravatar-Profil");
  }

  zeilen.push("", S("GOOGLE (GAIA)"));
  if (e.google?.google_konto_wahrscheinlich) {
    zeilen.push("  [+]  Gmail-Konto wahrscheinlich");
    zeilen.push("  Pivot-Links generiert:");
    for (const key of Object.keys(e.google.links ?? {}).slice(0, 4)) {
      zeilen.push(`    [+]  ${trunc(key.replace(/_/g, " "), 22)}`);
    }
  } else {
    zeilen.push("  [-]  Kein Google-Signal");
  }

  zeilen.push("", S("HIBP BREACHES"));
  if (!e.hibp?.geprueft) {
    zeilen.push(`  ${trunc(e.hibp?.hinweis ?? "HIBP nicht erreichbar", 30)}`);
  } else if (e.hibp.domain_betroffen) {
    zeilen.push(`  [!]  ${e.hibp.anzahl_breaches} Breach(es) fuer Domain`);
    for (const b of (e.hibp.breaches ?? []).slice(0, 4)) {
      zeilen.push(`    [!]  ${trunc(b.titel, 18)} (${b.datum})`);
    }
  } else {
    zeilen.push("  [ok]  Keine bekannten Breaches");
  }

  zeilen.push("", S("GITHUB"));
  if (e.github?.gefunden) {
    zeilen.push(`  [+]  ${e.github.treffer} GitHub-Konto(s)`);
    for (const n of (e.github.nutzer ?? []).slice(0, 3)) {
      zeilen.push(`    [+]  @${trunc(n.login, 22)}`);
    }
  } else {
    zeilen.push(`  [-]  ${trunc(e.github?.hinweis ?? "Keine GitHub-Treffer", 30)}`);
  }

  if ((e.wer_ist_das?.length ?? 0) > 0) {
    zeilen.push("", S("WER IST DAS?"));
    for (const w of e.wer_ist_das!.slice(0, 6)) {
      const kSym = w.konfidenz === "hoch" ? "[++]" : "[+]";
      zeilen.push(`  ${kSym}  ${trunc(w.quelle + ": " + w.wert, 28)}`);
    }
  }

  if (e.risiko) {
    zeilen.push("", S("RISIKO"));
    zeilen.push(`  ${e.risiko.stufe.toUpperCase()} (${e.risiko.punkte} Punkte)`);
    for (const d of e.risiko.details) zeilen.push(`  [!]  ${trunc(d, 26)}`);
  }

  zeilen.push("", `  Analysiert: ${e.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
  return zeilen;
}

// ─── Modul 10: Orchestrator (SpiderFoot-Style mit Graph) ────────

function orchestratorZuTerminal(o: OrchestratorErgebnis): string[] {
  if (o.fehler) return [R, K("ORCHESTRATOR -- Fehler"), R, "", `  ${trunc(o.fehler, 30)}`];
  const g = o.graph!;
  const zeilen: string[] = [
    R, K(`ORCHESTRATOR -- ${trunc(o.eingabe, 16)}`), R,
    "", S("AUTO-ERKENNUNG"),
    WW("Typ",       o.typ.toUpperCase()),
    WW("Tiefe",     String(o.tiefe ?? 2)),
    WW("Module",    String(o.zusammenfassung?.module_ausgefuehrt.length ?? 0)),
    "", S("GRAPH-STATISTIK"),
    WW("Knoten",    String(g.statistik.knoten_gesamt)),
    WW("Kanten",    String(g.statistik.kanten_gesamt)),
    WW("Pivots",    String(o.zusammenfassung?.pivots_entdeckt ?? 0)),
  ];
  zeilen.push("", S("KNOTEN NACH TYP"));
  for (const [typ, anzahl] of Object.entries(g.statistik.nach_typ)) {
    zeilen.push(`  [#]  ${typ.padEnd(12)} ${anzahl}`);
  }
  zeilen.push("", S("AUSGEFUEHRTE MODULE"));
  for (const m of o.zusammenfassung?.module_ausgefuehrt ?? []) {
    zeilen.push(`  [ok]  ${trunc(m, 28)}`);
  }
  zeilen.push("", S("ENTDECKTE PIVOTS"));
  const pivots = g.nodes.filter(n => !n.daten.primaer).slice(0, 8);
  for (const p of pivots) {
    zeilen.push(`  [>]  ${trunc(`${p.typ}: ${p.label}`, 30)}`);
  }
  if (g.nodes.length - 1 > 8) {
    zeilen.push(`  ... +${g.nodes.length - 1 - 8} weitere`);
  }
  zeilen.push("", `  Graph in JSON-Export verfuegbar`,
              `  Analysiert: ${o.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
  return zeilen;
}

// ─── Modul 9: Subdomain-Recon ───────────────────────────────────

function subdomainZuTerminal(s: SubdomainErgebnis): string[] {
  if (s.fehler) return [R, K("SUBDOMAIN-RECON -- Fehler"), R, "", `  ${trunc(s.fehler, 30)}`];
  const z = s.zusammenfassung;
  const zeilen: string[] = [
    R, K(`SUBDOMAINS -- ${trunc(s.domain, 17)}`), R,
    "", S("ZUSAMMENFASSUNG"),
    WW("Eindeutig", String(z?.gesamt_eindeutig ?? 0)),
    WW("Angezeigt", String(z?.angezeigt ?? 0)),
  ];
  if (z?.live_aufgeloest != null) zeilen.push(WW("Live", `${z.live_aufgeloest} aktiv`));
  zeilen.push("", S("QUELLEN-STATUS"));
  if (s.quellen) {
    for (const [name, meta] of Object.entries(s.quellen)) {
      const val = meta.ok ? `${meta.anzahl ?? 0} Treffer` : (meta.hinweis ?? "Fehler");
      zeilen.push(`  ${meta.ok ? "[ok]" : "[--]"}  ${name.padEnd(12)} ${val}`);
    }
  }
  zeilen.push("", S("SUBDOMAINS"));
  for (const d of (s.subdomains ?? []).slice(0, 40)) {
    const mark = d.aktiv === true ? "[+]" : d.aktiv === false ? "[--]" : "  •";
    zeilen.push(`  ${mark}  ${trunc(d.host, 30)}`);
  }
  const rest = (s.subdomains?.length ?? 0) - 40;
  if (rest > 0) zeilen.push(`  ... +${rest} weitere`);
  zeilen.push("", `  Quellen: crt.sh · Wayback · CommonCrawl`,
              `  Analysiert: ${s.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
  return zeilen;
}

// ─── Modul 10: IP-Intel (RIPEstat) ───────────────────────────────

function censysZuTerminal(c: CensysErgebnis): string[] {
  const z: string[] = [];
  z.push(R); z.push(K(`CENSYS — ${trunc(c.ziel, 22)}`)); z.push(R); z.push("");
  if (c.fehler) { z.push(`  [Fehler] ${c.fehler}`); return z; }
  if (c.verfuegbar === false) { z.push(`  ${c.hinweis ?? "Censys nicht aktiviert"}`); return z; }
  const h = (c.hosts ?? []).find((x) => x.in_censys);
  if (!h) { z.push("  Kein Censys-Datensatz gefunden."); return z; }
  z.push(S("STANDORT"));
  z.push(WW("Ort", [h.standort?.stadt, h.standort?.land].filter(Boolean).join(", ") || "—"));
  z.push(WW("AS", h.autonomes_system?.asn != null ? `AS${h.autonomes_system.asn} ${h.autonomes_system.name ?? ""}`.trim() : "—"));
  if (h.whois_organisation?.name) z.push(WW("Org", trunc(h.whois_organisation.name, 24)));
  z.push(""); z.push(S(`DIENSTE (${h.ports_anzahl ?? 0})`));
  (h.dienste ?? []).slice(0, 20).forEach((d) =>
    z.push(WW(String(d.port), `${d.protokoll ?? d.service ?? ""}${d.gefaehrlich ? " !" : ""}`)));
  if (h.whois_organisation?.abuse_kontakte?.length) {
    z.push(""); z.push(S("ABUSE-KONTAKT"));
    h.whois_organisation.abuse_kontakte.slice(0, 4).forEach((m) => z.push(WW("Mail", trunc(m, 26))));
  }
  if (h.reverse_dns?.length) {
    z.push(""); z.push(S("REVERSE-DNS"));
    h.reverse_dns.slice(0, 6).forEach((n) => z.push(`  ${trunc(n, 30)}`));
  }
  return z;
}

function ipIntelZuTerminal(r: IpIntelErgebnis): string[] {
  if (r.fehler) return [R, K("IP-INTEL -- Fehler"), R, "", `  ${trunc(r.fehler, 30)}`];
  const zeilen: string[] = [
    R, K(`IP-INTEL -- ${trunc(r.ip ?? r.ziel, 19)}`), R,
    "", S("ROUTING"),
  ];
  if (r.routing?.prefix) zeilen.push(WW("Prefix", trunc(r.routing.prefix, 20)));
  if (r.routing?.prefix_inhaber) zeilen.push(WW("Inhaber", trunc(r.routing.prefix_inhaber, 20)));
  if (r.routing?.asns?.length) zeilen.push(WW("ASN", r.routing.asns.map((a) => `AS${a}`).join(", ")));
  if (r.as?.holder || r.as?.asn != null) {
    zeilen.push("", S("AUTONOMES SYSTEM"));
    if (r.as?.asn != null) zeilen.push(WW("ASN", `AS${r.as.asn}`));
    if (r.as?.holder) zeilen.push(WW("Betreiber", trunc(r.as.holder, 20)));
    if (r.as?.typ) zeilen.push(WW("Typ", r.as.typ));
  }
  const g = r.geo;
  if (g?.geprueft) {
    zeilen.push("", S("GEO / IPINFO"));
    const ort = [g.stadt, g.region, g.land].filter(Boolean).join(", ");
    if (ort) zeilen.push(WW("Standort", trunc(ort, 20)));
    if (g.firma || g.org) zeilen.push(WW("Org", trunc(String(g.firma ?? g.org), 20)));
    if (g.hostname) zeilen.push(WW("Hostname", trunc(g.hostname, 20)));
    const flags = [g.vpn && "VPN", g.proxy && "Proxy", g.tor && "Tor", g.hosting && "Hosting"].filter(Boolean);
    if (flags.length) zeilen.push(`  [!]  Anonymisiert: ${flags.join(", ")}`);
    if (g.abuse_email) zeilen.push(WW("Abuse", trunc(g.abuse_email, 20)));
  }
  if (r.abuse_kontakte?.length) {
    zeilen.push("", S("ABUSE-KONTAKT"));
    for (const m of r.abuse_kontakte.slice(0, 4)) zeilen.push(`  [@]  ${trunc(m, 28)}`);
  }
  zeilen.push("", `  Quelle: RIPEstat${r.geo?.geprueft ? " + IPinfo" : ""}`,
              `  Analysiert: ${r.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
  return zeilen;
}

// ─── Download-Utilities ──────────────────────────────────────────
// Desktop: Standard Blob-Download via <a download>.
// iOS: Ausschließlich Web Share API — kein Blob-Fallback.
//   Blob-Downloads auf iOS landen in der Safari-Downloadliste und erzeugen
//   eine navigierbare Blob-URL. Das QuickLook-Preview re-navigiert diese URL →
//   bei revoced/ungültiger URL springt Safari in die Browser-History (z.B. Indeed).
//   Web Share API schickt die Datei direkt ins Ziel (Files, Mail, AirDrop) —
//   keine Downloadliste, keine Blob-URL-History, kein QuickLook-Problem.

const isIOS = (): boolean => /iPad|iPhone|iPod/.test(navigator.userAgent);

function blobDownload(blob: Blob, dateiname: string): void {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = dateiname;
  a.rel      = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function downloadDatei(dateiname: string, inhalt: string, mimeType: string): void {
  const blob = new Blob([inhalt], { type: mimeType });

  // Web Share API — auf iOS der einzig sichere Pfad (kein Blob in Downloadliste)
  try {
    const file = new File([blob], dateiname, { type: mimeType });
    if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: dateiname }).catch(() => {
        // User hat Share Sheet abgebrochen oder Fehler — auf iOS kein Fallback
        if (!isIOS()) blobDownload(blob, dateiname);
      });
      return;
    }
  } catch { /* Web Share nicht verfügbar */ }

  // Desktop: Blob-Download — auf iOS nicht aufrufen (QuickLook-Problem)
  if (!isIOS()) blobDownload(blob, dateiname);
}

// ─── Komponente ─────────────────────────────────────────────────

export default function OsintDemoView() {
  const [phase, setPhase] = useState<"menue" | "eingabe" | "laden" | "ausgabe">("menue");
  const [ansicht, setAnsicht] = useState<"report" | "raw">("report");
  const [schnellModus, setSchnellModus] = useState(true); // Soziale Präsenz: Schnell (~12) vs Vollscan (600+)
  const [aktivesModul, setAktivesModul] = useState<DemoModul | null>(null);
  const [eingabeWert, setEingabeWert] = useState("");
  const [ausgabeZeilen, setAusgabeZeilen] = useState<string[]>([]);
  const [zeilenIndex, setZeilenIndex] = useState(0);
  const [fertig, setFertig] = useState(false);
  const [apiFehler, setApiFehler] = useState<string | null>(null);
  const [rohdaten, setRohdaten] = useState<object | null>(null);
  const [modalOffen, setModalOffen] = useState(false);
  const [wartendesModul, setWartendesModul] = useState<DemoModul | null>(null);
  const [btcKopiert, setBtcKopiert] = useState<"idle" | "success" | "error">("idle");
  const terminalRef = useRef<HTMLDivElement>(null);
  const eingabeRef = useRef<HTMLInputElement>(null);
  const konsoleRef = useRef<HTMLDivElement>(null);
  // Verhindert das Hochscrollen direkt beim ersten Render (nur echte Phasenwechsel scrollen).
  const ersterRender = useRef(true);

  // Report-Ansicht verfügbar, sobald Rohdaten vorliegen (inkl. Status-Modul).
  // Status-Modul (1) hat eine eigene StatusKarte → kein Karten/Roh-Umschalter.
  const reportVerfuegbar = !!rohdaten && !!aktivesModul && aktivesModul.nummer !== "1";
  const zeigeReport = reportVerfuegbar && ansicht === "report";

  // ─── Download-Funktionen ──────────────────────────────────────
  const alsTextHerunterladen = useCallback(() => {
    if (!ausgabeZeilen.length || !aktivesModul) return;
    const inhalt      = ausgabeZeilen.join("\n");
    const zeitstempel = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
    const dateiname   = `osint-${aktivesModul.name.toLowerCase().replace(/\s+/g, "-")}-${zeitstempel}.txt`;
    downloadDatei(dateiname, inhalt, "text/plain;charset=utf-8");
  }, [ausgabeZeilen, aktivesModul]);

  const alsJsonHerunterladen = useCallback(() => {
    if (!rohdaten || !aktivesModul) return;
    const zeitstempel = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
    const dateiname   = `osint-${aktivesModul.name.toLowerCase().replace(/\s+/g, "-")}-${zeitstempel}.json`;
    downloadDatei(dateiname, JSON.stringify(rohdaten, null, 2), "application/json;charset=utf-8");
  }, [rohdaten, aktivesModul]);

  const btcAdresseKopieren = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(BITCOIN_ADDRESS);
      } else {
        const el = document.createElement("textarea");
        el.value = BITCOIN_ADDRESS;
        el.setAttribute("readonly", "");
        el.style.cssText = "position:absolute;left:-9999px;top:0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setBtcKopiert("success");
    } catch {
      setBtcKopiert("error");
    } finally {
      setTimeout(() => setBtcKopiert("idle"), 2000);
    }
  }, []);

  useEffect(() => {
    // Typing-Animation nur in der Raw-Ansicht — im Report wird sofort gerendert.
    if (phase !== "ausgabe" || ausgabeZeilen.length === 0 || zeigeReport) return;
    setZeilenIndex(0);
    setFertig(false);
    let aktuellerIndex = 0;
    const intervall = setInterval(() => {
      aktuellerIndex++;
      if (aktuellerIndex >= ausgabeZeilen.length) {
        clearInterval(intervall);
        setFertig(true);
        setZeilenIndex(ausgabeZeilen.length);
      } else {
        setZeilenIndex(aktuellerIndex);
      }
    }, 28);
    return () => clearInterval(intervall);
  }, [phase, ausgabeZeilen, zeigeReport]);

  useEffect(() => {
    // Auto-Scroll nur während des Typings (Raw) — nicht im Report (Lesefluss).
    if (zeigeReport) return;
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [zeilenIndex, zeigeReport]);

  useEffect(() => {
    // Eingabe fokussieren OHNE den Browser zum Springen zu zwingen — das
    // saubere Positionieren übernimmt der scrollIntoView-Effekt unten.
    if (phase === "eingabe" && eingabeRef.current) eingabeRef.current.focus({ preventScroll: true });
  }, [phase]);

  useEffect(() => {
    // Bei jedem Phasenwechsel die Konsole an den oberen Rand holen, damit
    // Modulauswahl bzw. Eingabe nie „unter der Falte" beginnt (kein Hochscrollen
    // mehr nötig). Beim allerersten Render bewusst nicht — sonst springt die
    // Seite beim Laden zur Konsole statt zur Überschrift.
    if (ersterRender.current) {
      ersterRender.current = false;
      return;
    }
    konsoleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase]);

  const modulStarten = useCallback((modul: DemoModul) => {
    setApiFehler(null);
    // Module 4 und 6 brauchen Datenschutz-Bestätigung
    if (modul.nummer === "4" || modul.nummer === "6") {
      setWartendesModul(modul);
      setModalOffen(true);
      return;
    }
    setAktivesModul(modul);
    if (modul.eingabeTyp === "none") {
      // Status-Modul: ECHTER Live-Health-Check → StatusKarte (grün/aktiv je Tool)
      setRohdaten(null);
      setAusgabeZeilen([]);
      setPhase("laden");
      void gesundheitLaden().then((g) => {
        setRohdaten(g);
        setPhase("ausgabe");
      });
    } else {
      setEingabeWert(modul.beispielEingabe);
      setPhase("eingabe");
    }
  }, []);

  const modalBestaetigt = useCallback(() => {
    setModalOffen(false);
    if (!wartendesModul) return;
    setAktivesModul(wartendesModul);
    setEingabeWert(wartendesModul.beispielEingabe);
    setPhase("eingabe");
    setWartendesModul(null);
  }, [wartendesModul]);

  const modalAbgebrochen = useCallback(() => {
    setModalOffen(false);
    setWartendesModul(null);
  }, []);

  // Kernlogik: führt ein Modul mit explizitem Wert aus (kein Closure-State →
  // auch für Pivot-Folgeanalysen sicher aufrufbar).
  const ausfuehren = useCallback(async (modul: DemoModul, wert: string, schnell = false) => {
    setApiFehler(null);

    // Demo-Module ohne Backend
    if (modul.eingabeTyp === "demo") {
      setAusgabeZeilen(erstelleDemoAusgabe(modul.nummer, wert));
      setPhase("ausgabe");
      return;
    }

    setPhase("laden");

    try {
      let zeilen: string[] = [];

      if (modul.nummer === "2") {
        // E-Mail Vollanalyse: Basis + Recon parallel
        const [basis, recon] = await Promise.allSettled([
          emailAnalysieren(wert),
          emailReconnaissance(wert),
        ]);
        const basisOk = basis.status === "fulfilled" ? basis.value : null;
        const reconOk = recon.status === "fulfilled" ? recon.value : null;
        if (!basisOk) throw basis.status === "rejected" ? basis.reason : new Apifehler("Basis-Email-Check fehlgeschlagen");
        zeilen = emailVollZuTerminal(basisOk, reconOk);
        setRohdaten({ basis: basisOk, recon: reconOk });
      } else if (modul.nummer === "4") {
        const ergebnis = await telefonAnalysieren(wert);
        zeilen = telefonZuTerminal(ergebnis);
        setRohdaten(ergebnis);
      } else if (modul.nummer === "5") {
        // Domain + Shodan parallel
        const [domain, shodan] = await Promise.allSettled([
          domainAnalysieren(wert),
          shodanAbfragen(wert),
        ]);
        const domainOk = domain.status === "fulfilled" ? domain.value : null;
        const shodanOk = shodan.status === "fulfilled" ? shodan.value : null;
        if (!domainOk) throw domain.status === "rejected" ? domain.reason : new Apifehler("Domain-Check fehlgeschlagen");
        zeilen = domainVollZuTerminal(domainOk, shodanOk);
        setRohdaten({ domain: domainOk, shodan: shodanOk });
      } else if (modul.nummer === "6") {
        const ergebnis = await bildAnalysieren(wert);
        zeilen = bildZuTerminal(ergebnis);
        setRohdaten(ergebnis);
      } else if (modul.nummer === "8") {
        const ergebnis = await orchestrator(wert, 2);
        zeilen = orchestratorZuTerminal(ergebnis);
        setRohdaten(ergebnis);
      } else if (modul.nummer === "9") {
        const ergebnis = await subdomainsFinden(wert, true);
        zeilen = subdomainZuTerminal(ergebnis);
        setRohdaten(ergebnis);
      } else if (modul.nummer === "10") {
        const ergebnis = await ipIntelAbfragen(wert);
        zeilen = ipIntelZuTerminal(ergebnis);
        setRohdaten(ergebnis);
      } else if (modul.nummer === "11") {
        const ergebnis = await censysAbfragen(wert);
        zeilen = censysZuTerminal(ergebnis);
        setRohdaten(ergebnis);
      } else if (modul.nummer === "12") {
        // Schnell (~12 WMN + offene APIs) oder Vollscan (600+); schnell=true → kein Vollscan
        const ergebnis = await sozialePraesenzSuchen(wert, !schnell);
        zeilen = sozialePraesenzZuTerminal(ergebnis);
        setRohdaten(ergebnis);
      } else if (modul.nummer === "1") {
        // Status: echter Live-Health-Check → hochwertige StatusKarte (kein Terminal)
        const g = await gesundheitLaden();
        setRohdaten(g);
        zeilen = [];
      } else {
        zeilen = erstelleDemoAusgabe(modul.nummer, wert);
      }

      setAusgabeZeilen(zeilen);
      setPhase("ausgabe");
    } catch (fehler) {
      // Senior-Elite Fehler-UX: differenzierte Meldung statt generisch.
      let meldung: string;
      if (fehler instanceof Apifehler) {
        const versuche = fehler.versuche > 1 ? ` (${fehler.versuche} Versuche)` : "";
        switch (fehler.art) {
          case "netzwerk":
            meldung = `Verbindung zur API instabil${versuche}. Bitte kurz warten und erneut versuchen.`;
            break;
          case "timeout":
            meldung = `Server-Antwort dauert zu lange${versuche}. Bitte erneut versuchen.`;
            break;
          case "rate_limit":
            meldung = "Zu viele Anfragen. Bitte einen Moment warten.";
            break;
          case "server":
            meldung = `Backend liefert einen Fehler${versuche}. Wir untersuchen das.`;
            break;
          default:
            meldung = fehler.message;
        }
      } else {
        meldung = "Unerwarteter Fehler in der Eingabe.";
      }
      setApiFehler(meldung);
      setPhase("eingabe");
    }
  }, []);

  const eingabeAbsenden = useCallback(() => {
    if (!aktivesModul || !eingabeWert.trim()) return;
    void ausfuehren(aktivesModul, eingabeWert.trim(), aktivesModul.nummer === "12" ? schnellModus : false);
  }, [aktivesModul, eingabeWert, ausfuehren, schnellModus]);

  // Pivot: aus einem Ergebnis direkt das passende Werkzeug mit dem Wert starten.
  const pivotStarten = useCallback((typ: string, wert: string) => {
    const PIVOT_ZU_MODUL: Record<string, string> = {
      username: "3", email: "2", domain: "5", ip: "10", image: "6",
    };
    const nummer = PIVOT_ZU_MODUL[typ];
    const modul = nummer ? DEMO_MODULE.find((m) => m.nummer === nummer) : undefined;
    if (!modul) return;
    setAktivesModul(modul);
    setEingabeWert(wert);
    setAnsicht("report");
    setApiFehler(null);
    void ausfuehren(modul, wert);
  }, [ausfuehren]);

  const zurueckSetzen = useCallback(() => {
    setPhase("menue");
    setAnsicht("report");
    setAktivesModul(null);
    setEingabeWert("");
    setAusgabeZeilen([]);
    setZeilenIndex(0);
    setFertig(false);
    setApiFehler(null);
    setRohdaten(null);
    setModalOffen(false);
    setWartendesModul(null);
  }, []);

  const zeileFarbe = (zeile: string): string => {
    if (zeile.includes("[ok]")) return "text-signal-gruen";
    if (zeile.includes("[!]")) return "text-signal-gelb";
    if (zeile.includes("[+]")) return "text-cyber-400";
    if (zeile.includes("[--]")) return "text-white/65";
    if (zeile.startsWith("+--")) return "text-white/65";
    if (zeile.startsWith("|")) return "text-white/65";
    if (zeile.startsWith("---")) return "text-akzent-400/70";
    if (zeile.includes("  Score") || zeile.includes("  Risiko") || zeile.includes("  Erreichbar")) return "text-white";
    if (zeile.includes("Analysiert:")) return "text-white/60";
    if (zeile.match(/^\s{2}[A-Z][A-Za-z-]+\s+:/)) return "text-white/72";
    if (zeile.match(/^\s{2}(Social|Development|Gaming|Beruf|Sicherheit|Sonstige)/)) return "text-white/65";
    if (zeile.includes("->")) return "text-white/65";
    return "text-white/72";
  };

  // Aktionsleiste (Downloads + Neustart) — geteilt zwischen Report- und Raw-Ansicht.
  const aktionsLeiste = (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6 border-t border-white/[0.06] pt-4">
      <div className="flex flex-wrap items-center gap-2.5">
        {aktivesModul?.nummer !== "1" && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); alsTextHerunterladen(); }}
            className="inline-flex items-center gap-1.5 text-[13px] px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 hover:text-white hover:border-white/20 transition"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14" /></svg>
            TXT
          </button>
        )}
        {rohdaten && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); alsJsonHerunterladen(); }}
            className="inline-flex items-center gap-1.5 text-[13px] px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 hover:text-white hover:border-white/20 transition"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14" /></svg>
            JSON
          </button>
        )}
        <button onClick={zurueckSetzen}
          className="inline-flex items-center gap-1.5 text-[13px] px-3.5 py-2 rounded-xl text-akzent-300 hover:text-white bg-akzent-500/10 border border-akzent-500/25 hover:border-akzent-500/45 transition ml-auto">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12a8 8 0 1 1 2.3 5.6M4 12V7m0 5h5" /></svg>
          Neue Analyse
        </button>
      </div>
    </motion.div>
  );

  return (
    <section id="osint" className="py-16 px-6 max-w-5xl mx-auto">
      {/* Verlaufs-Strich für die Modul-Icons (hell oben → azur unten) — wie im Hero */}
      <svg width="0" height="0" aria-hidden className="absolute pointer-events-none">
        <defs>
          <linearGradient id="osint-icon-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dbe6ff" />
            <stop offset="55%" stopColor="#9bbcff" />
            <stop offset="100%" stopColor="#5c87f7" />
          </linearGradient>
        </defs>
      </svg>
      <DatenschutzModal
        offen={modalOffen}
        modulName={wartendesModul?.name ?? ""}
        hinweise={DATENSCHUTZ_HINWEISE[wartendesModul?.nummer ?? ""] ?? []}
        onBestaetigen={modalBestaetigt}
        onAbbrechen={modalAbgebrochen}
      />
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="mb-7">
        <span className="flex items-center gap-2.5 mb-4">
          <span className="h-px w-7 bg-gradient-to-r from-akzent-500/0 via-akzent-500/80 to-akzent-500/0" />
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-akzent-400/90">Intelligence Suite</span>
        </span>
        <GlanzUeberschrift
          element="h2"
          kinder="OSINT Analyseplattform"
          klassen="font-display font-semibold tracking-[-0.01em] leading-snug text-xl md:text-2xl max-w-2xl mb-3"
        />
        <p className="text-white/70 text-[15px] leading-relaxed max-w-2xl">
          E-Mails, Domains, Usernames, Telefonnummern und mehr — live gegen öffentliche Datenquellen geprüft.
          Funde und ihre Beziehungen erscheinen als übersichtliche Karten und Graph. Transparent, kontrolliert,
          ohne dauerhafte Speicherung.
        </p>
      </motion.div>

      {/* Premium-Analyse-Konsole */}
      <div ref={konsoleRef} className="glass-stark rounded-3xl2 overflow-hidden kante-licht scroll-mt-24">
        {/* Kopfzeile: 3-Schritt-Flow + Live-Status */}
        <div className="flex items-center gap-3 px-4 md:px-6 py-3.5 border-b border-white/[0.07] bg-white/[0.02]">
          <FlowStepper phase={phase} />
          <div className="ml-auto hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-signal-gruen/25 bg-signal-gruen/[0.07] flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-signal-gruen animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-signal-gruen/85">Live</span>
          </div>
        </div>

        {/* Konsolen-Körper — fließt natürlich in der Seite (kein verschachtelter
            Scroll), damit die Modulauswahl nicht „unter der Falte" klemmt. */}
        <div ref={terminalRef}
          className="relative p-5 md:p-7 min-h-[420px] overflow-x-hidden">
          <AnimatePresence mode="wait">

            {/* Menü — Modul-Auswahl als Premium-Karten */}
            {phase === "menue" && (
              <motion.div key="menue" variants={PHASEN_WECHSEL} initial="versteckt" animate="sichtbar" exit="verlassen">
                <p className="text-[13px] text-white/55 mb-5">
                  Wähle ein Werkzeug. Du gibst ein Ziel ein — wir prüfen es live und bündeln die Funde verständlich.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {DEMO_MODULE.map((modul, i) => {
                    const istWarnung = modul.nummer === "4" || modul.nummer === "6";
                    const istLive = modul.eingabeTyp === "text";
                    return (
                      <motion.button
                        key={modul.nummer}
                        type="button"
                        onClick={() => modulStarten(modul)}
                        initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ delay: 0.03 * i, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{ y: -3, transition: FEDERN.weich }}
                        className="group relative text-left rounded-2xl border border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.05] hover:border-white/[0.16] p-4 transition-colors duration-300 overflow-hidden focus:outline-none focus-visible:border-akzent-500/50"
                      >
                        <span aria-hidden className="sheen" />
                        <div className="flex items-start gap-3.5">
                          {/* Icon-Plättchen — Azur-Glas mit Tiefe (wie Hero) */}
                          <span
                            className="relative grid place-items-center w-10 h-10 rounded-xl2 flex-shrink-0 border border-akzent-500/25 group-hover:border-akzent-500/45 transition-all duration-300 group-hover:scale-105"
                            style={{
                              background: "linear-gradient(140deg, rgba(79,124,251,0.18), rgba(79,124,251,0.03))",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 6px 16px rgba(79,124,251,0.10)",
                            }}
                          >
                            <span aria-hidden className="absolute inset-0 rounded-xl2 opacity-50 group-hover:opacity-100 transition-opacity duration-500"
                              style={{ background: "radial-gradient(circle at 50% 42%, rgba(122,162,255,0.40), transparent 70%)" }} />
                            <span aria-hidden className="icon-ring opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <span className="relative drop-shadow-[0_1px_3px_rgba(79,124,251,0.35)]">{MODUL_ICON[modul.nummer] ?? null}</span>
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-display font-semibold text-white text-[15px] leading-tight">{modul.name}</h4>
                              {istWarnung ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-signal-gelb/30 bg-signal-gelb/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-signal-gelb/90">Live · sensibel</span>
                              ) : istLive ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-signal-gruen/25 bg-signal-gruen/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-signal-gruen/85">Live</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/55">Check</span>
                              )}
                            </div>
                            <p className="text-[13px] text-white/65 leading-snug mt-1.5 line-clamp-2">{modul.ziel}</p>
                          </div>
                          <span className="flex-shrink-0 mt-1 text-white/20 group-hover:text-akzent-300 group-hover:translate-x-0.5 transition-all duration-300">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Projekt unterstützen — dezent */}
                <div className="mt-7 pt-5 border-t border-white/[0.06] flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-[12px] text-white/45">Frei nutzbar · keine Anmeldung · keine Speicherung</span>
                  <KnopfAktion
                    beimKlick={btcAdresseKopieren}
                    klassen="select-none !px-3.5 !py-1.5 !text-[11.5px] !rounded-md"
                    kinder={btcKopiert === "success" ? "BTC-Adresse kopiert ✓" : btcKopiert === "error" ? "Kopieren fehlgeschlagen" : "Projekt unterstützen · BTC"}
                  />
                </div>
              </motion.div>
            )}

            {/* Eingabe */}
            {phase === "eingabe" && aktivesModul && (
              <motion.div key="eingabe" variants={PHASEN_WECHSEL} initial="versteckt" animate="sichtbar" exit="verlassen" className="w-full min-w-0">
                {/* Zurück + Modul-Kopf */}
                <button onClick={zurueckSetzen}
                  className="inline-flex items-center gap-1.5 text-[12px] text-white/55 hover:text-white/80 transition mb-4">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
                  Auswahl
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <span className="relative grid place-items-center w-10 h-10 rounded-xl2 flex-shrink-0 border border-akzent-500/25"
                    style={{
                      background: "linear-gradient(140deg, rgba(79,124,251,0.18), rgba(79,124,251,0.03))",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                    }}>
                    {MODUL_ICON[aktivesModul.nummer] ?? null}
                  </span>
                  <h3 className="font-display font-semibold text-white text-lg leading-tight">{aktivesModul.name}</h3>
                </div>

                {/* Ziel (Nutzen) + Details */}
                {aktivesModul.ziel && (
                  <div className="mb-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                    <p className="text-white/85 text-sm leading-relaxed">{aktivesModul.ziel}</p>
                    {aktivesModul.beschreibung && (
                      <p className="mt-2.5 text-white/60 text-[13px] leading-relaxed">{aktivesModul.beschreibung}</p>
                    )}
                  </div>
                )}

                {/* Premium-Eingabefeld */}
                {aktivesModul.eingabeTyp === "text" && (
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-[0.18em] text-white/55 mb-2">
                      {aktivesModul.eingabeLabel}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <div className="flex-1 min-w-0 flex items-center gap-2.5 rounded-2xl border border-white/[0.1] bg-white/[0.03] focus-within:border-akzent-500/55 focus-within:bg-white/[0.05] transition-colors duration-200 px-4 py-3">
                        <span className="text-white/30 flex-shrink-0">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
                        </span>
                        <input ref={eingabeRef} type="text" value={eingabeWert}
                          onChange={(event) => setEingabeWert(event.target.value)}
                          onKeyDown={(event) => event.key === "Enter" && eingabeAbsenden()}
                          onFocus={() => {
                            if (aktivesModul && eingabeWert === aktivesModul.beispielEingabe) setEingabeWert("");
                          }}
                          placeholder={aktivesModul.beispielEingabe}
                          className="flex-1 min-w-0 w-full bg-transparent outline-none border-0 text-white text-[15px] placeholder:text-white/30 caret-akzent-400"
                          spellCheck={false} autoComplete="off"
                        />
                      </div>
                      <KnopfAktion beimKlick={eingabeAbsenden} klassen="flex-shrink-0" kinder="Analysieren →" />
                    </div>
                  </div>
                )}

                {/* Module ohne Texteingabe (z. B. Status) — direkter Start */}
                {aktivesModul.eingabeTyp !== "text" && (
                  <KnopfAktion beimKlick={eingabeAbsenden} kinder="Jetzt prüfen →" />
                )}

                {/* Soziale Präsenz: Schnell-/Vollscan-Umschalter */}
                {aktivesModul.nummer === "12" && (
                  <div className="mt-4 flex items-center gap-2 text-[12px] flex-wrap">
                    <span className="text-white/55 mr-0.5">Tiefe:</span>
                    <div className="inline-flex rounded-xl border border-white/[0.08] bg-white/[0.02] p-0.5">
                      {([
                        { schnell: true, label: "Schnell · ~12" },
                        { schnell: false, label: "Vollscan · 600+" },
                      ] as const).map((o) => (
                        <button
                          key={String(o.schnell)}
                          type="button"
                          onClick={() => setSchnellModus(o.schnell)}
                          className={`px-3 py-1.5 rounded-lg transition ${
                            schnellModus === o.schnell
                              ? "bg-akzent-500/20 text-akzent-300"
                              : "text-white/60 hover:text-white/75"
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                    <span className="text-white/45 ml-1">{schnellModus ? "Sekunden" : "~30–60 s"}</span>
                  </div>
                )}

                {apiFehler && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-signal-rot/30 bg-signal-rot/[0.07] px-3.5 py-2.5 text-signal-rot/90 text-[13px]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
                    <span>{apiFehler}</span>
                  </div>
                )}

                <DatenflussHinweis nummer={aktivesModul.nummer} />

                {/* Imgur-Anleitung — nur bei Modul 6 */}
                {aktivesModul?.nummer === "6" && (
                  <div className="mt-5 border-t border-white/[0.06] pt-4 text-[11px] font-mono leading-relaxed">
                    <div className="text-akzent-400/65 mb-2.5">[?] Bild-URL erforderlich — Anleitung</div>
                    <div className="space-y-1 text-white/65">
                      <div>
                        <span className="text-white/65">[1]</span>{" "}
                        <a
                          href="https://imgur.com/upload"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-akzent-400/75 hover:text-akzent-400 transition underline underline-offset-2"
                        >
                          imgur.com/upload
                        </a>{" "}
                        <span className="text-white/48">öffnen — kostenlos, kein Account nötig</span>
                      </div>
                      <div>
                        <span className="text-white/65">[2]</span>{" "}
                        Bild per Drag &amp; Drop oder Datei hochladen
                      </div>
                      <div>
                        <span className="text-white/65">[3]</span>{" "}
                        Nach dem Upload: Rechtsklick auf das Bild{" "}
                        <span className="text-signal-gruen/65">→ Bildadresse kopieren</span>
                      </div>
                      <div>
                        <span className="text-white/65">[4]</span>{" "}
                        URL oben einfügen und Enter drücken
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Laden */}
            {phase === "laden" && (
              <motion.div key="laden" variants={PHASEN_WECHSEL} initial="versteckt" animate="sichtbar" exit="verlassen"
                className="flex flex-col items-center justify-center text-center py-16">
                {/* Pulsierender Akzent-Ring mit Modul-Icon */}
                <div className="relative w-16 h-16 mb-6">
                  <motion.span
                    className="absolute inset-0 rounded-full border border-akzent-500/30"
                    animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                  />
                  <motion.span
                    className="absolute inset-0 rounded-full border border-akzent-500/30"
                    animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.8 }}
                  />
                  <span className="absolute inset-0 grid place-items-center rounded-full bg-akzent-500/12 border border-akzent-500/30 text-akzent-300">
                    {aktivesModul ? MODUL_ICON[aktivesModul.nummer] : null}
                  </span>
                </div>
                <p className="font-display font-semibold text-white text-[15px] mb-1.5">Analyse läuft</p>
                <p className="text-white/55 text-[13px] max-w-xs">
                  Öffentliche Datenquellen werden live geprüft und zusammengeführt …
                </p>
                {/* feiner Fortschritts-Shimmer */}
                <div className="mt-5 h-1 w-40 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-akzent-500 to-transparent"
                    animate={{ x: ["-100%", "300%"] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            )}

            {/* Ausgabe */}
            {phase === "ausgabe" && (
              <motion.div key="ausgabe" variants={PHASEN_WECHSEL} initial="versteckt" animate="sichtbar" exit="verlassen">
                {/* Zurück zur Modul-Auswahl — immer verfügbar */}
                <button onClick={zurueckSetzen}
                  className="inline-flex items-center gap-1.5 text-[12px] text-white/55 hover:text-white/80 transition-colors mb-4">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
                  Zurück zur Auswahl
                </button>

                {/* Forensik-Dossier (Hero): Identität + Risiko + Kennzahl-Heatmap
                    (Balken) + Karte + Timeline + nächste Schritte. */}
                <Dossier modulNummer={aktivesModul?.nummer ?? ""} daten={rohdaten} onPivot={pivotStarten} />

                {/* Status-Modul: hochwertige Live-Status-Karte */}
                {aktivesModul?.nummer === "1" && <StatusKarte daten={rohdaten as GesundheitErgebnis | null} />}

                {/* Defensiver Mehrwert: „Was kann ich dagegen tun?" — NUR wenn ein
                    echtes Sicherheitsproblem vorliegt (Schwere kritisch/auffällig),
                    als EINE ausklappbare Card (IT-Forensik-Rolle). */}
                {(() => {
                  const zus = fasseErgebnisZusammen(aktivesModul?.nummer ?? "", rohdaten);
                  const problem = !!zus && (zus.schwere === "kritisch" || zus.schwere === "auffaellig");
                  return problem
                    ? <SchutzEmpfehlungen empfehlungen={extrahiereSchutz(aktivesModul?.nummer ?? "", rohdaten)} />
                    : null;
                })()}

                {/* Statischer Führungs-Hinweis nur als Fallback, wenn sich keine
                    dynamische Übersicht ableiten lässt (z. B. Status-Modul). */}
                {aktivesModul && aktivesModul.nummer !== "1" && !fasseErgebnisZusammen(aktivesModul.nummer, rohdaten) && ERGEBNIS_HINWEIS[aktivesModul.nummer] && (
                  <div className="mb-5 flex items-start gap-3 rounded-2xl border border-akzent-500/20 bg-akzent-500/[0.05] px-4 py-3">
                    <span className="flex-shrink-0 mt-0.5 text-akzent-300">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 21h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2h6c0-.8.4-1.5 1-2A7 7 0 0 0 12 2Z" /></svg>
                    </span>
                    <div className="min-w-0">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-akzent-400/80 mb-0.5">So nutzt du die Ergebnisse</span>
                      <span className="block text-[13px] text-white/70 leading-snug">{ERGEBNIS_HINWEIS[aktivesModul.nummer]}</span>
                    </div>
                  </div>
                )}

                {/* Ansicht-Umschalter (Karten / Rohdaten) als Segmented Control */}
                {reportVerfuegbar && (
                  <div className="flex items-center mb-5">
                    <div className="inline-flex rounded-xl border border-white/[0.08] bg-white/[0.02] p-0.5 text-[12px]">
                      {([
                        { v: "report" as const, label: "Karten" },
                        { v: "raw" as const, label: "Rohdaten" },
                      ]).map(({ v, label }) => (
                        <button
                          key={v}
                          onClick={() => setAnsicht(v)}
                          className={`px-3 py-1.5 rounded-lg transition ${
                            ansicht === v ? "bg-akzent-500/20 text-akzent-300" : "text-white/60 hover:text-white/75"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {zeigeReport && (
                  <>
                    <ErgebnisReport modulNummer={aktivesModul!.nummer} daten={rohdaten} onPivot={pivotStarten} />
                    {aktionsLeiste}
                  </>
                )}

                {!zeigeReport && aktivesModul?.nummer !== "1" && (
                  <div className="font-mono text-[13px] leading-relaxed rounded-xl border border-white/[0.06] bg-grund-950/50 p-4 overflow-x-auto">
                  {ausgabeZeilen.slice(0, zeilenIndex + 1).map((zeile, index) => {
                  // Subline-Marker "  \u203A" \u2014 dezent, kleiner, hanging-indent, wrappable
                  if (zeile.startsWith("  \u203A")) {
                    const inhalt = zeile.replace(/^\s*\u203A\s+/, "");
                    return (
                      <div
                        key={index}
                        className="text-white/70 text-[11px] leading-snug pl-[58px] pr-2 break-words whitespace-normal -mt-0.5 mb-1"
                      >
                        {inhalt}
                      </div>
                    );
                  }
                  return (
                    <div key={index} className={`whitespace-pre-wrap break-words ${zeileFarbe(zeile)}`}>
                      {zeile || "\u00A0"}
                    </div>
                  );
                  })}
                    {!fertig && <span className="text-akzent-400/70 animate-pulse">█</span>}
                  </div>
                )}
                {!zeigeReport && fertig && aktionsLeiste}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Maltego-Style Graph — nur bei Modul 8 (Orchestrator) mit Graph-Daten */}
      {(fertig || zeigeReport) && aktivesModul?.nummer === "8" && rohdaten && (rohdaten as OrchestratorErgebnis).graph && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6">
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-t-2xl2 border border-white/[0.08] border-b-0 bg-white/[0.03] backdrop-blur-xl">
            <span className="text-akzent-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="2.2" /><circle cx="18" cy="7" r="2.2" /><circle cx="12" cy="18" r="2.2" /><path d="M7.6 7.6 11 16M16.6 8.6 13 16M8 6h8" /></svg>
            </span>
            <span className="font-display font-semibold text-white text-sm">Beziehungs-Graph</span>
            <span className="ml-auto font-mono text-[11px] text-white/55">
              {(rohdaten as OrchestratorErgebnis).graph!.statistik.knoten_gesamt} Knoten · {(rohdaten as OrchestratorErgebnis).graph!.statistik.kanten_gesamt} Kanten
            </span>
          </div>
          <div className="rounded-b-2xl2 overflow-hidden border border-white/[0.08] border-t-0">
            <OsintGraph
              nodes={(rohdaten as OrchestratorErgebnis).graph!.nodes}
              edges={(rohdaten as OrchestratorErgebnis).graph!.edges}
            />
          </div>
        </motion.div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[12px] text-white/50">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-signal-gruen animate-pulse" />
          Live-Checks aktiv
        </span>
        <span>Keine dauerhafte Speicherung</span>
        <span>Rate-Limit: 3–20/min</span>
      </div>
    </section>
  );
}
