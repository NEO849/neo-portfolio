/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        grund: { 950: '#06080f', 900: '#0a0e1a', 800: '#111827' },
        akzent: { 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5' },
        cyber: { 400: '#22d3ee', 500: '#06b6d4' },
        signal: { rot: '#ef4444', gelb: '#f59e0b', gruen: '#22c55e' },
      },
      animation: {
        'puls-langsam': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'einblenden': 'einblenden 0.6s ease-out forwards',
      },
      keyframes: {
        einblenden: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
