/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FFD700",
        "primary-dark": "#E6C200",
        danger: "#CC0000",
        "danger-dark": "#990000",
        dark: "#1A1A1A",
        darker: "#111111",
        "dark-surface": "#262626",
        "dark-elevated": "#333333",
        muted: "#A1A1A1",
        "text-sub": "rgba(255,255,255,0.65)",
        "text-muted": "rgba(255,255,255,0.45)",
        "category-auto": "#FFD700",
        "category-empresa": "#FF6B35",
        "category-residencia": "#4ECDC4",
        "status-pendente": "#A1A1A1",
        "status-confirmado": "#4ECDC4",
        "status-atendimento": "#FF6B35",
        "status-concluido": "#51CF66",
        "status-cancelado": "#CC0000",
        whatsapp: "#25D366",
      },
      fontFamily: {
        sans: ["Onest", "System"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(255, 215, 0, 0.18)",
        fab: "0 4px 20px rgba(37,211,102,0.55)",
      },
    },
  },
  plugins: [],
};
