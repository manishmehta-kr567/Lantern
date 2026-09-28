/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: { DEFAULT: "#101014", deep: "#0A0A0D", light: "#1B1B21" },
        parchment: { DEFAULT: "#EDEAE0", dim: "#C3BDAC" },
        ember: { DEFAULT: "#D97A3D", light: "#E89860" },
        forest: { DEFAULT: "#35513F", light: "#4D7259" },
      },
      fontFamily: {
        display: ["Libre Baskerville", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
