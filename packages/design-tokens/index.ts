export const shadowColors = {
  light: {
    background: "#F7F7F4",
    surface: "#FFFFFF",
    surfaceMuted: "#F1F1EC",
    text: "#121315",
    textMuted: "#5D6168",
    border: "#E2E4E8",
    accent: "#5468FF",
    accentSoft: "#EEF1FF",
    success: "#1F8F5F",
    warning: "#C58A1A",
    danger: "#C24E4E",
  },
  dark: {
    background: "#0D1014",
    surface: "#13171C",
    surfaceMuted: "#1A2027",
    text: "#F5F7FA",
    textMuted: "#9AA3AE",
    border: "#262E38",
    accent: "#7C8DFF",
    accentSoft: "#1B2347",
    success: "#39A976",
    warning: "#D5A33C",
    danger: "#D96B6B",
  },
} as const;

export const shadowSpacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

export const shadowRadii = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const shadowTypography = {
  heading: {
    family: "\"Fraunces\", \"Iowan Old Style\", serif",
    sizes: {
      display: "clamp(3rem, 6vw, 5.5rem)",
      h1: "clamp(2.5rem, 4vw, 4rem)",
      h2: "clamp(1.75rem, 3vw, 2.5rem)",
      h3: "1.375rem",
    },
  },
  body: {
    family: "\"Manrope\", \"Avenir Next\", sans-serif",
    sizes: {
      lg: "1.125rem",
      md: "1rem",
      sm: "0.9rem",
      xs: "0.8rem",
    },
  },
} as const;

export const shadowMotion = {
  fast: "140ms cubic-bezier(0.2, 0.8, 0.2, 1)",
  base: "220ms cubic-bezier(0.2, 0.8, 0.2, 1)",
  slow: "320ms cubic-bezier(0.2, 0.8, 0.2, 1)",
} as const;

export const designGuidance = {
  iconRule: "Prefer 18-20px outline icons with restrained use of filled icons for critical approval states.",
  loadingRule: "Use soft pulse skeletons and never block the whole screen when progressive disclosure is possible.",
  emptyStateRule: "Explain what the twin needs next and expose one clear next action.",
  motionRule: "Keep transitions under 320ms and disable transforms when reduced motion is enabled.",
} as const;

