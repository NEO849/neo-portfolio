// ═══════════════════════════════════════════════════════════════════
// VIEW: Vorgehensweise — "Sichere KI-Automation von Anfang bis Ende"
// Macht die Arbeitsweise für Kunden sichtbar: der interaktive Prozess-
// Graph (ProzessFluss) mit dem Security-Gate als festem Glied der Kette.
// ═══════════════════════════════════════════════════════════════════

import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { ProzessFluss } from "../bausteine/ProzessFluss";

export default function VorgehensweiseView() {
  return (
    <section id="vorgehensweise" className="py-16 px-6 max-w-5xl mx-auto">
      <AbschnittsTitel
        prefix="> vorgehensweise"
        untertitel="Vier Phasen von der ersten Idee bis zum laufenden Betrieb. Sicherheit ist dabei kein letzter Schritt, sondern ein festes Glied der Kette — das macht „von Anfang bis Ende“ konkret."
        klassen="mb-8"
      />
      <ProzessFluss />
      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-white/50">
        Tippen Sie auf eine Phase, um zu sehen, was darin passiert — und wie die Absicherung
        in jedem Schritt mitläuft, nicht erst am Ende.
      </p>
    </section>
  );
}
