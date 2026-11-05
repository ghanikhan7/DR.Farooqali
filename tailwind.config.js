/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        emerald: {
          deep: '#123D35',
          forest: '#1D5B4A',
          sage: '#A7C4B5',
          mist: '#E6EFEA',
          border: '#DCE5E0',
        },
        ivory: {
          DEFAULT: '#F8F7F2',
          warm: '#F1EFE7',
        },
        ink: {
          DEFAULT: '#182522',
          muted: '#66736D',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        urdu: ['"Noto Nastaliq Urdu"', '"DM Sans"', 'serif'],
      },
      boxShadow: {
        clinic: '0 20px 50px -15px rgba(18, 61, 53, 0.08)',
        'clinic-lg': '0 28px 65px -18px rgba(18, 61, 53, 0.14)',
        'clinic-subtle': '0 4px 20px -2px rgba(18, 61, 53, 0.05)',
      },
    },
  },
  plugins: [],
};

