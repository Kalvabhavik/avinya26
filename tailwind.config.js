/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cinzel', 'serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        voyage: {
          navy: '#1D3045',
          paper: '#F2E9D8',
          rust: '#B65E3C',
          teal: '#315E63',
          gold: '#C5A059',
          copper: '#E5B79E',
          midnight: '#0F1B27',
        },
      },
      letterSpacing: {
        widest: '.2em',
        epic: '.35em',
      },
    },
  },
  plugins: [],
};
