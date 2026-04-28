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
          DEFAULT: '#0F0F14',
          surface: '#1A1A24',
          light: '#252535',
        },
        border: {
          DEFAULT: '#2A2A3A',
          light: '#3A3A4A',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A0A0B8',
          muted: '#6B6B80',
        },
        accent: {
          DEFAULT: '#6C63FF',
          light: '#8B83FF',
          aws: '#FF9900',
          azure: '#0078D4',
          gcp: '#4285F4',
          devops: '#8B5CF6',
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
