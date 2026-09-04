// ═══════════════════════════════════════════════════════════════════
// HILFSMITTEL: Ergebnis-Zusammenfassung (pure, typsicher)
// Leitet aus den Roh-Antworten der OSINT-Module eine verständliche
// Klartext-Zusammenfassung + Schweregrad + severity-sortierte Kennzahlen
// ab. Reine Funktionen ohne Seiteneffekte — die View rendert nur.
//
// Hinweis zu den Roh-Formen: Modul 2 liefert { basis, recon }, Modul 5
// liefert { domain, shodan }, alle übrigen das jeweilige Ergebnis direkt.
// ═══════════════════════════════════════════════════════════════════

import type { Pivot, SchutzEmpfehlung } from "../dienste/osintApi";

export type Schwere = "kritisch" | "auffaellig" | "neutral" | "ok";

export interface Kennzahl {
  readonly etikett: string;
  readonly wert: string;
  readonly schwere: Schwere;
}

export interface Zusammenfassung {
  readonly schwere: Schwere;
  readonly verdikt: string;       // kurze Headline
  readonly kernaussage: string;   // 1–2 Sätze Klartext
  readonly kennzahlen: readonly Kennzahl[];  // severity-sortiert (kritisch zuerst)
}

// Lose Sicht auf die genutzten Roh-Felder (vermeidet `any`, deckt nur das ab,
// was die Zusammenfassung wirklich liest).
interface RisikoRoh { stufe?: string; punkte?: number }
interface RohSicht {
  fehler?: string;
  risiko?: RisikoRoh;
  basis?: RohSicht;
  recon?: RohSicht | null;
  domain?: RohSicht;
  shodan?: RohSicht | null;
  hibp?: { anzahl_breaches?: number };
  xposedornot?: { anzahl_breaches?: number };
  leakcheck?: { anzahl?: number };
  github?: { treffer?: number; gefunden?: boolean };
  gravatar?: { gefunden?: boolean };
  datenleck?: { anzahl_nutzer?: number; domain_betroffen?: boolean };
  aggregiert?: { ports_anzahl?: number; vulns_anzahl?: number };
  zusammenfassung?: { gefunden?: number; geprueft?: number; gesamt_eindeutig?: number; live_aufgeloest?: number | null; offen_gefunden?: number; walled_geprueft?: number; weitere_gefunden?: number };
  offene_plattformen?: { gefunden?: boolean }[];
  walled_gardens?: { existenz?: boolean | null }[];
  identitaet?: { profile_gefunden?: number };
  autonomes_system?: { name?: string | null; asn?: number | null; beschreibung?: string | null };
  whois_organisation?: { name?: string | null };
  ports_anzahl?: number;
  metadaten?: { land_code?: string; carrier?: string; leitungstyp?: string; region?: string };
  exif_vorhanden?: boolean;
  gps?: unknown;
  graph?: { statistik?: { knoten_gesamt?: number; kanten_gesamt?: number } };
  pivots?: Pivot[];
  schutz?: SchutzEmpfehlung[];
}

const RANG: Record<Schwere, number> = { kritisch: 0, auffaellig: 1, neutral: 2, ok: 3 };

function stufeZuSchwere(stufe?: string): Schwere {
  switch ((stufe ?? "").toLowerCase()) {
    case "kritisch": return "kritisch";
    case "hoch":     return "kritisch";
    case "mittel":   return "auffaellig";
    case "gering":   return "neutral";
    default:         return "ok";
  }
}

// Höhere (schlimmere) der beiden Schweregrade gewinnt.
function schlimmere(a: Schwere, b: Schwere): Schwere {
  return RANG[a] <= RANG[b] ? a : b;
}

function nach_schwere(kennzahlen: Kennzahl[]): Kennzahl[] {
  return [...kennzahlen].sort((a, b) => RANG[a.schwere] - RANG[b.schwere]);
}

/** Pivots an der modul-spezifisch richtigen Stelle einsammeln. */
export function extrahierePivots(modulNummer: string, daten: object | null): Pivot[] {
  if (!daten) return [];
  const d = daten as RohSicht;
  if (modulNummer === "2") return d.recon?.pivots ?? d.basis?.pivots ?? [];
  if (modulNummer === "5") return d.domain?.pivots ?? [];
  return d.pivots ?? [];
}

/** Schutz-Empfehlungen an der modul-spezifisch richtigen Stelle einsammeln. */
export function extrahiereSchutz(modulNummer: string, daten: object | null): SchutzEmpfehlung[] {
  if (!daten) return [];
  const d = daten as RohSicht;
  if (modulNummer === "2") return d.recon?.schutz ?? d.basis?.schutz ?? [];
  if (modulNummer === "5") return d.domain?.schutz ?? [];
  return d.schutz ?? [];
}

// ─── Dossier-Extraktion (für die zusammengeführte Forensik-Ansicht) ──

export interface DossierZeitpunkt { datum: string; label: string }
export interface DossierDaten {
  subjekt: string;
  namen: string[];
  avatare: string[];
  koordinaten: { lat: number; lon: number; label?: string } | null;
  zeitpunkte: DossierZeitpunkt[];
}

interface DossierRoh {
  email?: string; adresse?: string; benutzername?: string; domain?: string;
  ip?: string; ziel?: string; nummer?: string; url?: string; analysiert_am?: string;
  recon?: DossierRoh; basis?: DossierRoh;
  gravatar?: { gefunden?: boolean; avatar_url?: string; profil_daten?: { anzeigename?: string | null } };
  github?: { klarnamen?: string[]; nutzer?: Array<{ avatar?: string }> };
  identitaet?: { anzeigenamen?: string[]; avatare?: Array<{ avatar?: string }> };
  wer_ist_das?: Array<{ quelle: string; wert: string }>;
  offene_plattformen?: Array<{ gefunden?: boolean; anzeigename?: string; avatar?: string }>;
  exif?: { aufnahmedatum?: string | null; gps?: { lat?: number; lon?: number; ort_name?: string | null } | null };
  geo?: { koordinaten?: string | null; stadt?: string | null; land?: string | null };
  hibp?: { breaches?: Array<{ titel?: string; datum?: string }> };
}

function _coords(text?: string | null): { lat: number; lon: number } | null {
  if (!text) return null;
  const [a, b] = text.split(",").map((x) => parseFloat(x.trim()));
  return Number.isFinite(a) && Number.isFinite(b) ? { lat: a, lon: b } : null;
}

/** Zieht die Dossier-Bausteine (Identität/Avatare/Ort/Zeit) modulübergreifend. */
export function dossierExtrakt(modulNummer: string, daten: object | null): DossierDaten {
  const leer: DossierDaten = { subjekt: "", namen: [], avatare: [], koordinaten: null, zeitpunkte: [] };
  if (!daten) return leer;
  const d = daten as DossierRoh;
  const kern: DossierRoh = modulNummer === "2" ? (d.recon ?? d.basis ?? d)
            : modulNummer === "5" ? d  // Domain-Wrapper: Subjekt steckt in d.domain (string via Cast unten)
            : d;

  const subjekt = d.email ?? d.adresse ?? d.benutzername ?? d.ip ?? d.ziel ?? d.nummer ?? d.url
    ?? kern.email ?? kern.benutzername ?? (typeof (daten as { domain?: unknown }).domain === "string" ? (daten as { domain: string }).domain : "")
    ?? "";

  const namen = new Set<string>();
  if (kern.gravatar?.profil_daten?.anzeigename) namen.add(kern.gravatar.profil_daten.anzeigename);
  (kern.github?.klarnamen ?? []).forEach((n) => n && namen.add(n));
  (kern.identitaet?.anzeigenamen ?? []).forEach((n) => n && namen.add(n));
  (kern.offene_plattformen ?? []).forEach((p) => p.gefunden && p.anzeigename && namen.add(p.anzeigename));
  (kern.wer_ist_das ?? []).forEach((w) => {
    if (w.wert && !/^https?:\/\//.test(w.wert) && /name|profil/i.test(w.quelle)) namen.add(w.wert.replace(/^Name:\s*/, ""));
  });

  const avatare = new Set<string>();
  if (kern.gravatar?.gefunden && kern.gravatar.avatar_url) avatare.add(kern.gravatar.avatar_url);
  (kern.github?.nutzer ?? []).forEach((u) => u.avatar && avatare.add(u.avatar));
  (kern.identitaet?.avatare ?? []).forEach((a) => a.avatar && avatare.add(a.avatar));
  (kern.offene_plattformen ?? []).forEach((p) => p.gefunden && p.avatar && avatare.add(p.avatar));
  if (modulNummer === "6" && d.url) avatare.add(d.url);  // das analysierte Bild selbst

  let koordinaten: DossierDaten["koordinaten"] = null;
  const gps = kern.exif?.gps;
  if (gps && typeof gps.lat === "number" && typeof gps.lon === "number") {
    koordinaten = { lat: gps.lat, lon: gps.lon, label: gps.ort_name ?? undefined };
  } else if (kern.geo?.koordinaten) {
    const c = _coords(kern.geo.koordinaten);
    if (c) koordinaten = { ...c, label: [kern.geo.stadt, kern.geo.land].filter(Boolean).join(", ") || undefined };
  }

  const zeitpunkte: DossierZeitpunkt[] = [];
  for (const b of (kern.hibp?.breaches ?? [])) {
    if (b.datum) zeitpunkte.push({ datum: b.datum, label: b.titel ?? "Breach" });
  }
  if (kern.exif?.aufnahmedatum) zeitpunkte.push({ datum: kern.exif.aufnahmedatum, label: "Aufnahme" });
  zeitpunkte.sort((a, b) => (a.datum < b.datum ? -1 : 1));

  return {
    subjekt: String(subjekt || ""),
    namen: [...namen].slice(0, 6),
    avatare: [...avatare].slice(0, 8),
    koordinaten,
    zeitpunkte: zeitpunkte.slice(0, 8),
  };
}

/** Klartext-Zusammenfassung je Modul — oder null (z. B. Status-Modul). */
export function fasseErgebnisZusammen(modulNummer: string, daten: object | null): Zusammenfassung | null {
  if (!daten) return null;
  const d = daten as RohSicht;

  switch (modulNummer) {
    case "2": {
      const recon = d.recon ?? undefined;
      const leaks =
        (recon?.hibp?.anzahl_breaches ?? 0) +
        (recon?.xposedornot?.anzahl_breaches ?? 0) +
        (recon?.leakcheck?.anzahl ?? 0);
      const github = recon?.github?.treffer ?? 0;
      const schwere = leaks > 0 ? "kritisch" : "ok";
      const kennzahlen: Kennzahl[] = [
        { etikett: "Daten­leck-Treffer", wert: String(leaks), schwere: leaks > 0 ? "kritisch" : "ok" },
        { etikett: "GitHub-Spuren", wert: String(github), schwere: github > 0 ? "auffaellig" : "ok" },
        { etikett: "Gravatar", wert: recon?.gravatar?.gefunden ? "vorhanden" : "-", schwere: "neutral" },
      ];
      return {
        schwere,
        verdikt: leaks > 0 ? `In ${leaks} Leak-Quelle${leaks === 1 ? "" : "n"} aufgetaucht` : "Keine bekannten Leaks",
        kernaussage: leaks > 0
          ? "Diese Adresse erscheint in bekannten Datenlecks. Sieh dir die rot markierten Treffer zuerst an und ändere betroffene Passwörter."
          : "In den geprüften Leak-Datenbanken keine Treffer. Öffentliche Profile/Spuren findest du unten im Detail.",
        kennzahlen: nach_schwere(kennzahlen),
      };
    }

    case "3": {
      const gefunden = d.zusammenfassung?.gefunden ?? d.identitaet?.profile_gefunden ?? 0;
      const geprueft = d.zusammenfassung?.geprueft;
      return {
        schwere: gefunden > 0 ? "neutral" : "ok",
        verdikt: `${gefunden} Profil${gefunden === 1 ? "" : "e"} gefunden`,
        kernaussage: gefunden > 0
          ? "Der Benutzername existiert auf diesen Plattformen, der öffentliche Fußabdruck. Achte je Treffer auf die Konfidenz, bevor du folgst."
          : "Auf den geprüften Plattformen kein passendes Profil gefunden.",
        kennzahlen: nach_schwere([
          { etikett: "Profile", wert: String(gefunden), schwere: gefunden > 0 ? "neutral" : "ok" },
          ...(geprueft ? [{ etikett: "geprüft", wert: String(geprueft), schwere: "ok" as Schwere }] : []),
        ]),
      };
    }

    case "4": {
      const schwere = stufeZuSchwere(d.risiko?.stufe);
      const land = d.metadaten?.land_code ?? "-";
      const carrier = d.metadaten?.carrier || "unbekannt";
      return {
        schwere,
        verdikt: `${land} · ${carrier}`,
        kernaussage: "Land, Anbieter und Leitungstyp geben den Kontext. Die kuratierten Such-Links öffnest nur du selbst, nichts wird automatisch aufgerufen.",
        kennzahlen: nach_schwere([
          { etikett: "Anbieter", wert: carrier, schwere: "neutral" },
          { etikett: "Leitungstyp", wert: d.metadaten?.leitungstyp || "-", schwere: "neutral" },
          { etikett: "Region", wert: d.metadaten?.region || "-", schwere: "ok" },
        ]),
      };
    }

    case "5": {
      const httpSchwere = stufeZuSchwere(d.domain?.risiko?.stufe);
      const netzSchwere = stufeZuSchwere(d.shodan?.risiko?.stufe);
      const schwere = schlimmere(httpSchwere, netzSchwere);
      const ports = d.shodan?.aggregiert?.ports_anzahl ?? 0;
      const cves = d.shodan?.aggregiert?.vulns_anzahl ?? 0;
      return {
        schwere,
        verdikt: cves > 0 ? `${cves} bekannte CVE${cves === 1 ? "" : "s"} · ${ports} offene Ports` : `${ports} offene Port${ports === 1 ? "" : "s"}`,
        kernaussage: cves > 0
          ? "Es sind bekannte Schwachstellen (CVEs) und offene Ports nach außen sichtbar, das sind die relevanten Angriffspunkte. Zuerst die roten ansehen."
          : "Ordne die beiden Risk-Scores ein. Offene Ports und fehlende Security-Header sind die Stellen, an denen du genauer hinschaust.",
        kennzahlen: nach_schwere([
          { etikett: "Bekannte CVEs", wert: String(cves), schwere: cves > 0 ? "kritisch" : "ok" },
          { etikett: "Offene Ports", wert: String(ports), schwere: ports > 0 ? "auffaellig" : "ok" },
          { etikett: "HTTP-Sicherheit", wert: d.domain?.risiko?.stufe ?? "-", schwere: httpSchwere },
        ]),
      };
    }

    case "6": {
      const gps = !!d.gps;
      return {
        schwere: gps ? "auffaellig" : "neutral",
        verdikt: gps ? "GPS-Aufnahmeort im Bild" : "Keine GPS-Daten im Bild",
        kernaussage: gps
          ? "Das Bild enthält GPS-Koordinaten (der Aufnahmeort lässt sich rekonstruieren). Nutze außerdem die Reverse-Image-Suchen, um die Quelle zu finden."
          : "Keine GPS-Koordinaten gefunden. Über die Reverse-Image-Suchen kannst du dennoch nach der Bildquelle suchen.",
        kennzahlen: [],
      };
    }

    case "8": {
      const knoten = d.graph?.statistik?.knoten_gesamt ?? 0;
      const kanten = d.graph?.statistik?.kanten_gesamt ?? 0;
      return {
        schwere: "neutral",
        verdikt: `${knoten} Knoten · ${kanten} Verbindungen`,
        kernaussage: "Unten erscheint der Beziehungs-Graph. Klicke einen Knoten an und folge den Verbindungen, so werden die Zusammenhänge zwischen den Funden sichtbar.",
        kennzahlen: nach_schwere([
          { etikett: "Knoten", wert: String(knoten), schwere: "neutral" },
          { etikett: "Verbindungen", wert: String(kanten), schwere: "neutral" },
        ]),
      };
    }

    case "9": {
      const gesamt = d.zusammenfassung?.gesamt_eindeutig ?? 0;
      const live = d.zusammenfassung?.live_aufgeloest ?? null;
      const schwere = gesamt > 40 ? "auffaellig" : gesamt > 0 ? "neutral" : "ok";
      return {
        schwere,
        verdikt: `${gesamt} Subdomain${gesamt === 1 ? "" : "s"}${live != null ? ` · ${live} live` : ""}`,
        kernaussage: "Jede Subdomain ist potenzielle Angriffsfläche. Sieh dir die live aufgelösten (mit aktivem A-Record) zuerst an, sie sind erreichbar.",
        kennzahlen: nach_schwere([
          { etikett: "Subdomains", wert: String(gesamt), schwere: gesamt > 0 ? "neutral" : "ok" },
          ...(live != null ? [{ etikett: "live", wert: String(live), schwere: (live > 0 ? "auffaellig" : "ok") as Schwere }] : []),
        ]),
      };
    }

    case "10": {
      const holder = d.autonomes_system?.name || d.autonomes_system?.beschreibung || d.whois_organisation?.name || "-";
      const asn = d.autonomes_system?.asn;
      return {
        schwere: "neutral",
        verdikt: asn ? `AS${asn} · ${holder}` : String(holder),
        kernaussage: "Zeigt Eigentümer und Routing der IP, die Basis, um Zuständigkeit und den Abuse-Kontakt zu bestimmen.",
        kennzahlen: nach_schwere([
          { etikett: "Betreiber", wert: String(holder), schwere: "neutral" },
          ...(asn ? [{ etikett: "ASN", wert: `AS${asn}`, schwere: "ok" as Schwere }] : []),
        ]),
      };
    }

    case "11": {
      const ports = d.aggregiert?.ports_anzahl ?? d.ports_anzahl ?? 0;
      const schwere = ports > 0 ? "neutral" : "ok";
      return {
        schwere,
        verdikt: `${ports} offene Dienst${ports === 1 ? "" : "e"}`,
        kernaussage: "Offene Dienste und Standort des Hosts: die autoritative Sicht, die Shodan ergänzt. Prüfe, ob die offenen Ports so gewollt sind.",
        kennzahlen: nach_schwere([
          { etikett: "Offene Dienste", wert: String(ports), schwere: ports > 0 ? "neutral" : "ok" },
        ]),
      };
    }

    case "12": {
      const offen = d.zusammenfassung?.offen_gefunden
        ?? (d.offene_plattformen ?? []).filter((p) => p.gefunden).length;
      const walledBestaetigt = (d.walled_gardens ?? []).filter((p) => p.existenz === true).length;
      const weitere = d.zusammenfassung?.weitere_gefunden ?? 0;
      const gesamt = offen + walledBestaetigt + weitere;
      const schwere: Schwere = gesamt > 8 ? "auffaellig" : gesamt > 0 ? "neutral" : "ok";
      return {
        schwere,
        verdikt: `${gesamt} Treffer · ${offen} mit echten Daten`,
        kernaussage: gesamt > 0
          ? "Der digitale Fußabdruck dieses Namens: echte Profile (mit Daten) auf offenen Plattformen + Existenz auf großen Netzwerken und weiteren Seiten. Je einheitlicher der Username, desto leichter lässt sich daraus EINE Person zusammensetzen (siehe Schutz-Maßnahmen unten)."
          : "Auf den geprüften Plattformen kein Profil gefunden. Für die großen Netzwerke stehen unten Profil-Links + Dork-Suchen bereit.",
        kennzahlen: nach_schwere([
          { etikett: "Offene Profile", wert: String(offen), schwere: offen > 0 ? "neutral" : "ok" },
          ...(walledBestaetigt > 0
            ? [{ etikett: "Netzwerke bestätigt", wert: String(walledBestaetigt), schwere: "neutral" as Schwere }]
            : []),
          ...(weitere > 0
            ? [{ etikett: "Weitere (WMN)", wert: String(weitere), schwere: "neutral" as Schwere }]
            : []),
        ]),
      };
    }

    default:
      return null;  // Status-Modul u. Ä. — Fallback-Hinweis greift in der View.
  }
}
