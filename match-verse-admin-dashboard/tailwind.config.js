/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(73, 209, 84)',
          light: 'rgba(73, 209, 84, 0.1)',
          dark: 'rgb(58, 167, 67)',
        },
      },
    },
  },
  plugins: [],
}