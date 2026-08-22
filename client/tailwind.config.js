/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Source Sans Pro"', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: '#0d0f12',
        'on-primary': '#ffffff',
        background: '#dae1ed',
        surface: '#ffffff',
        border: '#c1cbdb',
        accent: '#0056d2',
        'accent-dark': '#004ab8',
        'accent-light': '#e8f0fe',
        danger: '#dc2626',
        success: '#16a34a',
        warning: '#d97706',
        'text-muted': '#6b7a8d',
        'text-secondary': '#374151',
      },
      fontSize: {
        display: ['28px', { fontWeight: '600', lineHeight: '1.2' }],
        heading: ['20px', { fontWeight: '600', lineHeight: '1.3' }],
        body: ['14px', { fontWeight: '400', lineHeight: '1.5' }],
        label: ['12px', { fontWeight: '500', lineHeight: '1.4' }],
      },
      boxShadow: {
        card: 'rgb(0, 86, 210) 0px 0px 0px 1px inset',
        'card-hover': 'rgb(0, 86, 210) 0px 0px 0px 2px inset',
        sm: '0 1px 3px rgba(0,0,0,0.08)',
        md: '0 4px 12px rgba(0,0,0,0.1)',
        lg: '0 8px 24px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
      },
      spacing: {
        1: '1px',
        2: '2px',
        4: '4px',
        6: '6px',
        8: '8px',
        10: '10px',
        12: '12px',
        16: '16px',
        18: '18px',
        20: '20px',
        24: '24px',
        32: '32px',
        40: '40px',
        48: '48px',
        64: '64px',
        80: '80px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-ring': 'pulseRing 1.5s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-dot': 'bounceDot 0.6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.08)', opacity: '0.7' },
        },
        bounceDot: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
