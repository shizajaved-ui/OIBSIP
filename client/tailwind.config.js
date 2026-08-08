/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        char: {
          950: '#2F1F17', // roasted coffee bean
          900: '#F9F4EE', // desaturated warm beige (lighter)
          800: '#FFFCF7', // very light cream (cards)
          700: '#F0E9DF', // subtle linen (borders)
          600: '#DCC9A8',
        },
        cream: '#2B2118',
        muted: '#8A7566',
        tomato: {
          DEFAULT: '#C84E29',
          light: '#D66B45',
          dark: '#A83D1F',
        },
        accent: '#C84E29',
        parchment: '#F2E7D5',
        brown: '#2B2118',
        crustorange: '#A83D1F',
        basil: '#5C7A3A',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        ember: '0 8px 24px -6px rgba(200, 78, 41, 0.35)',
        glow: '0 8px 30px -8px rgba(200, 78, 41, 0.25)',
        paper: '0 2px 12px -2px rgba(47, 31, 23, 0.08)',
        ambient: '0 10px 30px -10px rgba(47, 31, 23, 0.15)',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.85 },
        },
        rise: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        flicker: 'flicker 3s ease-in-out infinite',
        rise: 'rise 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};
