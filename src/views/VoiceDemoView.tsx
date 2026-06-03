// ═══════════════════════════════════════════════════════════════════
// VIEW: voice-bridge Demo
//
// Interaktiver, vollständig simulierter Klon der echten voice-bridge-
// Oberfläche. Einfach aufs Mikro drücken (oder Leertaste) → Aufnahme-
// Animation → der nächste Satz wird Wort für Wort in die gewählte
// Sitzung transkribiert. Es wird nichts aufgenommen, gesendet oder
// gespeichert.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useVoiceDemo } from "../viewmodels/useVoiceDemo";
import { MikrofonOrb } from "../bausteine/MikrofonOrb";
import { AudioPegel } from "../bausteine/AudioPegel";
import { TippText } from "../bausteine/TippText";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import type { AufnahmeZustand, DemoSitzung, DemoSprache } from "../models/voiceDemo";

const AKZENT = "#0a84ff";
const WARN = "#ff9f0a";

const STATUS_TEXT: Record<AufnahmeZustand, string> = {
  bereit: "Tippen zum Sprechen",
  aufnahme: "Hört zu …",
  verarbeitung: "Transkribiert …",
};

const SPRACHEN: readonly DemoSprache[] = ["de", "en", "auto"];
const SPRACH_LABEL: Record<DemoSprache, string> = { de: "DE", en: "EN", auto: "auto" };

export default function VoiceDemoView() {
  const steuerung = useVoiceDemo();
  const {
    sitzungen,
    aktiveSitzung,
    aufnahme,
    sprache,
    naechsterSatz,
    sitzungWaehlen,
    spracheWaehlen,
    aufnahmeUmschalten,
  } = steuerung;

  // Leertaste schaltet die Aufnahme um — wie im echten Tool.
  useEffect(() => {
    function beiTaste(ereignis: KeyboardEvent) {
      if (ereignis.code !== "Space") return;
      const ziel = ereignis.target as HTMLElement | null;
      const istEingabe = ziel?.tagName === "INPUT" || ziel?.tagName === "TEXTAREA";
      if (istEingabe) return;
      ereignis.preventDefault();
      aufnahmeUmschalten();
    }
    window.addEventListener("keydown", beiTaste);
    return () => window.removeEventListener("keydown", beiTaste);
  }, [aufnahmeUmschalten]);

  // Sitzungen nach Datumsgruppe ordnen (Reihenfolge des ersten Auftretens).
  const gruppen = useMemo(() => {
    const reihenfolge: string[] = [];
    const proGruppe = new Map<string, DemoSitzung[]>();
    for (const sitzung of sitzungen) {
      if (!proGruppe.has(sitzung.datumsGruppe)) {
        proGruppe.set(sitzung.datumsGruppe, []);
        reihenfolge.push(sitzung.datumsGruppe);
      }
      proGruppe.get(sitzung.datumsGruppe)!.push(sitzung);
    }
    return reihenfolge.map((name) => ({ name, eintraege: proGruppe.get(name)! }));
  }, [sitzungen]);

  return (
    <section className="py-16 px-6 max-w-5xl mx-auto">
      <AbschnittsTitel
        prefix="> voice-bridge · demo"
        untertitel="Interaktive Simulation der echten Oberfläche. Drück aufs Mikro (oder die Leertaste) und sieh, wie gesprochene Sätze transkribiert in der gewählten Sitzung landen. Es wird nichts aufgenommen, gesendet oder gespeichert."
        klassen="mb-8"
      />

      {/* Geräte-Rahmen im Look des echten Tools */}
      <div
        className="overflow-hidden rounded-3xl border flex flex-col md:flex-row"
        style={{
          background: "#0a0a0c",
          borderColor: "rgba(255,255,255,0.10)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
          minHeight: 520,
        }}
      >
        {/* ─── Seitenleiste: Sitzungen ─── */}
        <aside
          className="md:w-[244px] shrink-0 border-b md:border-b-0 md:border-r p-4"
          style={{ borderColor: "rgba(255,255,255,0.08)", background: "#000" }}
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-3 px-1">
            Sitzungen
          </p>
          <div className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible pb-1 md:pb-0">
            {gruppen.map((gruppe) => (
              <div key={gruppe.name} className="md:mb-3 shrink-0 md:shrink">
                <p className="hidden md:block font-mono text-[9px] uppercase tracking-wider text-white/20 mb-1.5 px-1">
                  {gruppe.name}
                </p>
                <div className="flex gap-2 md:flex-col">
                  {gruppe.eintraege.map((sitzung) => {
                    const aktiv = sitzung.id === aktiveSitzung.id;
                    return (
                      <button
                        key={sitzung.id}
                        type="button"
                        onClick={() => sitzungWaehlen(sitzung.id)}
                        className="text-left rounded-xl px-3 py-2 border transition-colors shrink-0 md:w-full"
                        style={{
                          borderColor: aktiv ? `${AKZENT}66` : "rgba(255,255,255,0.07)",
                          background: aktiv ? `${AKZENT}1a` : "rgba(255,255,255,0.02)",
                        }}
                      >
                        <span className="block font-mono text-[12px] text-white/85 whitespace-nowrap">
                          {sitzung.name}
                        </span>
                        <span className="block text-[10px] text-white/35 whitespace-nowrap">
                          {sitzung.kontext}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ─── Hauptbereich: Verlauf + Steuerung ─── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Kopfzeile */}
          <div
            className="flex items-center justify-between px-5 py-3 border-b"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <span className="font-mono text-sm text-white/80">voice → claude</span>
            <span
              className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border"
              style={{ color: WARN, borderColor: `${WARN}40`, background: `${WARN}12` }}
            >
              Simulation
            </span>
          </div>

          {/* Verlauf */}
          <Verlauf sitzung={aktiveSitzung} />

          {/* Steuerung */}
          <div
            className="border-t px-5 py-5 flex flex-col items-center gap-3"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <SprachSegment sprache={sprache} aufSprache={spracheWaehlen} />

            <MikrofonOrb zustand={aufnahme} onClick={aufnahmeUmschalten} />

            <AudioPegel aktiv={aufnahme === "aufnahme"} />

            <p className="font-mono text-xs text-white/45 h-4">
              {STATUS_TEXT[aufnahme]}
            </p>

            {/* Vorschau, was als Nächstes „gesprochen" wird */}
            <p className="text-[11px] text-white/30 text-center max-w-sm leading-relaxed">
              <span className="text-white/45">Nächster Satz:</span> „{naechsterSatz}"
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] text-white/30">
        Leertaste startet/stoppt ebenfalls. Reine Frontend-Demo · kein Backend, kein Mikrofon-Zugriff.
      </p>
    </section>
  );
}

// ─── Verlauf mit Auto-Scroll zum neuesten Eintrag ─────────────────
function Verlauf({ sitzung }: { sitzung: DemoSitzung }) {
  const endeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endeRef.current?.scrollIntoView({ block: "end" });
  }, [sitzung.verlauf.length, sitzung.id]);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-2.5" style={{ maxHeight: 320 }}>
      <AnimatePresence initial={false}>
        {sitzung.verlauf.map((nachricht) => (
          <motion.div
            key={`${sitzung.id}-${nachricht.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex justify-end"
          >
            <div
              className="max-w-[85%] rounded-2xl rounded-br-md px-3.5 py-2 border"
              style={{
                background: "rgba(10,132,255,0.12)",
                borderColor: "rgba(10,132,255,0.22)",
              }}
            >
              <p className="text-[13px] text-white/85 leading-relaxed">
                <TippText text={nachricht.text} animieren={nachricht.frischTranskribiert} />
              </p>
              <p className="mt-0.5 text-right font-mono text-[9px] text-white/30">
                {nachricht.zeit}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={endeRef} />
    </div>
  );
}

// ─── Sprach-Segment (DE / EN / auto) ──────────────────────────────
function SprachSegment({
  sprache,
  aufSprache,
}: {
  sprache: DemoSprache;
  aufSprache: (s: DemoSprache) => void;
}) {
  return (
    <div
      className="inline-flex rounded-full border p-0.5"
      style={{ borderColor: "rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)" }}
      role="group"
      aria-label="Sprache"
    >
      {SPRACHEN.map((option) => {
        const aktiv = option === sprache;
        return (
          <button
            key={option}
            type="button"
            onClick={() => aufSprache(option)}
            aria-pressed={aktiv}
            className="font-mono text-[11px] px-3 py-1 rounded-full transition-colors"
            style={{
              color: aktiv ? "#fff" : "rgba(255,255,255,0.45)",
              background: aktiv ? `${AKZENT}cc` : "transparent",
            }}
          >
            {SPRACH_LABEL[option]}
          </button>
        );
      })}
    </div>
  );
}
