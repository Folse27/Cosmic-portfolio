import type { Config } from "tailwindcss";

/**
 * Design tokens — "Event Horizon" theme
 * ------------------------------------
 * void     near-black page background
 * panel    slightly lifted surface for cards / admin panels
 * crimson  the single accent family (deep red)
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#050506",
        panel: "#0b0b0f",
        crimson: {
          DEFAULT: "#e11d33",
          bright: "#ff3850",
          dim: "#a3122a",
          deep: "#4e0a18",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 48px -10px rgba(225, 29, 51, 0.45)",
        "glow-sm": "0 0 24px -6px rgba(225, 29, 51, 0.5)",
      },
      maxWidth: {
        site: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
