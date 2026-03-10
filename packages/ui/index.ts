import { shadowColors, shadowMotion, shadowRadii, shadowSpacing, shadowTypography } from "@shadowtwin/design-tokens";

export const uiPrimitives = {
  card: {
    radius: shadowRadii.lg,
    padding: shadowSpacing[6],
    borderColor: shadowColors.light.border,
  },
  button: {
    radius: shadowRadii.pill,
    transition: shadowMotion.base,
  },
  input: {
    radius: shadowRadii.md,
    paddingY: shadowSpacing[3],
    paddingX: shadowSpacing[4],
  },
} as const;

export const uiGuidelines = {
  shareAcrossPlatforms: [
    "Design tokens",
    "Interaction copy patterns",
    "Approval card information hierarchy",
    "Status and confidence badge semantics",
  ],
  keepPlatformNative: [
    "Navigation shells",
    "Gestures and bottom sheets",
    "Keyboard shortcuts and command palette",
    "Typography rendering details",
  ],
  typeScale: shadowTypography,
} as const;

