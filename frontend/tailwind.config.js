/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        lobby: {
          bg: "#090E1A",
          card: "#111827",
          panel: "#0F172A",
          text: "#E5E7EB",
          accent: "#22D3EE",
          accent2: "#A78BFA"
        }
      },
      boxShadow: {
        neon: "0 0 0 1px rgba(34, 211, 238, 0.35), 0 0 28px rgba(167, 139, 250, 0.15)"
      }
    }
  },
  plugins: []
};
