// ═══════════════════════════════════════════════════════════════════
// BAUSTEIN: DatenschutzModal
// Einwilligungsdialog vor sensiblen OSINT-Tools.
// Muss aktiv bestätigt werden — kein Auto-Close.
// ═══════════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DatenschutzModalProps {
  offen: boolean;
  modulName: string;
  hinweise: string[];
  onBestaetigen: () => void;
  onAbbrechen: () => void;
}

export function DatenschutzModal({
  offen,
  modulName,
  hinweise,
  onBestaetigen,
  onAbbrechen,
}: DatenschutzModalProps) {
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
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={handleAbbrechen}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md rounded-2xl border border-signal-gelb/20 bg-[#0d0d1a] shadow-2xl shadow-black/60"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-white/5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-signal-gelb/10 border border-signal-gelb/20 flex items-center justify-center flex-shrink-0 text-base">
                    ⚠
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-white">
                      Datenschutzhinweis
                    </h3>
                    <p className="text-xs text-white/40 mt-0.5 font-mono">
                      {modulName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hinweise */}
              <div className="px-6 py-4 space-y-3">
                <p className="text-sm text-white/60 leading-relaxed">
                  Bevor du dieses Tool nutzt, beachte folgende Hinweise:
                </p>
                <ul className="space-y-2">
                  {hinweise.map((hinweis, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-white/70">
                      <span className="text-signal-gelb/70 flex-shrink-0 mt-0.5">›</span>
                      <span>{hinweis}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/8">
                  <p className="text-xs text-white/40 leading-relaxed">
                    <span className="text-white/60 font-medium">Technischer Hinweis:</span>{" "}
                    Die eingegebenen Daten werden einmalig zur Analyse an den Server gesendet
                    und danach nicht gespeichert. Es werden ausschließlich öffentlich
                    zugängliche Datenquellen verwendet.
                  </p>
                </div>
              </div>

              {/* Checkbox */}
              <div className="px-6 pb-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={bestaetigt}
                      onChange={(e) => setBestaetigt(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      bestaetigt
                        ? "bg-akzent-500 border-akzent-400"
                        : "border-white/20 bg-white/5 group-hover:border-white/40"
                    }`}>
                      {bestaetigt && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-white/60 leading-relaxed group-hover:text-white/80 transition">
                    Ich habe die Datenschutzhinweise gelesen und verstanden.
                    Ich bin einverstanden und nutze dieses Tool auf eigene Verantwortung.
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={handleBestaetigen}
                  disabled={!bestaetigt}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    bestaetigt
                      ? "bg-akzent-500/20 border border-akzent-400/40 text-akzent-400 hover:bg-akzent-500/30"
                      : "bg-white/5 border border-white/10 text-white/25 cursor-not-allowed"
                  }`}
                >
                  Tool starten
                </button>
                <button
                  onClick={handleAbbrechen}
                  className="px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 transition"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
