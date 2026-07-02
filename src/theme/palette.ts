export const brand = {
  cream: "#F6F7ED",
  lime: "#DBE64C",
  green: "#74C365",
  greenDark: "#00804C",
  navy: "#001F3F",
  blue: "#1E488F",
};

export interface Theme {
  mode: "light" | "dark";
  background: string;
  backgroundGradient: [string, string];
  surface: string;
  surfaceStrong: string;
  surfaceBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentText: string;
  primary: string;
  primarySoft: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  shadow: string;
  blurTint: "light" | "dark";
  blurIntensity: number;
}

export const lightTheme: Theme = {
  mode: "light",
  background: brand.cream,
  backgroundGradient: ["#F8F9F0", "#EFF2E2"],
  surface: "rgba(255, 255, 255, 0.62)",
  surfaceStrong: "rgba(255, 255, 255, 0.88)",
  surfaceBorder: "rgba(255, 255, 255, 0.75)",
  text: brand.navy,
  textSecondary: "rgba(0, 31, 63, 0.74)",
  textMuted: "rgba(0, 31, 63, 0.55)",
  accent: brand.lime,
  accentText: brand.navy,
  primary: brand.greenDark,
  primarySoft: "rgba(0, 128, 76, 0.10)",
  success: brand.green,
  warning: "#E8B93B",
  danger: "#D9534F",
  info: brand.blue,
  shadow: "rgba(0, 31, 63, 0.10)",
  blurTint: "light",
  blurIntensity: 46,
};

export const darkTheme: Theme = {
  mode: "dark",
  background: "#0A1626",
  backgroundGradient: ["#0C1B2E", "#081120"],
  surface: "rgba(255, 255, 255, 0.10)",
  surfaceStrong: "rgba(255, 255, 255, 0.14)",
  surfaceBorder: "rgba(255, 255, 255, 0.16)",
  text: brand.cream,
  textSecondary: "rgba(246, 247, 237, 0.74)",
  textMuted: "rgba(246, 247, 237, 0.55)",
  accent: brand.lime,
  accentText: brand.navy,
  primary: brand.green,
  primarySoft: "rgba(116, 195, 101, 0.14)",
  success: brand.green,
  warning: "#E8B93B",
  danger: "#E07370",
  info: "#6C9BE0",
  shadow: "rgba(0, 0, 0, 0.45)",
  blurTint: "dark",
  blurIntensity: 34,
};

export const disciplineColors = [
  brand.greenDark,
  brand.blue,
  "#B45FC9",
  "#E07A3F",
  "#C94F6D",
  "#2E9BA6",
  "#8A6FDF",
  brand.green,
  "#D19A2F",
  brand.navy,
];

export const disciplineIcons = [
  "book-outline",
  "calculator-outline",
  "flask-outline",
  "code-slash-outline",
  "globe-outline",
  "leaf-outline",
  "hardware-chip-outline",
  "library-outline",
  "stats-chart-outline",
  "construct-outline",
  "language-outline",
  "medkit-outline",
] as const;
