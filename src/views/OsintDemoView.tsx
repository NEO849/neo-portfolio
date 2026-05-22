import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  domainAnalysieren, emailAnalysieren, benutzernameSuchen,
  telefonAnalysieren, bildAnalysieren,
  shodanAbfragen, emailReconnaissance, searchAggregator, orchestrator,
  benutzernameVollscan,
  Apifehler,
  type DomainErgebnis, type EmailErgebnis, type BenutzerErgebnis,
  type TelefonErgebnis, type BildErgebnis,
  type ShodanErgebnis, type EmailReconErgebnis,
  type AggregatorErgebnis, type OrchestratorErgebnis,
} from "../dienste/osintApi";
import { DatenschutzModal } from "../bausteine/DatenschutzModal";
import OsintGraph from "../bausteine/OsintGraph";

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
}

// 8 konsolidierte Module — keine Redundanz, jedes Tool macht intern Vollanalyse.
// Email/Username/Domain führen mehrere Backend-Calls parallel und mergen die Outputs.
const DEMO_MODULE: DemoModul[] = [
  { nummer: "1", name: "Status pruefen",          farbe: "#9ca3af", eingabeLabel: "",                    beispielEingabe: "",                              eingabeTyp: "none" },
  { nummer: "2", name: "E-Mail Vollanalyse",      farbe: "#818cf8", eingabeLabel: "E-Mail eingeben",     beispielEingabe: "demo@gmail.com",                eingabeTyp: "text" },
  { nummer: "3", name: "Username Vollscan (600+)", farbe: "#c084fc", eingabeLabel: "Username eingeben",  beispielEingabe: "cypherneo",                     eingabeTyp: "text" },
  { nummer: "4", name: "Telefon Analyse",         farbe: "#eab308", eingabeLabel: "Telefonnummer",       beispielEingabe: "+4915112345678",                eingabeTyp: "text" },
  { nummer: "5", name: "Domain & Shodan",         farbe: "#22d3ee", eingabeLabel: "Domain eingeben",     beispielEingabe: "example.com",                   eingabeTyp: "text" },
  { nummer: "6", name: "Reverse Image",           farbe: "#22c55e", eingabeLabel: "Bild-URL",            beispielEingabe: "https://example.com/foto.jpg",  eingabeTyp: "text" },
  { nummer: "7", name: "Intel Search-Aggregator", farbe: "#06b6d4", eingabeLabel: "Wert (Auto-Typ)",     beispielEingabe: "cypherneo",                     eingabeTyp: "text" },
  { nummer: "8", name: "Vollanalyse Orchestrator", farbe: "#10b981", eingabeLabel: "Beliebiges Target",  beispielEingabe: "example.com",                   eingabeTyp: "text" },
];

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

// ─── Terminal-Hilfsfunktionen ─────────────────────────────────────
// Box: 36 Zeichen breit — passt auf Mobile ohne horizontalen Scroll.

const R  = "+----------------------------------+";
const K  = (t: string) => `|  ${t.substring(0, 32).padEnd(32)}|`;
const S  = (n: string) => { const p = `--- ${n} `; return p + "-".repeat(Math.max(2, 34 - p.length)); };
const WW = (key: string, val: string, kw = 11) => `  ${key.padEnd(kw)}: ${val}`;
const trunc = (s: string, n: number) => s.length > n ? s.substring(0, n - 1) + "…" : s;

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
    WW("Land",    `${t.metadaten?.land_code} — ${trunc(t.metadaten?.region ?? "", 18)}`),
    WW("Typ",     t.metadaten?.leitungstyp ?? ""),
    WW("Carrier", trunc(t.metadaten?.carrier ?? "", 20)),
    WW("Zeitzone",trunc((t.metadaten?.zeitzonen ?? []).join(", "), 20)),
  ];
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
  if (b.exif?.verfuegbar) {
    zeilen.push("", S("EXIF-METADATEN"));
    if (b.exif.kamera)        zeilen.push(WW("Kamera",   trunc(b.exif.kamera, 20)));
    if (b.exif.aufnahmedatum) zeilen.push(WW("Datum",    trunc(b.exif.aufnahmedatum, 20)));
    if (b.exif.software)      zeilen.push(WW("Software", trunc(b.exif.software, 20)));
    if (b.exif.iso)           zeilen.push(WW("ISO",      String(b.exif.iso)));
    if (b.exif.blende)        zeilen.push(WW("Blende",   `f/${b.exif.blende}`));
    if (b.exif.gps) {
      zeilen.push(WW("GPS", `${b.exif.gps.lat}, ${b.exif.gps.lon}`));
      zeilen.push(`  Maps-Link  : (generiert)`);
    }
  } else {
    zeilen.push("", "  EXIF: Keine Metadaten vorhanden");
  }
  if (b.sicherheits_hinweise?.length) {
    zeilen.push("", S("SICHERHEITSANALYSE"));
    for (const h of b.sicherheits_hinweise) {
      const pfx = h.stufe === "hoch" ? "[!]" : "[i]";
      zeilen.push(`  ${pfx}  ${trunc(h.meldung, 26)}`);
    }
  }
  if (b.suchlinks?.length) {
    zeilen.push("", S("REVERSE IMAGE LINKS"));
    for (const link of b.suchlinks) zeilen.push(`  [+]  ${trunc(link.name, 26)}`);
  }
  zeilen.push("", `  Analysiert: ${b.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
  return zeilen;
}

// ─── Demo-Ausgaben für Module ohne Backend ────────────────────────

function erstelleDemoAusgabe(modulNummer: string, eingabe: string): string[] {
  const rahmen = (text: string) => [R, K(text), R];

  if (modulNummer === "1") return [
    ...rahmen("STATUS -- Systempruefung"),
    "", S("LIVE-BACKEND (Contabo VPS)"),
    "  [ok]  FastAPI v0.115",
    "  [ok]  dnspython / python-whois",
    "  [ok]  httpx / slowapi",
    "  [ok]  WhatsMyName-DB cached",
    "  [ok]  Shodan InternetDB connected",
    "", S("MODULE (V2-konsolidiert)"),
    "  [ok]  [2] E-Mail Vollanalyse",
    "  ›  DNS · SPF · DMARC · Gravatar · GHunt · HIBP · GitHub",
    "  [ok]  [3] Username Vollscan",
    "  ›  WhatsMyName-DB · 600+ Plattformen",
    "  [ok]  [4] Telefon Analyse",
    "  ›  Format · Carrier · Land · Suchlinks",
    "  [ok]  [5] Domain & Shodan",
    "  ›  DNS · WHOIS · ASN · HTTP-Sec · Ports · CVEs",
    "  [ok]  [6] Reverse Image",
    "  ›  EXIF · GPS · pHash · Reverse-Suche",
    "  [ok]  [7] Intel Search-Aggregator",
    "  ›  60+ kuratierte Such-Quellen",
    "  [ok]  [8] Vollanalyse Orchestrator",
    "  ›  Auto-Pivot · Maltego-Graph",
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

function benutzerZuTerminal(b: BenutzerErgebnis): string[] {
  if (b.fehler) {
    return [R, K("USERNAME SUCHE -- Fehler"), R, "", `  ${trunc(b.fehler, 30)}`];
  }
  const s = b.zusammenfassung!;
  const zeilen: string[] = [
    R, K(`USERNAME -- ${trunc(b.benutzername ?? "", 20)}`), R,
    "", S("ZUSAMMENFASSUNG"),
    WW("Geprueft",  `${s.geprueft} Plattformen`),
    WW("Gefunden",  `${s.gefunden} Treffer`),
    WW("Rate",      `${s.treffer_rate}%`),
  ];
  if (b.nach_kategorie && Object.keys(b.nach_kategorie).length > 0) {
    zeilen.push("", S("VERIFIZIERTE TREFFER"));
    for (const [kategorie, plattformen] of Object.entries(b.nach_kategorie)) {
      zeilen.push(`  ${kategorie.charAt(0).toUpperCase() + kategorie.slice(1)}`);
      for (const p of plattformen) {
        zeilen.push(`    [+]  ${trunc(p.plattform, 26)}`);
      }
    }
  }
  zeilen.push("", `  Analysiert: ${b.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
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

  zeilen.push("", `  Analysiert: ${e.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
  return zeilen;
}

// ─── Username Vollscan (WhatsMyName 600+) ───────────────────────

function vollscanZuTerminal(b: BenutzerErgebnis): string[] {
  if (b.fehler) return [R, K("VOLLSCAN -- Fehler"), R, "", `  ${trunc(b.fehler, 30)}`];
  const s = b.zusammenfassung!;
  const zeilen: string[] = [
    R, K(`VOLLSCAN -- ${trunc(b.benutzername ?? "", 19)}`), R,
    "", S("ZUSAMMENFASSUNG"),
    WW("Geprueft",   `${s.geprueft} Plattformen`),
    WW("Gefunden",   `${s.gefunden} Treffer (${s.treffer_rate}%)`),
    WW("Konf. hoch", String(s.konfidenz_hoch ?? 0)),
    WW("Konf. mitt", String(s.konfidenz_mittel ?? 0)),
    WW("Konf. nied", String(s.konfidenz_niedrig ?? 0)),
    WW("Fehler",     String(s.fehler)),
  ];
  if (b.nach_kategorie && Object.keys(b.nach_kategorie).length > 0) {
    zeilen.push("", S("TREFFER NACH KATEGORIE"));
    for (const [kat, plattformen] of Object.entries(b.nach_kategorie)) {
      zeilen.push(`  ${kat.charAt(0).toUpperCase() + kat.slice(1)} (${plattformen.length})`);
      for (const p of plattformen.slice(0, 8)) {
        const kSym = p.konfidenz === "hoch" ? "[++]" : p.konfidenz === "mittel" ? "[+]" : "[?]";
        zeilen.push(`    ${kSym}  ${trunc(p.plattform, 22)}`);
      }
      if (plattformen.length > 8) zeilen.push(`    ... +${plattformen.length - 8} weitere`);
    }
  }
  zeilen.push("", `  WhatsMyName-DB (${b.modus})`,
              `  Analysiert: ${b.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
  return zeilen;
}

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

// ─── Modul 10: Intel Search-Aggregator ──────────────────────────

function aggregatorZuTerminal(a: AggregatorErgebnis): string[] {
  if (a.fehler) return [R, K("AGGREGATOR -- Fehler"), R, "", `  ${trunc(a.fehler, 30)}`];
  const zeilen: string[] = [
    R, K(`AGGREGATOR -- ${trunc(a.wert, 19)}`), R,
    "", S("UEBERSICHT"),
    WW("Typ",       a.typ.toUpperCase()),
    WW("Links",     `${a.anzahl} generiert`),
    WW("Kategor.",  String(Object.keys(a.nach_kategorie).length)),
  ];
  zeilen.push("", S("NACH KATEGORIE"));
  for (const [kat, links] of Object.entries(a.nach_kategorie)) {
    zeilen.push(`  ${kat} (${links.length})`);
    for (const link of links.slice(0, 5)) {
      zeilen.push(`    [+]  ${trunc(link.name, 24)}`);
    }
    if (links.length > 5) zeilen.push(`    ... +${links.length - 5} weitere`);
  }
  zeilen.push("", `  ${trunc(a.hinweis ?? "Statisch generiert", 30)}`,
              `  Analysiert: ${a.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
  return zeilen;
}

// ─── Modul 11: Orchestrator (SpiderFoot-Style mit Graph) ────────

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
    if (phase !== "ausgabe" || ausgabeZeilen.length === 0) return;
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
  }, [phase, ausgabeZeilen]);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [zeilenIndex]);

  useEffect(() => {
    if (phase === "eingabe" && eingabeRef.current) eingabeRef.current.focus();
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
      setAusgabeZeilen(erstelleDemoAusgabe(modul.nummer, ""));
      setPhase("ausgabe");
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

  const eingabeAbsenden = useCallback(async () => {
    if (!aktivesModul || !eingabeWert.trim()) return;
    const wert = eingabeWert.trim();
    setApiFehler(null);

    // Demo-Module ohne Backend
    if (aktivesModul.eingabeTyp === "demo") {
      setAusgabeZeilen(erstelleDemoAusgabe(aktivesModul.nummer, wert));
      setPhase("ausgabe");
      return;
    }

    setPhase("laden");

    try {
      let zeilen: string[] = [];

      if (aktivesModul.nummer === "2") {
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
      } else if (aktivesModul.nummer === "3") {
        // Username: nur noch Vollscan (600+ Plattformen)
        const ergebnis = await benutzernameVollscan(wert);
        zeilen = vollscanZuTerminal(ergebnis);
        setRohdaten(ergebnis);
      } else if (aktivesModul.nummer === "4") {
        const ergebnis = await telefonAnalysieren(wert);
        zeilen = telefonZuTerminal(ergebnis);
        setRohdaten(ergebnis);
      } else if (aktivesModul.nummer === "5") {
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
      } else if (aktivesModul.nummer === "6") {
        const ergebnis = await bildAnalysieren(wert);
        zeilen = bildZuTerminal(ergebnis);
        setRohdaten(ergebnis);
      } else if (aktivesModul.nummer === "7") {
        // Aggregator mit Auto-Typ-Erkennung
        const v = wert.trim();
        const typ: "email" | "username" | "domain" | "phone" | "image" | "ip" =
          /^[a-zA-Z0-9._%+\-]+@/.test(v) ? "email" :
          /^https?:\/\//.test(v) ? "image" :
          /^\+?[0-9\s\-()]{6,}$/.test(v) ? "phone" :
          /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/.test(v) ? "ip" :
          /\.[a-zA-Z]{2,}$/.test(v) ? "domain" :
          "username";
        const ergebnis = await searchAggregator(typ, wert);
        zeilen = aggregatorZuTerminal(ergebnis);
        setRohdaten(ergebnis);
      } else if (aktivesModul.nummer === "8") {
        const ergebnis = await orchestrator(wert, 2);
        zeilen = orchestratorZuTerminal(ergebnis);
        setRohdaten(ergebnis);
      } else {
        zeilen = erstelleDemoAusgabe(aktivesModul.nummer, wert);
      }

      setAusgabeZeilen(zeilen);
      setPhase("ausgabe");
    } catch (fehler) {
      const meldung = fehler instanceof Apifehler
        ? fehler.message
        : "Verbindung zur API fehlgeschlagen";
      setApiFehler(meldung);
      setPhase("eingabe");
    }
  }, [aktivesModul, eingabeWert]);

  const zurueckSetzen = useCallback(() => {
    setPhase("menue");
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
    if (zeile.includes("[--]")) return "text-white/55";
    if (zeile.startsWith("+--")) return "text-white/40";
    if (zeile.startsWith("|")) return "text-white/65";
    if (zeile.startsWith("---")) return "text-akzent-400/70";
    if (zeile.includes("  Score") || zeile.includes("  Risiko") || zeile.includes("  Erreichbar")) return "text-white";
    if (zeile.includes("Analysiert:")) return "text-white/50";
    if (zeile.match(/^\s{2}[A-Z][A-Za-z-]+\s+:/)) return "text-white/72";
    if (zeile.match(/^\s{2}(Social|Development|Gaming|Beruf|Sicherheit|Sonstige)/)) return "text-white/55";
    if (zeile.includes("->")) return "text-white/55";
    return "text-white/72";
  };

  return (
    <section id="osint" className="py-16 px-6 max-w-5xl mx-auto">
      <DatenschutzModal
        offen={modalOffen}
        modulName={wartendesModul?.name ?? ""}
        hinweise={DATENSCHUTZ_HINWEISE[wartendesModul?.nummer ?? ""] ?? []}
        onBestaetigen={modalBestaetigt}
        onAbbrechen={modalAbgebrochen}
      />
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <h2 className="font-mono text-xl md:text-2xl font-semibold tracking-wider mb-3">
          <span className="text-signal-gruen">&gt;</span>
          <span className="text-white/70"> osint_tools</span>
        </h2>
        <p className="text-white/65 text-sm mb-6">
          Ein kompaktes OSINT-Toolkit für schnelle Erstanalysen: Domains, E-Mails, Usernames und weitere Hinweise werden live gegen öffentliche Datenquellen geprüft — transparent, kontrolliert und ohne dauerhafte Speicherung.
        </p>
      </motion.div>

      <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/40">
        {/* Titelzeile */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#12121f] border-b border-white/5">
          <div className="flex gap-1.5">
            <button onClick={zurueckSetzen} className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-125 transition" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="font-mono text-[11px] text-white/55 ml-3">
            neo@vps:~/osint-toolkit$ python3 main.py
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-signal-gruen animate-pulse" />
            <span className="font-mono text-[10px] text-signal-gruen/80">LIVE</span>
          </div>
        </div>

        {/* Terminal-Körper */}
        <div ref={terminalRef}
          className="bg-[#08080f] p-5 md:p-6 font-mono text-[13px] leading-relaxed min-h-[420px] max-h-[540px] overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">

            {/* Menü */}
            {phase === "menue" && (
              <motion.div key="menue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <div className="text-white/50 text-xs mb-3">+== OSINT TOOLKIT -- Modul waehlen ==+</div>
                {DEMO_MODULE.map(modul => (
                  <button key={modul.nummer} onClick={() => modulStarten(modul)}
                    className="block w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all group">
                    <span className="text-white/50">[</span>
                    <span style={{ color: modul.farbe }} className="font-bold">{modul.nummer}</span>
                    <span className="text-white/50">]  </span>
                    <span className="text-white/75 group-hover:text-white transition">{modul.name}</span>
                    {modul.eingabeTyp === "text" && modul.nummer !== "4" && modul.nummer !== "6" && (
                      <span className="ml-2 text-[10px] text-signal-gruen/70">LIVE</span>
                    )}
                    {(modul.nummer === "4" || modul.nummer === "6") && (
                      <span className="ml-2 text-[10px] text-signal-gelb/75">LIVE ⚠</span>
                    )}
                  </button>
                ))}
                <div className="mt-3 text-white/40 text-xs">+====================================+</div>
                <div className="mt-8 text-[11px] font-mono select-none">
                    <button
                      type="button"
                      onClick={btcAdresseKopieren}
                      className={[
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-[11px] transition-all duration-200 select-none",
                        btcKopiert === "success"
                          ? "border-signal-gruen/35 bg-signal-gruen/[0.06] text-signal-gruen/80"
                          : btcKopiert === "error"
                          ? "border-signal-rot/30 bg-signal-rot/[0.05] text-signal-rot/70"
                          : "border-akzent-400/[0.22] bg-akzent-400/[0.04] hover:border-akzent-400/40 hover:bg-akzent-400/[0.09] active:bg-akzent-400/[0.14]",
                      ].join(" ")}
                    >
                      {btcKopiert === "success" ? (
                        "BTC-Adresse kopiert"
                      ) : btcKopiert === "error" ? (
                        "Kopieren fehlgeschlagen"
                      ) : (
                        <>
                          <span className="text-white/35">Projekt unterstützen</span>
                          <span className="text-akzent-400/40">-&gt;</span>
                          <span className="text-akzent-400/70 font-semibold">Copy BTC</span>
                        </>
                      )}
                    </button>
                </div>
              </motion.div>
            )}

            {/* Eingabe */}
            {phase === "eingabe" && aktivesModul && (
              <motion.div key="eingabe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="w-full min-w-0">
                <div className="text-white/55 text-xs mb-3">
                  Modul [{aktivesModul.nummer}]: {aktivesModul.name}
                  {aktivesModul.eingabeTyp === "text" && <span className="ml-2 text-signal-gruen/70">— LIVE API</span>}
                </div>
                <div className="flex items-center gap-2 w-full min-w-0">
                  <span style={{ color: aktivesModul.farbe }} className="whitespace-nowrap flex-shrink-0">{aktivesModul.eingabeLabel}:</span>
                  <input ref={eingabeRef} type="text" value={eingabeWert}
                    onChange={(event) => setEingabeWert(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && eingabeAbsenden()}
                    onFocus={() => {
                      if (aktivesModul && eingabeWert === aktivesModul.beispielEingabe) {
                        setEingabeWert("");
                      }
                    }}
                    className="flex-1 min-w-0 w-full max-w-full terminal-eingabe font-mono text-base"
                    spellCheck={false} autoComplete="off"
                  />
                </div>
                {apiFehler && (
                  <div className="mt-3 text-signal-rot text-xs">
                    [Fehler]  {apiFehler}
                  </div>
                )}
                <div className="mt-4 flex gap-3">
                  <button onClick={eingabeAbsenden}
                    className="text-xs px-3 py-1.5 rounded-lg bg-akzent-500/20 border border-akzent-400/30 text-akzent-400 hover:bg-akzent-500/30 transition">
                    Enter ↵
                  </button>
                  <button onClick={zurueckSetzen}
                    className="text-xs px-3 py-1.5 rounded-lg text-white/55 hover:text-white/80 transition">
                    Zurueck
                  </button>
                </div>

                {/* Imgur-Anleitung — nur bei Modul 6 */}
                {aktivesModul?.nummer === "6" && (
                  <div className="mt-5 border-t border-white/[0.06] pt-4 text-[11px] font-mono leading-relaxed">
                    <div className="text-akzent-400/65 mb-2.5">[?] Bild-URL erforderlich — Anleitung</div>
                    <div className="space-y-1 text-white/38">
                      <div>
                        <span className="text-white/55">[1]</span>{" "}
                        <a
                          href="https://imgur.com/upload"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-akzent-400/75 hover:text-akzent-400 transition underline underline-offset-2"
                        >
                          imgur.com/upload
                        </a>{" "}
                        <span className="text-white/28">öffnen — kostenlos, kein Account nötig</span>
                      </div>
                      <div>
                        <span className="text-white/55">[2]</span>{" "}
                        Bild per Drag &amp; Drop oder Datei hochladen
                      </div>
                      <div>
                        <span className="text-white/55">[3]</span>{" "}
                        Nach dem Upload: Rechtsklick auf das Bild{" "}
                        <span className="text-signal-gruen/65">→ Bildadresse kopieren</span>
                      </div>
                      <div>
                        <span className="text-white/55">[4]</span>{" "}
                        URL oben einfügen und Enter drücken
                      </div>
                    </div>
                    <div className="mt-2.5 text-white/22">
                      Beispiel: i.imgur.com/AbCdEfG.jpg
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Laden */}
            {phase === "laden" && (
              <motion.div key="laden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <div className="text-white/55 text-xs mb-4">Anfrage wird verarbeitet...</div>
                <div className="flex items-center gap-2 text-signal-gruen/85">
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >▶</motion.span>
                  <span>Verbindung zur OSINT-API...</span>
                </div>
                <div className="mt-2 text-white/55 text-xs">
                  POST /api/v1/osint/{aktivesModul?.nummer === "5" ? "domain" : aktivesModul?.nummer === "2" ? "email" : "benutzername"}
                </div>
              </motion.div>
            )}

            {/* Ausgabe */}
            {phase === "ausgabe" && (
              <motion.div key="ausgabe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {ausgabeZeilen.slice(0, zeilenIndex + 1).map((zeile, index) => {
                  // Subline-Marker "  \u203A" \u2014 dezent, kleiner, hanging-indent, wrappable
                  if (zeile.startsWith("  \u203A")) {
                    const inhalt = zeile.replace(/^\s*\u203A\s+/, "");
                    return (
                      <div
                        key={index}
                        className="text-white/45 text-[11px] leading-snug pl-[58px] pr-2 break-words whitespace-normal -mt-0.5 mb-1"
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
                {!fertig && <span className="text-signal-gruen/60 animate-pulse">█</span>}
                {fertig && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-5 border-t border-white/5 pt-4">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Download TXT — nicht beim Status-Check (Modul 1) */}
                      {aktivesModul?.nummer !== "1" && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); alsTextHerunterladen(); }}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-signal-gruen/10 border border-signal-gruen/25 text-signal-gruen/80 hover:bg-signal-gruen/20 hover:text-signal-gruen transition font-mono"
                        >
                          ↓ TXT
                        </button>
                      )}
                      {/* Download JSON — nur bei Live-Modulen */}
                      {rohdaten && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); alsJsonHerunterladen(); }}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-akzent-500/10 border border-akzent-400/25 text-akzent-400/80 hover:bg-akzent-500/20 hover:text-akzent-400 transition font-mono"
                        >
                          ↓ JSON
                        </button>
                      )}
                      <button onClick={zurueckSetzen}
                        className="text-xs text-white/50 hover:text-white/80 transition font-mono ml-auto">
                        [Neues Modul]
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Maltego-Style Graph — nur bei Modul 8 (Orchestrator) mit Graph-Daten */}
      {fertig && aktivesModul?.nummer === "8" && rohdaten && (rohdaten as OrchestratorErgebnis).graph && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#12121f] rounded-t-2xl border border-white/[0.08] border-b-0">
            <span className="font-mono text-[11px] text-white/55">graph_visualization — maltego_style</span>
            <span className="ml-auto font-mono text-[10px] text-akzent-400/70">
              {(rohdaten as OrchestratorErgebnis).graph!.statistik.knoten_gesamt} Knoten · {(rohdaten as OrchestratorErgebnis).graph!.statistik.kanten_gesamt} Kanten
            </span>
          </div>
          <div className="rounded-b-2xl overflow-hidden border border-white/[0.08] border-t-0">
            <OsintGraph
              nodes={(rohdaten as OrchestratorErgebnis).graph!.nodes}
              edges={(rohdaten as OrchestratorErgebnis).graph!.edges}
            />
          </div>
        </motion.div>
      )}

      <div className="mt-6 text-[11px] font-mono text-white/30 text-center leading-relaxed">
        <div><span className="text-akzent-400/55">status:</span> live-checks aktiv</div>
        <div><span className="text-akzent-400/55">privacy:</span> keine dauerhafte speicherung · rate-limit: 3–20/min</div>
      </div>
    </section>
  );
}
