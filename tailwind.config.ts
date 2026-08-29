import type { Config } from "tailwindcss";

// [Owner: D] Design system tokens live here.
// Palette: white-dominant with a saturated indigo-violet accent (brand-600
// ≈ #5B4FE0) — punchier than a washed-out pastel lavender, closer to a
// premium consumer-app look. brand-600/700 are the workhorses for solid
// buttons/links — brand-600 clears WCAG AA (5.9:1) against white text,
// brand-700 clears it comfortably (8.5:1+). Lighter steps (50-200) are for
// tints and glass surfaces only, never for text on white. B and C should
// use these token names instead of raw Tailwind colors so the app looks
// like one product.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F4F3FE",
          100: "#E9E6FD",
          200: "#D1CBFB",
          300: "#AEA3F7",
          400: "#8B7BF0",
          500: "#6C5DEA",
          600: "#5B4FE0",
          700: "#4A3FC4",
          800: "#3A319C",
          900: "#2C2678",
          DEFAULT: "#5B4FE0", // = 600
          light: "#E9E6FD", // = 100, tints/badges only
          dark: "#3A319C", // = 800
        },
        ink: {
          DEFAULT: "#242235", // near-black, warm/purple-tinted (not pure black)
          muted: "#6B6478",
        },
        background: "#FBFAFF",
        surface: "#FFFFFF",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        // No `tech` key: the nav tab font is applied in globals.css off
        // --font-tech directly (see .nav-tab-label for why).
      },
      boxShadow: {
        soft: "0 2px 16px rgba(36, 34, 53, 0.07)",
        glass: "0 10px 32px -8px rgba(91, 79, 224, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
