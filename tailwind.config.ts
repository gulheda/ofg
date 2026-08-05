import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#09090B",
        surface: "#111111",
        card: "#18181B",
        accent: {
          DEFAULT: "#2F6FEE",
          light: "#7DAAFB",
        },
      },
      borderColor: {
        subtle: "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        content: "72rem",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(47,111,238,0.4)",
        "glow-sm": "0 0 22px -8px rgba(47,111,238,0.32)",
      },
    },
  },
  plugins: [],
};

export default config;
