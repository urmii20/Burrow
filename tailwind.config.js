/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'burrow-primary': '#724e2bff',
        'burrow-secondary': '#f9bc43ff',
        'burrow-accent': '#E37B58',
        'burrow-background': '#f7f2eaff',
        'burrow-text-primary': '#1F2A44',
        'burrow-text-secondary': '#4B5563',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Bitter', 'serif'],
      },
    },
  },
  plugins: [],
};
