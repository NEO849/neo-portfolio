import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NAVIGATION, PERSOENLICH } from "../models/daten";

export default function NavigationBar() {
  const [menuOffen, setMenuOffen] = useState(false);
  const [gescrollt, setGescrollt] = useState(false);
  const [aktiverAbschnitt, setAktiverAbschnitt] = useState("hero");

  // Scroll-Shadow
  useEffect(() => {
    const handler = () => setGescrollt(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Aktiver Abschnitt via Intersection Observer
  useEffect(() => {
    const abschnittIds = NAVIGATION.map(n => n.abschnitt);
    const elemente = abschnittIds
      .map(id => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        eintraege.forEach(eintrag => {
          if (eintrag.isIntersecting) {
            setAktiverAbschnitt(eintrag.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    elemente.forEach(el => beobachter.observe(el));
    return () => beobachter.disconnect();
  }, []);

  const istAktiv = (abschnitt: string) => aktiverAbschnitt === abschnitt;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      gescrollt
        ? "bg-grund-950/85 backdrop-blur-xl border-b border-white/8 shadow-[0_1px_0_rgba(99,102,241,0.08)]"
        : ""
    }`}>
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <a
          href="#hero"
          className="font-mono text-sm tracking-wider transition-colors duration-200 group"
        >
          <span className="text-white/50 group-hover:text-white/80 transition-colors">neo</span>
          <span className="text-akzent-400">@</span>
          <span className="text-white/50 group-hover:text-white/80 transition-colors">portfolio</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAVIGATION.filter(nav => nav.abschnitt !== "hero").map(nav => (
            <a
              key={nav.pfad}
              href={nav.pfad}
              className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                istAktiv(nav.abschnitt)
                  ? "text-white bg-white/8"
                  : "text-white/55 hover:text-white/90 hover:bg-white/5"
              }`}
            >
              {nav.label}
              {istAktiv(nav.abschnitt) && (
                <motion.div
                  layoutId="nav-indikator"
                  className="absolute bottom-0.5 left-3 right-3 h-px rounded-full"
                  style={{ background: "linear-gradient(90deg, #6366f1, #06b6d4)" }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </a>
          ))}

          <a
            href={`mailto:${PERSOENLICH.email}`}
            className="ml-3 px-4 py-2 text-sm font-medium rounded-lg border border-akzent-500/30 text-akzent-400 hover:bg-akzent-500/10 hover:border-akzent-500/50 transition-all duration-200"
          >
            Kontakt
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOffen(!menuOffen)}
          className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/5 transition"
          aria-label="Menü"
        >
          <span className={`block w-5 h-px bg-white/70 transition-all duration-300 ${menuOffen ? "rotate-45 translate-y-1.5" : ""}`} />
          <span className={`block w-5 h-px bg-white/70 transition-all duration-300 ${menuOffen ? "opacity-0 scale-x-0" : ""}`} />
          <span className={`block w-5 h-px bg-white/70 transition-all duration-300 ${menuOffen ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </button>
      </nav>

      {/* Mobile Menü */}
      <AnimatePresence>
        {menuOffen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            className="md:hidden absolute top-full left-4 right-4 glass-stark p-3 space-y-1"
          >
            {NAVIGATION.filter(nav => nav.abschnitt !== "hero").map(nav => (
              <a
                key={nav.pfad}
                href={nav.pfad}
                onClick={() => setMenuOffen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all duration-200 ${
                  istAktiv(nav.abschnitt)
                    ? "text-white bg-white/8 font-medium"
                    : "text-white/65 hover:text-white hover:bg-white/5"
                }`}
              >
                {istAktiv(nav.abschnitt) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-akzent-400 flex-shrink-0" />
                )}
                {nav.label}
              </a>
            ))}

            <div className="pt-1 border-t border-white/8 mt-1">
              <a
                href={`mailto:${PERSOENLICH.email}`}
                onClick={() => setMenuOffen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm rounded-xl text-akzent-400 hover:bg-akzent-500/10 transition-all duration-200"
              >
                E-Mail schreiben
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
