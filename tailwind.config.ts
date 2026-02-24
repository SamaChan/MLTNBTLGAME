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
        cyber: {
          dark: '#0a0a0f',
          purple: '#1a0a2e',
          neon: {
            pink: '#ff00ff',
            blue: '#00ffff',
            green: '#00ff88',
            yellow: '#ffff00',
            orange: '#ff8800',
            red: '#ff0044',
          },
          grid: '#1a1a2e',
          card: '#12121a',
          border: '#2a2a4a',
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'pop': 'pop 0.3s ease-out',
        'banned-flash': 'banned-flash 0.5s ease-in-out',
        'slow-reveal': 'slow-reveal 1s ease-out forwards',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 136, 0.8)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        'pop': {
          '0%': { transform: 'scale(0.8)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        'banned-flash': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'slow-reveal': {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'cyber-grid': `linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px)`,
      },
    },
  },
  plugins: [],
}
export default config
