// ═══════════════════════════════════════════════════════════════════
// EINSTIEGSPUNKT: main.tsx
// Hier startet die gesamte Anwendung.
// BrowserRouter umschließt alles — Router muss am äußersten Rand sein.
// ═══════════════════════════════════════════════════════════════════

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Anbieter } from "./app/Anbieter";
import App from "./app/App";
import { neuLadenGegenStaleChunk } from "./app/chunkSelbstheilung";
import "./gestaltung/global.css";

// Selbstheilung bei veralteten Chunks nach einem Deploy: Vite meldet einen
// fehlgeschlagenen dynamischen Import als `vite:preloadError`. Ein einmaliger,
// Loop-geschützter Hard-Reload holt frisches HTML + frische Chunks.
window.addEventListener("vite:preloadError", () => {
  neuLadenGegenStaleChunk();
});

const wurzelElement = document.getElementById("root");
if (!wurzelElement) throw new Error("Root-Element nicht gefunden");

createRoot(wurzelElement).render(
  <StrictMode>
    <BrowserRouter>
      <Anbieter>
        <App />
      </Anbieter>
    </BrowserRouter>
  </StrictMode>
);
