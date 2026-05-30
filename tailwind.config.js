/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // 👈 Dòng này giúp Tailwind quét các class trong file Vue của bạn
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        nikeGray: '#f5f5f5',
        nikeDark: '#111111'
      }
    },
  },
  plugins: [],
}
