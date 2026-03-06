/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 啟用類別模式，讓 dark: 樣式依賴 html 上的 .dark 類別
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      letterSpacing: {
        'widest': '0.2em',
      }
    },
  },
  plugins: [],
}
