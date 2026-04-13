// ═══════════════════════════════════════════════════════════════════
// BEREICH: Fusszeile
// Seitenfuß mit Links, Copyright und Social-Profilen.
// ═══════════════════════════════════════════════════════════════════

import { Link } from "react-router-dom";
import { aktuellesJahr } from "../../hilfsmittel/formatierung";
import { PERSOENLICH } from "../../models/daten";

const FUSS_LINKS = [
  { pfad: "/projekte",    label: "Projekte" },
  { pfad: "/security",    label: "Security" },
  { pfad: "/osint-tools", label: "OSINT Tools" },
  { pfad: "/zeugnisse",   label: "Zeugnisse" },
  { pfad: "/kontakt",     label: "Kontakt" },
];

const SOZIALE_LINKS = [
  { url: PERSOENLICH.github,    label: "GitHub",     kurz: "NEO849" },
  { url: PERSOENLICH.hackerone, label: "HackerOne",  kurz: "luicypher_neo" },
  { url: PERSOENLICH.intigriti, label: "Intigriti",  kurz: "cypherneo" },
];

export function Fusszeile() {
  return (
    <footer className="border-t border-white/[0.06] mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Marke */}
          <div>
            <p className="font-mono text-sm text-white/25 mb-1">
              neo<span className="text-akzent-400">@</span>portfolio
            </p>
            <p className="text-xs text-white/25 leading-relaxed max-w-xs">
              Fullstack Security Engineer. iOS Development,<br />
              Security Research, Bug Bounty.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="font-mono text-xs text-white/20 mb-3 uppercase tracking-widest">
              Navigation
            </p>
            <ul className="space-y-2">
              {FUSS_LINKS.map((link) => (
                <li key={link.pfad}>
                  <Link
                    to={link.pfad}
                    className="text-sm text-white/35 hover:text-white/70 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Soziale Links */}
          <div>
            <p className="font-mono text-xs text-white/20 mb-3 uppercase tracking-widest">
              Profile
            </p>
            <ul className="space-y-2">
              {SOZIALE_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-white/35 hover:text-akzent-400 transition-colors duration-200 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-akzent-400 transition-colors" />
                    <span>{link.label}</span>
                    <span className="font-mono text-xs text-white/20">({link.kurz})</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright-Zeile */}
        <div className="pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/20 font-mono">
            © {aktuellesJahr()} {PERSOENLICH.name} — Alle Rechte vorbehalten
          </p>
          <p className="text-xs text-white/15 font-mono">
            Gebaut mit React · TypeScript · Framer Motion
          </p>
        </div>
      </div>
    </footer>
  );
}
