// ═══════════════════════════════════════════════════════════════════
// VIEW: Demo — Prompt-Injection zum Anfassen (simuliert, clientseitig).
// ═══════════════════════════════════════════════════════════════════

import { AbschnittsTitel } from "../bausteine/AbschnittsTitel";
import { InjektionsDemo } from "../bausteine/InjektionsDemo";

export default function DemoView() {
  return (
    <section id="demo" className="py-16 px-6 max-w-3xl mx-auto">
      <AbschnittsTitel
        prefix="> demo"
        untertitel="Prompt-Injection ist der häufigste Angriff auf KI-Systeme. Hier sehen Sie dieselbe Attacke gegen einen ungeschützten und einen abgesicherten Bot — nebeneinander, in Ihrem Browser."
        klassen="mb-8"
      />
      <InjektionsDemo />
      <p className="mt-6 text-sm leading-relaxed text-white/55">
        Genau diesen Unterschied stelle ich bei einem KI-Sicherheits-Check her: Ich finde die Wege, auf denen
        sich ein System aus der Spur bringen lässt, und sorge dafür, dass es wie der rechte Bot reagiert.
      </p>
    </section>
  );
}
