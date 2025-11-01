/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
          extend: {
            colors: {
              primary: '#6FBF73',
              'primary-dark': '#5a9a5d',
              accent: '#1E5631',
              light: '#F9F9F9',
              dark: '#1a1a1a',
              'dark-secondary': '#2a2a2a',
              'text-light': '#333333',
              'text-dark': '#F9F9F9',
            },
          },
        },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};
