/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'apple-bg': {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
        },
        'apple-text': {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
        },
        'apple-accent': {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
        },
        'apple-danger': 'var(--color-danger)',
        'apple-success': 'var(--color-success)',
        'apple-border': 'var(--color-border)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Inter"',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        'note-title': ['17px', { lineHeight: '22px', fontWeight: '600' }],
        'note-body': ['15px', { lineHeight: '1.5' }],
        'note-caption': ['13px', { lineHeight: '18px' }],
      },
      borderRadius: {
        'note': '12px',
        'modal': '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
