/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './App.tsx', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        indigo: {
          50: '#FDF2F2',
          100: '#FCE0E0',
          200: '#F8B6B6',
          300: '#F38181',
          400: '#EC5555',
          500: '#E13B3B',
          600: '#CA2929',
          700: '#A91F1F',
          800: '#8C1D1D',
          900: '#751D1D',
        },
        purple: {
          50: '#F0F4FA',
          100: '#DFE8F4',
          200: '#C5D6EA',
          300: '#9DBDE0',
          400: '#6F9DD1',
          500: '#4B81C3',
          600: '#3865A1',
          700: '#2E5183',
          800: '#28456B',
          900: '#243B59',
        },
        gray: {
          50: '#FDFBF9',
          100: '#F7F2EC',
          200: '#EAE0D4',
          300: '#D6C4B0',
          400: '#BCA185',
          500: '#A48263',
          600: '#8C674A',
          700: '#73503A',
          800: '#5A3E2D',
          850: '#3a271c',
          900: '#483326',
          950: '#281B13',
        },
      },
      fontFamily: {
        sans: ['"Nunito Variable"', 'sans-serif'],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      borderRadius: {
        sm: '0.75rem',
        md: '1rem',
        lg: '1.5rem',
      },
      boxShadow: {
        card: '0 10px 30px -10px rgba(0,0,0,0.08)',
        overlay: '0 20px 50px -12px rgba(0,0,0,0.25)',
      },
      zIndex: {
        nav: '30',
        sheet: '40',
        dialog: '50',
        toast: '60',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-up': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-up': 'scale-up 0.2s ease-out',
        'bounce-soft': 'bounce-soft 2.5s ease-in-out infinite',
        'slide-up': 'slide-up 0.25s ease-out',
        'slide-down': 'slide-down 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
