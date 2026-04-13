import { motion } from "framer-motion";
import { PERSOENLICH } from "../models/daten";

const einblend = { versteckt: { opacity: 0, y: 24 }, sichtbar: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function KontaktView() {
  return (
    <section id="kontakt" className="py-24 px-6 max-w-3xl mx-auto">
      <motion.div initial="versteckt" whileInView="sichtbar" viewport={{ once: true, margin: "-80px" }} variants={einblend}>
        <p className="font-mono text-sm text-akzent-400 mb-2">&gt; kontakt</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Kontakt</h2>
        <p className="text-white/50 mb-10">Interesse an Zusammenarbeit, Jobangeboten oder fachlichem Austausch? Ich freue mich auf deine Nachricht.</p>
      </motion.div>

      <motion.div initial="versteckt" whileInView="sichtbar" viewport={{ once: true }} variants={einblend}
        className="space-y-3">

        <a href={`mailto:${PERSOENLICH.email}`}
          className="glass-stark p-5 flex items-center gap-4 hover:bg-white/[0.08] transition-all group block">
          <div className="w-10 h-10 rounded-xl bg-akzent-500/10 border border-akzent-400/20 flex items-center justify-center text-lg flex-shrink-0">📧</div>
          <div>
            <div className="font-semibold text-white group-hover:text-akzent-400 transition">E-Mail</div>
            <div className="text-sm text-white/40 font-mono">{PERSOENLICH.email}</div>
          </div>
        </a>

        <a href={`tel:${PERSOENLICH.telefon?.replace(/\s/g, "")}`}
          className="glass-stark p-5 flex items-center gap-4 hover:bg-white/[0.08] transition-all group block">
          <div className="w-10 h-10 rounded-xl bg-signal-gruen/10 border border-signal-gruen/20 flex items-center justify-center text-lg flex-shrink-0">📱</div>
          <div>
            <div className="font-semibold text-white group-hover:text-akzent-400 transition">Telefon</div>
            <div className="text-sm text-white/40 font-mono">{PERSOENLICH.telefon}</div>
          </div>
        </a>

        <a href={PERSOENLICH.github} target="_blank" rel="noreferrer"
          className="glass-stark p-5 flex items-center gap-4 hover:bg-white/[0.08] transition-all group block">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          </div>
          <div>
            <div className="font-semibold text-white group-hover:text-akzent-400 transition">GitHub</div>
            <div className="text-sm text-white/40 font-mono">NEO849</div>
          </div>
        </a>

        <a href={PERSOENLICH.hackerone} target="_blank" rel="noreferrer"
          className="glass-stark p-5 flex items-center gap-4 hover:bg-white/[0.08] transition-all group block">
          <div className="w-10 h-10 rounded-xl bg-signal-rot/10 border border-signal-rot/20 flex items-center justify-center text-lg flex-shrink-0">🐛</div>
          <div>
            <div className="font-semibold text-white group-hover:text-akzent-400 transition">HackerOne</div>
            <div className="text-sm text-white/40 font-mono">luicypher_neo</div>
          </div>
        </a>

        <a href={PERSOENLICH.intigriti} target="_blank" rel="noreferrer"
          className="glass-stark p-5 flex items-center gap-4 hover:bg-white/[0.08] transition-all group block">
          <div className="w-10 h-10 rounded-xl bg-cyber-400/10 border border-cyber-400/20 flex items-center justify-center text-lg flex-shrink-0">🔍</div>
          <div>
            <div className="font-semibold text-white group-hover:text-akzent-400 transition">Intigriti</div>
            <div className="text-sm text-white/40 font-mono">cypherneo</div>
          </div>
        </a>
      </motion.div>

      {/* Downloads */}
      <motion.div initial="versteckt" whileInView="sichtbar" viewport={{ once: true }} variants={einblend}
        className="mt-8 flex flex-wrap gap-3">
        <a href="/Michael_Fleps_Lebenslauf.pdf" target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}
          className="px-5 py-2.5 rounded-xl bg-akzent-500/15 border border-akzent-400/25 text-akzent-400 text-sm font-semibold hover:bg-akzent-500/25 transition-all inline-block">
          Lebenslauf (PDF)
        </a>
        <a href="/Michael_Fleps_Anschreiben.pdf" target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}
          className="px-5 py-2.5 rounded-xl glass text-white/50 text-sm font-semibold hover:text-white/80 transition-all inline-block">
          Anschreiben (PDF)
        </a>
      </motion.div>

      <motion.div initial="versteckt" whileInView="sichtbar" viewport={{ once: true }} variants={einblend}
        className="mt-8 text-center">
        <p className="text-xs text-white/20 font-mono">{PERSOENLICH.adresse} • {PERSOENLICH.standort}</p>
      </motion.div>
    </section>
  );
}
