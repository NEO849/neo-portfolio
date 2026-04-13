// ═══════════════════════════════════════════════════════════════════
// APP: App
// Wurzel-Komponente. Montiert Navigation, Routen und Fußzeile.
// Der BrowserRouter kommt aus main.tsx (außerhalb von App).
// ═══════════════════════════════════════════════════════════════════

import { HauptNavigation } from "../bereiche/navigation/HauptNavigation";
import { Fusszeile } from "../bereiche/fusszeile/Fusszeile";
import { Routen } from "./Routen";

export default function App() {
  return (
    <>
      <HauptNavigation />
      <main>
        <Routen />
      </main>
      <Fusszeile />
    </>
  );
}
