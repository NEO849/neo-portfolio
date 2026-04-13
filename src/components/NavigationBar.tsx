import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NAVIGATION, PERSOENLICH } from "../models/daten";

export default function NavigationBar() {
  const [menuOffen, setMenuOffen] = useState(false);
  const [gescrollt, setGescrollt] = useState(false);

  useEffect(() => {
    const handler = () => setGescrollt(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      gescrollt ? "bg-grund-950/80 backdrop-blur-xl border-b border-white/5" : ""
    }`}>
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#hero" className="font-mono text-sm text-white/40 hover:text-akzent-400 transition tracking-wider">
          neo<span className="text-akzent-400">@</span>portfolio
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAVIGATION.filter(nav => nav.abschnitt !== "hero").map(nav => (
            <a key={nav.pfad} href={nav.pfad}
              className="px-3 py-1.5 text-sm text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition">
              {nav.label}
            </a>
          ))}
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setMenuOffen(!menuOffen)} className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5">
          <span className={`block w-5 h-px bg-white transition-all ${menuOffen ? "rotate-45 translate-y-1" : ""}`} />
          <span className={`block w-5 h-px bg-white transition-all ${menuOffen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-px bg-white transition-all ${menuOffen ? "-rotate-45 -translate-y-1" : ""}`} />
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOffen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-full left-4 right-4 glass-stark p-4 space-y-1"
          >
            {NAVIGATION.filter(nav => nav.abschnitt !== "hero").map(nav => (
              <a key={nav.pfad} href={nav.pfad} onClick={() => setMenuOffen(false)}
                className="block px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition">
                {nav.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
