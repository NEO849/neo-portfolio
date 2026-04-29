import { useState } from "react";
import { motion } from "framer-motion";
import { ZEITSTRAHL } from "../models/daten";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { InfoKarte } from "../bausteine/InfoKarte";
import { AbzeichenStatus } from "../bausteine/AbzeichenStatus";
import { GlassTabs, type GlassTab } from "../bausteine/GlassTabs";

// ─── Kategorie-Konfiguration ──────────────────────────────────────

type ZeitstrahlKat = "beruf" | "bildung" | "security" | "meilenstein";

const KATEGORIE_CFG: Record<ZeitstrahlKat, {
  variante: "akzent" | "cyber" | "aktiv" | "entwicklung";
  lichtfarbe: string;
  akzentFarbe: string;
  label: string;
}> = {
  beruf:       { variante: "akzent",      lichtfarbe: "99, 102, 241",  akzentFarbe: "#6366f1", label: "Beruf"       },
  bildung:     { variante: "cyber",       lichtfarbe: "34, 211, 238",  akzentFarbe: "#22d3ee", label: "Bildung"     },
  security:    { variante: "aktiv",       lichtfarbe: "148, 163, 184", akzentFarbe: "#94a3b8", label: "Security"    },
  meilenstein: { variante: "entwicklung", lichtfarbe: "34, 197, 94",   akzentFarbe: "#22c55e", label: "Meilenstein" },
};

const FILTER_TABS: GlassTab[] = [
  { id: "alle",        label: "Alle"        },
  { id: "beruf",       label: "Beruf"       },
  { id: "bildung",     label: "Bildung"     },
  { id: "security",    label: "Security"    },
  { id: "meilenstein", label: "Meilenstein" },
];

// ─── View ─────────────────────────────────────────────────────────

export default function UeberMichView() {
  const [aktiverFilter, setAktiverFilter] = useState<string>("alle");

  const gefilterteEintraege = aktiverFilter === "alle"
    ? ZEITSTRAHL
    : ZEITSTRAHL.filter(e => e.kategorie === aktiverFilter);

  const anzahl = {
    beruf:       ZEITSTRAHL.filter(e => e.kategorie === "beruf").length,
    bildung:     ZEITSTRAHL.filter(e => e.kategorie === "bildung").length,
    security:    ZEITSTRAHL.filter(e => e.kategorie === "security").length,
    meilenstein: ZEITSTRAHL.filter(e => e.kategorie === "meilenstein").length,
  };

  return (
    <section id="ueber" className="py-16 px-6 max-w-5xl mx-auto">
      <AbschnittsTitel
        prefix="> ueber_mich"
        titel="Über mich"
        klassen="mb-10"
      />

      {/* Profil-Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="mb-4"
      >
        <InfoKarte lichtfarbe="99, 102, 241" klassen="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-[11px] text-akzent-400/55">› profil</span>
            <div className="h-px flex-1 bg-white/[0.04]" />
          </div>
          <div className="space-y-4">
            <p className="text-white/80 leading-relaxed">
              Ich arbeite strukturiert, analytisch und mit dem Anspruch, Systeme wirklich zu verstehen. Neue Themen erschließe ich mir nicht oberflächlich, sondern Schritt für Schritt – durch Recherche, Dokumentation, Tests und praktische Umsetzung. Genau so habe ich mir in den letzten Jahren ein breites technisches Fundament aufgebaut: IT-Infrastruktur, Linux- und Server-Administration, iOS-Entwicklung mit SwiftUI und MVVM, moderne Web-Anwendungen, Security Research und eigene Bug-Bounty-Pipelines.
            </p>
            <p className="text-white/70 leading-relaxed">
              Meine Stärke liegt darin, komplexe Zusammenhänge greifbar zu machen. Ich denke in Architekturen, Protokollen, Repositories, ViewModels, Services, APIs, Datenflüssen und klar getrennten Verantwortlichkeiten. Dabei ist mir wichtig, dass Anwendungen nicht nur funktionieren, sondern verständlich, wartbar, testbar und langfristig erweiterbar bleiben.
            </p>
            <p className="text-white/70 leading-relaxed">
              Aus der Arbeit in interdisziplinären Teams bringe ich Erfahrung im Umgang mit unterschiedlichen Perspektiven, Anforderungen und Kommunikationsstilen mit. Ich habe gelernt, aufmerksam zuzuhören, Verantwortung zu übernehmen und auch in anspruchsvollen Situationen klar und lösungsorientiert zu handeln. Diese Kombination aus technischer Tiefe, analytischem Denken, sauberer Struktur und Besonnenheit prägt meine Arbeitsweise.
            </p>
          </div>
        </InfoKarte>
      </motion.div>

      {/* Hobbys */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-14"
      >
        <InfoKarte lichtfarbe="34, 211, 238" mitHoverAnimation={false} klassen="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[11px] text-cyber-400/50">› außerhalb_der_technik</span>
            <div className="h-px flex-1 bg-white/[0.04]" />
          </div>
          <p className="text-white/70 leading-relaxed text-sm">
            Auch abseits der Technik ist mir Ausdauer wichtig. In den Bergen bin ich zuhause – beim Wandern, Klettern und auf Klettersteigen. Diese Erfahrungen schärfen meinen Fokus, meine Geduld und meine Fähigkeit, in anspruchsvollen Situationen ruhig und entschlossen zu handeln.
          </p>
        </InfoKarte>
      </motion.div>

      {/* Zeitstrahl Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="mb-2"
      >
        <p className="font-mono text-sm text-akzent-400/60 mb-1">› mein_weg</p>
        <h3 className="font-display text-xl font-bold text-white/85">Mein Weg</h3>
      </motion.div>

      {/* Filter-Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6 mt-4"
      >
        <GlassTabs
          tabs={FILTER_TABS}
          activeId={aktiverFilter}
          onTabChange={setAktiverFilter}
          layoutId="weg-filter"
          scrollable
          ariaLabel="Karrierestationen nach Kategorie filtern"
          buttonClassName="min-w-[80px] px-4 text-sm"
        />
        <div className="mt-2.5 flex items-center justify-between px-0.5">
          <div className="flex items-center gap-3">
            {(["beruf", "bildung", "security", "meilenstein"] as ZeitstrahlKat[]).map(kat => {
              const c = KATEGORIE_CFG[kat];
              return (
                <button
                  key={kat}
                  type="button"
                  onClick={() => setAktiverFilter(kat)}
                  className="flex items-center gap-1.5"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-opacity duration-200"
                    style={{
                      background: c.akzentFarbe,
                      opacity: aktiverFilter === kat || aktiverFilter === "alle" ? 0.7 : 0.25,
                    }}
                  />
                  <span
                    className="font-mono text-[10px] transition-colors duration-200"
                    style={{ color: aktiverFilter === kat ? c.akzentFarbe : "rgba(255,255,255,0.28)" }}
                  >
                    {anzahl[kat]}
                  </span>
                </button>
              );
            })}
          </div>
          <span className="font-mono text-[10px] text-white/25">
            {gefilterteEintraege.length} / {ZEITSTRAHL.length} Stationen
          </span>
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-akzent-500/40 via-cyber-400/20 to-transparent" />

        <motion.div
          key={aktiverFilter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
        >
          {gefilterteEintraege.map((eintrag, index) => {
            const cfg = KATEGORIE_CFG[eintrag.kategorie as ZeitstrahlKat] ?? KATEGORIE_CFG.beruf;
            return (
              <motion.div
                key={`${eintrag.kategorie}-${eintrag.jahr}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
                className="relative pl-12 md:pl-20 pb-6 last:pb-0"
              >
                {/* Timeline-Punkt */}
                <div
                  className="absolute left-[10px] md:left-[26px] top-[18px] w-3 h-3 rounded-full border-2 transition-colors duration-200"
                  style={{
                    borderColor: cfg.akzentFarbe,
                    background: `${cfg.akzentFarbe}20`,
                  }}
                />

                <InfoKarte
                  lichtfarbe={cfg.lichtfarbe}
                  akzentRand
                  akzentFarbe={cfg.akzentFarbe}
                  mitHoverAnimation={false}
                  klassen="p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <AbzeichenStatus
                      variante={cfg.variante}
                      text={cfg.label}
                      klassen="uppercase"
                    />
                    <span className="font-mono text-xs text-white/45">{eintrag.jahr}</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-white mb-1.5">
                    {eintrag.titel}
                  </h3>
                  <p className="text-sm text-white/65 leading-relaxed">
                    {eintrag.beschreibung}
                  </p>
                </InfoKarte>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
