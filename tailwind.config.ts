import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F5F2',
        surface: '#FFFFFF',
        primary: {
          DEFAULT: '#1A1A2E',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#E8602C',
          foreground: '#FFFFFF',
          hover: '#CF4F20',
        },
        donate: {
          DEFAULT: '#2D6A4F',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#6B7280',
          foreground: '#9CA3AF',
        },
        danger: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        border: '#E5E2DD',
        ring: '#E8602C',
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
