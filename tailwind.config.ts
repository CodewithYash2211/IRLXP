import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        body: ['Inter', '-apple-system', 'sans-serif'],
      },
      colors: {
        gold: '#f5c842',
        'xp-bar': '#7c3aed',
        'xp-fill': '#a855f7',
        intellect: '#60a5fa',
        strength: '#f87171',
        discipline: '#34d399',
        vitality: '#fb7185',
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'glow-pulse': 'pulse-glow 2s ease-in-out infinite',
        'xp-fly': 'xp-fly 1.2s ease-out forwards',
        levelup: 'level-up-burst 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
}

export default config
