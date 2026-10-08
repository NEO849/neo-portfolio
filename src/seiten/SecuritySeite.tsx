// ═══════════════════════════════════════════════════════
// SEITE: SecuritySeite — Route: /security
// Service-Rahmung (KI-Sicherheit, Angreifer-Blick) + darunter das
// Research-Fundament (SecurityView: Pipeline/Scoring/Tools).
// ═══════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SEITEN_EINGANG } from "../bewegung/varianten";
import { SeitenMeta } from "../bausteine/SeitenMeta";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { InfoKarte } from "../bausteine/InfoKarte";
import SecurityView from "../views/SecurityView";

const PRUEFBEREICHE: readonly { titel: string; text: string }[] = [
  { titel: "Prompt-Injection & Jailbreaks", text: "Lässt sich das System über präparierte Eingaben dazu bringen, seine Anweisungen zu ignorieren?" },
  { titel: "Datenabfluss & zu breiter Zugriff", text: "Gibt die KI Daten preis, die sie nicht hergeben darf — aus anderen Konten, internen Quellen oder der Wissensbasis?" },
  { titel: "Unautorisierte Aktionen", text: "Kann man die KI zu Aktionen bewegen (Werkzeuge, Weitergabe), die nur bestimmten Rollen erlaubt sind?" },
];

export default function SecuritySeite() {
  return (
    <>
      <SeitenMeta
        titel="KI-Sicherheit — der Blick des Angreifers"
        beschreibung="Sicherheit für KI-Systeme: Ich prüfe Chatbots, Assistenten und Agenten auf Prompt-Injection, Datenabfluss und unautorisierte Aktionen — mit dem Blick des Angreifers, bevor es ein echter Angreifer tut."
        pfad="/security"
      />
      <motion.div
        variants={SEITEN_EINGANG}
        initial="versteckt"
        animate="sichtbar"
        exit="verlassen"
        className="pt-16"
      >
        {/* Service-Rahmung */}
        <section className="py-16 px-6 max-w-5xl mx-auto">
          <AbschnittsTitel
            prefix="> ki-sicherheit"
            untertitel="Ich prüfe KI-Systeme darauf, ob man sie zur Preisgabe von Daten oder zu unerlaubten Aktionen bringen kann — mit dem Blick des Angreifers, bevor es ein echter Angreifer tut."
            klassen="mb-8"
          />

          <div className="grid gap-4 md:grid-cols-3">
            {PRUEFBEREICHE.map((p) => (
              <InfoKarte key={p.titel} lichtfarbe="79, 124, 251">
                <div className="p-5">
                  <h3 className="font-display text-base font-bold text-white mb-2">{p.titel}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{p.text}</p>
                </div>
              </InfoKarte>
            ))}
          </div>

          <div className="mt-6 rounded-2xl2 border border-white/[0.07] bg-white/[0.02] p-4 text-sm text-white/60">
            <span className="text-akzent-400">Read-only zuerst:</span> keine Änderung an Produktivsystemen ohne
            Ihre ausdrückliche Freigabe. Klarer Scope und unterschriebene Testfreigabe vor jedem Auftrag.
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/demo" className="inline-flex items-center gap-2 rounded-full border border-akzent-500/40 bg-akzent-500/10 px-5 py-2.5 font-mono text-sm text-akzent-300 transition-colors hover:border-akzent-500/70 hover:text-white">
              Angriff live sehen
            </Link>
            <Link to="/referenzen" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 font-mono text-sm text-white/70 transition-colors hover:text-white hover:border-white/25">
              Echter Fund (anonymisiert)
            </Link>
          </div>
        </section>

        {/* Research-Fundament — die Methodik dahinter als Fähigkeits-Beweis */}
        <div className="px-6 max-w-5xl mx-auto">
          <div className="border-t border-white/[0.06] pt-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
              Das Fundament dahinter — meine Research-Methodik
            </p>
          </div>
        </div>
        <SecurityView />
      </motion.div>
    </>
  );
}
