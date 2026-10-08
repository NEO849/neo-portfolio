import { useState } from "react";
import { motion } from "framer-motion";
import { PROJEKTE } from "../models/daten";
import type { ProjektModel } from "../models/typen";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { AbzeichenStatus, TechTag } from "../bausteine/AbzeichenStatus";
import { AusklappKarte } from "../bausteine/AusklappKarte";
import { Knopf } from "../bausteine/Knopf";
import { GlassTabs, type GlassTab } from "../bausteine/GlassTabs";
import { BilderLightbox } from "../bausteine/BilderLightbox";
import { KATEGORIE_KONFIGURATION, kategorieKonfig } from "../models/kategorieKonfiguration";

// ─── Kategorie-Konfiguration ──────────────────────────────────────
// Akzentfarben + Labels kommen aus der gemeinsamen Quelle
// (models/kategorieKonfiguration) — keine Doppelpflege mehr.

const FILTER_TABS: GlassTab[] = [
  { id: "alle",        label: "Alle" },
  { id: "security",    label: "Security" },
  { id: "development", label: "Mobil" },
  { id: "tooling",     label: "Tooling" },
];

// ─── Projekt-Karte ────────────────────────────────────────────────

function ProjektKarte({ projekt, onBildKlick }: { projekt: ProjektModel; onBildKlick: (index: number) => void }) {
  const [offen, setOffen] = useState(false);
  const cfg = kategorieKonfig(projekt.kategorie);
  const bilder = projekt.bilder ?? [];

  return (
    <AusklappKarte
      lichtfarbe={cfg.lichtfarbe}
      akzentFarbe={cfg.akzentFarbe}
      offen={offen}
      onUmschalten={() => setOffen(!offen)}
      kopf={
        <>
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <AbzeichenStatus
              variante={cfg.variante}
              text={cfg.label}
              mitPuls={projekt.status === "aktiv"}
            />
            <span className="text-xs text-white/45 font-mono">{projekt.zeitraum}</span>
            {projekt.status === "aktiv" && (
              <AbzeichenStatus variante="aktiv" text="aktiv" mitPuls />
            )}
            {projekt.status === "abgeschlossen" && (
              <span className="text-[10px] font-mono text-white/30 border border-white/[0.06] rounded-full px-2 py-0.5">
                abgeschlossen
              </span>
            )}
          </div>
          <h3 className="font-display text-lg font-bold text-white leading-snug">{projekt.titel}</h3>
          <p className="text-sm text-white/60 leading-relaxed mt-2">{projekt.kurzbeschreibung}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {projekt.technologien.map(tech => (
              <TechTag key={tech} name={tech} />
            ))}
          </div>
        </>
      }
      detail={
        <div className="space-y-4">
          <p className="text-sm text-white/70 leading-relaxed">{projekt.langbeschreibung}</p>

          {/* Was es bringt — kurzer, leicht verständlicher Nutzen */}
          <div
            className="rounded-2xl2 border p-4"
            style={{ borderColor: `${cfg.akzentFarbe}33`, background: `${cfg.akzentFarbe}0d` }}
          >
            <p className="font-mono text-[11px] tracking-widest mb-1.5" style={{ color: `${cfg.akzentFarbe}cc` }}>
              WAS ES BRINGT
            </p>
            <p className="text-sm text-white/75 leading-relaxed">{projekt.mehrwert}</p>
          </div>

          <div>
            <p className="font-mono text-[11px] tracking-widest mb-2.5"
              style={{ color: `${cfg.akzentFarbe}99` }}>
              HIGHLIGHTS
            </p>
            <ul className="space-y-1.5">
              {projekt.highlights.map((highlight, index) => (
                <li key={index} className="text-sm text-white/60 flex items-start gap-2">
                  <span className="flex-shrink-0 mt-[3px] text-[10px]"
                    style={{ color: cfg.akzentFarbe, opacity: 0.65 }}>
                    ›
                  </span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Vorschau-Leiste — horizontal scrollbar, Klick öffnet den grossen Viewer */}
          {bilder.length > 0 && (
            <div>
              <p className="font-mono text-[11px] tracking-widest mb-2.5" style={{ color: `${cfg.akzentFarbe}99` }}>
                BILDER
              </p>
              <ul className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1">
                {bilder.map((bild, i) => (
                  <li key={bild.quelle} className="snap-start flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => onBildKlick(i)}
                      aria-label={`Bild gross anzeigen: ${bild.titel}`}
                      className="group relative block w-28 sm:w-32 aspect-[3/4] overflow-hidden rounded-xl2 border border-white/10 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-akzent-400/70 hover:border-white/25"
                    >
                      <img
                        src={bild.quelle}
                        alt={bild.titel}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 py-1 text-[10px] text-white/85 truncate">
                        {bild.titel}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(projekt.linkGithub || projekt.linkLive || projekt.linkDemo) && (
            <div className="flex flex-wrap gap-2 pt-1">
              {projekt.linkGithub && (
                <Knopf variante="sekundaer" zuUrl={projekt.linkGithub} klassen="text-xs">
                  GitHub →
                </Knopf>
              )}
              {projekt.linkLive && (
                <Knopf variante="sekundaer" zuUrl={projekt.linkLive} klassen="text-xs">
                  Live →
                </Knopf>
              )}
              {projekt.linkDemo && (
                <Knopf variante="sekundaer" zuRoute={projekt.linkDemo} klassen="text-xs">
                  Demo ansehen →
                </Knopf>
              )}
            </div>
          )}
        </div>
      }
    />
  );
}

// ─── Haupt-View ───────────────────────────────────────────────────

export default function ProjekteView() {
  const [aktiverFilter, setAktiverFilter] = useState<string>("alle");
  const [lightbox, setLightbox] = useState<{ projekt: ProjektModel; index: number } | null>(null);

  const gefilterteProjekte = aktiverFilter === "alle"
    ? PROJEKTE
    : PROJEKTE.filter(p => p.kategorie === aktiverFilter);

  const anzahlProKategorie = {
    security:    PROJEKTE.filter(p => p.kategorie === "security").length,
    development: PROJEKTE.filter(p => p.kategorie === "development").length,
    tooling:     PROJEKTE.filter(p => p.kategorie === "tooling").length,
  };

  return (
    <section id="projekte" className="py-16 px-6 max-w-5xl mx-auto">
      <AbschnittsTitel
        prefix="> projekte"
        untertitel="Von nativer App-Entwicklung bis zur KI-augmentierten Security-Pipeline, gebaut mit echtem Anspruch an Architektur und Wartbarkeit."
        klassen="mb-8"
      />

      {/* Filter-Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <GlassTabs
          tabs={FILTER_TABS}
          activeId={aktiverFilter}
          onTabChange={setAktiverFilter}
          layoutId="projekte-filter"
          scrollable={true}
          ariaLabel="Projekte nach Kategorie filtern"
          buttonClassName="min-w-[80px] px-4 text-sm"
        />
        <div className="mt-2.5 flex items-center justify-between px-0.5">
          <div className="flex items-center gap-3">
            {(["security", "development", "tooling"] as const).map(kat => {
              const c = KATEGORIE_KONFIGURATION[kat];
              return (
                <button
                  key={kat}
                  onClick={() => setAktiverFilter(kat)}
                  className="flex items-center gap-1.5 group"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-opacity duration-200"
                    style={{
                      background: c.akzentFarbe,
                      opacity: aktiverFilter === kat || aktiverFilter === "alle" ? 0.7 : 0.25,
                    }}
                  />
                  <span className="font-mono text-[10px] transition-colors duration-200"
                    style={{ color: aktiverFilter === kat ? c.akzentFarbe : "rgba(255,255,255,0.28)" }}>
                    {anzahlProKategorie[kat]}
                  </span>
                </button>
              );
            })}
          </div>
          <span className="font-mono text-[10px] text-white/25">
            {gefilterteProjekte.length} / {PROJEKTE.length} Projekte
          </span>
        </div>
      </motion.div>

      {/* Projekt-Liste */}
      <motion.div
        key={aktiverFilter}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18 }}
        className="space-y-4"
      >
        {gefilterteProjekte.map((projekt, index) => (
          <motion.div
            key={projekt.titel}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
          >
            <ProjektKarte
              projekt={projekt}
              onBildKlick={(i) => setLightbox({ projekt, index: i })}
            />
          </motion.div>
        ))}
      </motion.div>

      <BilderLightbox
        projekt={lightbox?.projekt ?? null}
        startIndex={lightbox?.index ?? 0}
        onSchliessen={() => setLightbox(null)}
      />
    </section>
  );
}
