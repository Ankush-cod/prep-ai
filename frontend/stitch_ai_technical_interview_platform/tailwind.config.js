/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Stitch Soft Charcoal Surface Palette
        'surface': '#1E2028',
        'surface-dim': '#191B22',
        'surface-bright': '#353946',
        'surface-container-lowest': '#191B22',
        'surface-container-low': '#242731',
        'surface-container': '#242731',
        'surface-container-high': '#292D38',
        'surface-container-highest': '#353946',
        'surface-variant': '#292D38',
        'on-surface': '#F1F2F5',
        'on-surface-variant': '#A1A5B2',
        'outline': '#A1A5B2',
        'outline-variant': '#353946',

        // Primary Accent Tokens (Purple)
        'primary': '#d0bcff',
        'primary-container': '#a078ff',
        'on-primary': '#3c0091',
        'on-primary-container': '#340080',
        'primary-fixed': '#e9ddff',
        'primary-fixed-dim': '#d0bcff',
        'on-primary-fixed': '#23005c',
        'on-primary-fixed-variant': '#5516be',
        'inverse-primary': '#6d3bd7',

        // Secondary Accent Tokens (Cyan)
        'secondary': '#4cd7f6',
        'secondary-container': '#03b5d3',
        'on-secondary': '#003640',
        'on-secondary-container': '#00424e',
        'secondary-fixed': '#acedff',
        'secondary-fixed-dim': '#4cd7f6',
        'on-secondary-fixed': '#001f26',
        'on-secondary-fixed-variant': '#004e5c',

        // Tertiary Accent Tokens (Emerald / Mint)
        'tertiary': '#4edea3',
        'tertiary-container': '#00a572',
        'on-tertiary': '#003824',
        'on-tertiary-container': '#00311f',
        'tertiary-fixed': '#6ffbbe',
        'tertiary-fixed-dim': '#4edea3',
        'on-tertiary-fixed': '#002113',
        'on-tertiary-fixed-variant': '#005236',

        // Error Tokens (Coral / Red)
        'error': '#ffb4ab',
        'error-container': '#93000a',
        'on-error': '#690005',
        'on-error-container': '#ffdad6',

        // Legacy / Compatibility Obsidian Tokens (Softened Charcoal)
        obsidian: {
          bg: '#191B22',
          surface: '#1E2028',
          card: '#242731',
          elevated: '#292D38',
          input: '#20232C',
          border: '#353946',
          hover: 'rgba(255, 255, 255, 0.04)',
        },
        telemetry: {
          purple: {
            DEFAULT: '#8b5cf6',
            hover: '#7c3aed',
            muted: 'rgba(139, 92, 246, 0.15)',
            glow: 'rgba(139, 92, 246, 0.3)',
          },
          cyan: {
            DEFAULT: '#00f0ff',
            muted: 'rgba(0, 240, 255, 0.15)',
          },
          green: {
            DEFAULT: '#10b981',
            muted: 'rgba(16, 185, 129, 0.15)',
          },
          amber: {
            DEFAULT: '#f59e0b',
            muted: 'rgba(245, 158, 11, 0.15)',
          },
          red: {
            DEFAULT: '#ef4444',
            muted: 'rgba(239, 68, 68, 0.15)',
          }
        }
      },
      spacing: {
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '1rem',
        'space-lg': '1.5rem',
        'space-xl': '2rem',
        'space-2xl': '3rem',
        'gutter': '1rem',
        'gutter-desktop': '1.5rem',
        'margin': '1rem',
        'margin-desktop': '2rem',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
        headline: ['Geist', 'sans-serif'],
        body: ['Geist', 'sans-serif'],
      },
      borderRadius: {
        'obsidian': '4px',
      }
    },
  },
  plugins: [],
}
