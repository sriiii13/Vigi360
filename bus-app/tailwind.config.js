/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        busDark: '#0B132B',
        busSurface: '#1C2541',
        busCard: '#1E293B',
        busBorder: '#334155',
        busAccent: '#06B6D4',
        busSuccess: '#10B981',
        busWarning: '#F59E0B',
        busDanger: '#EF4444',
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
