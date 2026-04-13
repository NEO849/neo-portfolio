import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ═══════════════════════════════════════════════════════
// OSINT TOOLKIT – INTERAKTIVE TERMINAL-DEMO v4
// Module: Status, E-Mail, Username, Domain, Telefon, Reverse Image
// ═══════════════════════════════════════════════════════

interface DemoModul {
  readonly nummer: string;
  readonly name: string;
  readonly farbe: string;
  readonly eingabeLabel: string;
  readonly beispielEingabe: string;
  readonly eingabeTyp: "text" | "file" | "none";
}

const DEMO_MODULE: DemoModul[] = [
  { nummer: "1", name: "Status pruefen",         farbe: "#9ca3af", eingabeLabel: "",                     beispielEingabe: "",                  eingabeTyp: "none" },
  { nummer: "2", name: "E-Mail Analyse",         farbe: "#818cf8", eingabeLabel: "E-Mail eingeben",     beispielEingabe: "demo@example.com",  eingabeTyp: "text" },
  { nummer: "3", name: "Username Suche",         farbe: "#c084fc", eingabeLabel: "Username eingeben",   beispielEingabe: "cypherneo",         eingabeTyp: "text" },
  { nummer: "4", name: "Telefon Analyse",        farbe: "#eab308", eingabeLabel: "Telefonnummer",       beispielEingabe: "+491701234567",     eingabeTyp: "text" },
  { nummer: "5", name: "Domain / DNS / WHOIS",   farbe: "#22d3ee", eingabeLabel: "Domain eingeben",    beispielEingabe: "example.com",       eingabeTyp: "text" },
  { nummer: "6", name: "Reverse Image",          farbe: "#22c55e", eingabeLabel: "Bildpfad",           beispielEingabe: "/home/neo/foto.jpg", eingabeTyp: "text" },
];

function erstelleAusgabe(modulNummer: string, eingabe: string): string[] {
  const rahmen = (text: string) => [
    "+----------------------------------------------+",
    "|  " + text.substring(0, 42).padEnd(44) + "|",
    "+----------------------------------------------+",
  ];

  if (modulNummer === "1") return [
    ...rahmen("STATUS -- Systempruefung"),
    "", "--- CLI-WERKZEUGE -------------------------",
    "  [ok]  holehe", "  [ok]  sherlock", "  [ok]  phoneinfoga",
    "  [ok]  exiftool", "  [ok]  whois", "  [ok]  dig", "  [ok]  nmap",
    "", "  7 von 7 Werkzeugen verfuegbar",
  ];

  if (modulNummer === "2") return [
    ...rahmen("E-MAIL ANALYSE -- " + eingabe),
    "", "--- ERGEBNIS-ZUSAMMENFASSUNG ---------------",
    "  Zielwert             : " + eingabe,
    "  Positive Dienste     : 5",
    "  Confidence           : mittel",
    "", "--- REGISTRIERUNGEN GEFUNDEN ---------------",
    "  [1]  Twitter", "  [2]  Instagram", "  [3]  Spotify",
    "  [4]  Pinterest", "  [5]  Adobe",
    "", "--- EXPOSURE / LEAKCHECK -------------------",
    "  Treffer gefunden     : Ja",
    "  Trefferanzahl        : 2",
    "  Quellen:",
    "    [1]  Collection #1 (2019)",
    "    [2]  LinkedIn Scrape (2021)",
    "", "--- GESPEICHERTE REPORTS -------------------",
    "  TXT   email_reports/" + eingabe + "/report.txt",
    "  JSON  email_reports/" + eingabe + "/report.json",
    "", "  5 positive Dienste erkannt",
  ];

  if (modulNummer === "3") return [
    ...rahmen("USERNAME SUCHE -- " + eingabe),
    "", "--- ERGEBNIS-ZUSAMMENFASSUNG ---------------",
    "  Zielwert        : " + eingabe,
    "  Positive Treffer: 7",
    "  Gruppen         : 4",
    "", "--- VERIFIZIERTE TREFFER -------------------",
    "  Social Media",
    "    [1]  Instagram     -> instagram.com/" + eingabe,
    "    [2]  Twitter       -> twitter.com/" + eingabe,
    "  Development",
    "    [3]  GitHub        -> github.com/" + eingabe,
    "    [4]  GitLab        -> gitlab.com/" + eingabe,
    "  Gaming",
    "    [5]  Steam         -> steamcommunity.com/id/" + eingabe,
    "  Sonstige",
    "    [6]  Keybase", "    [7]  HackerNews",
    "", "  7 Treffer auf Plattformen",
  ];

  if (modulNummer === "4") {
    const landCode = eingabe.startsWith("+49") ? "DE" : eingabe.startsWith("+1") ? "US" : eingabe.startsWith("+44") ? "GB" : "XX";
    const landName = landCode === "DE" ? "Germany" : landCode === "US" ? "United States" : landCode === "GB" ? "United Kingdom" : "Unknown";
    const carrier = landCode === "DE" ? "T-Mobile / Telekom" : landCode === "US" ? "Verizon Wireless" : "Unknown Carrier";
    const leitungstyp = "mobile";
    const lokalFormat = eingabe.replace(/^\+\d{1,3}/, "0");

    return [
      ...rahmen("TELEFON ANALYSE -- " + eingabe),
      "", "--- ERGEBNIS-ZUSAMMENFASSUNG ---------------",
      "  Zielwert              : " + eingabe,
      "  Suchlink-Kategorien   : 4",
      "  Gesamtzahl Suchlinks  : 23",
      "  Werkzeug              : phoneinfoga",
      "", "--- NUMVERIFY BASISDATEN -------------------",
      "  Gueltig               : Ja",
      "  Internationale Form   : " + eingabe,
      "  Lokale Form           : " + lokalFormat,
      "  Land                  : " + landName,
      "  Land-Code             : " + landCode,
      "  Carrier               : " + carrier,
      "  Leitungstyp           : " + leitungstyp,
      "", "--- EXPOSURE / LEAKCHECK -------------------",
      "  Quelle                : LeakCheck",
      "  Telefonsuche versucht : Ja",
      "  Treffer gefunden      : Nein",
      "  Trefferanzahl         : 0",
      "", "--- KATEGORIEN -----------------------------",
      "  Social Media           : 8 Links",
      "  Disposable Providers   : 3 Links",
      "  Reputation             : 7 Links",
      "  Individuals            : 5 Links",
      "", "--- WICHTIGSTE SUCHLINKS -------------------",
      "  Social Media",
      "    [1]  facebook.com/search/?q=" + eingabe,
      "    [2]  linkedin.com/search/results/?keywords=" + eingabe,
      "  Reputation",
      "    [3]  sync.me/" + eingabe,
      "    [4]  truecaller.com/search/" + eingabe,
      "", "--- GESPEICHERTE REPORTS -------------------",
      "  TXT   phone_reports/" + eingabe + "/report.txt",
      "  JSON  phone_reports/" + eingabe + "/report.json",
      "", "  23 strukturierte Suchlinks erkannt",
    ];
  }

  if (modulNummer === "5") return [
    ...rahmen("DOMAIN / DNS / WHOIS -- " + eingabe),
    "", "--- DNS-RECORDS ----------------------------",
    "  A     ->  93.184.216.34",
    "  MX    ->  0 mx." + eingabe,
    "  NS    ->  a.iana-servers.net.",
    "        ->  b.iana-servers.net.",
    '  TXT   ->  "v=spf1 -all"',
    "", "--- WHOIS-AUSZUG ---------------------------",
    "  Domain Name: " + eingabe.toUpperCase(),
    "  Registrar: RESERVED-Internet Assigned ...",
    "  Creation Date: 1995-08-14",
    "", "  4 DNS-Records mit Daten gefunden",
  ];

  if (modulNummer === "6") {
    const dateiname = eingabe.split("/").pop() || "bild.jpg";
    return [
      ...rahmen("REVERSE IMAGE -- " + dateiname),
      "", "--- BILD-INFORMATIONEN ---------------------",
      "  Dateipfad       : " + eingabe,
      "  Dateiname       : " + dateiname,
      "  Format          : JPEG",
      "  Groesse         : 2.4 MB",
      "  Aufloesung      : 3024 x 4032 px",
      "", "--- HASHES ---------------------------------",
      "  MD5     : a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
      "  SHA256  : 9f86d08...c150e04a8d",
      "  pHash   : d4e5f6a1b2c3d4e5",
      "", "--- EXIF-METADATEN -------------------------",
      "  Kamera          : Apple iPhone 15 Pro",
      "  Aufnahmedatum   : 2026-03-15 14:23:07",
      "  GPS-Koordinaten : 48.7731, 12.8684",
      "  Software        : 17.3.1",
      "  Blende          : f/1.78",
      "  ISO             : 64",
      "", "--- BILDVARIANTEN ERZEUGT ------------------",
      "  [1]  original       3024x4032  2.4 MB",
      "  [2]  gespiegelt     3024x4032  2.4 MB",
      "  [3]  zugeschnitten  2400x2400  1.8 MB",
      "  [4]  graustufen     3024x4032  1.1 MB",
      "", "--- SUCHLINKS ------------------------------",
      "  [1]  Google Images  -> lens.google.com/...",
      "  [2]  Yandex Images  -> yandex.com/images/...",
      "  [3]  TinEye         -> tineye.com/search/...",
      "  [4]  Bing Visual    -> bing.com/images/...",
      "", "--- BROWSER-SUCHE (automatisch) ------------",
      "  Google : 3 visuell aehnliche Treffer",
      "  Yandex : 7 visuell aehnliche Treffer",
      "  TinEye : 0 exakte Treffer",
      "", "--- GESPEICHERTE REPORTS -------------------",
      "  TXT   reverse_image/" + dateiname + "/report.txt",
      "  JSON  reverse_image/" + dateiname + "/report.json",
      "  HTML  reverse_image/" + dateiname + "/report.html",
      "", "  4 Suchlinks + 10 Browser-Treffer",
    ];
  }

  return ["  Modul nicht verfuegbar in der Demo"];
}

export default function OsintDemoView() {
  const [phase, setPhase] = useState<"menue" | "eingabe" | "ausgabe">("menue");
  const [aktivesModul, setAktivesModul] = useState<DemoModul | null>(null);
  const [eingabeWert, setEingabeWert] = useState("");
  const [ausgabeZeilen, setAusgabeZeilen] = useState<string[]>([]);
  const [zeilenIndex, setZeilenIndex] = useState(0);
  const [fertig, setFertig] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const eingabeRef = useRef<HTMLInputElement>(null);

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
    }, 35);
    return () => clearInterval(intervall);
  }, [phase, ausgabeZeilen]);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [zeilenIndex]);

  useEffect(() => {
    if (phase === "eingabe" && eingabeRef.current) eingabeRef.current.focus();
  }, [phase]);

  const modulStarten = useCallback((modul: DemoModul) => {
    setAktivesModul(modul);
    if (modul.eingabeTyp === "none") {
      setAusgabeZeilen(erstelleAusgabe(modul.nummer, ""));
      setPhase("ausgabe");
    } else {
      setEingabeWert(modul.beispielEingabe);
      setPhase("eingabe");
    }
  }, []);

  const eingabeAbsenden = useCallback(() => {
    if (!aktivesModul || !eingabeWert.trim()) return;
    setAusgabeZeilen(erstelleAusgabe(aktivesModul.nummer, eingabeWert.trim()));
    setPhase("ausgabe");
  }, [aktivesModul, eingabeWert]);

  const zurueckSetzen = useCallback(() => {
    setPhase("menue");
    setAktivesModul(null);
    setEingabeWert("");
    setAusgabeZeilen([]);
    setZeilenIndex(0);
    setFertig(false);
  }, []);

  const zeileFarbe = (zeile: string): string => {
    if (zeile.includes("[ok]")) return "text-signal-gruen";
    if (zeile.match(/^\s{2}(Zielwert|Positive|Confidence|Treffer|Quellen|Gruppen|Gueltig|Internationale|Lokale|Land|Carrier|Leitungstyp|Telefonsuche|Quelle|Dateipfad|Dateiname|Format|Groesse|Aufloesung|Kamera|Aufnahmedatum|GPS|Software|Blende|ISO|Google|Yandex|TinEye)/)) return "text-white/60";
    if (zeile.match(/^\s{2}(Social|Disposable|Reputation|Individuals)\s+:/)) return "text-white/50";
    if (zeile.match(/^\s+\[\d+\]/)) return "text-cyber-400";
    if (zeile.startsWith("+--")) return "text-white/25";
    if (zeile.startsWith("|")) return "text-white/45";
    if (zeile.startsWith("---")) return "text-akzent-400/30";
    if (zeile.includes("TXT") || zeile.includes("JSON") || zeile.includes("HTML")) return "text-signal-gelb/60";
    if (zeile.includes("->")) return "text-white/45";
    if (zeile.includes("erkannt") || zeile.includes("verfuegbar") || zeile.includes("gefunden") || zeile.includes("Treffer")) return "text-signal-gruen/70";
    if (zeile.match(/^\s{2}(MD5|SHA256|pHash)/)) return "text-akzent-400/50";
    if (zeile.match(/^\s{2}(Social Media|Development|Gaming|Sonstige)$/)) return "text-white/35";
    return "text-white/65";
  };

  return (
    <section className="py-16 px-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <p className="font-mono text-sm text-signal-gruen mb-2">&gt; osint_toolkit.demo()</p>
        <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">OSINT Toolkit — Live Demo</h3>
        <p className="text-white/40 text-sm mb-6">Interaktive Vorschau meines 7-Modul OSINT-Frameworks. Waehle ein Modul und gib eigene Testdaten ein.</p>
      </motion.div>

      <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/40">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#12121f] border-b border-white/5">
          <div className="flex gap-1.5">
            <button onClick={zurueckSetzen} className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-125 transition" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="font-mono text-[11px] text-white/25 ml-3">neo@contabo-vps:~/osint-toolkit$ python3 main.py</span>
        </div>

        <div ref={terminalRef} className="bg-[#08080f] p-5 md:p-6 font-mono text-[13px] leading-relaxed min-h-[400px] max-h-[520px] overflow-y-auto">
          <AnimatePresence mode="wait">
            {phase === "menue" && (
              <motion.div key="menue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <div className="text-white/30 text-xs mb-3">+== HAUPTMENUE -- Interaktive Auswahl ==+</div>
                {DEMO_MODULE.map(modul => (
                  <button key={modul.nummer} onClick={() => modulStarten(modul)}
                    className="block w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all group">
                    <span className="text-white/30">[</span>
                    <span style={{ color: modul.farbe }} className="font-bold">{modul.nummer}</span>
                    <span className="text-white/30">]  </span>
                    <span className="text-white/60 group-hover:text-white transition">{modul.name}</span>
                  </button>
                ))}
                <div className="mt-3 text-white/15 text-xs">+======================================+</div>
                <div className="mt-2 flex items-center">
                  <span className="text-signal-gruen/60">Auswahl eingeben: </span>
                  <span className="terminal-text text-white/40"></span>
                </div>
              </motion.div>
            )}

            {phase === "eingabe" && aktivesModul && (
              <motion.div key="eingabe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <div className="text-white/30 text-xs mb-3">Modul: {aktivesModul.name}</div>
                <div className="flex items-center gap-2">
                  <span style={{ color: aktivesModul.farbe }} className="font-bold whitespace-nowrap">{aktivesModul.eingabeLabel}:</span>
                  <input ref={eingabeRef} type="text" value={eingabeWert}
                    onChange={(event) => setEingabeWert(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && eingabeAbsenden()}
                    className="flex-1 bg-transparent border-none outline-none text-white caret-signal-gruen font-mono text-[13px]"
                    spellCheck={false} autoComplete="off"
                  />
                </div>
                <div className="mt-4 flex gap-3">
                  <button onClick={eingabeAbsenden}
                    className="text-xs px-3 py-1.5 rounded-lg bg-akzent-500/20 border border-akzent-400/30 text-akzent-400 hover:bg-akzent-500/30 transition">
                    Enter
                  </button>
                  <button onClick={zurueckSetzen}
                    className="text-xs px-3 py-1.5 rounded-lg text-white/30 hover:text-white/60 transition">
                    Zurueck
                  </button>
                </div>
              </motion.div>
            )}

            {phase === "ausgabe" && (
              <motion.div key="ausgabe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {ausgabeZeilen.slice(0, zeilenIndex + 1).map((zeile, index) => (
                  <div key={index} className={`whitespace-pre ${zeileFarbe(zeile)}`}>
                    {zeile || "\u00A0"}
                  </div>
                ))}
                {!fertig && <span className="terminal-text text-signal-gruen/60"></span>}
                {fertig && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4">
                    <button onClick={zurueckSetzen}
                      className="text-xs text-akzent-400/60 hover:text-akzent-400 transition font-mono">
                      Neues Modul waehlen
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-center text-[11px] text-white/15 mt-4 font-mono">
        Demo-Modus -- Eingaben werden lokal verarbeitet, echte Analysen laufen auf dem Contabo VPS
      </p>
    </section>
  );
}
