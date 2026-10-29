/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // "Midnight Marquee" palette
        canvas: '#0B0B10',
        surface: '#12121A',
        raised: { DEFAULT: '#181822', hover: '#20202D' },
        line: 'rgba(255,255,255,0.09)',
        ink: '#F5F3EE',
        muted: '#A19FA8',
        faint: '#6E6C78',
        brand: { DEFAULT: '#FFB224', hover: '#FFC24D', soft: '#FFD98A', deep: '#C98500' },
        'on-brand': '#1A1204',
        velvet: { DEFAULT: '#E63950', soft: '#FF7A8C' },
        paper: { DEFAULT: '#F3E9D2', dark: '#E4D6B6', ink: '#1B1710' },
        seat: { classic: '#7C8DB5', premium: '#3FC1B0', vip: '#F06EAA' }
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"Bebas Neue"', 'Impact', '"Arial Narrow"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      boxShadow: {
        glow: '0 0 28px rgba(255,178,36,0.38)',
        'glow-sm': '0 0 14px rgba(255,178,36,0.32)',
        lift: '0 18px 40px -18px rgba(0,0,0,0.75)'
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'fade-up': { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        bulb: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.35 } },
        'progress-bar': { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
        'beam-flicker': { '0%,100%': { opacity: 0.55 }, '50%': { opacity: 0.7 } }
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'fade-up': 'fade-up 0.55s cubic-bezier(.2,.7,.2,1) both',
        bulb: 'bulb 2.4s ease-in-out infinite',
        'progress-bar': 'progress-bar 6s linear both',
        'beam-flicker': 'beam-flicker 5s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
