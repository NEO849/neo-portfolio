// ═══════════════════════════════════════════════════════════════════
// SEITE: BilderSeite
// Bildergalerie eines Projekts unter "/projekte/<slug>/bilder".
// Findet das Projekt per galerieSlug, rendert Header + Karussell.
// ═══════════════════════════════════════════════════════════════════

import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import { SeitenMeta } from "../bausteine/SeitenMeta";
import { KnopfSekundaer } from "../bausteine/KnopfSekundaer";
import { PROJEKTE } from "../models/daten";
import { BilderKarussell } from "../bausteine/BilderKarussell";

// Akzentfarbe je Kategorie — konsistent zur ProjekteView.
const AKZENT_FARBE: Record<string, string> = {
  security:    "#94a3b8",
  development: "#818cf8",
  tooling:     "#22d3ee",
};

export default function BilderSeite() {
  const { slug } = useParams<{ slug: string }>();
  const projekt = PROJEKTE.find(p => p.galerieSlug === slug && (p.bilder?.length ?? 0) > 0);

  // Unbekannter Slug oder keine Bilder → zurück zur Projekt-Übersicht.
  if (!projekt || !projekt.bilder) return <Navigate to="/projekte" replace />;

  const akzent = AKZENT_FARBE[projekt.kategorie] ?? "#818cf8";

  return (
    <>
      <SeitenMeta
        titel={`${projekt.titel} – Bilder`}
        beschreibung={`Screenshots und Einblicke: ${projekt.kurzbeschreibung}`}
        pfad={`/projekte/${slug}/bilder`}
      />
      <motion.div
        variants={SEITEN_EINGANG}
        initial="versteckt"
        animate="sichtbar"
        exit="verlassen"
        className="pt-16"
      >
        <section className="py-12 px-6 max-w-3xl mx-auto">
          <Link
            to="/projekte"
            className="inline-flex items-center gap-2 font-mono text-xs text-white/50 hover:text-white/85 transition mb-6"
          >
            <span aria-hidden="true">←</span> zurück zu Projekten
          </Link>

          <header className="mb-7">
            <p className="font-mono text-[11px] tracking-[0.2em] mb-2" style={{ color: `${akzent}aa` }}>
              BILDERGALERIE
            </p>
            <h1 className="font-display text-2xl font-bold text-white leading-snug">{projekt.titel}</h1>
            <p className="text-sm text-white/55 mt-2 leading-relaxed">{projekt.kurzbeschreibung}</p>
          </header>

          <BilderKarussell bilder={projekt.bilder} akzentFarbe={akzent} />

          {projekt.linkGithub && (
            <div className="mt-8 flex flex-wrap gap-2">
              <KnopfSekundaer zuUrl={projekt.linkGithub} klassen="text-xs">
                GitHub-Repository →
              </KnopfSekundaer>
              <KnopfSekundaer zuRoute="/projekte" klassen="text-xs">
                Alle Projekte →
              </KnopfSekundaer>
            </div>
          )}
        </section>
      </motion.div>
    </>
  );
}
