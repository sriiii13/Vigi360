/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#f8f9ff',
        'surface-dim': '#d0dbed',
        'surface-bright': '#f8f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e6eeff',
        'surface-container-high': '#dee9fc',
        'surface-container-highest': '#d9e3f6',
        'on-surface': '#121c2a',
        'on-surface-variant': '#3e4850',
        'inverse-surface': '#27313f',
        'inverse-on-surface': '#eaf1ff',
        outline: '#6e7881',
        'outline-variant': '#bec8d2',
        'surface-tint': '#006591',
        primary: '#006591',
        'on-primary': '#ffffff',
        'primary-container': '#0ea5e9',
        'on-primary-container': '#003751',
        'inverse-primary': '#89ceff',
        secondary: '#4648d4',
        'on-secondary': '#ffffff',
        'secondary-container': '#e0e0ff',
        'on-secondary-container': '#121063',
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#410002',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
