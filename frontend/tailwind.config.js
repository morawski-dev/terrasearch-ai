/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    fontFamily: {
      esa: ["ESA"],
      esaitalic: ["ESA-ITALIC"],
      esabold: ["ESA-BOLD"],
      esabolditalic: ["ESA-BOLD-ITALIC"],
      body: ["Roboto", "sans-serif"],
    },
  },
  plugins: [],
}