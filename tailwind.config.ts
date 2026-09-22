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
        /* gray-500 lifted from #6b7280 (4.21:1) to clear 4.5:1 on the void
           background. gray-600 is left alone: it is only used for input
           placeholders now. */
        gray: {
          500: "#747b8a",
        },
        crimson: {
          /* DEFAULT stays put: white text on bg-crimson is 4.75:1 and
             lightening it would drop that below 4.5. `text` is the same red,
             8% lighter, for small accent labels on a dark background. */
          DEFAULT: "#e11d33",
          text: "#f31f37",
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
