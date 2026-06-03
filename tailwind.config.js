/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Noto Sans Thai", "system-ui", "sans-serif"]
      },
      colors: {
        basil: "#A4551B",
        limewash: "#FFF5E6",
        ink: "#4B2B17",
        paper: "#FFF9EF",
        honey: "#D97A25",
        tamarind: "#6E3A18",
        clay: "#B65F22",
        rice: "#FFFCF6"
      }
    }
  },
  plugins: []
};
