import { motion } from "framer-motion";
import { ZEITSTRAHL } from "../models/daten";

const einblend = {
  versteckt: { opacity: 0, y: 24 },
  sichtbar: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const kategorieStile: Record<string, { farbe: string; label: string }> = {
  beruf:       { farbe: "#6366f1", label: "Beruf" },
  bildung:     { farbe: "#22d3ee", label: "Bildung" },
  security:    { farbe: "#ef4444", label: "Security" },
  meilenstein: { farbe: "#22c55e", label: "Meilenstein" },
};

export default function UeberMichView() {
  return (
    <section id="ueber" className="py-24 px-6 max-w-5xl mx-auto">
      <motion.div initial="versteckt" whileInView="sichtbar" viewport={{ once: true, margin: "-80px" }} variants={einblend}>
        <p className="font-mono text-sm text-akzent-400 mb-2">&gt; ueber_mich</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">Über mich</h2>
      </motion.div>

      {/* Persönlicher Text */}
      <motion.div initial="versteckt" whileInView="sichtbar" viewport={{ once: true }} variants={einblend}
        className="glass-stark p-6 md:p-8 mb-8 space-y-4">
        <p className="text-white/70 leading-relaxed">
          Ich bin ein Mensch, der sich gerne weiterentwickelt, Verantwortung übernimmt und Dinge wirklich verstehen will. Mein Weg begann in der Technik, hat sich aber über die Jahre immer weiter in Richtung IT, Softwareentwicklung und moderne digitale Themen entwickelt. Dabei hilft mir mein praktischer Hintergrund sehr: Ich kenne nicht nur Theorie, sondern auch echte technische Arbeit, Fehlersuche, sauberes Vorgehen und den Anspruch, Probleme wirklich zu lösen.
        </p>
        <p className="text-white/60 leading-relaxed">
          Ich arbeite strukturiert, denke analytisch und habe Freude daran, mich in neue Themen tief einzuarbeiten. Wenn mich etwas interessiert, bleibe ich dran. Genau so habe ich mir in den letzten Jahren vieles im Bereich IT, App-Entwicklung, Linux, Server und technische Analyse aufgebaut. Ich mag es, Systeme zu verstehen, Zusammenhänge zu erkennen und Lösungen Schritt für Schritt sauber zu entwickeln.
        </p>
        <p className="text-white/60 leading-relaxed">
          Gleichzeitig ist mir der menschliche Aspekt sehr wichtig. Durch meine Zeit in der Fachklinik und die Zusammenarbeit mit unterschiedlichen Menschen habe ich gelernt, aufmerksam zuzuhören, ruhig zu bleiben und auch in anspruchsvollen Situationen verantwortungsvoll zu handeln. Ich denke, dass genau diese Mischung aus Technik, Ruhe, Einfühlungsvermögen und Lernbereitschaft mich gut beschreibt.
        </p>
      </motion.div>

      {/* Persönliches – kompakt */}
      <motion.div initial="versteckt" whileInView="sichtbar" viewport={{ once: true }} variants={einblend}
        className="glass p-5 mb-12">
        <p className="text-white/50 leading-relaxed text-sm">
          Auch privat spielen Verantwortung, Natur und Ausdauer eine große Rolle. Die freiwillige Feuerwehr bedeutet für mich Gemeinschaft, Verlässlichkeit und Einsatz für andere. In den Bergen bin ich zuhause – beim Wandern, Klettern und auf Klettersteigen. Touren in der Natur geben mir Kraft, Fokus und Motivation. Ich mag Herausforderungen, aber ich gehe sie bewusst und mit Respekt an.
        </p>
      </motion.div>

      {/* Zeitstrahl */}
      <motion.div initial="versteckt" whileInView="sichtbar" viewport={{ once: true }} variants={einblend}>
        <h3 className="font-display text-xl font-bold mb-6 text-white/80">Mein Weg</h3>
      </motion.div>

      <div className="relative">
        <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-akzent-500/50 via-cyber-400/30 to-transparent" />

        {ZEITSTRAHL.map((eintrag, index) => {
          const stil = kategorieStile[eintrag.kategorie] || kategorieStile.beruf;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="relative pl-12 md:pl-20 pb-10 last:pb-0"
            >
              <div className="absolute left-2.5 md:left-6.5 top-1 w-3 h-3 rounded-full border-2" style={{ borderColor: stil.farbe, background: `${stil.farbe}33` }} />
              <div className="glass p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: `${stil.farbe}15`, color: stil.farbe }}>{stil.label}</span>
                  <span className="font-mono text-xs text-white/30">{eintrag.jahr}</span>
                </div>
                <h3 className="font-display text-base font-bold text-white mb-1">{eintrag.titel}</h3>
                <p className="text-sm text-white/50">{eintrag.beschreibung}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
