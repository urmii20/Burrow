/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        burrow: {
          primary: '#d48437',
          secondary: '#f0ad62',
          accent: '#f8cfa2',
          background: '#fffcf3',
          surface: '#fffef9',
          border: '#f0e4d4',
          text: {
            primary: '#21211f',
            secondary: '#5a564e',
            muted: '#7c786f',
            inverse: '#fffef9'
          }
        }
      }
    },
  },
  plugins: [],
};
