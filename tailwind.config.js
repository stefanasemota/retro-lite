/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Wichtig: Hier wird nach den Tailwind-Klassen gesucht!
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
