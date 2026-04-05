/** @type {import('tailwindcss').Config} */
export default {
  // 'class' strategy: dark mode is toggled by adding the 'dark' class to <html>
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // ── Font Families ─────────────────────────────────────────────────
      fontFamily: {
        // Headings and UI labels use Outfit (geometric, modern)
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        // All monetary values and data use DM Mono (tabular, precise)
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
      },

      // ── Custom Colors ──────────────────────────────────────────────────
      colors: {
        // Brand violet-indigo accent
        violet: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          900: '#4c1d95',
        },
        // Sidebar near-black
        ink: {
          900: '#0d1117',
          800: '#161b22',
          700: '#21262d',
          600: '#30363d',
          400: '#8b949e',
          200: '#c9d1d9',
        },
      },

      // ── Box Shadows ────────────────────────────────────────────────────
      boxShadow: {
        card:    '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-md': '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)',
        'card-lg': '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.08)',
      },

      // ── Animation Keyframes ────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%':   { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in':   'fade-in 0.3s ease-out forwards',
        'slide-in':  'slide-in 0.3s ease-out forwards',
        'scale-in':  'scale-in 0.2s ease-out forwards',
      },

      // ── Border Radius ──────────────────────────────────────────────────
      borderRadius: {
        xl:  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};