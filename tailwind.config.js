/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Manrope"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Tiefes Navy/Graphit — Premium-Materialbasis
        grund: { 950: '#070a12', 900: '#0b0f1a', 800: '#141a28', 700: '#1d2536' },
        // EIN Akzent: Azur-Blau (Vertrauen/Technologie, nicht Neon)
        akzent: { 300: '#a9c4ff', 400: '#7aa2ff', 500: '#4f7cfb', 600: '#3b62e6', 700: '#2f4fc4' },
        // "cyber" entneont → gedämpftes Stahlblau (Alt-Verwendungen softening)
        cyber: { 400: '#8aa0c8', 500: '#5b6f99' },
        signal: { rot: '#f1646c', gelb: '#f5b544', gruen: '#34d399' },
      },
      boxShadow: {
        // Weiche, mehrlagige Elevation — Apple-Materialität statt harter Glows
        'tief-1': '0 1px 2px rgba(0,0,0,0.30), 0 1px 1px rgba(0,0,0,0.20)',
        'tief-2': '0 4px 12px rgba(0,0,0,0.28), 0 1px 3px rgba(0,0,0,0.24)',
        'tief-3': '0 12px 32px rgba(0,0,0,0.34), 0 4px 10px rgba(0,0,0,0.22)',
        'tief-4': '0 24px 64px rgba(0,0,0,0.42), 0 8px 20px rgba(0,0,0,0.24)',
        // Akzent-Aura — sehr subtil, kein Neon
        'aura': '0 0 0 1px rgba(79,124,251,0.14), 0 20px 60px rgba(79,124,251,0.08)',
      },
      borderRadius: {
        'xl2': '1.125rem',
        '2xl2': '1.375rem',
        '3xl2': '1.75rem',
      },
      transitionTimingFunction: {
        sanft: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        expressiv: 'cubic-bezier(0.16, 1, 0.3, 1)',
        praezise: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'puls-langsam': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'einblenden': 'einblenden 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'aurora-drift': 'aurora-drift 28s ease-in-out infinite',
        'band-laufen': 'band-laufen 40s linear infinite',
      },
      keyframes: {
        einblenden: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'aurora-drift': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(2%, -2%, 0) scale(1.06)' },
        },
        'band-laufen': {
          '0%': { transform: 'translate3d(0,0,0)' },
          '100%': { transform: 'translate3d(-50%,0,0)' },
        },
      },
    },
  },
  plugins: [],
}
