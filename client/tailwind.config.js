/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // used by the parallax hero gradient (hidden behind the images)
        sky: { 1700: "#1b4a55", 1900: "#0a2a33" },
      },
    },
  },
  plugins: [],
};
