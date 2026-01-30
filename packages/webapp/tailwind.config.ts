import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-app": "var(--bg-app)",
        "bg-sidebar": "var(--bg-sidebar)",
        "bg-panel": "var(--bg-panel)",
        "accent-orange": "var(--accent-orange)",
        "accent-orange-muted": "var(--accent-orange-muted)",
        "accent-green": "var(--accent-green)",
        "text-primary": "var(--text-primary)",
        "text-muted": "var(--text-muted)",
        border: "var(--border)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      fontSize: {
        xs: "var(--text-small)",
        base: "var(--text-body)",
        lg: "var(--text-large)",
        "2xl": "var(--text-display)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        panel: "var(--radius-panel)",
        card: "var(--radius-card)",
      },
      spacing: {
        card: "var(--padding-card)",
        panel: "var(--padding-panel)",
      },
      borderWidth: {
        DEFAULT: "2px",
      },
    },
  },
  plugins: [],
} satisfies Config;
