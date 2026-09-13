import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#fdf8f0",
          100: "#faeed9",
          200: "#f3d9ab",
          300: "#ecc179",
          400: "#e2a34a",
          500: "#d4862b",
          600: "#b56820",
          700: "#8f4e1c",
          800: "#733f1c",
          900: "#5f351b",
          950: "#361b0d",
        },
      },
    },
  },
  plugins: [],
};
export default config;
