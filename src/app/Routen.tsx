// ═══════════════════════════════════════════════════════════════════
// APP: Routen
// Alle URL-Routen der Website zentral definiert.
// AnimatePresence ermöglicht Seitenübergangs-Animationen.
// Lazy Loading: Seiten werden erst geladen wenn sie gebraucht werden.
// ═══════════════════════════════════════════════════════════════════

import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { KartenSkeleton } from "../bausteine/LadeanzeigePuls";

// Lazy-Imports: Jede Seite wird nur geladen wenn sie aufgerufen wird
const StartSeite      = lazy(() => import("../seiten/StartSeite"));
const UeberMichSeite  = lazy(() => import("../seiten/UeberMichSeite"));
const ProjekteSeite   = lazy(() => import("../seiten/ProjekteSeite"));
const SecuritySeite   = lazy(() => import("../seiten/SecuritySeite"));
const OsintToolSeite  = lazy(() => import("../seiten/OsintToolSeite"));
const ZeugnisseSeite  = lazy(() => import("../seiten/ZeugnisseSeite"));
const KontaktSeite    = lazy(() => import("../seiten/KontaktSeite"));

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

export function Routen() {
  const ort = useLocation();

  return (
    <>
      <ScrollZuTop />
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<SeitenLadeindikator />}>
        <Routes location={ort} key={ort.pathname}>
          <Route path="/"              element={<StartSeite />} />
          <Route path="/ueber-mich"    element={<UeberMichSeite />} />
          <Route path="/projekte"      element={<ProjekteSeite />} />
          <Route path="/security"      element={<SecuritySeite />} />
          <Route path="/osint-tools"   element={<OsintToolSeite />} />
          <Route path="/zeugnisse"     element={<ZeugnisseSeite />} />
          <Route path="/kontakt"       element={<KontaktSeite />} />
          <Route path="*"              element={<NichtGefundenSeite />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
    </>
  );
}
