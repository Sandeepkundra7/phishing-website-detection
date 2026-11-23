/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#070b14',
          card: '#0d1527',
          cardHover: '#131f38',
          border: '#1c2d52',
          borderLight: '#2a4374',
          cyan: '#00f0ff',
          cyanGlow: 'rgba(0, 240, 255, 0.25)',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          green: '#10b981',
          greenGlow: 'rgba(16, 185, 129, 0.25)',
          red: '#f43f5e',
          redGlow: 'rgba(244, 63, 94, 0.25)',
          yellow: '#f59e0b',
          muted: '#94a3b8'
        }
      },
      boxShadow: {
        'cyan-glow': '0 0 20px -2px rgba(0, 240, 255, 0.35)',
        'blue-glow': '0 0 20px -2px rgba(59, 130, 246, 0.35)',
        'red-glow': '0 0 20px -2px rgba(244, 63, 94, 0.35)',
        'green-glow': '0 0 20px -2px rgba(16, 185, 129, 0.35)',
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scan 3s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
