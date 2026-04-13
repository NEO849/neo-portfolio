import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DatenschutzModalProps {
  offen: boolean;
  modulName: string;
  hinweise: string[];
  onBestaetigen: () => void;
  onAbbrechen: () => void;
}

export function DatenschutzModal({ offen, modulName, hinweise, onBestaetigen, onAbbrechen }: DatenschutzModalProps) {
  const [bestaetigt, setBestaetigt] = useState(false);

  const handleBestaetigen = () => {
    if (!bestaetigt) return;
    setBestaetigt(false);
    onBestaetigen();
  };

  const handleAbbrechen = () => {
    setBestaetigt(false);
    onAbbrechen();
  };

  return (
    <AnimatePresence>
      {offen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50"
            onClick={handleAbbrechen}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-sm rounded-2xl border border-signal-gelb/20 bg-[#0e0e1c] shadow-2xl shadow-black/70"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 pt-5 pb-3 flex items-center gap-3 border-b border-white/6">
                <div className="w-8 h-8 rounded-xl bg-signal-gelb/10 border border-signal-gelb/20 flex items-center justify-center flex-shrink-0 text-sm">⚠</div>
                <div>
                  <h3 className="font-display text-sm font-bold text-white">Datenschutzhinweis</h3>
                  <p className="text-xs text-white/35 font-mono mt-0.5">{modulName}</p>
                </div>
              </div>

              {/* Hinweise — kompakt */}
              <div className="px-5 py-4 space-y-1.5">
                {hinweise.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-white/55">
                    <span className="text-signal-gelb/60 flex-shrink-0 mt-px">›</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              {/* Checkbox + Buttons */}
              <div className="px-5 pb-5 space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input type="checkbox" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} className="sr-only" />
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      bestaetigt ? "bg-akzent-500 border-akzent-400" : "border-white/20 bg-white/5 group-hover:border-white/40"
                    }`}>
                      {bestaetigt && (
                        <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-white/50 leading-relaxed group-hover:text-white/70 transition">
                    Ich habe die Hinweise gelesen und nutze das Tool auf eigene Verantwortung.
                  </span>
                </label>

                <div className="flex gap-2">
                  <button
                    onClick={handleBestaetigen}
                    disabled={!bestaetigt}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                      bestaetigt
                        ? "bg-akzent-500/20 border border-akzent-400/40 text-akzent-400 hover:bg-akzent-500/30"
                        : "bg-white/4 border border-white/8 text-white/20 cursor-not-allowed"
                    }`}
                  >
                    Starten
                  </button>
                  <button
                    onClick={handleAbbrechen}
                    className="px-4 py-2 rounded-xl text-xs text-white/40 hover:text-white/70 transition"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
