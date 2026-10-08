/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './App.tsx', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        indigo: {
          50: '#FFF0F0',
          100: '#FFDCDC',
          200: '#F5C6C6',
          300: '#EBACAC',
          400: '#D8A2A2',
          500: '#C78B8B',
          600: '#B57474',
          700: '#9E5B5B',
          800: '#854646',
          900: '#6E3434',
        },
        purple: {
          50: '#F4F7EF',
          100: '#E1E9D5',
          200: '#C6D6B3',
          300: '#ABC290',
          400: '#8EA66B',
          500: '#7A915A',
          600: '#647A47',
          700: '#4F6136',
          800: '#3D4A2A',
          900: '#2A331D',
        },
        gray: {
          750: '#2d3748',
          850: '#1a202c',
          950: '#0d1117',
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
