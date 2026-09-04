// ═══════════════════════════════════════════════════════════════════
// VIEW: voice-bridge Demo (1:1-Klon, vollständig simuliert)
//
// Getreuer Nachbau der echten Oberfläche samt allen Funktionen:
// Sidebar mit gruppierter History, Session-Picker, Status-Anzeige,
// Orb mit Aufnahme/Transkription, Pills, Transkript-Karte mit Meta +
// Copy, Queue/Drain-Banner, DE/EN/auto, auto-Enter, Einstellungs- und
// Detail-Dialog, mobile Seitenleiste. Oben rechts schließt ein „×" die
// Demo mit vertikaler Dreh-Animation. Kein Backend, kein Mikrofon.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useVoiceDemo, type VoiceDemoSteuerung } from "../viewmodels/useVoiceDemo";
import { MikrofonOrb } from "../bausteine/MikrofonOrb";
import { TippText } from "../bausteine/TippText";
import { SchliessenKnopf } from "../bausteine/SchliessenKnopf";
import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import type { DemoSprache, DemoTranskript, IndikatorModus, InjektionStatus } from "../models/voiceDemo";

const T = {
  bg0: "#000000", bg1: "#0a0a0c", bg2: "#15161a", bg3: "#1c1d22", bg4: "#25272d",
  line: "rgba(255,255,255,0.07)", lineStark: "rgba(255,255,255,0.13)",
  text: "#f5f5f7", soft: "#c6c8ce", muted: "#86868b", faint: "#555",
  accent: "#0a84ff", good: "#30d158", warn: "#ff9f0a", rec: "#ff453a",
};

const STATUS_FARBE: Record<IndikatorModus, string> = {
  idle: T.good, busy: T.warn, rec: T.rec, dead: T.rec,
};

const PILL: Record<InjektionStatus, { farbe: string; text: string }> = {
  sent: { farbe: T.good, text: "in Claude eingefügt" },
  queued: { farbe: T.warn, text: "wartet auf Idle" },
  skipped: { farbe: T.rec, text: "nicht gesendet" },
};

const SPRACHEN: readonly DemoSprache[] = ["de", "en", "auto"];

export default function VoiceDemoView() {
  const steuerung = useVoiceDemo();
  const navigate = useNavigate();
  const [schliesst, setSchliesst] = useState(false);

  // Leertaste schaltet die Aufnahme um (wenn kein Dialog/Eingabe aktiv).
  useEffect(() => {
    function beiTaste(ereignis: KeyboardEvent) {
      if (ereignis.code !== "Space") return;
      if (steuerung.einstellungenOffen || steuerung.detailTranskript) return;
      const ziel = ereignis.target as HTMLElement | null;
      const tag = ziel?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      ereignis.preventDefault();
      steuerung.aufnahmeUmschalten();
    }
    window.addEventListener("keydown", beiTaste);
    return () => window.removeEventListener("keydown", beiTaste);
  }, [steuerung]);

  return (
    <section className="pt-6 pb-10 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto">
      <AbschnittsTitel
        prefix="> voice-bridge · demo"
        untertitel="Originalgetreuer, interaktiver Klon der echten Oberfläche, alle Funktionen simuliert. Drück aufs Mikro (oder die Leertaste). Es wird nichts aufgenommen, gesendet oder gespeichert."
        klassen="mb-5 sm:mb-8"
      />

      <motion.div
        className="relative"
        style={{ transformPerspective: 1400, transformOrigin: "top center" }}
        animate={schliesst ? { rotateX: -82, opacity: 0, y: -12 } : { rotateX: 0, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        onAnimationComplete={() => { if (schliesst) navigate("/projekte"); }}
      >
        {/* Geräte-Rahmen */}
        <div
          className="overflow-hidden rounded-3xl border grid grid-cols-1 md:grid-cols-[260px_1fr] md:h-[580px]"
          style={{
            background: T.bg0, borderColor: T.lineStark,
            boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
          }}
        >
          <Seitenleiste steuerung={steuerung} />
          <Hauptbereich steuerung={steuerung} onSchliessen={() => setSchliesst(true)} />
        </div>

        {/* mobile Overlay für die Seitenleiste */}
        <AnimatePresence>
          {steuerung.seitenleisteOffen && (
            <motion.button
              type="button"
              aria-label="Seitenleiste schließen"
              className="md:hidden absolute inset-0 z-30 rounded-3xl"
              style={{ background: "rgba(0,0,0,0.55)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={steuerung.seitenleisteSchliessen}
            />
          )}
        </AnimatePresence>
        <MobileSeitenleiste steuerung={steuerung} />

        {/* Dialoge */}
        <EinstellungenDialog steuerung={steuerung} />
        <DetailDialog steuerung={steuerung} />
      </motion.div>

      <p className="mt-4 text-center text-[11px] text-white/30">
        Reine Frontend-Demo · kein Backend, kein Mikrofon-Zugriff · oben rechts schließt die Demo.
      </p>
    </section>
  );
}

// ─── Status-Anzeige (Punkt mit Ring + Text) ───────────────────────
function Statusanzeige({ modus, text }: { modus: IndikatorModus; text: string }) {
  const farbe = STATUS_FARBE[modus];
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative grid place-items-center" style={{ width: 12, height: 12 }}>
        <motion.span
          className="absolute rounded-full"
          style={{ inset: 0, background: farbe, opacity: 0.45 }}
          animate={{ scale: [1, 2.2], opacity: [0.45, 0] }}
          transition={{ duration: modus === "rec" ? 0.8 : modus === "busy" ? 1.2 : 1.8, repeat: Infinity, ease: "easeOut" }}
        />
        <span className="relative rounded-full" style={{ width: 8, height: 8, background: farbe }} />
      </span>
      <span className="text-[13px] font-medium" style={{ color: T.soft }}>{text}</span>
    </div>
  );
}

// ─── Seitenleiste (Desktop-Spalte) ────────────────────────────────
function Seitenleiste({ steuerung }: { steuerung: VoiceDemoSteuerung }) {
  return (
    <aside
      className="hidden md:flex flex-col border-r min-w-0"
      style={{ background: T.bg1, borderColor: T.line }}
    >
      <SeitenleisteInhalt steuerung={steuerung} />
    </aside>
  );
}

function MobileSeitenleiste({ steuerung }: { steuerung: VoiceDemoSteuerung }) {
  return (
    <AnimatePresence>
      {steuerung.seitenleisteOffen && (
        <motion.aside
          className="md:hidden absolute top-0 left-0 bottom-0 z-40 flex flex-col border-r"
          style={{ width: "82%", maxWidth: 300, background: T.bg1, borderColor: T.line }}
          initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <SeitenleisteInhalt steuerung={steuerung} />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function SeitenleisteInhalt({ steuerung }: { steuerung: VoiceDemoSteuerung }) {
  const gruppen: { name: string; eintraege: DemoTranskript[] }[] = [];
  for (const eintrag of steuerung.history) {
    const letzte = gruppen[gruppen.length - 1];
    if (letzte && letzte.name === eintrag.gruppe) letzte.eintraege.push(eintrag);
    else gruppen.push({ name: eintrag.gruppe, eintraege: [eintrag] });
  }

  return (
    <>
      <header className="flex items-center justify-between px-3.5 pt-4 pb-2">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: T.muted }}>
          History
        </h2>
        <button
          type="button" aria-label="History aktualisieren" onClick={steuerung.historieAktualisieren}
          className="grid place-items-center w-7 h-7 rounded-lg hover:bg-white/5" style={{ color: T.muted }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 8a6 6 0 0110.5-4M14 8a6 6 0 01-10.5 4" /><path d="M12 1v3.5H8.5M4 15v-3.5H7.5" />
          </svg>
        </button>
      </header>

      <button
        type="button" onClick={steuerung.neuerInput}
        className="mx-3 mb-3 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 text-sm font-medium hover:brightness-125"
        style={{ background: `linear-gradient(180deg, ${T.bg3}, ${T.bg2})`, border: `1px solid ${T.lineStark}`, color: T.text }}
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 2v10M2 7h10" /></svg>
        Neuer Voice-Input
      </button>

      <div className="flex-1 overflow-y-auto px-1.5 pb-3">
        {gruppen.map((gruppe) => (
          <div key={gruppe.name}>
            <p className="px-2 pt-1.5 pb-1 font-mono text-[11px] font-semibold" style={{ color: T.muted }}>
              {gruppe.name}
            </p>
            {gruppe.eintraege.map((eintrag) => (
              <button
                key={eintrag.id} type="button" onClick={() => steuerung.detailOeffnen(eintrag)}
                className="w-full text-left px-2.5 py-2 rounded-lg my-0.5 hover:bg-white/[0.04] flex flex-col gap-0.5"
              >
                <span className="text-[13px] truncate" style={{ color: T.text }}>{eintrag.text}</span>
                <span className="flex items-center gap-1.5 text-[11px]" style={{ color: T.muted }}>
                  {eintrag.anzeigeZeit} · <StatusPille status={eintrag.status} /> · {eintrag.dauerMs} ms
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <footer className="flex items-center justify-between px-3 py-2.5 border-t text-[11px]" style={{ borderColor: T.line, color: T.muted }}>
        <span className="flex items-center gap-1.5">
          <span className="rounded-full" style={{ width: 7, height: 7, background: T.good }} /> live
        </span>
        <span>m.cyp-hr.com</span>
      </footer>
    </>
  );
}

function StatusPille({ status }: { status: InjektionStatus }) {
  const farbe = PILL[status].farbe;
  return (
    <span
      className="inline-flex items-center px-1.5 py-px rounded-full text-[9.5px] font-semibold"
      style={{ color: farbe, background: `${farbe}22` }}
    >
      {status}
    </span>
  );
}

// ─── Hauptbereich (Topbar + Bühne + Controls) ─────────────────────
function Hauptbereich({ steuerung, onSchliessen }: { steuerung: VoiceDemoSteuerung; onSchliessen: () => void }) {
  return (
    <div className="flex flex-col min-w-0">
      {/* Topbar */}
      <div className="flex items-center gap-2 sm:gap-3.5 px-3 sm:px-5 py-2.5 sm:py-3 border-b" style={{ borderColor: T.line }}>
        <button
          type="button" aria-label="Menü" onClick={steuerung.seitenleisteUmschalten}
          className="md:hidden grid place-items-center w-8 h-8 rounded-lg" style={{ color: T.text }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 5h12M3 9h12M3 13h12" /></svg>
        </button>
        <Statusanzeige modus={steuerung.indikator.modus} text={steuerung.indikator.text} />
        <div className="flex-1" />
        <select
          aria-label="Session" value={steuerung.aktiveSitzungId}
          onChange={(e) => steuerung.sitzungWaehlen(e.target.value)}
          className="appearance-none rounded-xl px-2.5 sm:px-3 py-1.5 text-[12px] sm:text-[13px] cursor-pointer min-w-0 max-w-[42vw] sm:max-w-none truncate"
          style={{ background: T.bg2, border: `1px solid ${T.lineStark}`, color: T.text }}
        >
          {steuerung.sitzungen.map((s) => (
            <option key={s.id} value={s.id} disabled={!s.istClaude}>
              {(s.istClaude ? "✓ " : "· ") + s.name}{s.beschaeftigt ? " ⬤" : ""}
            </option>
          ))}
        </select>
        <button
          type="button" aria-label="Einstellungen" onClick={steuerung.einstellungenOeffnen}
          className="grid place-items-center w-9 h-9 rounded-[10px] hover:bg-white/5" style={{ color: T.muted }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="9" r="2.5" /><path d="M9 1.5v2M9 14.5v2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M1.5 9h2M14.5 9h2M3.7 14.3l1.4-1.4M12.9 5.1l1.4-1.4" strokeLinecap="round" /></svg>
        </button>
        <SchliessenKnopf onSchliessen={onSchliessen} />
      </div>

      <Buehne steuerung={steuerung} />
      <Steuerung steuerung={steuerung} />
    </div>
  );
}

// ─── Bühne (Orb + Status) ─────────────────────────────────────────
function Buehne({ steuerung }: { steuerung: VoiceDemoSteuerung }) {
  return (
    <section
      className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 py-2"
      style={{ gap: "clamp(0.75rem, 3.5vw, 1.5rem)" }}
    >
      <MikrofonOrb zustand={steuerung.aufnahme} onClick={steuerung.aufnahmeUmschalten} />
      <StatusZone steuerung={steuerung} />
    </section>
  );
}

// Pill + kurze Anleitung im Idle, nach einer Aktion ein temporärer
// Erfolgshinweis (blendet via ViewModel von selbst wieder aus). Kein
// dauerhaftes Transkriptfeld — ruhiger, reduzierter Eindruck.
function StatusZone({ steuerung }: { steuerung: VoiceDemoSteuerung }) {
  const { aufnahme, aktuellesTranskript, naechsterSatz } = steuerung;

  let pill: { farbe: string; text: string; live?: boolean } | null = null;
  if (aufnahme === "aufnahme") pill = { farbe: T.rec, text: "Aufnahme läuft", live: true };
  else if (aufnahme === "verarbeitung") pill = { farbe: T.accent, text: "Transkribiere …", live: true };
  else if (aktuellesTranskript) pill = { farbe: PILL[aktuellesTranskript.status].farbe, text: PILL[aktuellesTranskript.status].text };

  return (
    <div className="w-full max-w-[440px] flex flex-col items-center justify-start gap-2 text-center" style={{ minHeight: 60 }}>
      {pill ? (
        <motion.span
          key={pill.text}
          initial={{ opacity: 0, y: 6, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12.5px] font-semibold"
          style={{ color: pill.farbe, background: `${pill.farbe}22`, border: `1px solid ${pill.farbe}44` }}
        >
          <motion.span
            className="rounded-full" style={{ width: 6, height: 6, background: "currentColor" }}
            animate={pill.live ? { scale: [1, 1.45, 1] } : {}}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          />
          {pill.text}
        </motion.span>
      ) : (
        <span className="text-[13px]" style={{ color: T.muted }}>Tippen zum Sprechen</span>
      )}

      <AnimatePresence mode="wait">
        {aufnahme === "bereit" && aktuellesTranskript ? (
          <motion.p
            key={aktuellesTranskript.id}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-[12.5px] leading-snug px-3 line-clamp-2" style={{ color: T.soft }}
          >
            „<TippText text={aktuellesTranskript.text} animieren={aktuellesTranskript.frisch} />"
          </motion.p>
        ) : aufnahme === "bereit" ? (
          <motion.span
            key="hint"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-[11px] leading-snug px-3 line-clamp-1" style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Nächster Satz: „{naechsterSatz}"
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// ─── Controls (Sprache + auto-Enter) ──────────────────────────────
function Steuerung({ steuerung }: { steuerung: VoiceDemoSteuerung }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-3 sm:py-3.5 border-t" style={{ borderColor: T.line }}>
      <div className="inline-flex rounded-xl p-[3px] gap-0.5" style={{ background: T.bg2, border: `1px solid ${T.line}` }} role="radiogroup" aria-label="Sprache">
        {SPRACHEN.map((option) => {
          const aktiv = option === steuerung.sprache;
          return (
            <button
              key={option} type="button" aria-pressed={aktiv}
              onClick={() => steuerung.spracheWaehlen(option)}
              className="px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors"
              style={{ background: aktiv ? T.bg4 : "transparent", color: aktiv ? T.text : T.muted }}
            >
              {option.toUpperCase()}
            </button>
          );
        })}
      </div>

      <button
        type="button" role="switch" aria-checked={steuerung.autoEnter}
        onClick={() => steuerung.autoEnterSetzen(!steuerung.autoEnter)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12.5px]"
        style={{ background: T.bg2, border: `1px solid ${T.line}`, color: T.soft }}
      >
        <span className="relative rounded-full transition-colors" style={{ width: 32, height: 18, background: steuerung.autoEnter ? T.accent : T.bg4 }}>
          <motion.span
            className="absolute rounded-full bg-white" style={{ width: 14, height: 14, top: 2, left: 2 }}
            animate={{ x: steuerung.autoEnter ? 14 : 0 }}
            transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </span>
        auto-Enter
      </button>
    </div>
  );
}

// ─── Dialoge ──────────────────────────────────────────────────────
function ModalRahmen({ children, onSchliessen }: { children: React.ReactNode; onSchliessen: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 z-50 grid place-items-center p-4"
      style={{ background: "rgba(0,0,0,0.65)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onSchliessen}
    >
      <motion.div
        className="w-full max-w-[420px] rounded-2xl p-5"
        style={{ background: T.bg2, border: `1px solid ${T.line}`, boxShadow: "0 24px 48px rgba(0,0,0,0.55)" }}
        initial={{ scale: 0.94, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function EinstellungenDialog({ steuerung }: { steuerung: VoiceDemoSteuerung }) {
  const [defaultSprache, setDefaultSprache] = useState<DemoSprache>(steuerung.sprache);
  useEffect(() => { if (steuerung.einstellungenOffen) setDefaultSprache(steuerung.sprache); }, [steuerung.einstellungenOffen, steuerung.sprache]);

  return (
    <AnimatePresence>
      {steuerung.einstellungenOffen && (
        <ModalRahmen onSchliessen={steuerung.einstellungenSchliessen}>
          <h3 className="text-[18px] font-semibold mb-4" style={{ color: T.text }}>Einstellungen</h3>
          <div className="mb-3.5">
            <label className="block text-[12px] mb-1.5" style={{ color: T.muted }}>Bearer Token (nur Demo, ohne Funktion)</label>
            <input
              type="password" placeholder="vb_…" autoComplete="off" disabled
              className="w-full px-3 py-2.5 rounded-xl text-sm opacity-60"
              style={{ background: T.bg1, border: `1px solid ${T.lineStark}`, color: T.text }}
            />
          </div>
          <div className="mb-3.5">
            <label className="block text-[12px] mb-1.5" style={{ color: T.muted }}>Default-Sprache</label>
            <select
              value={defaultSprache} onChange={(e) => setDefaultSprache(e.target.value as DemoSprache)}
              className="w-full px-3 py-2.5 rounded-xl text-sm"
              style={{ background: T.bg1, border: `1px solid ${T.lineStark}`, color: T.text }}
            >
              <option value="de">Deutsch</option><option value="en">English</option><option value="auto">Auto-detect</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={steuerung.einstellungenSchliessen} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: T.bg3, border: `1px solid ${T.lineStark}`, color: T.text }}>Abbrechen</button>
            <button type="button" onClick={() => steuerung.einstellungenSpeichern(defaultSprache)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: T.accent, border: `1px solid ${T.accent}` }}>Speichern</button>
          </div>
        </ModalRahmen>
      )}
    </AnimatePresence>
  );
}

function DetailDialog({ steuerung }: { steuerung: VoiceDemoSteuerung }) {
  const eintrag = steuerung.detailTranskript;
  const [kopiert, setKopiert] = useState(false);

  async function kopieren() {
    if (!eintrag) return;
    try { await navigator.clipboard.writeText(eintrag.text); setKopiert(true); setTimeout(() => setKopiert(false), 1200); }
    catch { /* Clipboard nicht verfügbar */ }
  }

  return (
    <AnimatePresence>
      {eintrag && (
        <ModalRahmen onSchliessen={steuerung.detailSchliessen}>
          <h3 className="text-[18px] font-semibold mb-3" style={{ color: T.text }}>Transkript</h3>
          <p className="text-[14px] leading-relaxed whitespace-pre-wrap" style={{ color: T.text }}>{eintrag.text}</p>
          <div className="mt-3.5 pt-3 flex flex-wrap gap-3 text-[12px] border-t" style={{ borderColor: T.line, color: T.muted }}>
            <span style={{ color: T.soft }}><b>{eintrag.anzeigeZeit}</b></span>
            <StatusPille status={eintrag.status} />
            <span>{eintrag.dauerMs} ms</span>
            <span>{eintrag.sprache}</span>
            <span>{eintrag.bytesKb} KB</span>
            <span style={{ color: T.faint }}>{eintrag.auditId}</span>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={kopieren} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: T.bg3, border: `1px solid ${T.lineStark}`, color: kopiert ? T.good : T.text }}>{kopiert ? "kopiert ✓" : "Copy text"}</button>
            <button type="button" onClick={steuerung.detailSchliessen} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: T.accent, border: `1px solid ${T.accent}` }}>Schließen</button>
          </div>
        </ModalRahmen>
      )}
    </AnimatePresence>
  );
}
