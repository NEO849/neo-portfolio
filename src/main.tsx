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
import "./styles/global.css";

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
