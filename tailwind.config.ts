import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0c3b37",
          foreground: "#ffffff",
          hover: "#082825",
          light: "#e6f4f1",
          muted: "#0d5e56",
        },
        secondary: {
          DEFAULT: "#e6f4f1",
          foreground: "#0c3b37",
        },
        jalanbaik: {
          dark: "#0c3b37",
          forest: "#0f3833",
          teal: "#0d5e56",
          mint: "#e6f4f1",
          mintDark: "#d1fae5",
          gray: "#f8f9fa",
          border: "#e5e9ec",
        },
        status: {
          pendingBg: "#fef3c7",
          pendingText: "#b45309",
          progressBg: "#e0e7ff",
          progressText: "#3730a3",
          reviewBg: "#ffedd5",
          reviewText: "#c2410c",
          resolvedBg: "#dcfce7",
          resolvedText: "#15803d",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "0.75rem",
        "2xl": "0.875rem",
        "3xl": "1rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
