/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'bookwise-orange': '#B7472A',
        'bookwise-brown': '#8B4513',
      }
    },
  },
  plugins: [],
} 