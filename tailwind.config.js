/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'card-blue': '#d4f1f4',
        'card-green': '#d4f4dd',
        'card-yellow': '#fff9c4',
        'card-gray': '#f0f0f0',
        'notification-red': '#ff6b6b',
      },
    },
  },
  plugins: [],
}

