import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/**/*.{ts,tsx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        body: ["var(--font-body)"],
        heading: ["var(--font-heading)"],
      },
      colors: {
        canvas: "var(--color-background)",
        surface: "var(--color-surface)",
        "surface-muted": "var(--color-surface-muted)",
        ink: "var(--color-text)",
        "ink-muted": "var(--color-text-muted)",
        line: "var(--color-border)",
        accent: "var(--color-accent)",
        "accent-soft": "var(--color-accent-soft)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
      },
      boxShadow: {
        panel: "0 24px 64px rgba(18, 19, 21, 0.08)",
        card: "0 12px 28px rgba(18, 19, 21, 0.06)",
      },
      backgroundImage: {
        "shadow-grid":
          "radial-gradient(circle at top left, rgba(84, 104, 255, 0.12), transparent 28%), radial-gradient(circle at 80% 20%, rgba(84, 104, 255, 0.08), transparent 22%)",
      },
    },
  },
  plugins: [],
};

export default config;

