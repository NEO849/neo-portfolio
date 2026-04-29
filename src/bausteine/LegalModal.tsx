import { useState, useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type LegalTab = "impressum" | "datenschutz";

interface LegalModalProps {
  offen: boolean;
  startTab?: LegalTab;
  onSchliessen: () => void;
}

// ─── Bau-Blöcke ─────────────────────────────────────────────

function Abschnitt({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-cyber-400/55 text-[10px] uppercase tracking-widest font-mono mb-2 pb-1.5 border-b border-white/[0.05]">
        {titel}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Zeile({
  label,
  wert,
  link,
  platzhalter = false,
}: {
  label: string;
  wert: string;
  link?: string;
  platzhalter?: boolean;
}) {
  const wertKlasse = platzhalter
    ? "text-signal-gelb/65 italic"
    : "text-white/65 break-all";
  return (
    <div className="flex gap-3 text-xs font-mono">
      <span className="text-white/30 w-28 flex-shrink-0 leading-relaxed">{label}</span>
      {link ? (
        <a href={link} className="text-white/65 hover:text-cyber-400/85 transition break-all leading-relaxed">
          {wert}
        </a>
      ) : (
        <span className={`${wertKlasse} leading-relaxed`}>{wert}</span>
      )}
    </div>
  );
}

function Absatz({ children }: { children: ReactNode }) {
  return <p className="text-xs text-white/55 leading-relaxed font-mono">{children}</p>;
}

// ─── Impressum ───────────────────────────────────────────────

function ImpressumInhalt() {
  return (
    <div className="space-y-6">
      <Abschnitt titel="Angaben gemäß § 5 DDG">
        <Zeile label="Name" wert="Michael Fleps" />
        <Zeile label="Unternehmen" wert="FREE DATA solution's" />
      </Abschnitt>

      <Abschnitt titel="Ladungsfähige Anschrift">
        <Zeile label="Straße" wert="Adam-Klein-Str. 15" />
        <Zeile label="Ort" wert="90429 Nürnberg" />
        <Zeile label="Land" wert="Deutschland" />
      </Abschnitt>

      <Abschnitt titel="Kontakt">
        <Zeile label="E-Mail" wert="michael_fleps@aol.com" link="mailto:michael_fleps@aol.com" />
        <Zeile label="Telefon" wert="+49 15678 309580" link="tel:+4915678309580" />
      </Abschnitt>

      <Abschnitt titel="Steuerliche Angaben">
        <Zeile label="USt-IdNr." wert="DE459129384" />
      </Abschnitt>

      <Abschnitt titel="Unterstützung / Zahlungen">
        <Zeile label="Bitcoin (BTC)" wert="bc1qf666x5l4zs6tm9w69jsr9mn5glvf97fk9z6zs8" />
      </Abschnitt>

      <Abschnitt titel="Verantwortlich für den Inhalt (§ 18 Abs. 2 MStV)">
        <Absatz>Michael Fleps, Adam-Klein-Str. 15, 90429 Nürnberg</Absatz>
      </Abschnitt>

      <Abschnitt titel="Haftungshinweis">
        <Absatz>
          Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für Richtigkeit,
          Vollständigkeit und Aktualität wird keine Gewähr übernommen. Als Diensteanbieter bin ich
          gemäß § 7 Abs. 1 DDG für eigene Inhalte nach den allgemeinen Gesetzen verantwortlich.
        </Absatz>
        <p className="text-xs text-white/55 leading-relaxed font-mono mt-2">
          Für externe Links gilt: Zum Zeitpunkt der Verlinkung lagen keine rechtswidrigen Inhalte vor.
          Eine permanente Inhaltskontrolle verlinkter Seiten ist ohne konkreten Anhaltspunkt nicht
          zumutbar. Bei Bekanntwerden von Rechtsverstößen werden entsprechende Links entfernt.
        </p>
      </Abschnitt>
    </div>
  );
}

// ─── Datenschutz ─────────────────────────────────────────────

function DatenschutzInhalt() {
  return (
    <div className="space-y-6">
      <Abschnitt titel="Hosting — Vercel Inc.">
        <Absatz>
          Diese Website wird bei Vercel Inc. (340 Pine Street, Suite 900, San Francisco, CA 94104, USA)
          gehostet und weltweit über deren CDN ausgeliefert. Beim Seitenaufruf übermittelt Ihr Browser
          technisch notwendige Verbindungsdaten (IP-Adresse, Browser-Typ, Datum/Uhrzeit). Diese werden
          ausschließlich zur Bereitstellung des Dienstes verarbeitet.
        </Absatz>
        <p className="text-xs text-white/55 leading-relaxed font-mono mt-2">
          Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am sicheren Betrieb).
          EU-Datenübermittlungen erfolgen auf Basis der EU-Standardvertragsklauseln.
        </p>
      </Abschnitt>

      <Abschnitt titel="OSINT-Tool — Live API (VPS)">
        <Absatz>
          Das OSINT-Toolkit übermittelt vom Nutzer eingegebene Daten (E-Mail-Adressen, Benutzernamen,
          Domains, Telefonnummern, Bild-URLs) zur Analyse an eine FastAPI-Instanz auf einem VPS der
          Contabo GmbH (Aschauer Str. 32a, 81549 München, Deutschland).
        </Absatz>
        <p className="text-xs text-white/55 leading-relaxed font-mono mt-2">
          Die Verarbeitung findet ausschließlich im Arbeitsspeicher statt. Eine dauerhafte Speicherung
          der eingegebenen Daten erfolgt nicht. Standardmäßige Zugriffslogdaten (IP, Zeitstempel) können
          entsprechend den Contabo-Aufbewahrungsfristen temporär protokolliert werden.
        </p>
        <p className="text-xs text-white/55 leading-relaxed font-mono mt-2">
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO. Für datenschutzsensible Module (Telefon,
          Reverse Image) ist eine explizite Einwilligung vor Nutzung erforderlich.
        </p>
      </Abschnitt>

      <Abschnitt titel="Cookies & Tracking">
        <Absatz>
          Diese Website setzt keine eigenen Cookies. Es werden keine Analyse-, Tracking- oder
          Marketing-Tools eingesetzt. Ein Profiling der Besucher findet nicht statt.
        </Absatz>
      </Abschnitt>

      <Abschnitt titel="Kontaktaufnahme">
        <Absatz>
          Bei Kontaktaufnahme per E-Mail oder Telefon werden die übermittelten Daten ausschließlich zur
          Bearbeitung der Anfrage genutzt und nicht an Dritte weitergegeben. Rechtsgrundlage:
          Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Kommunikation).
        </Absatz>
      </Abschnitt>

      <Abschnitt titel="Externe Verlinkungen">
        <Absatz>
          Die Website enthält Links zu externen Plattformen (GitHub). Eine Datenübermittlung
          an diese Dienste erfolgt ausschließlich durch aktives Anklicken. Es gelten die
          jeweiligen Datenschutzrichtlinien der Betreiber.
        </Absatz>
      </Abschnitt>

      <Abschnitt titel="Ihre Rechte (Art. 15 – 21 DSGVO)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
          {[
            ["Art. 15", "Auskunft"],
            ["Art. 16", "Berichtigung"],
            ["Art. 17", "Löschung"],
            ["Art. 18", "Einschränkung"],
            ["Art. 20", "Datenübertragbarkeit"],
            ["Art. 21", "Widerspruch"],
          ].map(([art, recht]) => (
            <div key={art} className="flex gap-3 text-xs font-mono">
              <span className="text-white/30 w-14 flex-shrink-0">{art}</span>
              <span className="text-white/60">{recht}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/55 leading-relaxed font-mono mt-3">
          Anfragen richten Sie an:{" "}
          <a
            href="mailto:michael_fleps@aol.com"
            className="text-cyber-400/70 hover:text-cyber-400 transition"
          >
            michael_fleps@aol.com
          </a>
        </p>
      </Abschnitt>

      <Abschnitt titel="Zuständige Aufsichtsbehörde">
        <div className="text-xs text-white/55 font-mono leading-relaxed space-y-0.5">
          <p>Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)</p>
          <p>Promenade 18 · 91522 Ansbach</p>
          <a
            href="https://www.lda.bayern.de"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyber-400/65 hover:text-cyber-400 transition"
          >
            lda.bayern.de
          </a>
        </div>
      </Abschnitt>

      <Abschnitt titel="Aktualität dieser Erklärung">
        <Absatz>
          Stand: April 2026. Diese Datenschutzerklärung wird bei wesentlichen Änderungen der
          Datenverarbeitung oder der rechtlichen Anforderungen aktualisiert.
        </Absatz>
      </Abschnitt>
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────

export function LegalModal({ offen, startTab = "impressum", onSchliessen }: LegalModalProps) {
  const [aktiv, setAktiv] = useState<LegalTab>(startTab);
  const warOffen = useRef(false);

  // Tab nur beim Öffnen (false → true) zurücksetzen, nicht bei jedem Re-Render
  useEffect(() => {
    if (offen && !warOffen.current) {
      setAktiv(startTab);
    }
    warOffen.current = offen;
  }, [offen, startTab]);

  // ESC-Taste schließt Modal
  useEffect(() => {
    if (!offen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onSchliessen(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [offen, onSchliessen]);

  const TABS: { id: LegalTab; label: string }[] = [
    { id: "impressum",   label: "Impressum"    },
    { id: "datenschutz", label: "Datenschutz"  },
  ];

  return (
    <AnimatePresence>
      {offen && (
        <>
          {/* Overlay */}
          <motion.div
            key="legal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/72 backdrop-blur-sm z-50"
            onClick={onSchliessen}
          />

          {/* Panel */}
          <motion.div
            key="legal-modal"
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#09090f] shadow-[0_32px_80px_rgba(0,0,0,0.85)] flex flex-col max-h-[88vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 pt-5 pb-4 flex items-center gap-3 flex-shrink-0">
                <div className="w-8 h-8 rounded-xl bg-cyber-400/[0.08] border border-cyber-400/20 flex items-center justify-center flex-shrink-0 font-mono text-sm text-cyber-400/70">
                  §
                </div>
                <h3 className="font-display text-sm font-bold text-white flex-1">Rechtliches</h3>
                <button
                  onClick={onSchliessen}
                  aria-label="Schließen"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-akzent-400/55 hover:text-akzent-400 hover:bg-akzent-400/[0.08] transition font-mono text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="px-6 pb-3 flex gap-1.5 flex-shrink-0">
                {TABS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAktiv(id)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 ${
                      aktiv === id
                        ? "bg-cyber-400/[0.1] border border-cyber-400/25 text-cyber-400"
                        : "text-white/38 hover:text-white/60 hover:bg-white/[0.04]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="border-t border-white/[0.05] flex-shrink-0" />

              {/* Scrollbarer Inhalt */}
              <div className="overflow-y-auto px-6 py-5 flex-1">
                <AnimatePresence mode="wait">
                  {aktiv === "impressum" ? (
                    <motion.div
                      key="impressum"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                    >
                      <ImpressumInhalt />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="datenschutz"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                    >
                      <DatenschutzInhalt />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="border-t border-white/[0.05] px-6 py-4 flex-shrink-0 flex justify-end">
                <button
                  onClick={onSchliessen}
                  className="px-5 py-2 rounded-xl text-xs font-mono bg-akzent-500/[0.08] border border-akzent-400/20 text-akzent-400/65 hover:text-akzent-400 hover:bg-akzent-500/[0.15] transition"
                >
                  Schließen
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
