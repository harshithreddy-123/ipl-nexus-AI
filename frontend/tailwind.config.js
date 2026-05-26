/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ipl: {
          dark: "#060b12",
          panel: "#0c1424",
          card: "#111d32",
          border: "rgba(255,255,255,0.08)",
          orange: "#e85d26",
          cyan: "#22b8d9",
          gold: "#d4a72c",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": "0.65rem",
      },
      animation: {
        "fade-up": "fadeUp 0.45s ease-out forwards",
        "pulse-soft": "pulseSoft 2.5s ease-in-out infinite",
        "chat-glow": "chatGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        chatGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(34, 184, 217, 0.35)" },
          "50%": { boxShadow: "0 0 20px 4px rgba(34, 184, 217, 0.25)" },
        },
      },
    },
  },
  plugins: [],
};
