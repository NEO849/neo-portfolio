import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NAVIGATION } from "../models/daten";

export default function NavigationBar() {
  const [menuOffen, setMenuOffen] = useState(false);
  const [gescrollt, setGescrollt] = useState(false);
  const [aktiverAbschnitt, setAktiverAbschnitt] = useState("hero");

  useEffect(() => {
    const handler = () => setGescrollt(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const ids = NAVIGATION.map(n => n.abschnitt);
    const elemente = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const beobachter = new IntersectionObserver(
      (eintraege) => {
        eintraege.forEach(e => { if (e.isIntersecting) setAktiverAbschnitt(e.target.id); });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    elemente.forEach(el => beobachter.observe(el));
    return () => beobachter.disconnect();
  }, []);

  const scrollZu = (abschnitt: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (abschnitt === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.getElementById(abschnitt)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const istAktiv = (abschnitt: string) => aktiverAbschnitt === abschnitt;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      gescrollt ? "bg-grund-950/88 backdrop-blur-xl border-b border-white/6 shadow-[0_1px_0_rgba(99,102,241,0.07)]" : ""
    }`}>
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Brand — klare persönliche Identität */}
        <a
          href="#hero"
          onClick={(e) => scrollZu("hero", e)}
          className="font-display text-sm font-bold tracking-wide transition-opacity duration-200 hover:opacity-75 select-none"
          style={{
            background: "linear-gradient(135deg, #818cf8, #22d3ee)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Michael Fleps
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAVIGATION.filter(n => n.abschnitt !== "hero").map(nav => (
            <a
              key={nav.pfad}
              href={nav.pfad}
              onClick={(e) => scrollZu(nav.abschnitt, e)}
              className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                istAktiv(nav.abschnitt)
                  ? "text-white bg-white/8"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {nav.label}
              {istAktiv(nav.abschnitt) && (
                <motion.div
                  layoutId="nav-indikator"
                  className="absolute bottom-1 left-3 right-3 h-px rounded-full"
                  style={{ background: "linear-gradient(90deg, #6366f1, #06b6d4)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
            </a>
          ))}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOffen(!menuOffen)}
          className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/5 transition"
          aria-label="Menü"
        >
          <span className={`block w-5 h-px bg-white/70 transition-all duration-300 origin-center ${menuOffen ? "rotate-45 translate-y-[5px]" : ""}`} />
          <span className={`block w-5 h-px bg-white/70 transition-all duration-300 ${menuOffen ? "opacity-0 scale-x-0" : ""}`} />
          <span className={`block w-5 h-px bg-white/70 transition-all duration-300 origin-center ${menuOffen ? "-rotate-45 -translate-y-[5px]" : ""}`} />
        </button>
      </nav>

      {/* Mobile Menü */}
      <AnimatePresence>
        {menuOffen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.25, 0.1, 0.25, 1] }}
            className="md:hidden absolute top-full left-4 right-4 glass-stark p-3 space-y-0.5"
          >
            {NAVIGATION.filter(n => n.abschnitt !== "hero").map(nav => (
              <a
                key={nav.pfad}
                href={nav.pfad}
                onClick={(e) => {
                  scrollZu(nav.abschnitt, e);
                  setTimeout(() => setMenuOffen(false), 80);
                }}
                className={`flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all duration-200 ${
                  istAktiv(nav.abschnitt)
                    ? "text-white bg-white/8 font-medium"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {istAktiv(nav.abschnitt) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-akzent-400 flex-shrink-0" />
                )}
                {nav.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
