import { useState } from "react";
import { motion } from "framer-motion";
import { PERSOENLICH } from "../models/daten";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { InfoKarte } from "../bausteine/InfoKarte";
import { Knopf } from "../bausteine/Knopf";
import { LegalModal, type LegalTab } from "../bausteine/LegalModal";
import { STATISCHE_TEXTKARTE } from "../bewegung/varianten";

const CYBER_RGB = "22, 211, 238";
const CYBER_HEX = "#8aa0c8";

interface KontaktEintrag {
  href: string;
  extern: boolean;
  download?: string;
  icon: string;
  label: string;
  wert: string;
}

const KONTAKT_EINTRAEGE: KontaktEintrag[] = [
  {
    href: `mailto:${PERSOENLICH.email}`,
    extern: false,
    icon: "📧",
    label: "E-Mail",
    wert: PERSOENLICH.email,
  },
  {
    href: `tel:${PERSOENLICH.telefon?.replace(/\s/g, "")}`,
    extern: false,
    icon: "📱",
    label: "Telefon",
    wert: PERSOENLICH.telefon,
  },
  {
    href: PERSOENLICH.github,
    extern: true,
    icon: "⌥",
    label: "GitHub",
    wert: "NEO849",
  },
];

// ─── iOS-Keyboard: fokussiertes Feld weich scrollen ──────────────
// Delay 320 ms: iOS-Tastaturanimation abwarten, dann erst scrollen
function scrollZuFeld(el: HTMLElement) {
  setTimeout(() => {
    el.scrollIntoView({ block: "start", behavior: "smooth" });
  }, 320);
}

// ─── Formular-Typen ──────────────────────────────────────────────

type FormFelder = {
  name:      string;
  email:     string;
  telefon:   string;
  nachricht: string;
};

type FormFehler = Partial<Record<keyof FormFelder, string>>;

const FORM_LEER: FormFelder = { name: "", email: "", telefon: "", nachricht: "" };

// ─── Eingabe-Feld ────────────────────────────────────────────────

function EingabeFeld({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  fehler,
  autoComplete,
}: {
  label:         string;
  name:          string;
  type?:         string;
  value:         string;
  onChange:      (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?:  string;
  fehler?:       string;
  autoComplete?: string;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={`kf-${name}`}
        className="block text-[10px] font-mono text-white/70 uppercase tracking-widest mb-1.5"
      >
        {label}
      </label>
      <input
        id={`kf-${name}`}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onFocus={(e) => scrollZuFeld(e.currentTarget)}
        className={`formular-eingabe font-mono text-base sm:text-sm py-2 ${fehler ? "fehler" : ""}`}
      />
      {fehler && (
        <p className="mt-1 text-[10px] font-mono text-signal-rot/75 leading-relaxed">
          {fehler}
        </p>
      )}
    </div>
  );
}

// ─── Kontakt-Formular ────────────────────────────────────────────

function KontaktFormular() {
  const [felder,      setFelder]      = useState<FormFelder>(FORM_LEER);
  const [fehler,      setFehler]      = useState<FormFehler>({});
  const [sendet,      setSendet]      = useState(false);
  const [erfolg,      setErfolg]      = useState(false);
  const [serverFehler, setServerFehler] = useState<string | null>(null);
  const [honigTopf,   setHonigTopf]   = useState(""); // Anti-Spam

  function felderAendern(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFelder((f) => ({ ...f, [name]: value }));
    if (fehler[name as keyof FormFelder]) {
      setFehler((f) => ({ ...f, [name]: undefined }));
    }
    if (serverFehler) setServerFehler(null);
  }

  function validieren(): FormFehler {
    const neu: FormFehler = {};
    if (!felder.name.trim()) {
      neu.name = "Name ist erforderlich.";
    }
    if (!felder.email.trim()) {
      neu.email = "E-Mail ist erforderlich.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(felder.email.trim())) {
      neu.email = "Bitte eine gültige E-Mail-Adresse eingeben.";
    }
    if (!felder.nachricht.trim()) {
      neu.nachricht = "Bitte hinterlasse eine Nachricht.";
    } else if (felder.nachricht.trim().length < 10) {
      neu.nachricht = "Nachricht ist zu kurz (mind. 10 Zeichen).";
    }
    return neu;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Honeypot: Bot füllt verstecktes Feld → stille Weiterleitung ohne echten Versand
    if (honigTopf) {
      setErfolg(true);
      return;
    }

    const validierungsFehler = validieren();
    if (Object.keys(validierungsFehler).length > 0) {
      setFehler(validierungsFehler);
      return;
    }

    setSendet(true);
    setServerFehler(null);

    try {
      const antwort = await fetch("/api/kontakt", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:      felder.name.trim(),
          email:     felder.email.trim(),
          telefon:   felder.telefon.trim() || undefined,
          nachricht: felder.nachricht.trim(),
        }),
      });

      // JSON separat parsen — nicht-JSON-Antworten (HTML-Fehlerseiten) dürfen
      // den eigentlichen HTTP-Status-Check nicht blockieren
      let daten: { erfolg?: boolean; fehler?: string } = {};
      try { daten = await antwort.json(); } catch { /* non-JSON body */ }

      if (!antwort.ok) {
        setServerFehler(daten.fehler ?? "Fehler beim Senden. Bitte versuche es erneut.");
        return;
      }

      setErfolg(true);
      setFelder(FORM_LEER);

    } catch {
      setServerFehler("Keine Verbindung möglich. Bitte versuche es erneut.");
    } finally {
      setSendet(false);
    }
  }

  // ── Erfolgs-State ──────────────────────────────────────────────
  if (erfolg) {
    return (
      <motion.div
        key="erfolg"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl border border-cyber-400/20 bg-cyber-400/[0.04] p-8 text-center"
      >
        <div className="w-10 h-10 rounded-full bg-cyber-400/[0.1] border border-cyber-400/25 flex items-center justify-center mx-auto mb-3">
          <span className="text-cyber-400 text-base">✓</span>
        </div>
        <p className="text-sm font-mono text-white/75 mb-1">Nachricht gesendet.</p>
        <p className="text-xs font-mono text-white/35">
          Ich melde mich so bald wie möglich.
        </p>
        <button
          type="button"
          onClick={() => setErfolg(false)}
          className="mt-5 text-[10px] font-mono text-white/30 hover:text-white/55 transition-colors duration-200"
        >
          Neue Nachricht verfassen
        </button>
      </motion.div>
    );
  }

  // ── Formular ───────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate>
      <InfoKarte
        lichtfarbe={CYBER_RGB}
        mitHoverAnimation={false}
        klassen="overflow-hidden p-5 pl-6 md:p-6"
        stil={{ backgroundImage: "linear-gradient(to right, rgba(22,211,238,0.04) 0%, transparent 40%)" }}
      >

        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <span className="font-mono text-[11px] text-cyber-400/55">
            › kontakt_formular
          </span>
          <div className="h-px flex-1 bg-white/[0.04]" />
        </div>

        {/* Name + E-Mail — 2 Spalten ab sm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <EingabeFeld
            label="Name *"
            name="name"
            value={felder.name}
            onChange={felderAendern}
            placeholder="Dein Name"
            fehler={fehler.name}
            autoComplete="name"
          />
          <EingabeFeld
            label="E-Mail *"
            name="email"
            type="email"
            value={felder.email}
            onChange={felderAendern}
            placeholder="name@domain.de"
            fehler={fehler.email}
            autoComplete="email"
          />
        </div>

        {/* Telefon */}
        <div className="mb-4">
          <EingabeFeld
            label="Telefon (optional)"
            name="telefon"
            type="tel"
            value={felder.telefon}
            onChange={felderAendern}
            placeholder="+49 …"
            autoComplete="tel"
          />
        </div>

        {/* Nachricht */}
        <div className="min-w-0">
          <label
            htmlFor="kf-nachricht"
            className="block text-[10px] font-mono text-white/70 uppercase tracking-widest mb-1.5"
          >
            Nachricht *
          </label>
          <textarea
            id="kf-nachricht"
            name="nachricht"
            value={felder.nachricht}
            onChange={felderAendern}
            placeholder="Deine Nachricht…"
            rows={4}
            onFocus={(e) => scrollZuFeld(e.currentTarget)}
            className={`formular-eingabe font-mono text-base sm:text-sm py-2 ${fehler.nachricht ? "fehler" : ""}`}
          />
          {fehler.nachricht && (
            <p className="mt-1 text-[10px] font-mono text-signal-rot/75 leading-relaxed">
              {fehler.nachricht}
            </p>
          )}
        </div>

        {/* Honeypot — off-screen, für Bots sichtbar, für Menschen nicht */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-5000px",
            top: "auto",
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
        >
          <input
            type="text"
            name="_website"
            value={honigTopf}
            onChange={(e) => setHonigTopf(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Server-Fehler */}
        {serverFehler && (
          <p className="mt-3 text-[10px] font-mono text-signal-rot/75 leading-relaxed">
            {serverFehler}
          </p>
        )}

        {/* Footer: Datenschutz-Hinweis + Button */}
        <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[10px] font-mono text-white/25 leading-relaxed">
            Deine Angaben werden nur zur Bearbeitung deiner Nachricht verwendet.
          </p>
          <Knopf
            variante="aktion"
            typ="submit"
            laedt={sendet}
            ladeText="Senden…"
            klassen="w-full sm:w-auto flex-shrink-0"
          >
            Nachricht senden →
          </Knopf>
        </div>

      </InfoKarte>
    </form>
  );
}

// ─── View ────────────────────────────────────────────────────────

export default function KontaktView() {
  const [modalOffen, setModalOffen] = useState(false);
  const [modalTab,   setModalTab]   = useState<LegalTab>("impressum");

  const legalOeffnen = (tab: LegalTab) => {
    setModalTab(tab);
    setModalOffen(true);
  };

  return (
    <section id="kontakt" className="py-16 px-6 max-w-3xl mx-auto">
      <LegalModal
        offen={modalOffen}
        startTab={modalTab}
        onSchliessen={() => setModalOffen(false)}
      />

      <AbschnittsTitel
        prefix="> kontakt"
        untertitel="Interesse an Zusammenarbeit, Jobangeboten oder fachlichem Austausch? Ich freue mich auf deine Nachricht."
        klassen="mb-10"
      />

      {/* Kontaktkarten */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        {KONTAKT_EINTRAEGE.map((eintrag, index) => (
          <motion.div
            key={eintrag.label}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.07, duration: 0.4 }}
          >
            <a
              href={eintrag.href}
              download={eintrag.download}
              target={eintrag.extern ? "_blank" : undefined}
              rel={eintrag.extern ? "noopener noreferrer" : undefined}
              className="block group"
            >
              <InfoKarte
                lichtfarbe={CYBER_RGB}
                akzentRand
                akzentFarbe={CYBER_HEX}
                klassen="p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{
                      background: `rgba(${CYBER_RGB}, 0.08)`,
                      border:     `1px solid rgba(${CYBER_RGB}, 0.22)`,
                    }}
                  >
                    {eintrag.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-white text-sm leading-snug">
                      {eintrag.label}
                    </div>
                    <div className="text-xs text-white/40 font-mono truncate">
                      {eintrag.wert}
                    </div>
                  </div>
                  <div className="ml-auto pl-2 text-cyber-400/55 group-hover:text-cyber-400 transition-colors duration-200 text-sm flex-shrink-0">
                    {eintrag.download ? "↓" : "→"}
                  </div>
                </div>
              </InfoKarte>
            </a>
          </motion.div>
        ))}
      </motion.div>

      {/* Kontaktformular */}
      <motion.div
        variants={STATISCHE_TEXTKARTE}
        initial="versteckt"
        whileInView="sichtbar"
        viewport={{ once: true, margin: "-40px" }}
        transition={{ delay: 0.15 }}
        className="mt-4"
      >
        <KontaktFormular />
      </motion.div>

      {/* Legal-Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.28 }}
        className="mt-4"
      >
        <div className="rounded-xl border border-cyber-400/[0.1] bg-cyber-400/[0.02] px-4 py-3 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-cyber-400/[0.08] border border-cyber-400/20 flex items-center justify-center flex-shrink-0 font-mono text-xs text-white/45">
            §
          </div>
          <span className="text-[11px] font-mono text-white/45 flex-1 select-none">
            Rechtliches
          </span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => legalOeffnen("impressum")}
              className="text-[11px] font-mono text-cyber-400/70 hover:text-cyber-400 px-2.5 py-1.5 rounded-lg hover:bg-cyber-400/[0.07] transition-all duration-200"
            >
              Impressum
            </button>
            <span className="text-white/25 text-[10px] select-none">·</span>
            <button
              onClick={() => legalOeffnen("datenschutz")}
              className="text-[11px] font-mono text-cyber-400/70 hover:text-cyber-400 px-2.5 py-1.5 rounded-lg hover:bg-cyber-400/[0.07] transition-all duration-200"
            >
              Datenschutz
            </button>
          </div>
        </div>
      </motion.div>

      {/* Standort */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.38 }}
        className="mt-8 text-center"
      >
        <p className="text-xs text-akzent-400/55 font-mono">{PERSOENLICH.standort}</p>
      </motion.div>
    </section>
  );
}
