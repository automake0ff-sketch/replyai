/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14110F",
        paper: "#FBF9F6",
        clay: "#C9603A",
        moss: "#4A5D45",
        stone: "#E8E3DB",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-public-sans)", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,17,15,0.04), 0 4px 16px rgba(20,17,15,0.04)",
      },
    },
  },
  plugins: [],
};
