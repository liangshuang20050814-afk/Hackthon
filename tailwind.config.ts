import type { Config } from "tailwindcss";

// [Owner: D] Design system tokens live here.
// Extend `colors` / `spacing` with the palette agreed on in the first
// 2 hours, then everyone else (B, C) should use these token names instead
// of raw Tailwind colors, so the app looks like one product.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#5B5BD6", // TODO [D]: replace with final brand color
          light: "#EEF0FF",
          dark: "#3F3FB0",
        },
      },
    },
  },
  plugins: [],
};

export default config;
