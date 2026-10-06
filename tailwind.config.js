/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './global.css',
    './app/(*)/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#14110F',
          surface: '#1E1A17',
          light: '#2A2520',
        },
        border: {
          DEFAULT: '#332D27',
          light: '#3A3A4A',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B5AD9F',
          muted: '#8A8277',
        },
        accent: {
          DEFAULT: '#FF5A1F',
          light: '#FF7A4A',
          aws: '#FF9900',
          azure: '#0078D4',
          gcp: '#4285F4',
          devops: '#3DDBB0',
        },
        success: '#22C55E',
        error: '#EF4444',
        warning: '#F59E0B',
      },
    },
  },
  plugins: [],
  presets: [require('nativewind/preset')],
};
