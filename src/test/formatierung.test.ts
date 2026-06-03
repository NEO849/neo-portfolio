// ═══════════════════════════════════════════════════════
// TEST: Hilfsmittel — Formatierung
//
// Reine, seiteneffektfreie Funktionen aus hilfsmittel/formatierung.ts.
// Schnell, deterministisch, decken die Rand- und Grenzfälle ab
// (Karte 4.5: Grenzfälle testen, nicht nur den Glücksfall).
// ═══════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  kuerze,
  formatierteZahl,
  zuSlug,
  aktuellesJahr,
  klassen,
  zahlwort,
  grossErsterBuchstabe,
} from "../hilfsmittel/formatierung";

describe("formatierung.ts — reine Hilfsfunktionen", () => {
  describe("kuerze", () => {
    it("lässt kurzen Text unverändert", () => {
      expect(kuerze("kurz", 10)).toBe("kurz");
    });

    it("lässt Text exakt auf Grenzlänge unverändert", () => {
      expect(kuerze("12345", 5)).toBe("12345");
    });

    it("kürzt zu langen Text mit Auslassungszeichen", () => {
      // maxZeichen=5 → 4 Zeichen + Ellipsis
      expect(kuerze("123456789", 5)).toBe("1234…");
    });
  });

  describe("formatierteZahl", () => {
    it("setzt deutsche Tausender-Trennung", () => {
      expect(formatierteZahl(1234567)).toBe("1.234.567");
    });

    it("lässt kleine Zahlen unverändert", () => {
      expect(formatierteZahl(42)).toBe("42");
    });
  });

  describe("zuSlug", () => {
    it("wandelt Umlaute und ß korrekt um", () => {
      expect(zuSlug("Über Größe & Spaß")).toBe("ueber-groesse-spass");
    });

    it("kollabiert Sonderzeichen-Folgen zu einem Bindestrich", () => {
      expect(zuSlug("Hallo   Welt!!!")).toBe("hallo-welt");
    });

    it("entfernt führende und schließende Bindestriche", () => {
      expect(zuSlug("  --Rand--  ")).toBe("rand");
    });
  });

  describe("aktuellesJahr", () => {
    it("liefert das laufende Kalenderjahr", () => {
      expect(aktuellesJahr()).toBe(new Date().getFullYear());
    });
  });

  describe("klassen", () => {
    it("verbindet wahre Klassen mit Leerzeichen", () => {
      expect(klassen("a", "b", "c")).toBe("a b c");
    });

    it("filtert falsy-Werte heraus", () => {
      expect(klassen("a", undefined, null, false, "b")).toBe("a b");
    });

    it("liefert leeren String wenn alles falsy ist", () => {
      expect(klassen(undefined, false, null)).toBe("");
    });
  });

  describe("zahlwort", () => {
    it("liefert das deutsche Wort für kleine Zahlen", () => {
      expect(zahlwort(0)).toBe("null");
      expect(zahlwort(3)).toBe("drei");
      expect(zahlwort(4)).toBe("vier");
      expect(zahlwort(12)).toBe("zwölf");
    });

    it("fällt außerhalb 0–12 auf die Ziffer zurück", () => {
      expect(zahlwort(13)).toBe("13");
      expect(zahlwort(99)).toBe("99");
    });
  });

  describe("grossErsterBuchstabe", () => {
    it("macht den ersten Buchstaben groß", () => {
      expect(grossErsterBuchstabe("vier")).toBe("Vier");
    });

    it("lässt bereits großen Anfang unverändert", () => {
      expect(grossErsterBuchstabe("Vier")).toBe("Vier");
    });

    it("verträgt den leeren String", () => {
      expect(grossErsterBuchstabe("")).toBe("");
    });
  });
});
