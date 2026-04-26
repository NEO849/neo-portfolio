// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: GlassTabs
// Wiederverwendbare Tab-Leiste — identisches Verhalten auf Mobile/Desktop.
// Verwendet in: SecurityView, ZeugnisseView (und zukünftigen Sektionen).
//
// Technische Garantien:
//  · flex + overflow-x-auto auf dem Container-Element selbst
//    → Browser behandelt min-content der Flex-Items als Scroll-Grenze
//  · min-w-[80px] + flex-1: auf Desktop gleichmäßige Verteilung,
//    auf Mobile scrollen wenn Summe > Viewport
//  · Kein overflow-x-hidden-Ancestor darf diese Komponente umhüllen
//    (iOS Safari würde Child-Scroll unterdrücken)
//  · Framer Motion layoutId: muss pro Usage-Stelle eindeutig sein
//  · ARIA: role=tablist / role=tab / aria-selected / roving tabindex
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
  ariaLabel?: string;
}

export function GlassTabs({
  tabs,
  activeId,
  onTabChange,
  layoutId = "glass-tab-bg",
  className = "",
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
      className={`flex gap-1.5 p-1.5 rounded-2xl bg-white/[0.025] border border-white/[0.05] overflow-x-auto scrollbar-none ${className}`}
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
          className={`relative flex-1 min-w-[80px] px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors duration-200 flex items-center justify-center ${
            activeId === tab.id
              ? "text-white"
              : "text-white/45 hover:text-white/75"
          }`}
        >
          {activeId === tab.id && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-akzent-500/20 to-cyber-500/10 border border-akzent-500/25"
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
