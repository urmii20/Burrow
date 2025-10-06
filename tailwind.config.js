/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        burrow: {
          primary: '#1E3A8A',
          secondary: '#059669',
          accent: '#F59E0B',
          background: '#F9FAFB',
          text: {
            primary: '#111827',
            secondary: '#4B5563'
          }
        }
      }
    },
  },
  plugins: [],
};
