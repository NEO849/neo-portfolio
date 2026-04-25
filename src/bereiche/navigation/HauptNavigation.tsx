// ═══════════════════════════════════════════════════════════════════
// BEREICH: HauptNavigation
// Sticky-Header mit React Router Links, Scroll-Blur und Mobile Menu.
// Kennt die aktive Route und hebt sie visuell hervor.
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePortfolioZustand } from "../../zustaende/portfolioZustand";
import { MOBILE_MENU, MOBILE_MENU_EINTRAG } from "../../bewegung/varianten";
import { MobileMenu } from "./MobileMenu";

interface NavEintrag {
  readonly pfad: string;
  readonly label: string;
}

const NAV_EINTRAEGE: NavEintrag[] = [
  { pfad: "/",              label: "Start" },
  { pfad: "/ueber-mich",    label: "Über mich" },
  { pfad: "/projekte",      label: "Projekte" },
  { pfad: "/security",      label: "Security" },
  { pfad: "/osint-tools",   label: "OSINT Tools" },
  { pfad: "/zeugnisse",     label: "Zeugnisse" },
  { pfad: "/kontakt",       label: "Kontakt" },
];

export function HauptNavigation() {
  const { mobileMenuOffen, mobileMenuToggle } = usePortfolioZustand();
  const [gescrollt, setGescrollt] = useState(false);

  useEffect(() => {
    const handler = () => setGescrollt(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    handler(); // Initialwert setzen
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-500
          ${gescrollt
            ? "bg-grund-950/85 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_1px_40px_rgba(0,0,0,0.4)]"
            : "bg-transparent"
          }
        `}
      >
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo / Markenname */}
          <Link
            to="/"
            className="font-mono text-sm tracking-widest transition-colors duration-200 group"
          >
            <span className="text-white/65 group-hover:text-white/85">FREE DATA </span>
            <span className="text-akzent-400 group-hover:text-akzent-300 transition-colors">solution's</span>
          </Link>

          {/* Desktop-Navigation */}
          <ul className="hidden md:flex items-center gap-0.5" role="navigation">
            {NAV_EINTRAEGE.map((eintrag) => (
              <li key={eintrag.pfad}>
                <NavLink
                  to={eintrag.pfad}
                  end={eintrag.pfad === "/"}
                  className={({ isActive }) => `
                    relative px-3 py-2 text-sm rounded-lg
                    transition-colors duration-200
                    ${isActive
                      ? "text-white"
                      : "text-white/45 hover:text-white/80 hover:bg-white/[0.04]"
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {eintrag.label}
                      {isActive && (
                        <motion.div
                          layoutId="nav-indikator"
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-akzent-400"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <Link
            to="/kontakt"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
              text-white bg-akzent-500/90 border border-akzent-400/30
              hover:bg-akzent-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-akzent-400"
          >
            Kontakt
          </Link>

          {/* Hamburger (Mobile) */}
          <button
            onClick={mobileMenuToggle}
            aria-label={mobileMenuOffen ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={mobileMenuOffen}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-white/5 transition"
          >
            <motion.span
              animate={mobileMenuOffen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              className="block w-5 h-px bg-white/70 origin-center"
              transition={{ duration: 0.25 }}
            />
            <motion.span
              animate={mobileMenuOffen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              className="block w-5 h-px bg-white/70"
              transition={{ duration: 0.2 }}
            />
            <motion.span
              animate={mobileMenuOffen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              className="block w-5 h-px bg-white/70 origin-center"
              transition={{ duration: 0.25 }}
            />
          </button>
        </nav>
      </header>

      {/* Mobile Menu (außerhalb des Headers) */}
      <MobileMenu eintraege={NAV_EINTRAEGE} />
    </>
  );
}
