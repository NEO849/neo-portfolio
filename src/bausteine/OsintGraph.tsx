// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: OsintGraph — Premium Intelligence-Graph (Maltego-Style)
//
// Reine SVG-Lösung mit force-directed Layout (eigener Mini-Solver,
// keine externen Libraries, kein WebGL). Rendert Nodes + Edges aus dem
// Orchestrator-Ergebnis als interaktiven, hochwertigen Graph.
//
// Design-Prinzipien:
//   • SVG füllt den Container 1:1 (ResizeObserver) → kein Letterboxing,
//     dadurch robuste Positionierung ohne Viewport-Offsets bei Resize.
//   • Legende als HTML-Glass-Overlay (unten links verankert, immer
//     korrekt — entkoppelt vom SVG-Scaling). Zeigt nur vorhandene Typen.
//   • Tiefe durch Material statt 3D-Engine: Radial-Gradient + Specular +
//     weiche Schatten + Fokus-Dimming verbundener Knoten.
//   • Ruhige Interaktion, prefers-reduced-motion respektiert.
// ═══════════════════════════════════════════════════════════════════

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { GraphNode, GraphEdge } from "../dienste/osintApi";

// ─── Konstanten ────────────────────────────────────────────────────

const NODE_FARBEN: Record<string, string> = {
  email:      "#818cf8", // indigo-400
  domain:     "#22d3ee", // cyan-400
  username:   "#c084fc", // purple-400
  account:    "#a78bfa", // violet-400
  ip:         "#ef4444", // red-500
  cve:        "#f87171", // red-400
  asn:        "#fbbf24", // amber-400
  nameserver: "#fb923c", // orange-400
  carrier:    "#34d399", // green-400
  land:       "#86efac", // green-300
  phone:      "#eab308", // yellow-500
};

// Lesbare Legenden-Labels (statt roher Typ-Keys)
const TYP_LABEL: Record<string, string> = {
  email: "E-Mail", domain: "Domain", username: "Username", account: "Account",
  ip: "IP-Adresse", cve: "CVE", asn: "ASN", nameserver: "Nameserver",
  carrier: "Carrier", land: "Land", phone: "Telefon",
};

const FALLBACK_FARBE = "#94a3b8";

// Knoten-Radius nach Typ/Wichtigkeit. Primary deutlich größer (Hierarchie),
// kritische CVE-Knoten bewusst klein (viele, sekundär).
const NODE_RADIUS = (typ: string, primaer: boolean): number =>
  primaer ? 24 : typ === "cve" ? 8 : typ === "account" || typ === "username" ? 10 : 13;

// ─── Force-Layout Berechnung ──────────────────────────────────────

interface Position { x: number; y: number; vx: number; vy: number; fixed?: boolean; }

function berechneLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  breite: number,
  hoehe: number,
  iterationen = 250,
): Map<string, Position> {
  const positionen = new Map<string, Position>();
  const primary = nodes.find(n => n.daten.primaer);
  const andere = nodes.filter(n => !n.daten.primaer);

  // Zentrum leicht über die Mitte gesetzt → Primary-Label kollidiert nicht
  // mit der Legende unten links (besonders auf schmalen Screens).
  const cx = breite / 2;
  const cy = hoehe * 0.46;

  if (primary) {
    positionen.set(primary.id, { x: cx, y: cy, vx: 0, vy: 0, fixed: true });
  }

  const radius = Math.min(breite, hoehe) * 0.34;
  andere.forEach((n, i) => {
    const winkel = (i / Math.max(andere.length, 1)) * Math.PI * 2;
    positionen.set(n.id, {
      x: cx + Math.cos(winkel) * radius,
      y: cy + Math.sin(winkel) * radius,
      vx: 0, vy: 0,
    });
  });

  // Hooke (Spring entlang Kanten) + Coulomb (Repulsion zwischen allen Knoten)
  const repulsion = 8200;
  const springLänge = 116;
  const springKraft = 0.04;
  const dämpfung = 0.85;
  const rand = 46; // Sicherheitsabstand zum Container-Rand für Labels

  for (let iter = 0; iter < iterationen; iter++) {
    for (const a of nodes) {
      for (const b of nodes) {
        if (a.id === b.id) continue;
        const pa = positionen.get(a.id)!;
        const pb = positionen.get(b.id)!;
        const dx = pa.x - pb.x;
        const dy = pa.y - pb.y;
        const dist2 = Math.max(dx * dx + dy * dy, 1);
        const dist = Math.sqrt(dist2);
        const kraft = repulsion / dist2;
        pa.vx += (dx / dist) * kraft;
        pa.vy += (dy / dist) * kraft;
      }
    }
    for (const e of edges) {
      const pa = positionen.get(e.von);
      const pb = positionen.get(e.zu);
      if (!pa || !pb) continue;
      const dx = pb.x - pa.x;
      const dy = pb.y - pa.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const diff = dist - springLänge;
      const fx = (dx / dist) * diff * springKraft;
      const fy = (dy / dist) * diff * springKraft;
      pa.vx += fx; pa.vy += fy;
      pb.vx -= fx; pb.vy -= fy;
    }
    for (const [, p] of positionen) {
      if (p.fixed) continue;
      p.vx *= dämpfung; p.vy *= dämpfung;
      p.x += p.vx * 0.5; p.y += p.vy * 0.5;
      p.x = Math.max(rand, Math.min(breite - rand, p.x));
      p.y = Math.max(rand, Math.min(hoehe - rand, p.y));
    }
  }
  return positionen;
}

// Nachbarschafts-Map für Fokus-Dimming + Kanten-Highlight
function berechneNachbarn(edges: GraphEdge[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  const add = (a: string, b: string) => {
    if (!map.has(a)) map.set(a, new Set());
    map.get(a)!.add(b);
  };
  for (const e of edges) { add(e.von, e.zu); add(e.zu, e.von); }
  return map;
}

// ─── Komponente ────────────────────────────────────────────────────

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** Optional fix; sonst füllt der Graph den Container responsiv. */
  breite?: number;
  hoehe?: number;
}

export default function OsintGraph({ nodes, edges, breite, hoehe }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const [dims, setDims] = useState({ w: breite ?? 720, h: hoehe ?? 460 });
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [auswahl, setAuswahl] = useState<GraphNode | null>(null);
  const [legendeManuell, setLegendeManuell] = useState<boolean | null>(null);

  // Container 1:1 vermessen → SVG-Koordinaten = Pixel (kein Letterboxing).
  useLayoutEffect(() => {
    if (breite && hoehe) return; // feste Maße vorgegeben → nicht messen
    const el = containerRef.current;
    if (!el) return;
    let raf = 0;
    const messen = () => {
      const w = Math.round(el.clientWidth);
      if (w < 1) return;
      // Schmale Screens bekommen relativ mehr Höhe → Knoten spreizen, weniger Label-Kollision
      const h = w < 560
        ? Math.min(460, Math.max(360, Math.round(w * 1.05)))
        : Math.min(520, Math.max(360, Math.round(w * 0.58)));
      setDims(prev => (Math.abs(prev.w - w) > 4 || prev.h !== h ? { w, h } : prev));
    };
    messen();
    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(messen); });
    ro.observe(el);
    return () => { ro.disconnect(); cancelAnimationFrame(raf); };
  }, [breite, hoehe]);

  const positionen = useMemo(
    () => berechneLayout(nodes, edges, dims.w, dims.h),
    [nodes, edges, dims.w, dims.h],
  );
  const nachbarn = useMemo(() => berechneNachbarn(edges), [edges]);

  // Nur tatsächlich vorhandene Typen in der Legende zeigen
  const vorhandeneTypen = useMemo(() => {
    const set = new Set(nodes.map(n => n.typ));
    return Object.keys(NODE_FARBEN).filter(t => set.has(t));
  }, [nodes]);

  const istAktiv = (id: string): boolean =>
    !hoverNode || hoverNode === id || !!nachbarn.get(hoverNode)?.has(id);

  // Legende: Desktop offen, schmale Screens standardmäßig eingeklappt
  const istMobil = dims.w < 560;
  const legendeOffen = legendeManuell ?? !istMobil;

  if (!nodes.length) {
    return (
      <div className="flex items-center justify-center h-64 text-white/50 text-sm font-mono">
        Kein Graph verfügbar — führe erst eine Orchestrator-Analyse aus.
      </div>
    );
  }

  const trans = reduce ? "none" : "opacity 0.25s ease, stroke-width 0.2s ease";

  return (
    <div ref={containerRef} className="relative w-full bg-[#06080f]">
      <svg
        width={dims.w}
        height={dims.h}
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        className="block w-full"
        style={{ height: dims.h }}
        role="img"
        aria-label={`Intelligence-Graph mit ${nodes.length} Knoten und ${edges.length} Verbindungen`}
      >
        <defs>
          {/* Hintergrund-Vignette für Tiefe */}
          <radialGradient id="bg-vignette" cx="50%" cy="42%" r="78%">
            <stop offset="0%"   stopColor="#0c1120" />
            <stop offset="100%" stopColor="#06080f" />
          </radialGradient>
          {/* Dezentes technisches Dot-Grid */}
          <pattern id="dot-grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="1.2" cy="1.2" r="1.1" fill="rgba(255,255,255,0.035)" />
          </pattern>
          {/* Weicher Glow für Hover/Fokus */}
          <filter id="node-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Tiefen-Schatten */}
          <filter id="node-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.4" floodColor="#000" floodOpacity="0.55" />
          </filter>
          {/* Volumetrischer Radial-Gradient pro Farbe (Licht oben links) */}
          {Object.entries(NODE_FARBEN).map(([typ, farbe]) => (
            <radialGradient key={`grad-${typ}`} id={`grad-${typ}`} cx="34%" cy="28%" r="78%">
              <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="26%"  stopColor={farbe}   stopOpacity="1" />
              <stop offset="100%" stopColor={farbe}   stopOpacity="0.5" />
            </radialGradient>
          ))}
        </defs>

        {/* Hintergrund */}
        <rect width={dims.w} height={dims.h} fill="url(#bg-vignette)" />
        <rect width={dims.w} height={dims.h} fill="url(#dot-grid)" />

        {/* ─── Edges (gebogen, mit Fokus-Highlight) ─── */}
        <g>
          {edges.map((e, i) => {
            const pa = positionen.get(e.von);
            const pb = positionen.get(e.zu);
            if (!pa || !pb) return null;
            const verbunden = hoverNode === e.von || hoverNode === e.zu;
            const gedimmt = !!hoverNode && !verbunden;
            // sanfte Quadratische Kurve (perpendikulärer Versatz)
            const dx = pb.x - pa.x, dy = pb.y - pa.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const off = Math.min(38, len * 0.12);
            const cx = (pa.x + pb.x) / 2 + (-dy / len) * off;
            const cy = (pa.y + pb.y) / 2 + (dx / len) * off;
            const farbe = verbunden ? (NODE_FARBEN[nodes.find(n => n.id === hoverNode)?.typ ?? ""] ?? "#a5b4fc") : "#ffffff";
            return (
              <g key={`e-${i}`} style={{ transition: trans }} opacity={gedimmt ? 0.05 : 1}>
                <path
                  d={`M ${pa.x} ${pa.y} Q ${cx} ${cy} ${pb.x} ${pb.y}`}
                  fill="none"
                  stroke={farbe}
                  strokeOpacity={verbunden ? 0.7 : 0.12}
                  strokeWidth={verbunden ? 1.8 : 1}
                  strokeLinecap="round"
                  filter={verbunden ? "url(#node-glow)" : undefined}
                />
                {verbunden && (
                  <text
                    x={cx} y={cy - 4}
                    fill="rgba(255,255,255,0.7)" fontSize={9}
                    textAnchor="middle" className="font-mono pointer-events-none"
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}
                  >
                    {e.beziehung}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* ─── Nodes ─── */}
        <g>
          {nodes.map(n => {
            const p = positionen.get(n.id);
            if (!p) return null;
            const farbe = NODE_FARBEN[n.typ] ?? FALLBACK_FARBE;
            const r = NODE_RADIUS(n.typ, !!n.daten.primaer);
            const istPrimaer = !!n.daten.primaer;
            const hover = hoverNode === n.id;
            const selektiert = auswahl?.id === n.id;
            const aktiv = istAktiv(n.id);
            const label = n.label.length > 22 ? n.label.substring(0, 20) + "…" : n.label;
            const pillW = label.length * (istPrimaer ? 7.4 : 6.4) + 12;
            // Intelligente Labels: Haupt-Entitäten immer, kleine Sekundär-Knoten
            // (CVE/Username/Account) erst bei Hover/Fokus → weniger Clutter.
            const labelSichtbar = istPrimaer || r >= 12 || hover || selektiert
              || (!!hoverNode && (nachbarn.get(hoverNode)?.has(n.id) ?? false));

            return (
              <g
                key={n.id}
                transform={`translate(${p.x},${p.y})`}
                onMouseEnter={() => setHoverNode(n.id)}
                onMouseLeave={() => setHoverNode(null)}
                onClick={() => setAuswahl(n)}
                style={{ cursor: "pointer", transition: trans }}
                opacity={aktiv ? 1 : 0.26}
              >
                {/* Pulsierender Halo (Primary) — nur ohne reduced-motion */}
                {istPrimaer && !reduce && (
                  <motion.circle
                    fill="none" stroke={farbe} strokeWidth={1}
                    initial={{ r: r + 6, opacity: 0.45 }}
                    animate={{ r: [r + 6, r + 17, r + 6], opacity: [0.45, 0.04, 0.45] }}
                    transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                {istPrimaer && (
                  <circle r={r + 7} fill="none" stroke={farbe} strokeWidth={0.6} opacity={0.3} />
                )}
                {/* Fokus-Ring bei Auswahl */}
                {selektiert && (
                  <circle r={r + 5} fill="none" stroke="#ffffff" strokeWidth={1.4} opacity={0.85} />
                )}
                {/* Hauptkörper mit Gradient + Tiefe */}
                <circle
                  r={r}
                  fill={`url(#grad-${n.typ in NODE_FARBEN ? n.typ : "domain"})`}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={hover ? 1.6 : 0.8}
                  filter={hover || selektiert ? "url(#node-glow)" : "url(#node-shadow)"}
                />
                {/* Specular Highlight oben links (3D-Anmutung) */}
                <ellipse
                  cx={-r * 0.3} cy={-r * 0.42}
                  rx={r * 0.42} ry={r * 0.26}
                  fill="rgba(255,255,255,0.4)" pointerEvents="none"
                />
                {/* Label mit dezenter Pill für Lesbarkeit */}
                {labelSichtbar && (
                <g pointerEvents="none">
                  <rect
                    x={-pillW / 2} y={r + 5}
                    width={pillW} height={istPrimaer ? 18 : 16} rx={istPrimaer ? 9 : 8}
                    fill="rgba(7,9,16,0.62)"
                    stroke={istPrimaer ? farbe : "rgba(255,255,255,0.08)"}
                    strokeOpacity={istPrimaer ? 0.5 : 1}
                    strokeWidth={istPrimaer ? 1 : 0.6}
                  />
                  <text
                    y={r + (istPrimaer ? 17 : 15)}
                    fill={istPrimaer ? "#ffffff" : "rgba(255,255,255,0.86)"}
                    fontSize={istPrimaer ? 12 : 10.5}
                    fontWeight={istPrimaer ? 600 : 500}
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {label}
                  </text>
                </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* ─── Legende: HTML-Glass-Overlay, immer unten links verankert ───
          Auf schmalen Screens einklappbar (Default zu), Desktop offen. */}
      <div
        className="absolute left-3 bottom-3 select-none overflow-hidden
                   rounded-xl border border-white/10 bg-[#0a0c16]/80 backdrop-blur-md
                   shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
      >
        <button
          type="button"
          onClick={() => setLegendeManuell(!legendeOffen)}
          aria-expanded={legendeOffen}
          className="flex items-center gap-1.5 w-full px-3 py-2 text-left
                     hover:bg-white/[0.03] transition-colors focus-visible:outline-none"
        >
          <span className="font-mono text-[9px] tracking-[0.18em] text-white/45">LEGENDE</span>
          <span className="font-mono text-[9px] text-white/30">({vorhandeneTypen.length})</span>
          <svg
            viewBox="0 0 12 12"
            className={`ml-auto w-3 h-3 text-white/40 transition-transform motion-reduce:transition-none ${legendeOffen ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" strokeWidth={1.6}
          >
            <path d="M3 4.5 6 7.5 9 4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {legendeOffen && (
          <ul className="grid grid-cols-1 gap-y-1 px-3 pb-2.5 pt-0.5 pointer-events-none">
            {vorhandeneTypen.map(typ => (
              <li key={typ} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: NODE_FARBEN[typ], boxShadow: `0 0 6px ${NODE_FARBEN[typ]}80` }}
                />
                <span className="font-mono text-[10.5px] text-white/75 leading-none">
                  {TYP_LABEL[typ] ?? typ}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ─── Detail-Panel (Auswahl) ─── */}
      {auswahl && (
        <div
          className="absolute top-3 right-3 max-w-[16rem] p-3 rounded-xl bg-[#0e1020]/95 border border-white/10 backdrop-blur-md font-mono text-[11px]"
          style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-white/55 text-[9px] uppercase tracking-wider">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: NODE_FARBEN[auswahl.typ] ?? FALLBACK_FARBE }}
                />
                {auswahl.typ}
              </div>
              <div className="text-white font-semibold break-all">{auswahl.label}</div>
            </div>
            <button
              onClick={() => setAuswahl(null)}
              className="text-white/40 hover:text-white text-base leading-none shrink-0"
              aria-label="Schließen"
            >
              ×
            </button>
          </div>
          {Object.keys(auswahl.daten).length > 0 && (
            <div className="space-y-1 text-white/65 max-h-48 overflow-y-auto">
              {Object.entries(auswahl.daten).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-white/40 shrink-0">{k}:</span>
                  <span className="break-all">
                    {typeof v === "string" && v.startsWith("http") ? (
                      <a href={v} target="_blank" rel="noopener noreferrer" className="text-cyber-400 hover:underline">
                        {v.length > 30 ? v.substring(0, 28) + "…" : v}
                      </a>
                    ) : (
                      String(v).substring(0, 50)
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
