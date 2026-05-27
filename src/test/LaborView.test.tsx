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
    // AbschnittsTitel rendert Prefix mit '>' das als entity escaped wird —
    // also nach reinem "labor" suchen (case-insensitive)
    expect(screen.getByText(/^labor$/i)).toBeInTheDocument();
  });

  it('zeigt alle 5 Tab-Labels in der Tabnavigation', () => {
    renderLabor();
    expect(screen.getByRole('tab', { name: 'Memory' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'MCPs' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Workflows' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Commands' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Hard-Gates' })).toBeInTheDocument();
  });

  it('hat genau einen aktiven Tab (Default: Memory)', () => {
    renderLabor();
    const aktive = screen.getAllByRole('tab').filter(
      (el) => el.getAttribute('aria-selected') === 'true'
    );
    expect(aktive).toHaveLength(1);
    expect(aktive[0]).toHaveTextContent('Memory');
  });

  it('Memory-Act zeigt alle 5 Tier-Namen (Core/Deep/Archival/Recall/Staging)', () => {
    renderLabor();
    // Default-Tab ist Memory — alle Tiers sollten sichtbar sein
    expect(screen.getByText('Core')).toBeInTheDocument();
    expect(screen.getByText('Deep')).toBeInTheDocument();
    expect(screen.getByText('Archival')).toBeInTheDocument();
    expect(screen.getByText('Recall')).toBeInTheDocument();
    expect(screen.getByText('Staging')).toBeInTheDocument();
  });

  it('Leitprinzipien-Section ist sichtbar', () => {
    renderLabor();
    expect(screen.getByText(/leitprinzipien/i)).toBeInTheDocument();
  });

  it('Memory-Tier-Karten haben Aufklapp-Button (aria-expanded)', () => {
    renderLabor();
    // Jeder Tier hat einen Button mit aria-expanded="false" (default zu)
    const buttons = screen.getAllByRole('button').filter(
      (el) => el.getAttribute('aria-expanded') === 'false'
    );
    expect(buttons.length).toBeGreaterThanOrEqual(5); // mindestens die 5 Memory-Tiers
  });
});
