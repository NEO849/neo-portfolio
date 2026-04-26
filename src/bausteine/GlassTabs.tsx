// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: GlassTabs
// Wiederverwendbare Tab-Leiste — zwei Modi:
//
// scrollable=true (Default, SecurityView):
//   · overflow-x-auto — scrollt wenn Summe der Buttons > Container
//   · min-w-[80px] px-4 text-sm — kurze Labels passen nativ rein
//
// scrollable=false (ZeugnisseView, lange Labels):
//   · overflow-hidden am Container — kein Scroll möglich
//   · min-w-0 am Button — Flex teilt Breite exakt gleich auf (1/n)
//   · overflow-hidden am Button — Clip-Sicherheit wenn Text zu breit
//   · buttonClassName steuert Font + Padding: auf Mobile verkleinern
//     bis Label sicher in den Slot passt (text-[11px] px-1.5)
//   · Kein overflow-x-hidden-Ancestor (iOS Safari unterdrückt sonst Child-Scroll)
//   · Framer Motion layoutId: pro Usage-Stelle eindeutig wählen
//   · ARIA: role=tablist / role=tab / aria-selected / roving tabindex
// ═══════════════════════════════════════════════════════════════════

import { useRef } from "react";
import { motion } from "framer-motion";

export interface GlassTab {
  readonly id: string;
  readonly label: string;
}

interface GlassTabsProps {
  tabs: readonly GlassTab[];
  activeId: string;
  onTabChange: (id: string) => void;
  layoutId?: string;
  className?: string;
  /** Tailwind-Klassen für Breite + Padding der einzelnen Buttons.
   *  Default "min-w-[80px] px-4 text-sm" (scrollable=true, kurze Labels).
   *  Für gleichmäßige Vollbreite ohne Scroll: "min-w-0 px-1.5 sm:px-4 text-[11px] sm:text-sm" */
  buttonClassName?: string;
  /** false → kein horizontales Scrollen, alle Tabs verteilen sich gleichmäßig über die volle Breite */
  scrollable?: boolean;
  ariaLabel?: string;
}

export function GlassTabs({
  tabs,
  activeId,
  onTabChange,
  layoutId = "glass-tab-bg",
  className = "",
  buttonClassName = "min-w-[80px] px-4 text-sm",
  scrollable = true,
  ariaLabel,
}: GlassTabsProps) {
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = tabs.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    onTabChange(tabs[next].id);
    btnRefs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex gap-1.5 p-1.5 rounded-2xl bg-white/[0.025] border border-white/[0.05] ${scrollable ? "overflow-x-auto scrollbar-none" : "overflow-hidden"} ${className}`}
    >
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={(el) => { btnRefs.current[index] = el; }}
          role="tab"
          aria-selected={activeId === tab.id}
          tabIndex={activeId === tab.id ? 0 : -1}
          onClick={() => onTabChange(tab.id)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className={`relative flex-1 ${buttonClassName} py-2 rounded-xl font-medium whitespace-nowrap transition-colors duration-200 flex items-center justify-center overflow-hidden ${
            activeId === tab.id
              ? "text-white"
              : "text-white/45 hover:text-white/75"
          }`}
        >
          {activeId === tab.id && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-akzent-500/20 to-cyber-500/10 border border-akzent-500/25"
              transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.8 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
