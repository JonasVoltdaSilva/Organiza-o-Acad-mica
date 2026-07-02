export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  screen: 20,
} as const;

export const radius = {
  sm: 14,
  md: 20,
  lg: 26,
  xl: 30,
  pill: 999,
} as const;

export const typography = {
  largeTitle: { fontSize: 34, fontWeight: "800" as const, letterSpacing: -0.8 },
  title: { fontSize: 22, fontWeight: "700" as const, letterSpacing: -0.4 },
  heading: { fontSize: 17, fontWeight: "700" as const, letterSpacing: -0.2 },
  subheading: {
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 0.2,
  },
  body: { fontSize: 16, fontWeight: "500" as const },
  caption: { fontSize: 13, fontWeight: "500" as const },
  micro: { fontSize: 11, fontWeight: "600" as const, letterSpacing: 0.4 },
} as const;
