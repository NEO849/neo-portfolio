// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: ErgebnisReport — interaktive Terminal-Report-Ansicht
//
// Wandelt die rohen OSINT-Backend-Daten in eine scannbare, interaktive
// Darstellung um — im Terminal-Stil (Monospace, Cyber-Palette), aber
// mit echtem Mehrwert: klickbare Quellen-Links, Copy-Buttons auf
// Hashes/IPs, animierte Severity-Gauges, Avatare, Filter für lange
// Listen. Die rohe ASCII-Ausgabe bleibt parallel erhalten (Raw-View).
//
// Isoliert von OsintDemoView, damit der Terminal-Kern stabil bleibt.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type {
  DomainErgebnis, EmailErgebnis, EmailReconErgebnis, BenutzerErgebnis,
  TelefonErgebnis, BildErgebnis, ShodanErgebnis,
  OrchestratorErgebnis, SubdomainErgebnis, IpIntelErgebnis,
  Pivot, PivotTyp, VtReputation,
} from "../../dienste/osintApi";

// Callback-Typ: ein analysierbarer Pivot wird in-app weiteranalysiert.
export type PivotHandler = (typ: PivotTyp, wert: string) => void;

// ─── Palette (terminal-konform, aus dem Design-System) ──────────────

const C = {
  gruen:   "#22c55e",
  gelb:    "#f59e0b",
  rot:     "#ef4444",
  cyber:   "#22d3ee",
  akzent:  "#818cf8",
  lila:    "#c084fc",
  orange:  "#fb923c",
  neutral: "#9aa4ba", // Chrome/Struktur (gut lesbar) — Farbe bleibt der Bedeutung vorbehalten
};

/** Mappt eine Risiko-/Severity-Stufe auf eine Farbe. */
function stufeFarbe(stufe?: string): string {
  switch ((stufe ?? "").toLowerCase()) {
    case "kritisch": return C.rot;
    case "hoch":     return C.rot;
    case "mittel":   return C.gelb;
    case "gering":   return C.cyber;
    case "keines":   return C.gruen;
    case "live":     return C.gruen;
    case "ok":       return C.gruen;
    default:         return C.akzent;
  }
}

// ─── Copy-Hook ──────────────────────────────────────────────────────

function useKopieren(): [string | null, (wert: string, id: string) => void] {
  const [kopiertId, setKopiertId] = useState<string | null>(null);
  const kopieren = (wert: string, id: string) => {
    const ok = () => { setKopiertId(id); setTimeout(() => setKopiertId(null), 1400); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(wert).then(ok).catch(() => {});
    } else {
      const el = document.createElement("textarea");
      el.value = wert; el.style.cssText = "position:absolute;left:-9999px";
      document.body.appendChild(el); el.select();
      try { document.execCommand("copy"); ok(); } catch { /* noop */ }
      document.body.removeChild(el);
    }
  };
  return [kopiertId, kopieren];
}

// ─── Bewegung / Count-up ────────────────────────────────────────────

function bewegungReduziert(): boolean {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Zählt von 0 auf das Ziel hoch (ease-out). Respektiert prefers-reduced-motion. */
function useCountUp(ziel: number, dauer = 750): number {
  const [wert, setWert] = useState(() => (bewegungReduziert() ? ziel : 0));
  useEffect(() => {
    if (bewegungReduziert() || typeof requestAnimationFrame !== "function") {
      setWert(ziel);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / dauer, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setWert(Math.round(ziel * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ziel, dauer]);
  return wert;
}

// ─── Primitive: Sektion ─────────────────────────────────────────────

// Sektions-Header sind bewusst einheitlich neutral (kein Regenbogen) — das
// `farbe`-Prop bleibt akzeptiert, wird aber nicht mehr zur Einfärbung genutzt.
function Sektion({ titel, rechts, children }: {
  titel: string; farbe?: string; rechts?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="mt-5 first:mt-0">
      <div className="flex items-center gap-3 mb-2">
        <span className="font-mono text-[10.5px] tracking-[0.22em] uppercase font-semibold"
              style={{ color: C.neutral }}>{titel}</span>
        <span className="h-px flex-1"
              style={{ background: `linear-gradient(90deg, ${C.neutral}33, transparent)` }} />
        {rechts}
      </div>
      <div className="pl-0.5">{children}</div>
    </div>
  );
}

// ─── Primitive: Feld (Key/Value, optional Copy/Link) ────────────────

function Feld({ label, children, copy, href, copyId, kopiertId, onCopy }: {
  label: string; children: React.ReactNode;
  copy?: string; href?: string;
  copyId?: string; kopiertId?: string | null; onCopy?: (w: string, id: string) => void;
}) {
  return (
    <div className="flex items-baseline gap-2 py-[3px] font-mono text-[12.5px] group">
      <span className="text-white/55 min-w-[96px] shrink-0">{label}</span>
      <span className="text-white/85 break-all flex-1">
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer"
             className="text-cyber-400 hover:underline underline-offset-2">{children}</a>
        ) : children}
      </span>
      {copy !== undefined && onCopy && (
        <button onClick={() => onCopy(copy, copyId ?? label)}
          className="shrink-0 text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-white/55
                     hover:text-white/80 hover:border-white/25 transition opacity-0 group-hover:opacity-100"
          title="Kopieren">
          {kopiertId === (copyId ?? label) ? "✓" : "copy"}
        </button>
      )}
    </div>
  );
}

// ─── Primitive: Severity-Messleiste (animiert, segmentiert) ─────────

function Messleiste({ wert, max, stufe }: { wert: number; max: number; stufe: string }) {
  const farbe = stufeFarbe(stufe);
  const segmente = 16;
  const aktiv = max > 0 ? Math.round((wert / max) * segmente) : 0;
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex gap-[3px]">
        {Array.from({ length: segmente }).map((_, i) => (
          <motion.span key={i}
            initial={{ opacity: 0, scaleY: 0.3 }} animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: i * 0.025, duration: 0.2 }}
            className="w-[6px] h-4 rounded-[1px]"
            style={{
              background: i < aktiv ? farbe : "rgba(255,255,255,0.07)",
              boxShadow: i < aktiv ? `0 0 6px ${farbe}55` : "none",
            }} />
        ))}
      </div>
      <span className="font-mono text-[12px] font-bold tracking-wide" style={{ color: farbe }}>
        {stufe.toUpperCase()}
      </span>
      <span className="font-mono text-[11px] text-white/55">{wert}/{max}</span>
    </div>
  );
}

// ─── Primitive: Verdikt-Banner (Headline mit Gauge) ─────────────────

function Verdikt({ titel, stufe, wert, max, hinweis, deutung }: {
  titel: string; stufe: string; wert: number; max: number; hinweis?: string; deutung?: string;
}) {
  const farbe = stufeFarbe(stufe);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border p-3.5 mb-1"
      style={{ borderColor: `${farbe}33`, background: `${farbe}0d` }}>
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <span className="font-mono text-[11px] tracking-wider uppercase text-white/55">{titel}</span>
        {hinweis && <span className="font-mono text-[10px] text-white/50">{hinweis}</span>}
      </div>
      <Messleiste wert={wert} max={max} stufe={stufe} />
      {deutung && (
        <p className="font-mono text-[10.5px] text-white/60 mt-2.5 leading-snug">{deutung}</p>
      )}
    </motion.div>
  );
}

// ─── Primitive: Marke / Badge ───────────────────────────────────────

// Farbe = nur Bedeutung: rot/gelb/grün bleiben semantisch, orange wird zu
// gelb (Warnung), alles Dekorative (cyber/akzent/lila …) wird neutral.
function Marke({ text, farbe = C.neutral, gefuellt }: { text: string; farbe?: string; gefuellt?: boolean }) {
  const semantisch = farbe === C.rot || farbe === C.gelb || farbe === C.gruen;
  const f = semantisch ? farbe : farbe === C.orange ? C.gelb : C.neutral;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[10.5px] font-medium"
      style={{
        color: f,
        border: `1px solid ${f}${gefuellt ? "55" : "33"}`,
        background: gefuellt ? `${f}1a` : `${f}0a`,
      }}>{text}</span>
  );
}

// ─── Primitive: klickbarer Link-Chip ────────────────────────────────

// Links haben EINE konsistente, interaktive Farbe (cyber) — wie die Inline-
// Links im Report. Das `farbe`-Prop bleibt akzeptiert, wird aber ignoriert.
function LinkChip({ name, url }: { name: string; url: string; farbe?: string }) {
  const farbe = C.cyber;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-mono text-[11.5px] transition-all"
      style={{ border: `1px solid ${farbe}26`, background: `${farbe}0a`, color: "rgba(255,255,255,0.78)" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${farbe}66`; e.currentTarget.style.background = `${farbe}1a`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${farbe}26`; e.currentTarget.style.background = `${farbe}0a`; }}>
      <span>{name}</span>
      <span className="opacity-0 group-hover:opacity-70 transition" style={{ color: farbe }}>↗</span>
    </a>
  );
}

// ─── Primitive: Link-Raster gruppiert nach Kategorie ────────────────

function LinkRaster({ gruppen, farbe = C.cyber }: {
  gruppen: Record<string, Array<{ name: string; url: string }>>; farbe?: string;
}) {
  return (
    <div className="space-y-3">
      {Object.entries(gruppen).map(([kat, links]) => (
        <div key={kat}>
          <div className="font-mono text-[10px] text-white/50 mb-1.5 tracking-wider">{kat} ({links.length})</div>
          <div className="flex flex-wrap gap-1.5">
            {links.map((l, i) => <LinkChip key={`${l.name}-${i}`} name={l.name} url={l.url} farbe={farbe} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Primitive: Severity-Item-Liste ─────────────────────────────────

function Item({ stufe, children }: { stufe?: "hoch" | "mittel" | "info" | "ok" | "neg"; children: React.ReactNode }) {
  const farbe = stufe === "hoch" ? C.rot : stufe === "mittel" ? C.gelb
    : stufe === "ok" ? C.gruen : stufe === "neg" ? "rgba(255,255,255,0.28)" : C.neutral;
  return (
    <div className="flex items-start gap-2.5 py-[3px] font-mono text-[12px]">
      <span className="mt-[5px] w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: farbe, boxShadow: `0 0 5px ${farbe}88` }} />
      <span className="text-white/75 break-words flex-1">{children}</span>
    </div>
  );
}

// ─── Primitive: Aufklappbar ─────────────────────────────────────────

function Aufklappbar({ label, kinderAnzahl, children }: {
  label: string; kinderAnzahl: number; children: React.ReactNode;
}) {
  const [offen, setOffen] = useState(false);
  if (kinderAnzahl <= 0) return null;
  return (
    <div>
      {offen && <div className="mb-2">{children}</div>}
      <button onClick={() => setOffen(!offen)}
        className="font-mono text-[11px] text-white/60 hover:text-white/75 transition">
        {offen ? "▲ weniger anzeigen" : `▼ ${label}`}
      </button>
    </div>
  );
}

// ─── Primitive: Filter-Eingabe ──────────────────────────────────────

function Filter({ wert, setWert, platzhalter }: { wert: string; setWert: (v: string) => void; platzhalter: string }) {
  return (
    <input value={wert} onChange={(e) => setWert(e.target.value)} placeholder={platzhalter}
      spellCheck={false} autoComplete="off"
      className="terminal-eingabe font-mono text-[12px] py-1 w-40 max-w-full" />
  );
}

const zeit = (iso?: string) => (iso ?? "").replace("T", " ").substring(0, 19);

// ─── Primitive: Pivot-Sektion ("weiter analysieren") ────────────────

const PIVOT_IKON: Record<string, string> = {
  username: "◈", email: "✉", domain: "🌐", ip: "▦", account: "↗", image: "🖼",
};

function kuerzen(text: string, max = 36): string {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

function PivotSektion({ pivots, onPivot }: { pivots?: Pivot[]; onPivot?: PivotHandler }) {
  if (!pivots || pivots.length === 0) return null;
  return (
    <Sektion titel="Weiter analysieren" farbe={C.lila}
      rechts={<span className="font-mono text-[10px] text-white/50">{pivots.length} Datenpunkte</span>}>
      <div className="flex flex-wrap gap-1.5">
        {pivots.map((p, i) => {
          const ikon = PIVOT_IKON[p.typ] ?? "•";
          const label = `${ikon} ${kuerzen(p.wert)}`;
          // Analysierbar + Handler → in-app Folge-Analyse per Klick
          if (p.analysierbar && onPivot) {
            return (
              <button key={`${p.typ}-${i}`} onClick={() => onPivot(p.typ, p.wert)}
                title={`${p.typ} aus: ${p.quelle} → in der App analysieren`}
                className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-mono text-[11.5px] transition-all"
                style={{ border: `1px solid ${C.lila}26`, background: `${C.lila}0a`, color: "rgba(255,255,255,0.82)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${C.lila}66`; e.currentTarget.style.background = `${C.lila}1a`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${C.lila}26`; e.currentTarget.style.background = `${C.lila}0a`; }}>
                <span>{label}</span>
                <span className="opacity-50 group-hover:opacity-90 transition" style={{ color: C.lila }}>→ analysieren</span>
              </button>
            );
          }
          // Sonst: externer Link (z.B. Account-Profil) oder passiver Hinweis
          if (p.url) return <LinkChip key={`${p.typ}-${i}`} name={label} url={p.url} />;
          return <Marke key={`${p.typ}-${i}`} text={label} />;
        })}
      </div>
      <p className="font-mono text-[10px] text-white/45 mt-2 leading-snug">
        Verknüpfte Datenpunkte aus diesem Ergebnis — ein Klick startet die nächste Analyse.
      </p>
    </Sektion>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MODUL-REPORTS
// ═══════════════════════════════════════════════════════════════════

// ─── Telefon ────────────────────────────────────────────────────────

function ReportTelefon({ t }: { t: TelefonErgebnis }) {
  const [kid, copy] = useKopieren();
  if (!t.gueltig || t.fehler) return <FehlerHinweis text={t.fehler ?? "Ungültige Nummer"} />;
  return (
    <div>
      <Sektion titel="Format">
        <Feld label="International" copy={t.format?.international} copyId="intl" kopiertId={kid} onCopy={copy}>{t.format?.international}</Feld>
        <Feld label="National">{t.format?.national}</Feld>
        <Feld label="E.164" copy={t.format?.e164} copyId="e164" kopiertId={kid} onCopy={copy}>{t.format?.e164}</Feld>
      </Sektion>
      <Sektion titel="Metadaten">
        <Feld label="Land">{t.metadaten?.land_code} — {t.metadaten?.region}</Feld>
        <Feld label="Typ">{t.metadaten?.leitungstyp}</Feld>
        <Feld label="Carrier">{t.metadaten?.carrier || "—"}</Feld>
        <Feld label="Zeitzone">{(t.metadaten?.zeitzonen ?? []).join(", ")}</Feld>
      </Sektion>
      {t.live_status?.aktiv && (
        <Sektion titel="Live-Status (HLR)" farbe={C.gruen}
          rechts={<span className="font-mono text-[10px] text-white/50">Echtzeit · {t.live_status.quelle}</span>}>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Marke text={t.live_status.status_text ?? t.live_status.status ?? "—"}
              farbe={t.live_status.erreichbar ? C.gruen : C.gelb} gefuellt />
            {t.live_status.roaming && <Marke text="Roaming" farbe={C.gelb} />}
            {t.live_status.portiert && <Marke text="portiert" farbe={C.cyber} />}
          </div>
          {t.live_status.carrier && <Feld label="Carrier (live)">{t.live_status.carrier}</Feld>}
          {t.live_status.roaming_netz && <Feld label="Roaming-Netz">{t.live_status.roaming_netz}</Feld>}
        </Sektion>
      )}
      {t.suchlinks?.nach_kategorie && (
        <Sektion titel="Suchlinks" farbe={C.cyber} rechts={<span className="font-mono text-[10px] text-white/50">{t.suchlinks.gesamt} Quellen · klickbar</span>}>
          <LinkRaster gruppen={t.suchlinks.nach_kategorie} />
        </Sektion>
      )}
      {!!t.risiko?.details.length && (
        <Sektion titel="Hinweise" farbe={C.gelb}>
          {t.risiko.details.map((d, i) => <Item key={i} stufe="mittel">{d}</Item>)}
        </Sektion>
      )}
      <FussZeile iso={t.analysiert_am} />
    </div>
  );
}

// ─── Bild: GPS-Mini-Map (keyless OpenStreetMap-Embed) ───────────────

function GpsKarte({ lat, lon }: { lat: number; lon: number }) {
  // bbox um den Punkt (~1.1 km Kantenlänge) + Marker — kein API-Key nötig.
  const d = 0.006;
  const bbox = `${lon - d},${lat - d},${lon + d},${lat + d}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="relative mt-2.5 rounded-lg overflow-hidden border" style={{ borderColor: `${C.rot}40` }}>
      <iframe
        title="EXIF-GPS-Standort"
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="block w-full h-44"
        style={{ border: 0, filter: "grayscale(0.2) contrast(0.95) brightness(0.9)" }}
      />
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-2.5 py-1.5
                      pointer-events-none font-mono text-[10px]"
        style={{ background: "linear-gradient(180deg, rgba(6,8,15,0.85), transparent)" }}>
        <span style={{ color: C.rot }}>● REKONSTRUIERTER AUFNAHMEORT</span>
        <span className="text-white/70">{lat.toFixed(5)}, {lon.toFixed(5)}</span>
      </div>
      <a href={`https://www.google.com/maps?q=${lat},${lon}`} target="_blank" rel="noopener noreferrer"
        className="absolute bottom-2 right-2 font-mono text-[10px] px-2 py-1 rounded
                   bg-grund-950/80 border border-white/15 text-white/80 hover:text-white hover:border-white/30 transition">
        in Maps öffnen ↗
      </a>
    </motion.div>
  );
}

// ─── Bild: Vorschau-Thumbnail ───────────────────────────────────────

function BildVorschau({ url, format, breite, hoehe }: {
  url: string; format?: string; breite?: number; hoehe?: number;
}) {
  const [fehler, setFehler] = useState(false);
  if (fehler) return null;
  return (
    <div className="relative mt-1 rounded-lg overflow-hidden border border-white/10 bg-grund-950"
      style={{ backgroundImage: "linear-gradient(45deg,#0d1018 25%,transparent 25%),linear-gradient(-45deg,#0d1018 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#0d1018 75%),linear-gradient(-45deg,transparent 75%,#0d1018 75%)", backgroundSize: "16px 16px", backgroundPosition: "0 0,0 8px,8px -8px,-8px 0" }}>
      <img
        src={url} alt="Analysiertes Bild" loading="lazy" referrerPolicy="no-referrer"
        onError={() => setFehler(true)}
        className="block w-full max-h-52 object-contain mx-auto"
      />
      {(format || breite) && (
        <div className="absolute bottom-1.5 left-1.5 font-mono text-[10px] px-1.5 py-0.5 rounded
                        bg-grund-950/80 border border-white/10 text-white/65">
          {format}{breite ? ` · ${breite}×${hoehe}` : ""}
        </div>
      )}
    </div>
  );
}

// ─── Bild ───────────────────────────────────────────────────────────

function ReportBild({ b, onPivot }: { b: BildErgebnis; onPivot?: PivotHandler }) {
  const [kid, copy] = useKopieren();
  if (b.fehler) return <FehlerHinweis text={b.fehler} />;
  const gps = b.exif?.gps;
  const bw = b.bewertung;
  return (
    <div>
      {bw
        ? <Verdikt titel="Privatsphäre-Risiko" stufe={bw.stufe} wert={bw.punkte} max={10}
            hinweis={`${bw.befunde.length} Befund(e)`} deutung={bw.zusammenfassung} />
        : gps && <Verdikt titel="Standort-Risiko" stufe="Hoch" wert={6} max={6} hinweis="GPS im Bild gefunden"
            deutung="Das Bild enthält GPS-Koordinaten — der Aufnahmeort lässt sich auf der Karte unten rekonstruieren." />}
      <Sektion titel="Bild-Info">
        <BildVorschau url={b.url} format={b.bild?.format} breite={b.bild?.breite} hoehe={b.bild?.hoehe} />
        <div className="mt-2">
          <Feld label="Format">{b.bild?.format}</Feld>
          <Feld label="Auflösung">{b.bild?.breite} × {b.bild?.hoehe} px</Feld>
          <Feld label="Größe">{b.bild?.groesse_kb} KB</Feld>
        </div>
      </Sektion>
      <Sektion titel="Hashes" rechts={<span className="font-mono text-[10px] text-white/50">copy → reverse-DB</span>}>
        <Feld label="MD5"    copy={b.hashes?.md5}   copyId="md5"   kopiertId={kid} onCopy={copy}>{b.hashes?.md5}</Feld>
        <Feld label="SHA256" copy={b.hashes?.sha256} copyId="sha"  kopiertId={kid} onCopy={copy}>{b.hashes?.sha256}</Feld>
        <Feld label="pHash"  copy={b.hashes?.phash}  copyId="ph"   kopiertId={kid} onCopy={copy}>{b.hashes?.phash}</Feld>
      </Sektion>
      {b.exif?.verfuegbar ? (
        <Sektion titel="EXIF-Metadaten" farbe={C.gelb}>
          {b.exif.kamera && <Feld label="Kamera">{b.exif.kamera}</Feld>}
          {b.exif.objektiv && <Feld label="Objektiv">{b.exif.objektiv}</Feld>}
          {b.exif.seriennummer && <Feld label="Serien-Nr.">{b.exif.seriennummer}</Feld>}
          {b.exif.aufnahmedatum && <Feld label="Datum">{b.exif.aufnahmedatum}</Feld>}
          {b.exif.software && <Feld label="Software">{b.exif.software}</Feld>}
          {b.exif.kuenstler && <Feld label="Künstler">{b.exif.kuenstler}</Feld>}
          {b.exif.copyright && <Feld label="Copyright">{b.exif.copyright}</Feld>}
          {b.exif.iso != null && <Feld label="ISO">{String(b.exif.iso)}</Feld>}
          {b.exif.blende && <Feld label="Blende">f/{b.exif.blende}</Feld>}
          {gps?.ort_name && <Feld label="Ort">{gps.ort_name}</Feld>}
          {gps?.adresse && <Feld label="Adresse">{gps.adresse}</Feld>}
          {gps && <Feld label="GPS" href={gps.osm_link ?? gps.maps_link}>
            {gps.lat}, {gps.lon}{gps.hoehe_meter != null ? ` · ${gps.hoehe_meter} m` : ""} ↗
          </Feld>}
          {gps && <GpsKarte lat={gps.lat} lon={gps.lon} />}
        </Sektion>
      ) : <div className="font-mono text-[12px] text-white/55 mt-4">Keine EXIF-Metadaten vorhanden — gut für die Privatsphäre.</div>}
      {bw && bw.befunde.length > 0 && (
        <Sektion titel="Befunde" farbe={C.gelb}>
          {bw.befunde.map((h, i) => (
            <Item key={i} stufe={h.stufe === "hoch" ? "hoch" : h.stufe === "mittel" ? "mittel" : "info"}>
              {h.kategorie ? <span className="text-white/45">[{h.kategorie}] </span> : null}{h.meldung}
            </Item>
          ))}
        </Sektion>
      )}
      {bw && bw.empfehlungen.length > 0 && (
        <Sektion titel="Handlungsempfehlungen" farbe={C.gruen}>
          {bw.empfehlungen.map((e, i) => <Item key={i} stufe="ok">{e}</Item>)}
        </Sektion>
      )}
      {!bw && !!b.sicherheits_hinweise?.length && (
        <Sektion titel="Sicherheitsanalyse" farbe={C.gelb}>
          {b.sicherheits_hinweise.map((h, i) => <Item key={i} stufe={h.stufe === "hoch" ? "hoch" : "info"}>{h.meldung}</Item>)}
        </Sektion>
      )}
      {!!b.suchlinks?.length && (
        <Sektion titel="Reverse-Image-Suche" farbe={C.gruen} rechts={<span className="font-mono text-[10px] text-white/50">{b.suchlinks.length} Engines · klickbar</span>}>
          <div className="flex flex-wrap gap-1.5">
            {b.suchlinks.map((l, i) => <LinkChip key={i} name={l.name} url={l.url} farbe={C.gruen} />)}
          </div>
        </Sektion>
      )}
      <PivotSektion pivots={b.pivots} onPivot={onPivot} />
      <FussZeile iso={b.analysiert_am} />
    </div>
  );
}

// ─── E-Mail Vollanalyse ─────────────────────────────────────────────

function ReportEmail({ basis, recon, onPivot }: { basis: EmailErgebnis; recon: EmailReconErgebnis | null; onPivot?: PivotHandler }) {
  const [kid, copy] = useKopieren();
  if (!basis.gueltig) return <FehlerHinweis text={basis.fehler ?? "Ungültige Adresse"} />;
  const risiko = recon?.risiko ?? basis.risiko;
  const gravatar = recon?.gravatar;
  return (
    <div>
      {risiko && <Verdikt titel="Exposure-Risiko" stufe={risiko.stufe} wert={risiko.punkte} max={12} hinweis={`${basis.adresse}`}
        deutung="Wie stark diese Adresse öffentlich exponiert ist — Datenlecks und verknüpfte Profile zusammengefasst. Höher = größere Angriffsfläche." />}

      {gravatar?.gefunden && gravatar.avatar_url && (
        <div className="flex items-center gap-3 mt-4 mb-1">
          <img src={gravatar.avatar_url} alt="" loading="lazy"
            className="w-12 h-12 rounded-lg border border-white/10 object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          <div className="font-mono text-[12px]">
            <div className="text-white/85">{gravatar.profil_daten?.anzeigename ?? "Gravatar-Profil"}</div>
            {gravatar.profil_daten?.benutzername && <div className="text-white/60">@{gravatar.profil_daten.benutzername}</div>}
          </div>
        </div>
      )}

      <Sektion titel="Identität">
        <Feld label="Domain">{basis.syntax?.domain}</Feld>
        <Feld label="Lokalteil">{basis.syntax?.lokal_teil}</Feld>
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          <Marke text={basis.klassifikation?.zustellbar ? "zustellbar" : "nicht zustellbar"} farbe={basis.klassifikation?.zustellbar ? C.gruen : C.gelb} />
          {basis.klassifikation?.wegwerf && <Marke text="wegwerf-adresse" farbe={C.gelb} gefuellt />}
          {basis.domain?.hat_mx && <Marke text={`MX (${basis.domain.mx_records.length})`} farbe={C.cyber} />}
          {basis.domain?.spf && <Marke text="SPF" farbe={C.akzent} />}
          {basis.domain?.dmarc && <Marke text="DMARC" farbe={C.akzent} />}
        </div>
      </Sektion>

      {/* Breaches: HIBP + XposedOrNot + LeakCheck */}
      <Sektion titel="Datenlecks" farbe={C.rot}>
        {recon?.hibp?.geprueft && recon.hibp.domain_betroffen ? (
          <>
            <Item stufe="hoch">HIBP: {recon.hibp.anzahl_breaches} Breach(es) für Domain</Item>
            {(recon.hibp.breaches ?? []).slice(0, 5).map((b, i) => <Item key={i} stufe="info">{b.titel} ({b.datum})</Item>)}
          </>
        ) : recon?.hibp?.geprueft ? <Item stufe="ok">HIBP: keine bekannten Domain-Breaches</Item> : null}

        {recon?.xposedornot?.geprueft && (recon.xposedornot.anzahl_breaches ?? 0) > 0 ? (
          <>
            <Item stufe="hoch">XposedOrNot: {recon.xposedornot.anzahl_breaches} Email-Breach(es)</Item>
            {(recon.xposedornot.breaches ?? []).slice(0, 6).map((n, i) => <Item key={i} stufe="info">{n}</Item>)}
            {!!recon.xposedornot.exposed_fields?.length && (
              <div className="flex flex-wrap gap-1.5 mt-1.5 mb-1">
                {recon.xposedornot.exposed_fields.map((f, i) => <Marke key={i} text={f.replace(/^data_/, "")} farbe={C.gelb} />)}
              </div>
            )}
          </>
        ) : recon?.xposedornot?.geprueft ? <Item stufe="ok">XposedOrNot: Email nicht in Breach-DBs</Item> : null}

        {recon?.leakcheck?.geprueft && (recon.leakcheck.anzahl ?? 0) > 0 && (
          <>
            <Item stufe="mittel">LeakCheck: {recon.leakcheck.anzahl} weitere Quelle(n)</Item>
            {(recon.leakcheck.sources ?? []).slice(0, 4).map((s, i) => <Item key={i} stufe="info">{s.name}{s.datum ? ` (${s.datum})` : ""}</Item>)}
          </>
        )}
        {!recon && <Item stufe="neg">Tiefen-Recon nicht verfügbar</Item>}
      </Sektion>

      {/* Verknüpfte Identitäten */}
      {(gravatar?.profil_daten?.verifizierte_konten?.length || recon?.github?.gefunden || recon?.pgp?.hat_pgp_key) && (
        <Sektion titel="Verknüpfte Identitäten" farbe={C.lila}>
          {recon?.github?.gefunden && (recon.github.nutzer ?? []).map((n, i) => (
            <Feld key={`gh${i}`} label="GitHub" href={n.url}>@{n.login}{n.quelle ? ` · ${n.quelle}` : ""} ↗</Feld>
          ))}
          {!!recon?.github?.klarnamen?.length && (
            <Feld label="Klarname">{recon.github.klarnamen.join(", ")}</Feld>
          )}
          {!!recon?.github?.repositories?.length && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {recon.github.repositories.slice(0, 6).map((r, i) => (
                <LinkChip key={`repo${i}`} name={r.name} url={r.url} farbe={C.lila} />
              ))}
            </div>
          )}
          {(gravatar?.profil_daten?.verifizierte_konten ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {gravatar!.profil_daten!.verifizierte_konten!.map((k, i) => (
                <LinkChip key={i} name={`${k.name}${k.verifiziert ? " ✓" : ""}`} url={k.url} farbe={C.lila} />
              ))}
            </div>
          )}
          {recon?.pgp?.hat_pgp_key && <Item stufe="info">PGP: {recon.pgp.anzahl} öffentliche(r) Key(s) — sicherheitsaffin</Item>}
        </Sektion>
      )}

      {/* Google-Pivots */}
      {recon?.google?.google_konto_wahrscheinlich && recon.google.links && (
        <Sektion titel="Google-Pivots" farbe={C.cyber}>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(recon.google.links).map(([k, url]) => (
              <LinkChip key={k} name={k.replace(/_/g, " ")} url={url} farbe={C.cyber} />
            ))}
          </div>
        </Sektion>
      )}

      {recon?.hashes && (
        <Sektion titel="Hashes (Cross-Ref)">
          <Feld label="MD5"  copy={recon.hashes.md5}  copyId="m" kopiertId={kid} onCopy={copy}>{recon.hashes.md5}</Feld>
          <Feld label="SHA-1" copy={recon.hashes.sha1} copyId="s" kopiertId={kid} onCopy={copy}>{recon.hashes.sha1}</Feld>
        </Sektion>
      )}
      <PivotSektion pivots={recon?.pivots} onPivot={onPivot} />
      <FussZeile iso={basis.analysiert_am} />
    </div>
  );
}

// ─── Username Vollscan ──────────────────────────────────────────────

function ReportUsername({ b, onPivot }: { b: BenutzerErgebnis; onPivot?: PivotHandler }) {
  const [filter, setFilter] = useState("");
  if (b.fehler) return <FehlerHinweis text={b.fehler} />;
  const s = b.zusammenfassung;
  const kategorien = b.nach_kategorie ?? {};
  const gefiltert = useMemo(() => {
    const f = filter.trim().toLowerCase();
    const out: Record<string, typeof kategorien[string]> = {};
    for (const [kat, plats] of Object.entries(kategorien)) {
      const treffer = f ? plats.filter(p => p.plattform.toLowerCase().includes(f) || kat.toLowerCase().includes(f)) : plats;
      if (treffer.length) out[kat] = treffer;
    }
    return out;
  }, [filter, kategorien]);

  return (
    <div>
      {s && <Verdikt titel="Treffer-Rate" stufe={s.treffer_rate >= 50 ? "Hoch" : s.treffer_rate >= 20 ? "Mittel" : "Gering"} wert={s.gefunden} max={Math.max(s.geprueft, 1)} hinweis={`@${b.benutzername} · ${s.geprueft} Plattformen`}
        deutung="Auf wie vielen geprüften Plattformen dieser Name existiert. Mehr Treffer = größerer digitaler Fußabdruck." />}
      {s && (
        <div className="flex flex-wrap gap-1.5 mt-3 mb-1">
          <Marke text={`${s.gefunden} gefunden`} farbe={C.gruen} gefuellt />
          <Marke text={`${s.konfidenz_hoch ?? 0} hoch`} farbe={C.gruen} />
          <Marke text={`${s.konfidenz_mittel ?? 0} mittel`} farbe={C.gelb} />
          <Marke text={`${s.konfidenz_niedrig ?? 0} niedrig`} farbe={C.cyber} />
          <Marke text={`${s.fehler} Fehler`} farbe={C.orange} />
        </div>
      )}
      {b.identitaet && b.identitaet.profile_gefunden > 0 && (
        <Sektion titel="Identität" farbe={C.lila}
          rechts={<span className="font-mono text-[10px] text-white/50">{b.identitaet.profile_gefunden} Profil(e)</span>}>
          {b.identitaet.anzeigenamen.length > 0 && (
            <Feld label="Namen">{b.identitaet.anzeigenamen.join(" · ")}</Feld>
          )}
          {b.identitaet.avatare.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {b.identitaet.avatare.slice(0, 8).map((a, i) => (
                <img key={i} src={a.avatar} alt={a.plattform} title={a.plattform} loading="lazy" referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-lg border border-white/10 object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              ))}
            </div>
          )}
          {b.identitaet.profile.filter((p) => p.beschreibung).slice(0, 3).map((p, i) => (
            <div key={i} className="font-mono text-[11.5px] text-white/65 mt-2 leading-snug">
              <span className="text-white/45">{p.plattform}: </span>{p.beschreibung}
            </div>
          ))}
        </Sektion>
      )}
      <Sektion titel="Verifizierte Profile" farbe={C.gruen}
        rechts={<Filter wert={filter} setWert={setFilter} platzhalter="filter…" />}>
        {Object.keys(gefiltert).length === 0 ? (
          <div className="font-mono text-[12px] text-white/55 py-2">Keine Treffer{filter ? " für diesen Filter" : ""}.</div>
        ) : Object.entries(gefiltert).map(([kat, plats]) => (
          <div key={kat} className="mb-3">
            <div className="font-mono text-[10px] text-white/50 mb-1.5 tracking-wider uppercase">{kat} ({plats.length})</div>
            <div className="flex flex-wrap gap-1.5">
              {plats.map((p, i) => {
                const farbe = p.konfidenz === "hoch" ? C.gruen : p.konfidenz === "mittel" ? C.gelb : C.cyber;
                return <LinkChip key={`${p.plattform}-${i}`} name={p.plattform} url={p.url} farbe={farbe} />;
              })}
            </div>
          </div>
        ))}
      </Sektion>
      <PivotSektion pivots={b.pivots} onPivot={onPivot} />
      <div className="font-mono text-[10px] text-white/50 mt-2">WhatsMyName-DB · Modus: {b.modus}</div>
      <FussZeile iso={b.analysiert_am} />
    </div>
  );
}

// ─── Domain & Shodan ────────────────────────────────────────────────

// ─── VirusTotal-Reputation (geteilt: Domain + IP) ───────────────────
// Wird nur gerendert, wenn das Backend ein vt-Feld liefert (Key gesetzt).
function VtSektion({ vt }: { vt?: VtReputation }) {
  if (!vt) return null;
  const farbe =
    vt.stufe === "Schädlich" ? C.rot :
    vt.stufe === "Verdächtig" ? C.gelb :
    vt.stufe === "Sauber" ? C.gruen : C.neutral;
  return (
    <Sektion titel="Reputation · VirusTotal" farbe={farbe}>
      {!vt.geprueft ? (
        <Item stufe="info">{vt.hinweis ?? "VirusTotal nicht geprüft"}</Item>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <Marke text={vt.stufe ?? "Unbekannt"} farbe={farbe}
              gefuellt={vt.stufe === "Schädlich" || vt.stufe === "Verdächtig"} />
            {typeof vt.gesamt_engines === "number" && vt.gesamt_engines > 0 && (
              <span className="font-mono text-[11px] text-white/55">
                {vt.malicious ?? 0} / {vt.gesamt_engines} Engines melden „schädlich"
              </span>
            )}
            {typeof vt.reputation === "number" && (
              <span className="font-mono text-[11px] text-white/45">Reputation {vt.reputation}</span>
            )}
          </div>
          {vt.hinweis && <Item stufe="info">{vt.hinweis}</Item>}
          {!!vt.kategorien?.length && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {vt.kategorien.map((k, i) => <Marke key={i} text={k} farbe={C.neutral} />)}
            </div>
          )}
        </>
      )}
    </Sektion>
  );
}

function ReportDomain({ domain, shodan, onPivot }: { domain: DomainErgebnis; shodan: ShodanErgebnis | null; onPivot?: PivotHandler }) {
  const [kid, copy] = useKopieren();
  const sv = domain.sicherheits_bewertung;
  const ag = shodan?.aggregiert;
  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-2.5">
        <Verdikt titel="HTTP-Sicherheit" stufe={sv.note === "Gut" ? "Keines" : sv.note === "Mittel" ? "Mittel" : "Hoch"} wert={sv.punkte} max={sv.max} hinweis={`${sv.prozent}%`}
          deutung="Qualität der HTTP-Sicherheits-Header. Voll & grün = gut abgesichert." />
        {shodan?.risiko && <Verdikt titel="Netzwerk-Exposure" stufe={shodan.risiko.stufe} wert={shodan.risiko.punkte} max={shodan.risiko.max} hinweis="Shodan InternetDB"
          deutung="Nach außen sichtbare offene Ports und bekannte Schwachstellen. Höher = mehr Risiko." />}
      </div>

      <Sektion titel="DNS-Records">
        {domain.dns.a.slice(0, 4).map((ip, i) => (
          <Feld key={i} label={i === 0 ? "A" : ""} copy={ip} copyId={`a${i}`} kopiertId={kid} onCopy={copy}>{ip}</Feld>
        ))}
        {domain.dns.aaaa[0] && <Feld label="AAAA">{domain.dns.aaaa[0]}</Feld>}
        {domain.dns.mx.slice(0, 2).map((mx, i) => <Feld key={i} label={i === 0 ? "MX" : ""}>{mx}</Feld>)}
        {domain.dns.ns.slice(0, 2).map((ns, i) => <Feld key={i} label={i === 0 ? "NS" : ""}>{ns}</Feld>)}
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          {domain.dns.spf && <Marke text="SPF" farbe={C.gruen} />}
          {domain.dns.dmarc && <Marke text="DMARC" farbe={C.gruen} />}
        </div>
      </Sektion>

      <Sektion titel="Provider / WHOIS">
        <Feld label="ASN">{domain.asn}</Feld>
        {domain.whois.registrar && <Feld label="Registrar">{String(domain.whois.registrar)}</Feld>}
        {domain.whois.registriert_am && <Feld label="Erstellt">{domain.whois.registriert_am}</Feld>}
        {domain.whois.ablauf_am && <Feld label="Ablauf">{domain.whois.ablauf_am}</Feld>}
      </Sektion>

      <Sektion titel="HTTP-Header-Audit">
        <Feld label="Status">{domain.http.status ?? "—"} {domain.http.server ? `· ${domain.http.server}` : ""}</Feld>
        {sv.details.map((d, i) => <Item key={i} stufe={d.ok ? "ok" : "neg"}>{d.check}</Item>)}
      </Sektion>

      {ag && (
        <Sektion titel="Shodan: Ports & CVEs" farbe={C.rot}>
          {ag.ports_anzahl === 0 ? <Item stufe="ok">Keine offenen Ports in der Shodan-DB</Item> : (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {ag.ports.map((p, i) => (
                <Marke key={i} text={`${p.port}${p.service ? " " + p.service : ""}`} farbe={p.gefaehrlich ? C.rot : C.cyber} gefuellt={p.gefaehrlich} />
              ))}
            </div>
          )}
          {ag.vulns_anzahl > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {ag.vulns.slice(0, 12).map((v, i) => (
                <LinkChip key={i} name={v} url={`https://nvd.nist.gov/vuln/detail/${v}`} farbe={C.rot} />
              ))}
            </div>
          )}
          {!!ag.tags.length && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {ag.tags.map((t, i) => <Marke key={i} text={t.tag} farbe={C.orange} />)}
            </div>
          )}
        </Sektion>
      )}
      <VtSektion vt={domain.vt} />
      <PivotSektion pivots={domain.pivots} onPivot={onPivot} />
      <FussZeile iso={domain.analysiert_am} />
    </div>
  );
}

// ─── Orchestrator (Graph rendert der Parent) ────────────────────────

function ReportOrchestrator({ o }: { o: OrchestratorErgebnis }) {
  if (o.fehler) return <FehlerHinweis text={o.fehler} />;
  const g = o.graph;
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-1">
        <Marke text={`Typ: ${o.typ}`} farbe={C.akzent} gefuellt />
        <Marke text={`${g?.statistik.knoten_gesamt ?? 0} Knoten`} farbe={C.cyber} />
        <Marke text={`${g?.statistik.kanten_gesamt ?? 0} Kanten`} farbe={C.cyber} />
        <Marke text={`${o.zusammenfassung?.pivots_entdeckt ?? 0} Pivots`} farbe={C.lila} gefuellt />
      </div>
      {g && (
        <Sektion titel="Knoten nach Typ" farbe={C.lila}>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(g.statistik.nach_typ).map(([typ, n]) => <Marke key={typ} text={`${typ}: ${n}`} farbe={C.akzent} />)}
          </div>
        </Sektion>
      )}
      <Sektion titel="Ausgeführte Module" farbe={C.gruen}>
        <div className="flex flex-wrap gap-1.5">
          {(o.zusammenfassung?.module_ausgefuehrt ?? []).map((m, i) => <Marke key={i} text={m} farbe={C.gruen} />)}
        </div>
      </Sektion>
      <div className="font-mono text-[11px] text-white/50 mt-4">↓ Interaktiver Graph unterhalb des Terminals</div>
      <FussZeile iso={o.analysiert_am} />
    </div>
  );
}

// ─── Subdomains ─────────────────────────────────────────────────────

const QUELLE_FARBE: Record<string, string> = { "crt.sh": C.akzent, wayback: C.cyber, commoncrawl: C.lila };

function ResolveBalken({ gesamt, geprueft, live }: { gesamt: number; geprueft: number; live: number }) {
  const gesamtAnim = useCountUp(gesamt);
  const liveAnim = useCountUp(live);
  const pct = geprueft > 0 ? live / geprueft : 0;
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.015] p-3.5 mb-1">
      <div className="flex items-end justify-between mb-2.5 font-mono gap-4">
        <div>
          <div className="text-[24px] font-bold leading-none tabular-nums" style={{ color: C.cyber }}>{gesamtAnim}</div>
          <div className="text-[10px] text-white/55 mt-1.5 tracking-[0.15em]">EINDEUTIGE SUBDOMAINS</div>
        </div>
        {geprueft > 0 && (
          <div className="text-right">
            <div className="text-[24px] font-bold leading-none tabular-nums" style={{ color: C.gruen }}>{liveAnim}</div>
            <div className="text-[10px] text-white/55 mt-1.5 tracking-[0.15em]">LIVE · {geprueft} GEPRÜFT</div>
          </div>
        )}
      </div>
      {geprueft > 0 && (
        <div className="h-2 rounded-full overflow-hidden bg-white/[0.06]" title={`${live} von ${geprueft} aufgelösten Subdomains sind live`}>
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${Math.round(pct * 100)}%` }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${C.cyber}, ${C.gruen})`, boxShadow: `0 0 10px ${C.gruen}55` }}
          />
        </div>
      )}
    </div>
  );
}

function ReportSubdomains({ s }: { s: SubdomainErgebnis }) {
  const [filter, setFilter] = useState("");
  const [kid, copy] = useKopieren();
  if (s.fehler) return <FehlerHinweis text={s.fehler} />;
  const z = s.zusammenfassung;
  const subs = s.subdomains ?? [];
  const geprueft = subs.filter((d) => d.aktiv != null).length;
  const live = subs.filter((d) => d.aktiv === true).length;
  const gefiltert = filter.trim()
    ? subs.filter(d => d.host.toLowerCase().includes(filter.trim().toLowerCase()))
    : subs;
  const sichtbar = gefiltert.slice(0, 40);
  const rest = gefiltert.slice(40);

  return (
    <div>
      <ResolveBalken gesamt={z?.gesamt_eindeutig ?? subs.length} geprueft={geprueft} live={live} />
      {z?.limit_erreicht && (
        <div className="mb-1"><Marke text="Anzeige-Limit erreicht" farbe={C.gelb} /></div>
      )}

      <Sektion titel="Quellen-Status">
        <div className="flex flex-wrap gap-1.5">
          {s.quellen && Object.entries(s.quellen).map(([name, meta]) => (
            <Marke key={name} text={`${name}: ${meta.ok ? (meta.anzahl ?? 0) : (meta.hinweis ?? "fehler")}`}
              farbe={meta.ok ? QUELLE_FARBE[name] ?? C.cyber : C.orange} />
          ))}
        </div>
      </Sektion>

      <Sektion titel="Subdomains" farbe={C.cyber}
        rechts={
          <div className="flex items-center gap-2">
            <Filter wert={filter} setWert={setFilter} platzhalter="filter…" />
            <button onClick={() => copy(subs.map(d => d.host).join("\n"), "all")}
              className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-white/60 hover:text-white/80 hover:border-white/25 transition">
              {kid === "all" ? "✓ kopiert" : "copy alle"}
            </button>
          </div>
        }>
        {sichtbar.length === 0 ? (
          <div className="font-mono text-[12px] text-white/55 py-2">Keine Subdomains{filter ? " für diesen Filter" : ""}.</div>
        ) : (
          <div className="space-y-1">
            {sichtbar.map((d) => <SubZeile key={d.host} d={d} />)}
          </div>
        )}
        {rest.length > 0 && (
          <div className="mt-2">
            <Aufklappbar label={`${rest.length} weitere anzeigen`} kinderAnzahl={rest.length}>
              <div className="space-y-1">{rest.map((d) => <SubZeile key={d.host} d={d} />)}</div>
            </Aufklappbar>
          </div>
        )}
      </Sektion>
      <FussZeile iso={s.analysiert_am} />
    </div>
  );
}

function SubZeile({ d }: { d: { host: string; quellen: string[]; aktiv: boolean | null; ip: string | null } }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[12px] py-[2px]">
      {d.aktiv != null && (
        <span className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: d.aktiv ? C.gruen : "rgba(255,255,255,0.18)", boxShadow: d.aktiv ? `0 0 5px ${C.gruen}88` : "none" }} />
      )}
      <a href={`https://${d.host}`} target="_blank" rel="noopener noreferrer"
        className="text-white/80 hover:text-cyber-400 transition break-all">{d.host}</a>
      {d.ip && <span className="text-white/50 text-[11px]">{d.ip}</span>}
      <span className="ml-auto flex gap-1 shrink-0">
        {d.quellen.map((q) => (
          <span key={q} className="w-1.5 h-1.5 rounded-full" title={q} style={{ background: QUELLE_FARBE[q] ?? C.cyber }} />
        ))}
      </span>
    </div>
  );
}

// ─── IP-Intel ───────────────────────────────────────────────────────

function ReportIpIntel({ r }: { r: IpIntelErgebnis }) {
  const [kid, copy] = useKopieren();
  if (r.fehler) return <FehlerHinweis text={r.fehler} />;
  return (
    <div>
      <Sektion titel="Ziel">
        <Feld label="IP" copy={r.ip} copyId="ip" kopiertId={kid} onCopy={copy}>{r.ip}</Feld>
        {r.eingabe_typ && <Feld label="Eingabe">{r.eingabe_typ}</Feld>}
      </Sektion>
      <Sektion titel="Routing">
        {r.routing?.prefix && <Feld label="Prefix" copy={r.routing.prefix} copyId="px" kopiertId={kid} onCopy={copy}>{r.routing.prefix}</Feld>}
        {r.routing?.prefix_inhaber && <Feld label="Inhaber">{r.routing.prefix_inhaber}</Feld>}
        {!!r.routing?.asns?.length && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {r.routing.asns.map((a, i) => <Marke key={i} text={`AS${a}`} farbe={C.gelb} />)}
            {r.routing.announced != null && <Marke text={r.routing.announced ? "announced" : "not announced"} farbe={r.routing.announced ? C.gruen : C.orange} />}
          </div>
        )}
      </Sektion>
      {(r.as?.holder || r.as?.asn != null) && (
        <Sektion titel="Autonomes System" farbe={C.gelb}>
          {r.as?.asn != null && <Feld label="ASN">AS{r.as.asn}</Feld>}
          {r.as?.holder && <Feld label="Betreiber">{r.as.holder}</Feld>}
          {r.as?.typ && <Feld label="Typ">{r.as.typ}</Feld>}
        </Sektion>
      )}
      {!!r.abuse_kontakte?.length && (
        <Sektion titel="Abuse-Kontakt" farbe={C.rot}>
          {r.abuse_kontakte.map((mail, i) => <Feld key={i} label="E-Mail" href={`mailto:${mail}`}>{mail}</Feld>)}
        </Sektion>
      )}
      {r.links && (
        <Sektion titel="Weiterführend">
          <div className="flex flex-wrap gap-1.5">
            <LinkChip name="RIPEstat" url={r.links.ripestat} farbe={C.akzent} />
            <LinkChip name="bgp.he.net" url={r.links.bgp_he} farbe={C.akzent} />
          </div>
        </Sektion>
      )}
      <VtSektion vt={r.vt} />
      <FussZeile iso={r.analysiert_am} />
    </div>
  );
}

// ─── Gemeinsame Bausteine ───────────────────────────────────────────

function FehlerHinweis({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-signal-rot/25 bg-signal-rot/[0.06] p-4 font-mono text-[12.5px] text-signal-rot/85">
      [Fehler] {text}
    </div>
  );
}

function FussZeile({ iso }: { iso?: string }) {
  return <div className="font-mono text-[10px] text-white/45 mt-5 pt-3 border-t border-white/[0.05]">analysiert: {zeit(iso)} UTC</div>;
}

// ─── System-Status (Modul 1) ────────────────────────────────────────

function ReportStatus() {
  const werkzeuge = [
    "E-Mail Vollanalyse", "Username Vollscan (600+)", "Telefon Analyse",
    "Reverse Image", "Domain & Shodan", "Subdomain-Recon (3 Quellen)",
    "IP-Intel (RIPEstat)", "Vollanalyse Orchestrator",
  ];
  const infra = [
    "FastAPI · uvicorn · slowapi",
    "dnspython · python-whois",
    "httpx — TLS-verify + SSRF-Guard",
    "WhatsMyName-DB (cached)",
    "Shodan InternetDB",
    "RIPEstat (RIPE NCC)",
    "crt.sh · Wayback · CommonCrawl",
  ];
  return (
    <div>
      <Verdikt titel="System-Status" stufe="live" wert={werkzeuge.length} max={werkzeuge.length}
        hinweis="live · produktiv"
        deutung="Alle Analyse-Werkzeuge sind aktuell erreichbar und einsatzbereit." />
      <Sektion titel="Analyse-Werkzeuge"
        rechts={<span className="font-mono text-[10px] text-white/50">{werkzeuge.length} aktiv</span>}>
        {werkzeuge.map((w) => <Item key={w} stufe="ok">{w}</Item>)}
      </Sektion>
      <Sektion titel="Infrastruktur (Contabo VPS)">
        {infra.map((i) => <Item key={i} stufe="ok">{i}</Item>)}
      </Sektion>
      <FussZeile iso={new Date().toISOString()} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HAUPT-SWITCH
// ═══════════════════════════════════════════════════════════════════

export default function ErgebnisReport({ modulNummer, daten, onPivot }: { modulNummer: string; daten: unknown; onPivot?: PivotHandler }) {
  let inhalt: React.ReactNode = null;
  switch (modulNummer) {
    case "1": inhalt = <ReportStatus />; break;
    case "2": { const d = daten as { basis: EmailErgebnis; recon: EmailReconErgebnis | null }; inhalt = <ReportEmail basis={d.basis} recon={d.recon} onPivot={onPivot} />; break; }
    case "3": inhalt = <ReportUsername b={daten as BenutzerErgebnis} onPivot={onPivot} />; break;
    case "4": inhalt = <ReportTelefon t={daten as TelefonErgebnis} />; break;
    case "5": { const d = daten as { domain: DomainErgebnis; shodan: ShodanErgebnis | null }; inhalt = <ReportDomain domain={d.domain} shodan={d.shodan} onPivot={onPivot} />; break; }
    case "6": inhalt = <ReportBild b={daten as BildErgebnis} onPivot={onPivot} />; break;
    case "8": inhalt = <ReportOrchestrator o={daten as OrchestratorErgebnis} />; break;
    case "9": inhalt = <ReportSubdomains s={daten as SubdomainErgebnis} />; break;
    case "10": inhalt = <ReportIpIntel r={daten as IpIntelErgebnis} />; break;
    default: return null;
  }
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      {inhalt}
    </motion.div>
  );
}
