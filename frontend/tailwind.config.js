/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paytm: {
          blue: "#002970",
          cyan: "#00BAF2",
          dark: "#001844",
          light: "#E8F8FD",
          accent: "#00B9F1",
          gold: "#F59E0B"
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 4s linear infinite',
      }
    },
  },
  plugins: [],
}

