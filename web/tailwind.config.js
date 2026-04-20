/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neonBlue: '#45f3ff',
        darkBg: '#0b0c10',
        darkSurface: '#1f2833',
        grayText: '#c5c6c7',
        neonAccent: '#66fcf1'
      }
    },
  },
  plugins: [],
}
