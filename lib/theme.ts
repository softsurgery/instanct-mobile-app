import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";

export const THEME = {
  light: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(0 0% 32%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(0 0% 32%)",
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(0 0% 32%)",
    primary: "hsl(259 62% 62%)",
    primaryForeground: "hsl(0 0% 100%)",
    secondary: "hsl(265 0% 96%)",
    secondaryForeground: "hsl(257 5% 44%)",
    muted: "hsl(248 0% 98%)",
    mutedForeground: "hsl(264 7% 55%)",
    accent: "hsl(237 10% 95%)",
    accentForeground: "hsl(266 24% 38%)",
    destructive: "hsl(0 84.2365% 60.1961%)",
    destructiveForeground: "hsl(0 0% 100%)",
    border: "hsl(264 2% 93%)",
    input: "hsl(264 2% 93%)",
    ring: "hsl(259 62% 62%)",
    radius: "0.375rem",
    chart1: "hsl(259 62% 62%)",
    chart2: "hsl(263 70% 54%)",
    chart3: "hsl(264 76% 49%)",
    chart4: "hsl(266 65% 43%)",
    chart5: "hsl(266 47% 37%)",
  },
  dark: {
    background: "hsl(0 0% 20%)",
    foreground: "hsl(0 0% 92%)",
    card: "hsl(0 0% 26%)",
    cardForeground: "hsl(0 0% 92%)",
    popover: "hsl(0 0% 26%)",
    popoverForeground: "hsl(0 0% 92%)",
    primary: "hsl(259 62% 62%)",
    primaryForeground: "hsl(0 0% 100%)",
    secondary: "hsl(0 0% 26%)",
    secondaryForeground: "hsl(0 0% 92%)",
    muted: "hsl(0 0% 24%)",
    mutedForeground: "hsl(0 0% 72%)",
    accent: "hsl(266 24% 38%)",
    accentForeground: "hsl(254 64% 88%)",
    destructive: "hsl(0 84.2365% 60.1961%)",
    destructiveForeground: "hsl(0 0% 100%)",
    border: "hsl(0 0% 37%)",
    input: "hsl(0 0% 37%)",
    ring: "hsl(259 62% 62%)",
    radius: "0.375rem",
    chart1: "hsl(255 56% 71%)",
    chart2: "hsl(259 62% 62%)",
    chart3: "hsl(263 70% 54%)",
    chart4: "hsl(264 76% 49%)",
    chart5: "hsl(266 65% 43%)",
  },
};

export const NAV_THEME: Record<"light" | "dark", Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};

export function hslToHex(hslString: string): string {
  const match = hslString.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
  if (!match) return hslString; // Return as-is if not valid HSL
  let h = parseInt(match[1], 10) / 360;
  let s = parseInt(match[2], 10) / 100;
  let l = parseInt(match[3], 10) / 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
