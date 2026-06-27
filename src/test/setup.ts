// ═══════════════════════════════════════════════════════
// TEST: globales Setup für Vitest
// Wird vor jeder Test-Suite ausgeführt (siehe vite.config.ts).
// ═══════════════════════════════════════════════════════

import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Nach jedem Test DOM zurücksetzen, damit Tests isoliert sind
afterEach(() => {
  cleanup();
});

// IntersectionObserver/ResizeObserver gibt's in jsdom nicht — Framer-Motion
// benutzt sie für whileInView. Wir stubben sie damit Komponenten gerendert
// werden ohne zu crashen.
class IntersectionObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
  root = null;
  rootMargin = '';
  thresholds: ReadonlyArray<number> = [];
}

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);
vi.stubGlobal('ResizeObserver', ResizeObserverStub);

// matchMedia stub für prefers-reduced-motion-Queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});

// scrollTo stub (manche Komponenten triggern beim Mount)
window.scrollTo = vi.fn();

// scrollIntoView gibt's in jsdom nicht — das PeekKarussell ruft es beim
// programmatischen Zentrieren (Dot/Pfeil/Nachbar-Tap) auf.
Element.prototype.scrollIntoView = vi.fn();
