/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        gov: {
          50:  '#f0f4ff',
          100: '#dde6ff',
          200: '#b8caff',
          300: '#8aa4ff',
          400: '#5a74f5',
          500: '#3b51e8',
          600: '#2c3dcf',
          700: '#2230a8',
          800: '#1a2480',
          900: '#141b5e',
          950: '#0c1040',
        },
        accent: {
          400: '#f0a500',
          500: '#d48f00',
        },
      },
    },
  },
  plugins: [],
}
