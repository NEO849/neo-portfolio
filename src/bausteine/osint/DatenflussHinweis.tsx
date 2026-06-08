// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: DatenflussHinweis — DSGVO-Transparenz (Art. 13/14)
//
// Zeigt vor/zur Analyse aufklappbar, welche Drittdienste das gewählte
// Werkzeug SERVERSEITIG kontaktiert (= wohin Daten fließen) — gespeist
// aus der maschinenlesbaren Backend-Deklaration (/transparenz).
// Nicht-blockierend, aber ehrlich: der Nutzer sieht jederzeit, was passiert.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { transparenzLaden, type WerkzeugDatenfluss } from "../../dienste/osintApi";

// Modul-Nummer (UI) → Werkzeug-Schlüssel (Backend-Deklaration)
const MODUL_ZU_WERKZEUG: Record<string, string> = {
  "2": "email-recon",
  "3": "benutzername",
  "4": "telefon",
  "5": "domain",
  "6": "bild",
  "8": "orchestrator",
  "9": "subdomains",
  "10": "ip-intel",
};

export default function DatenflussHinweis({ nummer }: { nummer: string }) {
  const [wz, setWz] = useState<WerkzeugDatenfluss | null>(null);
  const [offen, setOffen] = useState(false);

  useEffect(() => {
    let aktiv = true;
    const key = MODUL_ZU_WERKZEUG[nummer];
    setWz(null);
    setOffen(false);
    if (!key) return;
    transparenzLaden().then((t) => {
      if (aktiv && t) setWz(t.werkzeuge?.[key] ?? null);
    });
    return () => { aktiv = false; };
  }, [nummer]);

  if (!wz) return null;
  const anzahl = wz.sendet_an.length;

  return (
    <div className="mt-4 border-t border-white/[0.06] pt-3 font-mono text-[11px]">
      <button
        onClick={() => setOffen((o) => !o)}
        className="flex items-center gap-2 text-white/55 hover:text-white/80 transition"
      >
        <span className="text-cyber-400">🛡</span>
        <span>
          Datenfluss-Transparenz{" "}
          <span className="text-white/40">
            · {anzahl > 0 ? `${anzahl} Drittdienst(e)` : "nur lokal verarbeitet"}
          </span>
        </span>
        <span className="text-white/40">{offen ? "▲" : "▼"}</span>
      </button>

      {offen && (
        <div className="mt-2.5 space-y-2 text-white/60 leading-relaxed">
          <p className="text-white/55">{wz.beschreibung}</p>

          {anzahl === 0 ? (
            <p className="text-signal-gruen/75">
              ✓ Es wird serverseitig kein Drittdienst kontaktiert — die Analyse läuft lokal.
            </p>
          ) : (
            <div className="space-y-1.5">
              <div className="text-white/45 text-[10px] tracking-wider uppercase">Daten gehen an:</div>
              {wz.sendet_an.map((d, i) => (
                <div key={i} className="pl-2 border-l border-white/10">
                  <a href={d.datenschutz_url} target="_blank" rel="noopener noreferrer"
                     className="text-cyber-400 hover:underline underline-offset-2">{d.dienst}</a>
                  <span className="text-white/40"> · {d.region}</span>
                  <div className="text-white/50">{d.uebermittelte_daten}</div>
                </div>
              ))}
            </div>
          )}

          {wz.hinweis && <p className="text-white/50">{wz.hinweis}</p>}
          <p className="text-white/40 text-[10px]">{wz.speicherung}</p>
        </div>
      )}
    </div>
  );
}
