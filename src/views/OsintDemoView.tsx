import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  domainAnalysieren, emailAnalysieren, benutzernameSuchen,
  telefonAnalysieren, bildAnalysieren,
  Apifehler,
  type DomainErgebnis, type EmailErgebnis, type BenutzerErgebnis,
  type TelefonErgebnis, type BildErgebnis,
} from "../dienste/osintApi";
import { DatenschutzModal } from "../bausteine/DatenschutzModal";

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

const DEMO_MODULE: DemoModul[] = [
  { nummer: "1", name: "Status pruefen",        farbe: "#9ca3af", eingabeLabel: "",                    beispielEingabe: "",              eingabeTyp: "none" },
  { nummer: "2", name: "E-Mail Analyse",        farbe: "#818cf8", eingabeLabel: "E-Mail eingeben",    beispielEingabe: "demo@gmail.com", eingabeTyp: "text" },
  { nummer: "3", name: "Username Suche",        farbe: "#c084fc", eingabeLabel: "Username eingeben",  beispielEingabe: "cypherneo",      eingabeTyp: "text" },
  { nummer: "4", name: "Telefon Analyse",       farbe: "#eab308", eingabeLabel: "Telefonnummer",   beispielEingabe: "+4915112345678",        eingabeTyp: "text" },
  { nummer: "5", name: "Domain / DNS / WHOIS",  farbe: "#22d3ee", eingabeLabel: "Domain eingeben", beispielEingabe: "example.com",            eingabeTyp: "text" },
  { nummer: "6", name: "Reverse Image",         farbe: "#22c55e", eingabeLabel: "Bild-URL",        beispielEingabe: "https://example.com/foto.jpg", eingabeTyp: "text" },
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

// ─── Terminal-Formatter für Telefon ──────────────────────────────

function telefonZuTerminal(t: TelefonErgebnis): string[] {
  if (!t.gueltig || t.fehler) {
    return [
      `+----------------------------------------------+`,
      `|  TELEFON ANALYSE -- Fehler                   |`,
      `+----------------------------------------------+`,
      "", `  ${t.fehler ?? "Ungültige Nummer"}`,
    ];
  }
  const zeilen: string[] = [
    `+----------------------------------------------+`,
    `|  TELEFON ANALYSE -- ${(t.format?.e164 ?? t.nummer).substring(0, 25).padEnd(25)}|`,
    `+----------------------------------------------+`,
    "", "--- FORMAT ------------------------------------",
    `  International : ${t.format?.international}`,
    `  National      : ${t.format?.national}`,
    `  E.164         : ${t.format?.e164}`,
    "", "--- METADATEN ---------------------------------",
    `  Land          : ${t.metadaten?.land_code} — ${t.metadaten?.region}`,
    `  Leitungstyp   : ${t.metadaten?.leitungstyp}`,
    `  Carrier       : ${t.metadaten?.carrier}`,
    `  Zeitzone      : ${t.metadaten?.zeitzonen.join(", ")}`,
  ];
  if (t.suchlinks?.nach_kategorie) {
    zeilen.push("", "--- SUCHLINKS (nicht automatisch aufgerufen) --");
    for (const [kat, links] of Object.entries(t.suchlinks.nach_kategorie)) {
      zeilen.push(`  ${kat}`);
      for (const link of links) {
        zeilen.push(`    [+]  ${link.name}`);
      }
    }
    zeilen.push(``, `  ${t.suchlinks.gesamt} Suchlinks generiert`);
  }
  if (t.risiko?.details.length) {
    zeilen.push("", "--- HINWEISE ----------------------------------");
    for (const d of t.risiko.details) zeilen.push(`  [!]  ${d}`);
  }
  zeilen.push("", `  Analysiert: ${t.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
  return zeilen;
}

// ─── Terminal-Formatter für Bild ─────────────────────────────────

function bildZuTerminal(b: BildErgebnis): string[] {
  if (b.fehler) {
    return [
      `+----------------------------------------------+`,
      `|  BILD ANALYSE -- Fehler                      |`,
      `+----------------------------------------------+`,
      "", `  ${b.fehler}`,
    ];
  }
  const dateiname = b.url.split("/").pop()?.split("?")[0] ?? "bild";
  const zeilen: string[] = [
    `+----------------------------------------------+`,
    `|  BILD ANALYSE -- ${dateiname.substring(0, 28).padEnd(28)}|`,
    `+----------------------------------------------+`,
    "", "--- BILD-INFO ---------------------------------",
    `  Format        : ${b.bild?.format}`,
    `  Auflösung     : ${b.bild?.breite} x ${b.bild?.hoehe} px`,
    `  Größe         : ${b.bild?.groesse_kb} KB (${b.bild?.groesse_mb} MB)`,
    "", "--- HASHES ------------------------------------",
    `  MD5    : ${b.hashes?.md5}`,
    `  SHA256 : ${b.hashes?.sha256}`,
    `  pHash  : ${b.hashes?.phash}`,
  ];
  if (b.exif?.verfuegbar) {
    zeilen.push("", "--- EXIF-METADATEN ----------------------------");
    if (b.exif.kamera)        zeilen.push(`  Kamera         : ${b.exif.kamera}`);
    if (b.exif.aufnahmedatum) zeilen.push(`  Aufnahmedatum  : ${b.exif.aufnahmedatum}`);
    if (b.exif.software)      zeilen.push(`  Software       : ${b.exif.software}`);
    if (b.exif.iso)           zeilen.push(`  ISO            : ${b.exif.iso}`);
    if (b.exif.blende)        zeilen.push(`  Blende         : f/${b.exif.blende}`);
    if (b.exif.gps) {
      zeilen.push(`  GPS            : ${b.exif.gps.lat}, ${b.exif.gps.lon}`);
      zeilen.push(`  Maps-Link      : ${b.exif.gps.maps_link}`);
    }
  } else {
    zeilen.push("", "  EXIF: Keine Metadaten gefunden / nicht verfügbar");
  }
  if (b.sicherheits_hinweise?.length) {
    zeilen.push("", "--- SICHERHEITSANALYSE ------------------------");
    for (const h of b.sicherheits_hinweise) {
      const prefix = h.stufe === "hoch" ? "[!]" : "[i]";
      zeilen.push(`  ${prefix}  ${h.meldung}`);
    }
  }
  if (b.suchlinks?.length) {
    zeilen.push("", "--- REVERSE IMAGE SUCHLINKS -------------------");
    for (const link of b.suchlinks) {
      zeilen.push(`  [+]  ${link.name}`);
    }
  }
  zeilen.push("", `  Analysiert: ${b.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
  return zeilen;
}

// ─── Demo-Ausgaben für Module ohne Backend ────────────────────────

function erstelleDemoAusgabe(modulNummer: string, eingabe: string): string[] {
  const rahmen = (text: string) => [
    "+----------------------------------------------+",
    "|  " + text.substring(0, 44).padEnd(44) + "|",
    "+----------------------------------------------+",
  ];

  if (modulNummer === "1") return [
    ...rahmen("STATUS -- Systempruefung"),
    "", "--- LIVE-BACKEND (Contabo VPS) ------------",
    "  [ok]  FastAPI v0.115",
    "  [ok]  dnspython (DNS-Resolver)",
    "  [ok]  python-whois (WHOIS)",
    "  [ok]  httpx (HTTP-Client)",
    "  [ok]  slowapi (Rate-Limiter)",
    "", "--- WERKZEUGE (LIVE) ---------------------",
    "  [ok]  Domain / DNS / WHOIS  (Modul 5)",
    "  [ok]  E-Mail Analyse        (Modul 2)",
    "  [ok]  Username Suche        (Modul 3)",
    "  [--]  Telefon Analyse       (Demo-Modus)",
    "  [--]  Reverse Image         (Demo-Modus)",
    "", "  3 von 5 Werkzeugen live aktiv",
  ];

  if (modulNummer === "4") {
    const landCode = eingabe.startsWith("+49") ? "DE" : eingabe.startsWith("+1") ? "US" : "XX";
    const carrier = landCode === "DE" ? "T-Mobile / Telekom" : "Unknown Carrier";
    return [
      ...rahmen("TELEFON ANALYSE -- " + eingabe),
      "", "  [Demo-Modus -- phoneinfoga nicht verfuegbar]",
      "", "--- NUMVERIFY BASISDATEN -------------------",
      "  Gueltig               : Ja",
      "  Internationale Form   : " + eingabe,
      "  Land-Code             : " + landCode,
      "  Carrier               : " + carrier,
      "  Leitungstyp           : mobile",
      "", "--- SUCHLINKS ------------------------------",
      "  [1]  facebook.com/search/?q=" + eingabe,
      "  [2]  truecaller.com/search/" + eingabe,
      "", "  Demo-Ausgabe / keine echten Daten",
    ];
  }

  if (modulNummer === "6") {
    const dateiname = eingabe.split("/").pop() || "bild.jpg";
    return [
      ...rahmen("REVERSE IMAGE -- " + dateiname),
      "", "  [Demo-Modus -- exiftool nicht verfuegbar]",
      "", "--- BILD-HASHES ----------------------------",
      "  MD5     : a1b2c3d4e5f6 (Demo)",
      "  pHash   : d4e5f6a1b2c3 (Demo)",
      "", "--- SUCHLINKS ------------------------------",
      "  [1]  Google Lens  -> lens.google.com/...",
      "  [2]  TinEye       -> tineye.com/search/...",
      "  [3]  Yandex       -> yandex.com/images/...",
      "", "  Demo-Ausgabe / keine echten Daten",
    ];
  }

  return ["  Modul nicht verfuegbar"];
}

// ─── Echte API → Terminal-Format ─────────────────────────────────

function domainZuTerminal(d: DomainErgebnis): string[] {
  const zeilen: string[] = [
    `+----------------------------------------------+`,
    `|  DOMAIN ANALYSE -- ${d.domain.substring(0, 25).padEnd(25)}|`,
    `+----------------------------------------------+`,
    "", "--- DNS-RECORDS ----------------------------",
  ];
  if (d.dns.a.length)    zeilen.push(...d.dns.a.map((ip, i) => `  A     [${i + 1}]  ${ip}`));
  if (d.dns.aaaa.length) zeilen.push(`  AAAA  ->  ${d.dns.aaaa[0]}`);
  if (d.dns.mx.length)   zeilen.push(...d.dns.mx.map(mx => `  MX    ->  ${mx}`));
  if (d.dns.ns.length)   zeilen.push(...d.dns.ns.slice(0, 2).map(ns => `  NS    ->  ${ns}`));
  if (d.dns.spf)         zeilen.push(`  SPF   ->  ${d.dns.spf.substring(0, 44)}`);
  if (d.dns.dmarc)       zeilen.push(`  DMARC ->  ${d.dns.dmarc.substring(0, 44)}`);

  zeilen.push("", "--- ASN / PROVIDER -------------------------");
  zeilen.push(`  Provider  : ${d.asn}`);

  zeilen.push("", "--- WHOIS ----------------------------------");
  if (d.whois.registrar)      zeilen.push(`  Registrar  : ${String(d.whois.registrar).substring(0, 40)}`);
  if (d.whois.registriert_am) zeilen.push(`  Erstellt   : ${d.whois.registriert_am}`);
  if (d.whois.ablauf_am)      zeilen.push(`  Ablauf     : ${d.whois.ablauf_am}`);
  if (d.whois.fehler)         zeilen.push(`  WHOIS      : ${d.whois.fehler}`);

  zeilen.push("", "--- HTTP -----------------------------------");
  zeilen.push(`  Erreichbar : ${d.http.erreichbar ? "Ja" : "Nein"}`);
  if (d.http.status)  zeilen.push(`  Status     : ${d.http.status}`);
  if (d.http.server)  zeilen.push(`  Server     : ${d.http.server}`);
  if (d.http.weiterleitungsziel) zeilen.push(`  Redirect   : ${d.http.weiterleitungsziel.substring(0, 40)}`);

  const s = d.sicherheits_bewertung;
  zeilen.push("", "--- SICHERHEITSBEWERTUNG -------------------");
  zeilen.push(`  Score      : ${s.punkte}/${s.max} Punkte (${s.prozent}%) -- ${s.note.toUpperCase()}`);
  for (const detail of s.details) {
    zeilen.push(`  ${detail.ok ? "[ok]" : "[--]"}  ${detail.check}`);
  }

  zeilen.push("", `  Analysiert: ${d.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
  return zeilen;
}

function emailZuTerminal(e: EmailErgebnis): string[] {
  if (!e.gueltig) {
    return [
      `+----------------------------------------------+`,
      `|  E-MAIL ANALYSE -- Fehler                    |`,
      `+----------------------------------------------+`,
      "", `  Fehler: ${e.fehler ?? "Ungueltige Adresse"}`,
    ];
  }

  const zeilen: string[] = [
    `+----------------------------------------------+`,
    `|  E-MAIL ANALYSE -- ${(e.adresse ?? "").substring(0, 26).padEnd(26)}|`,
    `+----------------------------------------------+`,
    "", "--- SYNTAX ---------------------------------",
    `  Format     : Gueltig`,
    `  Domain     : ${e.syntax?.domain ?? "?"}`,
    `  Lokal-Teil : ${e.syntax?.lokal_teil ?? "?"}`,
    "", "--- DOMAIN-DNS -----------------------------",
    `  MX-Records : ${e.domain?.hat_mx ? `Ja (${e.domain.mx_records.length} Eintraege)` : "Nein -- Domain empfaengt keine E-Mails"}`,
  ];

  if (e.domain?.spf)   zeilen.push(`  SPF        : ${e.domain.spf.substring(0, 42)}`);
  if (e.domain?.dmarc) zeilen.push(`  DMARC      : ${e.domain.dmarc.substring(0, 42)}`);

  zeilen.push("", "--- KLASSIFIKATION -------------------------");
  zeilen.push(`  Wegwerf    : ${e.klassifikation?.wegwerf ? "JA -- Bekannter Wegwerf-Anbieter" : "Nein"}`);
  zeilen.push(`  Zustellbar : ${e.klassifikation?.zustellbar ? "Ja" : "Nein"}`);

  if (e.datenleck) {
    zeilen.push("", "--- DATENLECK (HaveIBeenPwned) -------------");
    if (!e.datenleck.geprueft) {
      zeilen.push("  Status     : HIBP nicht erreichbar");
    } else if (e.datenleck.domain_betroffen) {
      zeilen.push(`  Domain     : In oeffentlichen Leaks gefunden`);
      if (e.datenleck.anzahl_nutzer) zeilen.push(`  Betroffene : ~${e.datenleck.anzahl_nutzer} Nutzer`);
    } else {
      zeilen.push("  Domain     : Keine bekannten Leaks gefunden");
    }
  }

  if (e.risiko) {
    const risikoFarbe: Record<string, string> = { Hoch: "HOCH", Mittel: "MITTEL", Gering: "GERING", Keines: "KEINES" };
    zeilen.push("", "--- RISIKOBEWERTUNG ------------------------");
    zeilen.push(`  Risiko     : ${risikoFarbe[e.risiko.stufe] ?? e.risiko.stufe} (${e.risiko.punkte} Punkte)`);
    for (const detail of e.risiko.details) {
      zeilen.push(`  [!]  ${detail}`);
    }
  }

  zeilen.push("", `  Analysiert: ${e.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
  return zeilen;
}

function benutzerZuTerminal(b: BenutzerErgebnis): string[] {
  if (b.fehler) {
    return [
      `+----------------------------------------------+`,
      `|  USERNAME SUCHE -- Fehler                    |`,
      `+----------------------------------------------+`,
      "", `  Fehler: ${b.fehler}`,
    ];
  }

  const s = b.zusammenfassung!;
  const zeilen: string[] = [
    `+----------------------------------------------+`,
    `|  USERNAME SUCHE -- ${(b.benutzername ?? "").substring(0, 26).padEnd(26)}|`,
    `+----------------------------------------------+`,
    "", "--- ZUSAMMENFASSUNG ------------------------",
    `  Geprueft     : ${s.geprueft} Plattformen`,
    `  Gefunden     : ${s.gefunden} Treffer`,
    `  Nicht gefunden: ${s.nicht_gefunden}`,
    `  Treffer-Rate : ${s.treffer_rate}%`,
  ];

  if (b.nach_kategorie && Object.keys(b.nach_kategorie).length > 0) {
    zeilen.push("", "--- VERIFIZIERTE TREFFER -------------------");
    for (const [kategorie, plattformen] of Object.entries(b.nach_kategorie)) {
      zeilen.push(`  ${kategorie.charAt(0).toUpperCase() + kategorie.slice(1)}`);
      for (const p of plattformen) {
        const kurzeUrl = p.url.replace("https://", "").replace("http://", "");
        zeilen.push(`    [+]  ${p.plattform.padEnd(18)} -> ${kurzeUrl.substring(0, 28)}`);
      }
    }
  }

  zeilen.push("", `  Analysiert: ${b.analysiert_am.replace("T", " ").substring(0, 19)} UTC`);
  return zeilen;
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
  const terminalRef = useRef<HTMLDivElement>(null);
  const eingabeRef = useRef<HTMLInputElement>(null);

  // ─── Download-Funktionen ──────────────────────────────────────
  const alsTextHerunterladen = useCallback(() => {
    if (!ausgabeZeilen.length || !aktivesModul) return;
    const inhalt = ausgabeZeilen.join("\n");
    const zeitstempel = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
    const dateiname = `osint-${aktivesModul.name.toLowerCase().replace(/\s+/g, "-")}-${zeitstempel}.txt`;
    const blob = new Blob([inhalt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = dateiname; a.click();
    URL.revokeObjectURL(url);
  }, [ausgabeZeilen, aktivesModul]);

  const alsJsonHerunterladen = useCallback(() => {
    if (!rohdaten || !aktivesModul) return;
    const zeitstempel = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
    const dateiname = `osint-${aktivesModul.name.toLowerCase().replace(/\s+/g, "-")}-${zeitstempel}.json`;
    const blob = new Blob([JSON.stringify(rohdaten, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = dateiname; a.click();
    URL.revokeObjectURL(url);
  }, [rohdaten, aktivesModul]);

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

      if (aktivesModul.nummer === "5") {
        const ergebnis = await domainAnalysieren(wert);
        zeilen = domainZuTerminal(ergebnis);
        setRohdaten(ergebnis);
      } else if (aktivesModul.nummer === "2") {
        const ergebnis = await emailAnalysieren(wert);
        zeilen = emailZuTerminal(ergebnis);
        setRohdaten(ergebnis);
      } else if (aktivesModul.nummer === "3") {
        const ergebnis = await benutzernameSuchen(wert);
        zeilen = benutzerZuTerminal(ergebnis);
        setRohdaten(ergebnis);
      } else if (aktivesModul.nummer === "4") {
        const ergebnis = await telefonAnalysieren(wert);
        zeilen = telefonZuTerminal(ergebnis);
        setRohdaten(ergebnis);
      } else if (aktivesModul.nummer === "6") {
        const ergebnis = await bildAnalysieren(wert);
        zeilen = bildZuTerminal(ergebnis);
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
    if (zeile.includes("[--]")) return "text-white/35";
    if (zeile.startsWith("+--")) return "text-white/20";
    if (zeile.startsWith("|")) return "text-white/40";
    if (zeile.startsWith("---")) return "text-akzent-400/40";
    if (zeile.includes("  Score") || zeile.includes("  Risiko") || zeile.includes("  Erreichbar")) return "text-white";
    if (zeile.includes("Analysiert:")) return "text-white/25";
    if (zeile.match(/^\s{2}[A-Z][A-Za-z-]+\s+:/)) return "text-white/55";
    if (zeile.match(/^\s{2}(Social|Development|Gaming|Beruf|Sicherheit|Sonstige)/)) return "text-white/35";
    if (zeile.includes("->")) return "text-white/40";
    return "text-white/65";
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
        <p className="font-mono text-sm text-signal-gruen mb-2">&gt; osint_toolkit.live()</p>
        <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">OSINT Toolkit — Live</h3>
        <p className="text-white/40 text-sm mb-6">
          Domain, E-Mail und Username werden live gegen echte Datenquellen geprüft.
          Deine Daten verlassen den Browser nur für die Analyse — keine Speicherung.
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
          <span className="font-mono text-[11px] text-white/25 ml-3">
            neo@vps:~/osint-toolkit$ python3 main.py
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-signal-gruen animate-pulse" />
            <span className="font-mono text-[10px] text-signal-gruen/60">LIVE</span>
          </div>
        </div>

        {/* Terminal-Körper */}
        <div ref={terminalRef}
          className="bg-[#08080f] p-5 md:p-6 font-mono text-[13px] leading-relaxed min-h-[420px] max-h-[540px] overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">

            {/* Menü */}
            {phase === "menue" && (
              <motion.div key="menue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <div className="text-white/25 text-xs mb-3">+== OSINT TOOLKIT -- Modul waehlen ==+</div>
                {DEMO_MODULE.map(modul => (
                  <button key={modul.nummer} onClick={() => modulStarten(modul)}
                    className="block w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all group">
                    <span className="text-white/30">[</span>
                    <span style={{ color: modul.farbe }} className="font-bold">{modul.nummer}</span>
                    <span className="text-white/30">]  </span>
                    <span className="text-white/60 group-hover:text-white transition">{modul.name}</span>
                    {modul.eingabeTyp === "text" && modul.nummer !== "4" && modul.nummer !== "6" && (
                      <span className="ml-2 text-[10px] text-signal-gruen/50">LIVE</span>
                    )}
                    {(modul.nummer === "4" || modul.nummer === "6") && (
                      <span className="ml-2 text-[10px] text-signal-gelb/60">LIVE ⚠</span>
                    )}
                  </button>
                ))}
                <div className="mt-3 text-white/15 text-xs">+====================================+</div>
              </motion.div>
            )}

            {/* Eingabe */}
            {phase === "eingabe" && aktivesModul && (
              <motion.div key="eingabe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <div className="text-white/25 text-xs mb-3">
                  Modul [{aktivesModul.nummer}]: {aktivesModul.name}
                  {aktivesModul.eingabeTyp === "text" && <span className="ml-2 text-signal-gruen/50">— LIVE API</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: aktivesModul.farbe }} className="whitespace-nowrap">{aktivesModul.eingabeLabel}:</span>
                  <input ref={eingabeRef} type="text" value={eingabeWert}
                    onChange={(event) => setEingabeWert(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && eingabeAbsenden()}
                    className="flex-1 bg-transparent border-none outline-none text-white caret-signal-gruen font-mono text-[13px]"
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
                    className="text-xs px-3 py-1.5 rounded-lg text-white/30 hover:text-white/60 transition">
                    Zurueck
                  </button>
                </div>
              </motion.div>
            )}

            {/* Laden */}
            {phase === "laden" && (
              <motion.div key="laden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <div className="text-white/25 text-xs mb-4">Anfrage wird verarbeitet...</div>
                <div className="flex items-center gap-2 text-signal-gruen/70">
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >▶</motion.span>
                  <span>Verbindung zur OSINT-API...</span>
                </div>
                <div className="mt-2 text-white/30 text-xs">
                  POST /api/v1/osint/{aktivesModul?.nummer === "5" ? "domain" : aktivesModul?.nummer === "2" ? "email" : "benutzername"}
                </div>
              </motion.div>
            )}

            {/* Ausgabe */}
            {phase === "ausgabe" && (
              <motion.div key="ausgabe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {ausgabeZeilen.slice(0, zeilenIndex + 1).map((zeile, index) => (
                  <div key={index} className={`whitespace-pre-wrap break-words ${zeileFarbe(zeile)}`}>
                    {zeile || "\u00A0"}
                  </div>
                ))}
                {!fertig && <span className="text-signal-gruen/60 animate-pulse">█</span>}
                {fertig && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-5 border-t border-white/5 pt-4">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Download TXT */}
                      <button
                        onClick={alsTextHerunterladen}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-signal-gruen/10 border border-signal-gruen/25 text-signal-gruen/80 hover:bg-signal-gruen/20 hover:text-signal-gruen transition font-mono"
                      >
                        ↓ TXT
                      </button>
                      {/* Download JSON — nur bei Live-Modulen */}
                      {rohdaten && (
                        <button
                          onClick={alsJsonHerunterladen}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-akzent-500/10 border border-akzent-400/25 text-akzent-400/80 hover:bg-akzent-500/20 hover:text-akzent-400 transition font-mono"
                        >
                          ↓ JSON
                        </button>
                      )}
                      <button onClick={zurueckSetzen}
                        className="text-xs text-white/25 hover:text-white/60 transition font-mono ml-auto">
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

      <p className="text-center text-[11px] text-white/15 mt-4 font-mono">
        Module 2, 3, 5 live — Daten werden nicht gespeichert — Rate-Limit: 3–10 Anfragen/Minute
      </p>
    </section>
  );
}
