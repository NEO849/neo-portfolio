// ═══════════════════════════════════════════════════════════════════
// BEREICH: MobileMenu
// Ausfahrendes Menü für mobile Geräte.
// Animiert sich mit dem Motion-System ein und aus.
// ═══════════════════════════════════════════════════════════════════

import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePortfolioZustand } from "../../zustaende/portfolioZustand";
import { MOBILE_MENU, MOBILE_MENU_EINTRAG } from "../../bewegung/varianten";

interface NavEintrag {
  readonly pfad: string;
  readonly label: string;
}

interface MobileMenuProps {
  eintraege: NavEintrag[];
}

export function MobileMenu({ eintraege }: MobileMenuProps) {
  const { mobileMenuOffen, mobileMenuSchliessen } = usePortfolioZustand();

  return (
    <AnimatePresence>
      {mobileMenuOffen && (
        <>
          {/* Hintergrund-Overlay zum Schließen */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={mobileMenuSchliessen}
          />

          {/* Menü-Panel */}
          <motion.nav
            key="panel"
            variants={MOBILE_MENU}
            initial="geschlossen"
            animate="offen"
            exit="geschlossen"
            className="md:hidden fixed top-16 left-4 right-4 z-50 glass-stark py-3 px-2"
          >
            {eintraege.map((eintrag, index) => (
              <motion.div
                key={eintrag.pfad}
                custom={index}
                variants={MOBILE_MENU_EINTRAG}
                initial="geschlossen"
                animate="offen"
                exit="geschlossen"
              >
                <NavLink
                  to={eintrag.pfad}
                  end={eintrag.pfad === "/"}
                  onClick={mobileMenuSchliessen}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                    transition-colors duration-200
                    ${isActive
                      ? "text-white bg-akzent-500/10 border border-akzent-400/20"
                      : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          isActive ? "bg-akzent-400" : "bg-white/20"
                        }`}
                      />
                      {eintrag.label}
                    </>
                  )}
                </NavLink>
              </motion.div>
            ))}
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
