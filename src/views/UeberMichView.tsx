import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ZEITSTRAHL } from "../models/daten";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { GlanzUeberschrift } from "../bewegung/GlanzUeberschrift";
import { InfoKarte } from "../bausteine/InfoKarte";
import { TechTag } from "../bausteine/AbzeichenStatus";
import { AusklappKarte } from "../bausteine/AusklappKarte";
import { STATISCHE_TEXTKARTE } from "../bewegung/varianten";

// ─── Kategorie-Konfiguration ──────────────────────────────────────

type ZeitstrahlKat = "beruf" | "teamarbeit" | "infrastruktur" | "bildung" | "entwicklung" | "security" | "eigenbau";

const KATEGORIE_CFG: Record<ZeitstrahlKat, {
  lichtfarbe: string;
  akzentFarbe: string;
  label: string;
}> = {
  beruf:         { lichtfarbe: "79, 124, 251",  akzentFarbe: "#7aa2ff", label: "Beruf"         },
  teamarbeit:    { lichtfarbe: "167, 139, 250", akzentFarbe: "#a78bfa", label: "Praxis"        },
  infrastruktur: { lichtfarbe: "56, 189, 248",  akzentFarbe: "#38bdf8", label: "Infrastruktur" },
  bildung:       { lichtfarbe: "138, 160, 200",  akzentFarbe: "#8aa0c8", label: "Bildung"       },
  entwicklung:   { lichtfarbe: "52, 211, 153",  akzentFarbe: "#34d399", label: "Entwicklung"   },
  security:      { lichtfarbe: "148, 163, 184", akzentFarbe: "#94a3b8", label: "Security"      },
  eigenbau:      { lichtfarbe: "251, 146, 60",  akzentFarbe: "#fb923c", label: "Eigenbau"      },
};

// ─── View ─────────────────────────────────────────────────────────

export default function UeberMichView() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [offenerIndex, setOffenerIndex] = useState<number | null>(null);
  const entryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prefersReducedMotion = useReducedMotion() === true;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = entryRefs.current.findIndex(r => r === entry.target);
            if (idx >= 0) setActiveIdx(idx);
          }
        });
      },
      { rootMargin: "-35% 0px -35% 0px", threshold: 0 },
    );
    const els = entryRefs.current;
    els.forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <section id="ueber" className="py-16 px-6 max-w-5xl mx-auto">
      <AbschnittsTitel
        prefix="> ueber_mich"
        klassen="mb-7"
      />

      {/* Lead-Statement mit Shine-Effekt — die Positionierung in einem Satz,
          gleicher hochwertiger Effekt wie die Überschriften der anderen Views. */}
      <motion.div
        variants={STATISCHE_TEXTKARTE}
        initial="versteckt"
        whileInView="sichtbar"
        viewport={{ once: true, margin: "-40px" }}
        className="mb-9 max-w-3xl"
      >
        <GlanzUeberschrift
          element="h3"
          dauerSekunden={6.5}
          klassen="font-display font-semibold text-xl md:text-[26px] leading-snug tracking-[-0.01em]"
          kinder="Eine seltene Kombination: über 15 Jahre IT-Systeme aufgebaut — heute entwickle ich die Software für die Hardware. Das gibt mir einen besonderen Blick fürs große Ganze."
        />
      </motion.div>

      {/* Profil-Text */}
      <motion.div
        variants={STATISCHE_TEXTKARTE}
        initial="versteckt"
        whileInView="sichtbar"
        viewport={{ once: true, margin: "-40px" }}
        className="mb-4"
      >
        <InfoKarte lichtfarbe="79, 124, 251" klassen="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-[11px] text-akzent-400/55">› profil</span>
            <div className="h-px flex-1 bg-white/[0.04]" />
          </div>
          <div className="space-y-4">
            <p className="text-white/80 leading-relaxed">
              Ich arbeite strukturiert, analytisch und mit dem Anspruch, Systeme wirklich zu verstehen. Neue Themen erschließe ich mir nicht oberflächlich, sondern Schritt für Schritt – durch Recherche, Dokumentation, Tests und praktische Umsetzung. Genau so habe ich mir in den letzten Jahren ein breites technisches Fundament aufgebaut: IT-Infrastruktur, Linux- und Server-Administration, iOS-Entwicklung mit SwiftUI und MVVM, moderne Web-Anwendungen, Security Research und eigene Research-Pipelines.
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
        variants={STATISCHE_TEXTKARTE}
        initial="versteckt"
        whileInView="sichtbar"
        viewport={{ once: true, margin: "-40px" }}
        transition={{ delay: 0.1 }}
        className="mb-14"
      >
        <InfoKarte lichtfarbe="138, 160, 200" mitHoverAnimation={false} klassen="p-5">
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
        className="mb-6"
      >
        <h3 className="flex items-center gap-2.5">
          <span className="h-px w-7 bg-gradient-to-r from-akzent-500/0 via-akzent-500/80 to-akzent-500/0" />
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-akzent-400/90">Mein Weg</span>
        </h3>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertikale Linie */}
        <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-akzent-500/35 via-cyber-400/15 to-transparent" />

        <div>
          {ZEITSTRAHL.map((eintrag, index) => {
            const cfg = KATEGORIE_CFG[eintrag.kategorie as ZeitstrahlKat] ?? KATEGORIE_CFG.beruf;
            const isActive = activeIdx === index;
            const offen = offenerIndex === index;
            return (
              <motion.div
                key={index}
                ref={(el) => { entryRefs.current[index] = el; }}
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.42, ease: "easeOut" }}
                className="relative pl-12 md:pl-20 pb-6 last:pb-0"
              >
                {/* Dot-Container */}
                <div className="absolute left-[10px] md:left-[26px] top-[18px] w-3 h-3">
                  {/* Entrance-Sonar: einmaliger Ping beim ersten Viewport-Eintritt */}
                  <motion.div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      top: "-5px", right: "-5px", bottom: "-5px", left: "-5px",
                      border: `1px solid ${cfg.akzentFarbe}`,
                    }}
                    initial={{ scale: 0.7, opacity: 0.8 }}
                    whileInView={{ scale: 2.8, opacity: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.95, delay: 0.12, ease: "easeOut" }}
                  />
                  {/* Aktiver Dauer-Ring: läuft solange die Card aktiv ist */}
                  <motion.div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      top: "-5px", right: "-5px", bottom: "-5px", left: "-5px",
                      border: `1px solid ${cfg.akzentFarbe}`,
                    }}
                    animate={isActive && !prefersReducedMotion
                      ? { scale: [1, 2.3], opacity: [0.58, 0] }
                      : { scale: 1, opacity: 0 }}
                    transition={isActive && !prefersReducedMotion
                      ? { duration: 2.2, repeat: Infinity, ease: "easeOut", repeatDelay: 0.55 }
                      : { duration: 0.4, ease: "easeOut" }}
                  />
                  {/* Dot: atmet wenn aktiv */}
                  <motion.div
                    className="relative w-3 h-3 rounded-full border-2"
                    style={{ borderColor: cfg.akzentFarbe, backgroundColor: `${cfg.akzentFarbe}18` }}
                    animate={isActive && !prefersReducedMotion
                      ? {
                          scale: [1, 1.15, 1],
                          backgroundColor: [`${cfg.akzentFarbe}18`, `${cfg.akzentFarbe}44`, `${cfg.akzentFarbe}18`],
                        }
                      : { scale: 1, backgroundColor: `${cfg.akzentFarbe}18` }}
                    transition={isActive && !prefersReducedMotion
                      ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.35 }}
                  />
                </div>

                <AusklappKarte
                  lichtfarbe={cfg.lichtfarbe}
                  akzentFarbe={cfg.akzentFarbe}
                  offen={offen}
                  onUmschalten={() => setOffenerIndex(offen ? null : index)}
                  stil={{
                    backgroundImage: `linear-gradient(135deg, rgba(${cfg.lichtfarbe}, 0.038) 0%, transparent 55%)`,
                  }}
                  kopf={
                    <>
                      <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                        <span
                          className="inline-flex items-center px-2 py-[3px] rounded-full text-[10px] font-mono font-semibold tracking-[0.13em] uppercase border"
                          style={{
                            borderColor: `${cfg.akzentFarbe}30`,
                            color: cfg.akzentFarbe,
                            backgroundColor: `${cfg.akzentFarbe}10`,
                          }}
                        >
                          {cfg.label}
                        </span>
                        <span className="font-mono text-[11px] text-white/35">{eintrag.jahr}</span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-white leading-snug">
                        {eintrag.titel}
                      </h3>
                      <p className="text-sm text-white/60 leading-relaxed mt-2">
                        {eintrag.beschreibung}
                      </p>
                    </>
                  }
                  detail={
                    <>
                      <p
                        className="font-mono text-[11px] tracking-widest uppercase mb-2.5"
                        style={{ color: `${cfg.akzentFarbe}99` }}
                      >
                        {eintrag.modulTitel ?? "Schwerpunkte"}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                        {(eintrag.module ?? []).map((mod) => (
                          <div
                            key={mod.name}
                            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5"
                          >
                            <p className="font-mono text-[10px] font-semibold mb-1.5 text-white/45 tracking-wide">
                              {mod.name}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {mod.skills.map((skill) => (
                                <TechTag key={skill} name={skill} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  }
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
