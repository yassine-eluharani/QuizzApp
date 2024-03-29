/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/(*)/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF385C',
        grey: '#5E5D5E',
        dark: '#1A1A1A',
      },
    },
  },
  plugins: [],
}


