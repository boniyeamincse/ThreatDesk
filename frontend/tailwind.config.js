/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        critical: '#dc2626',
        high: '#ea580c',
        medium: '#eab308',
        low: '#22c55e',
        neon: {
          cyan: '#06b6d4',
          blue: '#3b82f6',
          indigo: '#6366f1',
          emerald: '#10b981',
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.6), 0 0 10px rgba(6, 182, 212, 0.4)' }
        }
      }
    },
  },
  plugins: [],
}
