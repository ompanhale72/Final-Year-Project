/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#14213D",
        graphite: "#253042",
        mint: "#2EC4B6",
        saffron: "#FFB703",
        coral: "#F25F5C",
        cloud: "#F7F9FC",
      },
      boxShadow: {
        soft: "0 16px 44px rgba(20, 33, 61, 0.12)",
      },
    },
  },
  plugins: [],
};
