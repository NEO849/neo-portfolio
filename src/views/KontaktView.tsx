import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { PERSOENLICH } from "../models/daten";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { InfoKarte } from "../bausteine/InfoKarte";
import { LegalModal, type LegalTab } from "../bausteine/LegalModal";

const CYBER_RGB = "22, 211, 238";
const CYBER_HEX = "#22d3ee";
const BTC_ADRESSE = "HIER_BTC_ADRESSE_EINTRAGEN";

const KONTAKT_EINTRAEGE = [
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

export default function KontaktView() {
  const [modalOffen, setModalOffen] = useState(false);
  const [modalTab, setModalTab] = useState<LegalTab>("impressum");
  const [kopiert, setKopiert] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if ((location.state as { anchor?: string } | null)?.anchor === "support") {
      setTimeout(() => {
        document.getElementById("support")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 250);
    }
  }, [location.state]);

  const legalOeffnen = (tab: LegalTab) => {
    setModalTab(tab);
    setModalOffen(true);
  };

  const adresseKopieren = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(BTC_ADRESSE);
      } else {
        const el = document.createElement("textarea");
        el.value = BTC_ADRESSE;
        el.setAttribute("readonly", "");
        el.style.cssText = "position:absolute;left:-9999px;top:0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2000);
    } catch { /* silent fail */ }
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
        titel="Kontakt"
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
                      border: `1px solid rgba(${CYBER_RGB}, 0.22)`,
                    }}
                  >
                    {eintrag.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-white text-sm leading-snug">{eintrag.label}</div>
                    <div className="text-xs text-white/40 font-mono truncate">{eintrag.wert}</div>
                  </div>
                  <div className="ml-auto pl-2 text-cyber-400/55 group-hover:text-cyber-400 transition-colors duration-200 text-sm flex-shrink-0">
                    →
                  </div>
                </div>
              </InfoKarte>
            </a>
          </motion.div>
        ))}
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
          <div className="w-7 h-7 rounded-lg bg-cyber-400/[0.08] border border-cyber-400/20 flex items-center justify-center flex-shrink-0 font-mono text-xs text-cyber-400/75">
            §
          </div>
          <span className="text-[11px] font-mono text-cyber-400/65 flex-1 select-none">Rechtliches</span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => legalOeffnen("impressum")}
              className="text-[11px] font-mono text-white/45 hover:text-cyber-400/80 px-2.5 py-1.5 rounded-lg hover:bg-cyber-400/[0.07] transition-all duration-200"
            >
              Impressum
            </button>
            <span className="text-white/25 text-[10px] select-none">·</span>
            <button
              onClick={() => legalOeffnen("datenschutz")}
              className="text-[11px] font-mono text-white/45 hover:text-cyber-400/80 px-2.5 py-1.5 rounded-lg hover:bg-cyber-400/[0.07] transition-all duration-200"
            >
              Datenschutz
            </button>
          </div>
        </div>
      </motion.div>

      {/* Bitcoin Support */}
      <motion.div
        id="support"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.38 }}
        className="mt-4"
      >
        <div className="rounded-xl border border-akzent-400/[0.10] bg-akzent-400/[0.02] px-4 py-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-mono text-sm"
              style={{
                background: "rgba(129, 140, 248, 0.07)",
                border: "1px solid rgba(129, 140, 248, 0.18)",
                color: "rgba(129, 140, 248, 0.70)",
              }}
            >
              ₿
            </div>
            <span className="text-[11px] font-mono text-akzent-400/60 select-none">
              Bitcoin Support
            </span>
          </div>

          <p className="text-[11px] text-white/32 font-mono leading-relaxed mb-3">
            Wenn du meine freien Tools und Projekte unterstützen möchtest,
            kannst du freiwillig per Bitcoin spenden.
          </p>

          <div className="flex items-center gap-2 rounded-lg bg-[#08080f] border border-white/[0.06] px-3 py-2">
            <span className="font-mono text-[10px] text-white/28 flex-shrink-0 select-none">BTC</span>
            <span className="font-mono text-[11px] text-white/50 flex-1 truncate select-all break-all">
              {BTC_ADRESSE}
            </span>
            <button
              type="button"
              onClick={adresseKopieren}
              className="flex-shrink-0 text-[10px] font-mono px-2.5 py-1 rounded-md transition-all duration-200"
              style={{
                background: kopiert
                  ? "rgba(34, 197, 94, 0.10)"
                  : "rgba(129, 140, 248, 0.08)",
                border: kopiert
                  ? "1px solid rgba(34, 197, 94, 0.25)"
                  : "1px solid rgba(129, 140, 248, 0.18)",
                color: kopiert
                  ? "rgba(34, 197, 94, 0.85)"
                  : "rgba(129, 140, 248, 0.65)",
              }}
            >
              {kopiert ? "Kopiert ✓" : "Adresse kopieren"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Standort */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="mt-8 text-center"
      >
        <p className="text-xs text-akzent-400/55 font-mono">{PERSOENLICH.standort}</p>
      </motion.div>
    </section>
  );
}
