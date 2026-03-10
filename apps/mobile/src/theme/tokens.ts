export const palette = {
  background: "#0D1014",
  surface: "#13171C",
  surfaceMuted: "#1A2027",
  surfaceRaised: "#202833",
  text: "#F5F7FA",
  textMuted: "#9AA3AE",
  border: "#262E38",
  accent: "#7C8DFF",
  accentSoft: "#20284D",
  success: "#39A976",
  warning: "#D5A33C",
  danger: "#D96B6B",
} as const;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const darkTheme = {
  navigation: {
    dark: true,
    colors: {
      primary: palette.accent,
      background: palette.background,
      card: palette.surface,
      text: palette.text,
      border: palette.border,
      notification: palette.accent,
    },
  },
};

