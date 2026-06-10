// ═══════════════════════════════════════════════════════════════════
// APP: Routen
// Alle URL-Routen der Website zentral definiert.
// AnimatePresence ermöglicht Seitenübergangs-Animationen.
// Lazy Loading: Seiten werden erst geladen wenn sie gebraucht werden.
// ═══════════════════════════════════════════════════════════════════

import { Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { KartenSkeleton } from "../bausteine/LadeanzeigePuls";
import { FehlerGrenze } from "../bausteine/FehlerGrenze";
import { lazyMitNeuversuch } from "./chunkSelbstheilung";

// Lazy-Imports: Jede Seite wird nur geladen wenn sie aufgerufen wird.
// lazyMitNeuversuch verhält sich wie React.lazy(), heilt aber Stale-Chunks
// nach einem Deploy automatisch (Retry → einmaliger Hard-Reload).
const StartSeite      = lazyMitNeuversuch(() => import("../seiten/StartSeite"));
const UeberMichSeite  = lazyMitNeuversuch(() => import("../seiten/UeberMichSeite"));
const ProjekteSeite   = lazyMitNeuversuch(() => import("../seiten/ProjekteSeite"));
const SecuritySeite   = lazyMitNeuversuch(() => import("../seiten/SecuritySeite"));
const LaborSeite      = lazyMitNeuversuch(() => import("../seiten/LaborSeite"));
const OsintToolSeite  = lazyMitNeuversuch(() => import("../seiten/OsintToolSeite"));
const KontaktSeite    = lazyMitNeuversuch(() => import("../seiten/KontaktSeite"));
const VoiceDemoSeite  = lazyMitNeuversuch(() => import("../seiten/VoiceDemoSeite"));
const BilderSeite     = lazyMitNeuversuch(() => import("../seiten/BilderSeite"));

// Fallback während eine Seite geladen wird
function SeitenLadeindikator() {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <KartenSkeleton zeilen={5} />
      </div>
    </div>
  );
}

// 404-Seite
function NichtGefundenSeite() {
  return (
    <div className="min-h-screen pt-16 flex flex-col items-center justify-center text-center px-6">
      <p className="font-mono text-6xl font-bold text-white/10 mb-4">404</p>
      <h1 className="font-display text-2xl font-bold text-white mb-3">
        Seite nicht gefunden
      </h1>
      <p className="text-white/40 text-sm mb-8">
        Diese URL existiert nicht oder wurde verschoben.
      </p>
      <a href="/" className="text-akzent-400 font-mono text-sm hover:underline">
        ← Zurück zur Startseite
      </a>
    </div>
  );
}

function ScrollZuTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

// Lädt alle Routen-Chunks im Hintergrund (sobald der Browser idle ist) →
// jede Folge-Navigation ist sofort da, ohne Lade-Skelett. Läuft genau einmal.
function useRoutenVorladen() {
  useEffect(() => {
    const vorladen = () => {
      void import("../seiten/UeberMichSeite");
      void import("../seiten/ProjekteSeite");
      void import("../seiten/SecuritySeite");
      void import("../seiten/LaborSeite");
      void import("../seiten/OsintToolSeite");
      void import("../seiten/KontaktSeite");
      void import("../seiten/VoiceDemoSeite");
    };
    const hatIdle = "requestIdleCallback" in window;
    const id = hatIdle
      ? window.requestIdleCallback(vorladen, { timeout: 2500 })
      : window.setTimeout(vorladen, 1200);
    return () => {
      if (hatIdle) window.cancelIdleCallback(id as number);
      else clearTimeout(id as number);
    };
  }, []);
}

export function Routen() {
  const ort = useLocation();
  useRoutenVorladen();

  return (
    <>
      <ScrollZuTop />
    <FehlerGrenze resetSchluessel={ort.pathname}>
    <AnimatePresence mode="wait" initial={false}>
      {/*
        Der pathname-Key MUSS auf dem direkten AnimatePresence-Kind sitzen,
        damit die Exit-Animationen (SEITEN_EINGANG.verlassen) feuern. Liegt er
        — wie früher — auf <Routes> innerhalb von <Suspense>, ist das stabile
        <Suspense> das direkte Kind und AnimatePresence sieht nie einen
        Key-Wechsel → kein Exit. `location={ort}` bleibt auf <Routes>, damit die
        ausgehende (eingefrorene) Seite während des Exits ihre alte Route rendert.
      */}
      <Suspense key={ort.pathname} fallback={<SeitenLadeindikator />}>
        <Routes location={ort}>
          <Route path="/"              element={<StartSeite />} />
          <Route path="/ueber-mich"    element={<UeberMichSeite />} />
          <Route path="/projekte"      element={<ProjekteSeite />} />
          <Route path="/security"      element={<SecuritySeite />} />
          <Route path="/labor"         element={<LaborSeite />} />
          <Route path="/osint-tools"   element={<OsintToolSeite />} />
          <Route path="/kontakt"       element={<KontaktSeite />} />
          <Route path="/voice-demo"    element={<VoiceDemoSeite />} />
          <Route path="/projekte/:slug/bilder" element={<BilderSeite />} />
          <Route path="*"              element={<NichtGefundenSeite />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
    </FehlerGrenze>
    </>
  );
}
