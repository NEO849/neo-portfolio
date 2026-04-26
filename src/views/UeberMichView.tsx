import { motion } from "framer-motion";
import { ZEITSTRAHL } from "../models/daten";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { InfoKarte } from "../bausteine/InfoKarte";
import { AbzeichenStatus } from "../bausteine/AbzeichenStatus";

const KATEGORIE_KONFIGURATION: Record<string, {
  variante: "akzent" | "cyber" | "aktiv" | "entwicklung";
  lichtfarbe: string;
  akzentFarbe: string;
}> = {
  beruf:       { variante: "akzent",     lichtfarbe: "99, 102, 241",  akzentFarbe: "#6366f1" },
  bildung:     { variante: "cyber",      lichtfarbe: "34, 211, 238",  akzentFarbe: "#22d3ee" },
  security:    { variante: "aktiv",      lichtfarbe: "249, 115, 22",  akzentFarbe: "#f97316" },
  meilenstein: { variante: "entwicklung",lichtfarbe: "34, 197, 94",   akzentFarbe: "#22c55e" },
};

export default function UeberMichView() {
  return (
    <section id="ueber" className="py-16 px-6 max-w-5xl mx-auto">
      <AbschnittsTitel
        prefix="> ueber_mich"
        titel="Über mich"
        klassen="mb-10"
      />

      {/* Persönlicher Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="mb-4"
      >
        <InfoKarte lichtfarbe="99, 102, 241" klassen="p-6 md:p-8">
          <div className="space-y-4">
            <p className="text-white/80 leading-relaxed">
              Ich arbeite strukturiert, analytisch und mit dem Anspruch, Systeme wirklich zu verstehen. Neue Themen erschließe ich mir nicht oberflächlich, sondern Schritt für Schritt – durch Recherche, Dokumentation, Tests und praktische Umsetzung. Genau so habe ich mir in den letzten Jahren ein breites technisches Fundament aufgebaut: IT-Infrastruktur, Linux- und Server-Administration, iOS-Entwicklung mit SwiftUI und MVVM, moderne Web-Anwendungen, Security Research und eigene Bug-Bounty-Pipelines.
            </p>
            <p className="text-white/75 leading-relaxed">
              Meine Stärke liegt darin, komplexe Zusammenhänge greifbar zu machen. Ich denke in Architekturen, Protokollen, Repositories, ViewModels, Services, APIs, Datenflüssen und klar getrennten Verantwortlichkeiten. Dabei ist mir wichtig, dass Anwendungen nicht nur funktionieren, sondern verständlich, wartbar, testbar und langfristig erweiterbar bleiben.
            </p>
            <p className="text-white/75 leading-relaxed">
              Aus der Arbeit in interdisziplinären Teams bringe ich Erfahrung im Umgang mit unterschiedlichen Perspektiven, Anforderungen und Kommunikationsstilen mit. Ich habe gelernt, aufmerksam zuzuhören, Verantwortung zu übernehmen und auch in anspruchsvollen Situationen klar und lösungsorientiert zu handeln. Diese Kombination aus technischer Tiefe, analytischem Denken, sauberer Struktur und Besonnenheit prägt meine Arbeitsweise.
            </p>
          </div>
        </InfoKarte>
      </motion.div>

      {/* Persönliches – kompakt */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-14"
      >
        <InfoKarte lichtfarbe="34, 211, 238" mitHoverAnimation={false} klassen="p-5">
          <p className="text-white/70 leading-relaxed text-sm">
            Auch abseits der Technik ist mir Ausdauer wichtig. In den Bergen bin ich zuhause – beim Wandern, Klettern und auf Klettersteigen. Diese Erfahrungen schärfen meinen Fokus, meine Geduld und meine Fähigkeit, in anspruchsvollen Situationen ruhig und entschlossen zu handeln.
          </p>
        </InfoKarte>
      </motion.div>

      {/* Zeitstrahl */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h3 className="font-display text-xl font-bold text-white/80">Mein Weg</h3>
      </motion.div>

      <div className="relative">
        <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-akzent-500/50 via-cyber-400/30 to-transparent" />

        {ZEITSTRAHL.map((eintrag, index) => {
          const konfiguration = KATEGORIE_KONFIGURATION[eintrag.kategorie] ?? KATEGORIE_KONFIGURATION.beruf;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07, duration: 0.4 }}
              className="relative pl-12 md:pl-20 pb-8 last:pb-0"
            >
              <div
                className="absolute left-2.5 md:left-6.5 top-1.5 w-3 h-3 rounded-full border-2"
                style={{ borderColor: konfiguration.akzentFarbe, background: `${konfiguration.akzentFarbe}22` }}
              />
              <InfoKarte
                lichtfarbe={konfiguration.lichtfarbe}
                akzentRand
                akzentFarbe={konfiguration.akzentFarbe}
                mitHoverAnimation={false}
                klassen="p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <AbzeichenStatus variante={konfiguration.variante} text={eintrag.kategorie} klassen="uppercase" />
                  <span className="font-mono text-xs text-white/55">{eintrag.jahr}</span>
                </div>
                <h3 className="font-display text-base font-bold text-white mb-1">{eintrag.titel}</h3>
                <p className="text-sm text-white/70">{eintrag.beschreibung}</p>
              </InfoKarte>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
