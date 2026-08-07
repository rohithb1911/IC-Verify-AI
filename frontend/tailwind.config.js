/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#030712",
        cardBg: "rgba(17, 24, 39, 0.7)",
        cardBorder: "rgba(255, 255, 255, 0.08)",
        electricCyan: "#06B6D4",
        neonViolet: "#8B5CF6",
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'matrix-shift': 'matrixShift 20s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 5px rgba(6, 182, 212, 0.5))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.8))' },
        },
      },
    },
  },
  plugins: [],
}
