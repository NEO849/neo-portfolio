// ─────────────────────────────────────────────────────────────────────────────
// CI-Audit-Gate für Production-Dependencies (high/critical) mit dokumentierter
// Ausnahme-Liste. Blockiert das Deploy bei ausnutzbaren Advisories — lässt aber
// explizit geprüfte, für diese App nicht anwendbare Advisories durch.
//
// Nutzung:  npm audit --omit=dev --json > audit.json || true
//           node scripts/audit-gate.mjs audit.json
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync } from "node:fs";

// Akzeptierte Advisories (geprüft & für diese App NICHT anwendbar):
//   GHSA-qwww-vcr4-c8h2 — react-router "RSC Mode CSRF Bypass". Betrifft ausschließlich
//   den React-Server-Components-/Server-Mode von React Router. Diese Website ist eine
//   reine Client-SPA (BrowserRouter, kein RSC/SSR/Server-Actions) → nicht ausnutzbar.
//   Entfernen, sobald ein nicht-breaking react-router-7-Patch (< 8.x) verfügbar ist.
const ALLOW = new Set(["GHSA-qwww-vcr4-c8h2"]);

const BLOCK = new Set(["high", "critical"]);
const file = process.argv[2] || "audit.json";

let data;
try {
  data = JSON.parse(readFileSync(file, "utf8"));
} catch (e) {
  console.error(`audit-gate: konnte ${file} nicht lesen/parsen: ${e.message}`);
  process.exit(2);
}

const offending = new Map(); // GHSA-Id -> Titel
const accepted = new Set();

for (const vuln of Object.values(data.vulnerabilities || {})) {
  for (const via of vuln.via || []) {
    if (typeof via !== "object" || !BLOCK.has(via.severity)) continue;
    const ghsa = (via.url || "").split("/").pop() || String(via.source || "unbekannt");
    if (ALLOW.has(ghsa)) {
      accepted.add(ghsa);
      continue;
    }
    offending.set(ghsa, via.title || vuln.name);
  }
}

if (accepted.size) {
  console.log(`audit-gate: akzeptierte Advisories (dokumentiert, nicht blockierend): ${[...accepted].join(", ")}`);
}

if (offending.size) {
  console.error("audit-gate: BLOCKIERENDE high/critical Advisories in Production-Deps:");
  for (const [ghsa, title] of offending) console.error(`  - ${ghsa} · ${title}`);
  process.exit(1);
}

console.log("audit-gate: keine blockierenden high/critical Production-Advisories. OK.");
process.exit(0);
