// ═══════════════════════════════════════════════════════
// TEST: Daten-Konsistenz (Single Source of Truth)
//
// Diese Tests sichern die Invarianten der Senior-Elite-Daten-Schicht
// in models/daten.ts. Sie fangen Daten-Drift ab BEVOR er in
// Production landet.
// ═══════════════════════════════════════════════════════

import { describe, it, expect } from 'vitest';
import {
  PROJEKTE,
  ZEITSTRAHL,
  NAVIGATION,
  PIPELINE_SCHRITTE,
  SCORING_KATEGORIEN,
  SECURITY_STATS,
  SYSTEM_STATS,
  MEMORY_TIERS,
  MCP_KATEGORIEN,
  AUTO_WORKFLOWS,
  SLASH_COMMANDS,
  CUSTOM_SKILLS,
  HARD_GATES,
  DA_PATTERNS,
  ELITE_PRINZIPIEN,
} from '../models/daten';

describe('daten.ts — Senior-Elite Invarianten', () => {
  describe('Navigation', () => {
    it('enthält den Labor-Eintrag', () => {
      const eintrag = NAVIGATION.find((n) => n.abschnitt === 'labor');
      expect(eintrag).toBeDefined();
      expect(eintrag?.label).toBe('Labor');
    });
  });

  describe('Projekte', () => {
    it('hat mindestens die 4 neuen Senior-Elite-Projekte', () => {
      const titel = PROJEKTE.map((p) => p.titel);
      expect(titel.some((t) => t.includes('Memory System v2'))).toBe(true);
      expect(titel.some((t) => t.includes('claude-bus'))).toBe(true);
      expect(titel.some((t) => t.includes('voice-bridge'))).toBe(true);
      expect(titel.some((t) => t.includes('bb_recon'))).toBe(true);
    });

    it('jedes Projekt hat alle Pflichtfelder', () => {
      for (const p of PROJEKTE) {
        expect(p.titel).toBeTruthy();
        expect(p.kurzbeschreibung).toBeTruthy();
        expect(p.langbeschreibung).toBeTruthy();
        expect(p.kategorie).toMatch(/^(security|development|tooling)$/);
        expect(p.technologien.length).toBeGreaterThan(0);
        expect(p.highlights.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Zeitstrahl', () => {
    it('jede Station mit Modulen hat befüllte Sektionen und Chips', () => {
      for (const eintrag of ZEITSTRAHL) {
        if (!eintrag.module) continue;
        for (const modul of eintrag.module) {
          expect(modul.name).toBeTruthy();
          expect(modul.skills.length).toBeGreaterThan(0);
        }
      }
    });

    it('die BERUF-Station zeigt Projekt-Referenzen als Chips', () => {
      const beruf = ZEITSTRAHL.find((e) => e.kategorie === 'beruf');
      expect(beruf).toBeDefined();
      expect(beruf?.module?.length ?? 0).toBeGreaterThan(0);
      // jedes Projekt-Modul trägt mindestens einen Chip
      for (const modul of beruf?.module ?? []) {
        expect(modul.skills.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Memory-System v2 (5 Tiers)', () => {
    it('hat exakt 5 Tiers in der MemGPT-Reihenfolge', () => {
      expect(MEMORY_TIERS).toHaveLength(5);
      const tiers = MEMORY_TIERS.map((t) => t.tier);
      expect(tiers).toEqual(['Core', 'Deep', 'Archival', 'Recall', 'Staging']);
    });

    it('jeder Tier hat farbeRgb in "R, G, B" Format', () => {
      const rgbPattern = /^\d{1,3},\s*\d{1,3},\s*\d{1,3}$/;
      for (const t of MEMORY_TIERS) {
        expect(t.farbeRgb).toMatch(rgbPattern);
      }
    });
  });

  describe('MCP-Arsenal', () => {
    it('hat 4 fokussierte Kategorien (Recon · Reasoning · Web/App/Mobile · Cloud/Dev)', () => {
      expect(MCP_KATEGORIEN).toHaveLength(4);
    });

    it('Summe aller MCPs ist ≥ 20 (Stand 2026-05-27)', () => {
      const total = MCP_KATEGORIEN.reduce((sum, k) => sum + k.mcps.length, 0);
      expect(total).toBeGreaterThanOrEqual(20);
    });

    it('Eigenbau-MCPs sind als solche markiert (mind. 2: censys + caido)', () => {
      const eigenbau = MCP_KATEGORIEN.flatMap((k) => k.mcps).filter((m) => m.eigenbau);
      expect(eigenbau.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Auto-Workflows', () => {
    it('hat sowohl Timers als auch Services', () => {
      const timers = AUTO_WORKFLOWS.filter((w) => w.typ === 'timer');
      const services = AUTO_WORKFLOWS.filter((w) => w.typ === 'service');
      expect(timers.length).toBeGreaterThan(0);
      expect(services.length).toBeGreaterThan(0);
    });

    it('Hacktivity-Stream und claude-bus laufen', () => {
      const namen = AUTO_WORKFLOWS.map((w) => w.name);
      expect(namen).toContain('hacktivity-stream.timer');
      expect(namen).toContain('claude-bus.service');
    });
  });

  describe('Slash-Commands', () => {
    it('hat exakt 11 Custom Slash-Commands', () => {
      expect(SLASH_COMMANDS).toHaveLength(11);
    });

    it('/submit-gate und /new-target sind Hard-Rules', () => {
      const submitGate = SLASH_COMMANDS.find((c) => c.cmd === '/submit-gate');
      const newTarget = SLASH_COMMANDS.find((c) => c.cmd === '/new-target');
      expect(submitGate?.hardRule).toBe(true);
      expect(newTarget?.hardRule).toBe(true);
    });
  });

  describe('Custom Skills', () => {
    it('hat exakt 11 Skills', () => {
      expect(CUSTOM_SKILLS).toHaveLength(11);
    });

    it('Master-Skills enthalten /research', () => {
      const research = CUSTOM_SKILLS.find((s) => s.name === 'research');
      expect(research).toBeDefined();
      expect(research?.gruppe).toBe('master-skill');
    });
  });

  describe('Hard-Gates', () => {
    it('hat exakt 12 Submit-Hard-Gates', () => {
      expect(HARD_GATES).toHaveLength(12);
    });

    it('Nummerierung ist fortlaufend 1-12 ohne Lücken', () => {
      const nummern = HARD_GATES.map((g) => g.nummer).sort((a, b) => a - b);
      expect(nummern).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });
  });

  describe('Devil\'s Advocate Patterns', () => {
    it('hat genau die 5 dokumentierten Anti-Patterns', () => {
      expect(DA_PATTERNS).toHaveLength(5);
    });
  });

  describe('Stats konsistent', () => {
    it('SYSTEM_STATS und SECURITY_STATS sind beide 8 Items (Grid-Anforderung)', () => {
      expect(SYSTEM_STATS).toHaveLength(8);
      expect(SECURITY_STATS).toHaveLength(8);
    });

    it('SYSTEM_STATS-Werte konsistent mit Daten-Quellen', () => {
      const findStat = (label: string) =>
        SYSTEM_STATS.find((s) => s.label === label)?.wert;

      // Slash-Commands sind 11 — Stat muss "11" sagen
      expect(findStat('Slash-Commands')).toBe(String(SLASH_COMMANDS.length));
      // Custom Skills sind 11 — Stat muss "11" sagen
      expect(findStat('Custom Skills')).toBe(String(CUSTOM_SKILLS.length));
      // Auto-Workflows sind 12 — Stat muss "12" sagen
      expect(findStat('systemd Workflows')).toBe(String(AUTO_WORKFLOWS.length));
      // Memory-Tiers sind 5 — Stat muss "5" sagen
      expect(findStat('Memory-Tiers')).toBe(String(MEMORY_TIERS.length));
    });
  });

  describe('Elite-Prinzipien', () => {
    it('genau 6 Leitprinzipien', () => {
      expect(ELITE_PRINZIPIEN).toHaveLength(6);
    });
  });

  describe('Bestehende Strukturen unverändert', () => {
    it('Pipeline hat weiterhin 7 Schritte', () => {
      expect(PIPELINE_SCHRITTE).toHaveLength(7);
    });

    it('Scoring-Kategorien sind weiterhin 12', () => {
      expect(SCORING_KATEGORIEN).toHaveLength(12);
    });
  });
});
