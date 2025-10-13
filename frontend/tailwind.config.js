/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#002060',
      },
      fontFamily: {
        'geist': ['Geist', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
