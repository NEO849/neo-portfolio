// ═══════════════════════════════════════════════════════
// TEST: Hilfsmittel — Validierung
//
// Reine Validierungsfunktionen aus hilfsmittel/validierung.ts.
// Diese Schicht entscheidet, ob eine Nutzereingabe die Grenze
// passieren darf (Karte 4.4: Allowlist an der Grenze). Deshalb
// werden hier bewusst auch die Fehlerpfade geprüft, nicht nur
// der Glücksfall (Karte 4.5).
// ═══════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  istGueltigeEmail,
  istGueltigeDomain,
  extrahiereDomain,
  istGueltigerUsername,
  nichtLeer,
  validiereEingabe,
} from "../hilfsmittel/validierung";

describe("validierung.ts — Eingabe-Grenzkontrolle", () => {
  describe("istGueltigeEmail", () => {
    it("akzeptiert eine normale Adresse", () => {
      expect(istGueltigeEmail("michael@f3-data-solutions.com")).toBe(true);
    });

    it("toleriert umschließende Leerzeichen (wird getrimmt)", () => {
      expect(istGueltigeEmail("  kontakt@beispiel.de  ")).toBe(true);
    });

    it("lehnt Adresse ohne @ ab", () => {
      expect(istGueltigeEmail("kein-at-zeichen.de")).toBe(false);
    });

    it("lehnt Adresse ohne Domain-Punkt ab", () => {
      expect(istGueltigeEmail("nutzer@localhost")).toBe(false);
    });

    it("lehnt internes Leerzeichen ab", () => {
      expect(istGueltigeEmail("nut zer@beispiel.de")).toBe(false);
    });

    it("lehnt den leeren String ab", () => {
      expect(istGueltigeEmail("")).toBe(false);
    });
  });

  describe("istGueltigeDomain", () => {
    it("akzeptiert eine einfache Domain", () => {
      expect(istGueltigeDomain("beispiel.de")).toBe(true);
    });

    it("akzeptiert eine Subdomain", () => {
      expect(istGueltigeDomain("www.f3-data-solutions.com")).toBe(true);
    });

    it("entfernt das Schema vor der Prüfung", () => {
      expect(istGueltigeDomain("https://beispiel.de")).toBe(true);
    });

    it("entfernt einen angehängten Pfad", () => {
      expect(istGueltigeDomain("beispiel.de/pfad/zur/seite")).toBe(true);
    });

    it("lehnt eine Domain ohne TLD ab", () => {
      expect(istGueltigeDomain("beispiel")).toBe(false);
    });

    it("lehnt einen reinen Punkt ab", () => {
      expect(istGueltigeDomain(".")).toBe(false);
    });
  });

  describe("extrahiereDomain", () => {
    it("zieht den Hostnamen aus einer vollständigen URL", () => {
      expect(extrahiereDomain("https://www.beispiel.de/pfad?q=1")).toBe(
        "www.beispiel.de",
      );
    });

    it("ergänzt fehlendes Schema und liefert den Hostnamen", () => {
      expect(extrahiereDomain("beispiel.de/pfad")).toBe("beispiel.de");
    });

    it("fällt bei unparsbarer Eingabe auf die bereinigte Form zurück", () => {
      // Leerzeichen macht new URL() ungültig → catch-Zweig greift.
      expect(extrahiereDomain("kein valider host")).toBe("kein valider host");
    });
  });

  describe("istGueltigerUsername", () => {
    it("akzeptiert alphanumerisch mit - _ .", () => {
      expect(istGueltigerUsername("michael_fleps-85.x")).toBe(true);
    });

    it("lehnt zu kurzen Namen ab (< 2 Zeichen)", () => {
      expect(istGueltigerUsername("a")).toBe(false);
    });

    it("lehnt verbotene Sonderzeichen ab", () => {
      expect(istGueltigerUsername("nutzer!name")).toBe(false);
    });
  });

  describe("nichtLeer", () => {
    it("erkennt echten Inhalt", () => {
      expect(nichtLeer(" x ")).toBe(true);
    });

    it("erkennt reine Leerzeichen als leer", () => {
      expect(nichtLeer("   ")).toBe(false);
    });
  });

  describe("validiereEingabe — liefert Fehlermeldung oder undefined", () => {
    it("meldet Pflichtfeld bei leerer Eingabe", () => {
      expect(validiereEingabe("email", "  ")).toBe("Pflichtfeld");
    });

    it("gibt undefined bei gültiger E-Mail zurück", () => {
      expect(validiereEingabe("email", "ok@beispiel.de")).toBeUndefined();
    });

    it("meldet ungültige E-Mail", () => {
      expect(validiereEingabe("email", "kaputt")).toBe(
        "Ungültige E-Mail-Adresse",
      );
    });

    it("meldet ungültige Domain", () => {
      expect(validiereEingabe("domain", "kaputt")).toBe(
        "Ungültige Domain (z.B. example.com)",
      );
    });

    it("meldet ungültigen Username", () => {
      expect(validiereEingabe("username", "!!")).toBe(
        "Ungültiger Username (2–50 Zeichen, a-z, 0-9, _ -)",
      );
    });

    it("lässt freien Text immer durch (nur Pflichtfeld-Prüfung)", () => {
      expect(validiereEingabe("text", "beliebiger inhalt")).toBeUndefined();
    });
  });
});
