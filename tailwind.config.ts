import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': 'var(--color-bg-dark)',
        'bg-mid': 'var(--color-bg-mid)',
        'accent-orange': 'var(--color-accent-1)',
        'accent-blue': 'var(--color-accent-2)',
        'accent-purple': 'var(--color-accent-3)',
        'text-main': 'var(--color-text-main)',
        'text-muted': 'var(--color-text-muted)',
        'border-custom': 'var(--color-border)',
      },
      fontFamily: {
        display: ['var(--font-bricolage)'],
        body: ['var(--font-jakarta)'],
      },
      backgroundImage: {
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-orange': '0 0 30px rgba(255, 107, 43, 0.3)',
        'glow-blue': '0 0 30px rgba(0, 212, 255, 0.3)',
        'glow-purple': '0 0 30px rgba(124, 58, 237, 0.3)',
        'glow-sm': '0 0 15px rgba(255, 107, 43, 0.15)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'gradient-shift': 'gradient-shift 6s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.5s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        'wave': 'wave 15s linear infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(255, 107, 43, 0.3)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(255, 107, 43, 0.6)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'wave': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '120': '30rem',
        '128': '32rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionDuration: {
        '400': '400ms',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
};

export default config;
