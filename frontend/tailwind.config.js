/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#b9e0ff',
          300: '#7cc7ff',
          400: '#36abff',
          500: '#0c91f2',
          600: '#0070cf',
          700: '#0059a7',
          800: '#054d8a',
          900: '#0a4073',
        },
        fragrance: {
          daily: '#3a6ea5',
          college: '#2d5aa0',
          summer: '#00bcd4',
          office: '#004e89',
          club: '#7b1fa2',
          date: '#d32f2f',
          signature: '#ff6b35',
          winter: '#5d4037',
          special: '#9c27b0'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
