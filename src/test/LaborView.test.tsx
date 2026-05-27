// ═══════════════════════════════════════════════════════
// TEST: LaborView Smoke-Tests
//
// Stellt sicher, dass /labor ohne Errors rendert und alle 5 Acts
// (Tabs) zugänglich sind. Fängt Daten-zu-View-Drift ab.
// ═══════════════════════════════════════════════════════

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LaborView from '../views/LaborView';

function renderLabor() {
  return render(
    <MemoryRouter initialEntries={['/labor']}>
      <LaborView />
    </MemoryRouter>
  );
}

describe('LaborView — Render-Smoke-Tests', () => {
  it('rendert ohne Crash', () => {
    renderLabor();
    expect(screen.getByText(/labor_senior_elite/i)).toBeInTheDocument();
  });

  it('zeigt alle 5 Tab-Labels in der Tabnavigation', () => {
    renderLabor();
    expect(screen.getByRole('tab', { name: 'Memory v2' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'MCP-Arsenal' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Workflows' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Commands & Skills' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Hard-Gates' })).toBeInTheDocument();
  });

  it('hat genau einen aktiven Tab (Default: Memory v2)', () => {
    renderLabor();
    const aktive = screen.getAllByRole('tab').filter(
      (el) => el.getAttribute('aria-selected') === 'true'
    );
    expect(aktive).toHaveLength(1);
    expect(aktive[0]).toHaveTextContent('Memory v2');
  });

  it('Memory-Act zeigt alle 5 Tier-Namen (Core/Deep/Archival/Recall/Staging)', () => {
    renderLabor();
    // Default-Tab ist Memory v2 — alle Tiers sollten sichtbar sein
    expect(screen.getByText('Core')).toBeInTheDocument();
    expect(screen.getByText('Deep')).toBeInTheDocument();
    expect(screen.getByText('Archival')).toBeInTheDocument();
    expect(screen.getByText('Recall')).toBeInTheDocument();
    expect(screen.getByText('Staging')).toBeInTheDocument();
  });

  it('Elite-Prinzipien-Section ist sichtbar', () => {
    renderLabor();
    expect(screen.getByText(/elite-prinzipien/i)).toBeInTheDocument();
  });
});
