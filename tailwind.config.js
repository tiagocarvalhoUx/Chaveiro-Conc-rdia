/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FFD700",
        "primary-dark": "#E6C200",
        danger: "#CC0000",
        "danger-dark": "#990000",
        dark: "#1A1A1A",
        "dark-surface": "#262626",
        "dark-elevated": "#333333",
        muted: "#A1A1A1",
      },
      fontFamily: {
        sans: ["System"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(255, 215, 0, 0.18)",
      },
    },
  },
  plugins: [],
};
