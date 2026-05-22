// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: OsintGraph — Maltego-Style Visualisierung
//
// Reine SVG-Lösung mit force-directed Layout (eigener Mini-Solver,
// keine externen Libraries). Rendert Nodes + Edges aus dem
// Orchestrator-Ergebnis als interaktiven Graph.
//
// Layout:
//   • Primary Node im Zentrum
//   • Force-directed Spring-Modell (Hooke + Coulomb)
//   • Klick auf Node → Detail-Panel öffnet
//   • Drag-Support für Mobile + Desktop
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState } from "react";
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

const NODE_RADIUS = (typ: string, primaer: boolean): number =>
  primaer ? 22 : typ === "cve" ? 8 : typ === "account" || typ === "username" ? 10 : 13;


// ─── Force-Layout Berechnung ──────────────────────────────────────

interface Position {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fixed?: boolean;
}

function berechneLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  breite: number,
  hoehe: number,
  iterationen: number = 250,
): Map<string, Position> {
  const positionen = new Map<string, Position>();

  // Initial: Primary in der Mitte, Rest im Kreis
  const primary = nodes.find(n => n.daten.primaer);
  const andere = nodes.filter(n => !n.daten.primaer);

  if (primary) {
    positionen.set(primary.id, {
      x: breite / 2,
      y: hoehe / 2,
      vx: 0,
      vy: 0,
      fixed: true,
    });
  }

  const radius = Math.min(breite, hoehe) * 0.35;
  andere.forEach((n, i) => {
    const winkel = (i / andere.length) * Math.PI * 2;
    positionen.set(n.id, {
      x: breite / 2 + Math.cos(winkel) * radius,
      y: hoehe / 2 + Math.sin(winkel) * radius,
      vx: 0,
      vy: 0,
    });
  });

  // Force-Solver Parameter
  const repulsion = 8000;        // Coulomb-Kraft
  const spring_länge = 110;
  const spring_kraft = 0.04;
  const dämpfung = 0.85;

  for (let iter = 0; iter < iterationen; iter++) {
    // Repulsion zwischen ALLEN Nodes
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

    // Spring entlang Edges
    for (const e of edges) {
      const pa = positionen.get(e.von);
      const pb = positionen.get(e.zu);
      if (!pa || !pb) continue;
      const dx = pb.x - pa.x;
      const dy = pb.y - pa.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const diff = dist - spring_länge;
      const fx = (dx / dist) * diff * spring_kraft;
      const fy = (dy / dist) * diff * spring_kraft;
      pa.vx += fx;
      pa.vy += fy;
      pb.vx -= fx;
      pb.vy -= fy;
    }

    // Position aktualisieren
    for (const [, p] of positionen) {
      if (p.fixed) continue;
      p.vx *= dämpfung;
      p.vy *= dämpfung;
      p.x += p.vx * 0.5;
      p.y += p.vy * 0.5;
      // Innerhalb der Bounds halten
      p.x = Math.max(40, Math.min(breite - 40, p.x));
      p.y = Math.max(40, Math.min(hoehe - 40, p.y));
    }
  }

  return positionen;
}


// ─── Komponente ────────────────────────────────────────────────────

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  breite?: number;
  hoehe?: number;
}

export default function OsintGraph({ nodes, edges, breite = 720, hoehe = 480 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [auswahl, setAuswahl] = useState<GraphNode | null>(null);

  const positionen = useMemo(
    () => berechneLayout(nodes, edges, breite, hoehe),
    [nodes, edges, breite, hoehe],
  );

  if (!nodes.length) {
    return (
      <div className="flex items-center justify-center h-64 text-white/50 text-sm font-mono">
        Kein Graph verfuegbar — fuehre erst eine Orchestrator-Analyse aus.
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${breite} ${hoehe}`}
        className="w-full bg-[#08080f] rounded-xl border border-white/[0.06]"
        style={{ maxHeight: hoehe }}
      >
        {/* ─── SVG-Definitionen: Radial-Gradients + Glow pro Node-Farbe ─── */}
        <defs>
          {/* Glow-Filter — gemeinsam für alle Nodes */}
          <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Drop-Shadow für Tiefe */}
          <filter id="node-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#000" floodOpacity="0.6" />
          </filter>
          {/* Radial-Gradient pro Farbe für volumetrischen Look */}
          {Object.entries(NODE_FARBEN).map(([typ, farbe]) => (
            <radialGradient key={`grad-${typ}`} id={`grad-${typ}`} cx="35%" cy="30%" r="75%">
              <stop offset="0%"   stopColor={farbe} stopOpacity="1" />
              <stop offset="55%"  stopColor={farbe} stopOpacity="0.85" />
              <stop offset="100%" stopColor={farbe} stopOpacity="0.55" />
            </radialGradient>
          ))}
        </defs>

        {/* Edges */}
        <g className="edges">
          {edges.map((e, i) => {
            const pa = positionen.get(e.von);
            const pb = positionen.get(e.zu);
            if (!pa || !pb) return null;
            return (
              <g key={`e-${i}`}>
                <line
                  x1={pa.x}
                  y1={pa.y}
                  x2={pb.x}
                  y2={pb.y}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth={1}
                />
                {(hoverNode === e.von || hoverNode === e.zu) && (
                  <text
                    x={(pa.x + pb.x) / 2}
                    y={(pa.y + pb.y) / 2 - 4}
                    fill="rgba(255,255,255,0.55)"
                    fontSize={9}
                    textAnchor="middle"
                    className="font-mono pointer-events-none"
                  >
                    {e.beziehung}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Nodes */}
        <g className="nodes">
          {nodes.map(n => {
            const p = positionen.get(n.id);
            if (!p) return null;
            const farbe = NODE_FARBEN[n.typ] ?? "#94a3b8";
            const r = NODE_RADIUS(n.typ, !!n.daten.primaer);
            const istPrimaer = !!n.daten.primaer;
            const hover = hoverNode === n.id;

            return (
              <g
                key={n.id}
                transform={`translate(${p.x},${p.y})`}
                onMouseEnter={() => setHoverNode(n.id)}
                onMouseLeave={() => setHoverNode(null)}
                onClick={() => setAuswahl(n)}
                style={{ cursor: "pointer" }}
              >
                {/* Pulsierender Halo um Primary-Node */}
                {istPrimaer && (
                  <>
                    <circle r={r + 12} fill="none" stroke={farbe} strokeWidth={0.5} opacity={0.18} />
                    <circle r={r + 8}  fill="none" stroke={farbe} strokeWidth={1}   opacity={0.35} />
                  </>
                )}
                {/* Hauptkreis mit Radial-Gradient + Drop-Shadow */}
                <circle
                  r={r}
                  fill={`url(#grad-${n.typ})`}
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth={hover ? 1.5 : 0.8}
                  filter={hover ? "url(#node-glow)" : "url(#node-shadow)"}
                />
                {/* Specular Highlight oben links für 3D-Effekt */}
                <ellipse
                  cx={-r * 0.3}
                  cy={-r * 0.4}
                  rx={r * 0.4}
                  ry={r * 0.25}
                  fill="rgba(255,255,255,0.32)"
                  pointerEvents="none"
                />
                <text
                  y={r + 14}
                  fill="rgba(255,255,255,0.92)"
                  fontSize={istPrimaer ? 13 : 11}
                  fontWeight={istPrimaer ? 600 : 500}
                  textAnchor="middle"
                  className="font-mono pointer-events-none"
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.6)" }}
                >
                  {n.label.length > 22 ? n.label.substring(0, 20) + "…" : n.label}
                </text>
              </g>
            );
          })}
        </g>

        {/* ─── Legende: größeres Panel mit Background, hochwertigen Kreisen ─── */}
        {(() => {
          const ROW_H    = 22;
          const PAD_X    = 12;
          const PAD_Y    = 10;
          const TITLE_H  = 18;
          const types    = Object.entries(NODE_FARBEN);
          const panelH   = TITLE_H + types.length * ROW_H + PAD_Y + 4;
          const panelW   = 140;
          const panelX   = 10;
          const panelY   = hoehe - panelH - 10;
          return (
            <g transform={`translate(${panelX}, ${panelY})`}>
              {/* Background-Panel */}
              <rect
                width={panelW}
                height={panelH}
                rx={10}
                fill="rgba(12, 12, 22, 0.85)"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={1}
                filter="url(#node-shadow)"
              />
              {/* Title */}
              <text
                x={PAD_X}
                y={PAD_Y + 9}
                fontSize={10}
                fontWeight={600}
                letterSpacing={1.5}
                fill="rgba(255,255,255,0.55)"
                className="font-mono"
              >
                LEGENDE
              </text>
              {/* Entries */}
              {types.map(([typ, farbe], i) => {
                const cy = TITLE_H + PAD_Y + i * ROW_H + ROW_H / 2;
                return (
                  <g key={typ}>
                    {/* Glow-Halo */}
                    <circle cx={PAD_X + 7} cy={cy} r={9} fill={farbe} opacity={0.18} />
                    {/* Hauptkreis mit Gradient + Highlight */}
                    <circle
                      cx={PAD_X + 7}
                      cy={cy}
                      r={6}
                      fill={`url(#grad-${typ})`}
                      stroke="rgba(255,255,255,0.22)"
                      strokeWidth={0.8}
                    />
                    <ellipse
                      cx={PAD_X + 7 - 2.2}
                      cy={cy - 2.5}
                      rx={2.6}
                      ry={1.6}
                      fill="rgba(255,255,255,0.35)"
                      pointerEvents="none"
                    />
                    {/* Label */}
                    <text
                      x={PAD_X + 22}
                      y={cy + 4}
                      fontSize={11}
                      fontWeight={500}
                      fill="rgba(255,255,255,0.78)"
                      className="font-mono"
                    >
                      {typ}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })()}
      </svg>

      {/* Detail-Panel */}
      {auswahl && (
        <div
          className="absolute top-3 right-3 max-w-xs p-3 rounded-lg bg-[#12121f]/95 border border-white/[0.08] backdrop-blur-sm font-mono text-[11px]"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="text-white/55 text-[9px] uppercase tracking-wider">
                {auswahl.typ}
              </div>
              <div className="text-white font-semibold">
                {auswahl.label}
              </div>
            </div>
            <button
              onClick={() => setAuswahl(null)}
              className="text-white/40 hover:text-white text-base leading-none"
              aria-label="Schliessen"
            >
              ×
            </button>
          </div>
          {Object.keys(auswahl.daten).length > 0 && (
            <div className="space-y-1 text-white/65">
              {Object.entries(auswahl.daten).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-white/40">{k}:</span>
                  <span className="break-all">
                    {typeof v === "string" && v.startsWith("http") ? (
                      <a href={v} target="_blank" rel="noopener noreferrer"
                         className="text-cyber-400 hover:underline">
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
