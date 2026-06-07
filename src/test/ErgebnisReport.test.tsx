// ═══════════════════════════════════════════════════════════════════
// TEST: ErgebnisReport — Render-Smoke über alle Module
//
// Stellt sicher, dass die interaktive Report-Ansicht für jedes Modul
// mit repräsentativen Mock-Daten ohne Crash rendert und Kerninhalte +
// klickbare Links erzeugt. Fängt Daten-zu-View-Drift ab — ohne Backend.
// ═══════════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import ErgebnisReport from "../bausteine/osint/ErgebnisReport";

const JETZT = "2026-06-07T12:00:00Z";

describe("ErgebnisReport — Render-Smoke alle Module", () => {
  it("Modul 2 (E-Mail): rendert Identität + Breach-Sektion", () => {
    const daten = {
      basis: {
        adresse: "demo@example.com", gueltig: true, analysiert_am: JETZT,
        syntax: { lokal_teil: "demo", domain: "example.com" },
        domain: { mx_records: ["mx.example.com"], hat_mx: true, a_records: [], spf: "v=spf1", dmarc: "v=DMARC1" },
        klassifikation: { wegwerf: false, zustellbar: true },
        risiko: { stufe: "Mittel", punkte: 4, details: ["x"] },
      },
      recon: {
        email: "demo@example.com", gueltig: true, analysiert_am: JETZT, domain: "example.com",
        hashes: { md5: "abc", sha1: "def", sha256: "ghi" },
        hibp: { geprueft: true, domain_betroffen: false },
        xposedornot: { geprueft: true, anzahl_breaches: 0 },
        github: { gefunden: true, treffer: 1, nutzer: [{ login: "demo", url: "https://github.com/demo", avatar: "", typ: "User" }] },
        risiko: { stufe: "Mittel", punkte: 4, details: ["y"] },
      },
    };
    render(<ErgebnisReport modulNummer="2" daten={daten} />);
    expect(screen.getByText("example.com")).toBeInTheDocument();
    expect(screen.getByText(/Datenlecks/i)).toBeInTheDocument();
    // GitHub-Link klickbar
    const link = screen.getByRole("link", { name: /@demo/i });
    expect(link).toHaveAttribute("href", "https://github.com/demo");
  });

  it("Modul 3 (Username): klickbare Profil-Chips", () => {
    const daten = {
      benutzername: "torvalds", analysiert_am: JETZT, modus: "vollscan",
      zusammenfassung: { geprueft: 600, gefunden: 2, nicht_gefunden: 598, fehler: 0, treffer_rate: 1, konfidenz_hoch: 2, konfidenz_mittel: 0, konfidenz_niedrig: 0 },
      nach_kategorie: {
        entwicklung: [{ plattform: "GitHub", kategorie: "entwicklung", url: "https://github.com/torvalds", gefunden: true, konfidenz: "hoch" }],
      },
    };
    render(<ErgebnisReport modulNummer="3" daten={daten} />);
    const link = screen.getByRole("link", { name: /GitHub/i });
    expect(link).toHaveAttribute("href", "https://github.com/torvalds");
  });

  it("Modul 4 (Telefon): Suchlinks sind klickbar", () => {
    const daten = {
      nummer: "+12025550143", analysiert_am: JETZT, gueltig: true,
      format: { international: "+1 202-555-0143", national: "(202) 555-0143", e164: "+12025550143", rfc3966: "tel:+1-202-555-0143" },
      metadaten: { land_code: "US", leitungstyp: "Festnetz", region: "USA", carrier: "", zeitzonen: ["America/New_York"] },
      suchlinks: { gesamt: 1, nach_kategorie: { Reverse: [{ name: "Truecaller", url: "https://truecaller.com/x", kategorie: "Reverse" }] } },
    };
    render(<ErgebnisReport modulNummer="4" daten={daten} />);
    expect(screen.getByRole("link", { name: /Truecaller/i })).toHaveAttribute("href", "https://truecaller.com/x");
  });

  it("Modul 5 (Domain & Shodan): CVE wird zu NVD-Link", () => {
    const daten = {
      domain: {
        domain: "example.com", analysiert_am: JETZT,
        dns: { a: ["93.184.216.34"], aaaa: [], mx: [], ns: [], txt: [], spf: "v=spf1", dmarc: null },
        asn: "AS15133 Edgecast", whois: { registrar: "X", registrant: null, registriert_am: null, ablauf_am: null, nameserver: [], land: null, status: null },
        http: { erreichbar: true, status: 200, server: "ECS", sicherheit: [], weiterleitungsziel: null },
        sicherheits_bewertung: { punkte: 4, max: 6, prozent: 67, note: "Mittel", details: [{ check: "HSTS", ok: true }] },
      },
      shodan: {
        ziel: "example.com", eingabe_typ: "domain", analysiert_am: JETZT,
        aggregiert: { ports: [{ port: 443, gefaehrlich: false, service: null }], ports_anzahl: 1, vulns: ["CVE-2021-1234"], vulns_anzahl: 1, tags: [], hostnames: [], cpes: [] },
        risiko: { punkte: 3, max: 10, stufe: "Mittel", details: [] },
      },
    };
    render(<ErgebnisReport modulNummer="5" daten={daten} />);
    expect(screen.getByRole("link", { name: /CVE-2021-1234/ })).toHaveAttribute("href", "https://nvd.nist.gov/vuln/detail/CVE-2021-1234");
  });

  it("Modul 6 (Bild): Reverse-Image-Links klickbar", () => {
    const daten = {
      url: "https://x/y.png", analysiert_am: JETZT,
      bild: { format: "PNG", breite: 10, hoehe: 10, modus: "RGB", groesse_kb: 1, groesse_mb: 0 },
      hashes: { md5: "a", sha256: "b", phash: "c", ahash: "d", dhash: "e" },
      exif: { verfuegbar: false },
      suchlinks: [{ name: "Google Lens", url: "https://lens.google.com/x" }],
      sicherheits_hinweise: [],
    };
    render(<ErgebnisReport modulNummer="6" daten={daten} />);
    expect(screen.getByRole("link", { name: /Google Lens/i })).toHaveAttribute("href", "https://lens.google.com/x");
  });

  it("Modul 7 (Aggregator): gruppierte Link-Chips", () => {
    const daten = {
      typ: "domain", wert: "example.com", analysiert_am: JETZT, anzahl: 1,
      links: [{ name: "crt.sh", kategorie: "Cert", url: "https://crt.sh/?q=example.com" }],
      nach_kategorie: { Cert: [{ name: "crt.sh", kategorie: "Cert", url: "https://crt.sh/?q=example.com" }] },
    };
    render(<ErgebnisReport modulNummer="7" daten={daten} />);
    expect(screen.getByRole("link", { name: /crt\.sh/i })).toHaveAttribute("href", "https://crt.sh/?q=example.com");
  });

  it("Modul 8 (Orchestrator): Statistik-Marken", () => {
    const daten = {
      eingabe: "cloudflare.com", typ: "domain", tiefe: 2, analysiert_am: JETZT,
      graph: { nodes: [], edges: [], statistik: { knoten_gesamt: 5, kanten_gesamt: 4, nach_typ: { domain: 1, ip: 2 } } },
      zusammenfassung: { module_ausgefuehrt: ["domain", "shodan"], pivots_entdeckt: 4 },
    };
    render(<ErgebnisReport modulNummer="8" daten={daten} />);
    expect(screen.getByText(/5 Knoten/)).toBeInTheDocument();
    expect(screen.getByText(/4 Pivots/)).toBeInTheDocument();
  });

  it("Modul 9 (Subdomains): klickbarer Host + Quellen-Status", () => {
    const daten = {
      domain: "github.com", analysiert_am: JETZT,
      zusammenfassung: { gesamt_eindeutig: 1, angezeigt: 1, live_aufgeloest: 1, limit_erreicht: false },
      quellen: { "crt.sh": { ok: false, hinweis: "HTTP 502" }, wayback: { ok: false, hinweis: "HTTP 429" }, commoncrawl: { ok: true, anzahl: 1 } },
      subdomains: [{ host: "api.github.com", quellen: ["commoncrawl"], aktiv: true, ip: "140.82.121.6" }],
    };
    render(<ErgebnisReport modulNummer="9" daten={daten} />);
    expect(screen.getByRole("link", { name: /api\.github\.com/ })).toHaveAttribute("href", "https://api.github.com");
    expect(screen.getByText(/commoncrawl: 1/)).toBeInTheDocument();
  });

  it("Modul 10 (IP-Intel): AS-Holder + Abuse-Mailto", () => {
    const daten = {
      ziel: "1.1.1.1", ip: "1.1.1.1", eingabe_typ: "ip", analysiert_am: JETZT,
      routing: { asns: ["13335"], prefix: "1.1.1.0/24", prefix_inhaber: "Cloudflare", announced: true },
      as: { asn: "13335", holder: "CLOUDFLARENET", typ: "as", announced: true },
      abuse_kontakte: ["abuse@cloudflare.com"],
      links: { ripestat: "https://stat.ripe.net/1.1.1.1", bgp_he: "https://bgp.he.net/ip/1.1.1.1" },
    };
    render(<ErgebnisReport modulNummer="10" daten={daten} />);
    expect(screen.getByText("CLOUDFLARENET")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /abuse@cloudflare\.com/ })).toHaveAttribute("href", "mailto:abuse@cloudflare.com");
  });

  it("Modul 6 (Bild) mit GPS: Vorschau-Img + OSM-Mini-Map + Standort-Verdikt", () => {
    const daten = {
      url: "https://example.com/foto.jpg", analysiert_am: JETZT,
      bild: { format: "JPEG", breite: 4000, hoehe: 3000, modus: "RGB", groesse_kb: 2500, groesse_mb: 2.4 },
      hashes: { md5: "a", sha256: "b", phash: "c", ahash: "d", dhash: "e" },
      exif: { verfuegbar: true, kamera: "Apple iPhone 15", gps: { lat: 48.137154, lon: 11.576124, maps_link: "https://maps.google.com/?q=48.137154,11.576124", hinweis: "x" } },
      suchlinks: [{ name: "TinEye", url: "https://tineye.com/x" }],
      sicherheits_hinweise: [{ stufe: "hoch", meldung: "GPS-Koordinaten im Bild" }],
    };
    const { container } = render(<ErgebnisReport modulNummer="6" daten={daten} />);
    // Vorschau-Thumbnail
    const img = container.querySelector('img[alt="Analysiertes Bild"]') as HTMLImageElement | null;
    expect(img?.getAttribute("src")).toBe("https://example.com/foto.jpg");
    // OSM-Mini-Map (iframe mit Marker)
    const iframe = container.querySelector('iframe[title="EXIF-GPS-Standort"]') as HTMLIFrameElement | null;
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute("src")).toContain("marker=48.137154,11.576124");
    // Standort-Verdikt sichtbar
    expect(screen.getByText(/Standort-Risiko/i)).toBeInTheDocument();
  });

  it("Fehlerfall: rendert FehlerHinweis statt Crash", () => {
    render(<ErgebnisReport modulNummer="10" daten={{ ziel: "x", analysiert_am: JETZT, fehler: "IP nicht öffentlich" }} />);
    const box = screen.getByText(/IP nicht öffentlich/);
    expect(box).toBeInTheDocument();
    expect(within(box).queryByRole("link")).toBeNull();
  });
});
