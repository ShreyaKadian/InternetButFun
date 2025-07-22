import { heroui } from "@heroui/theme";
import { color } from "framer-motion";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#fde1c2", // override token
        color : "#595540"
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        tooltip: "fadeIn 150ms ease-out",
      },

      fontFamily: {
        sans: ["Overpass", "sans-serif"], // default sans
        dancing: ["Dancing Script", "cursive"],
        overpass: ["Overpass", "sans-serif"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};

export default config;
