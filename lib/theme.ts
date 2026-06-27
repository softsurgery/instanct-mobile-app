import { DarkTheme, DefaultTheme, Theme } from "expo-router/react-navigation";

export const THEME = {
  light: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(0 0% 20%)",
    card: "hsl(192 15% 94%)",
    cardForeground: "hsl(0 0% 20%)",
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(0 0% 20%)",

    primary: "hsl(217.2193 91.2195% 59.8039%)",
    primaryForeground: "hsl(0 0% 100%)",

    secondary: "hsl(220 14.2857% 95.8824%)",
    secondaryForeground: "hsl(215 13.7931% 34.1176%)",

    muted: "hsl(210 20% 98.0392%)",
    mutedForeground: "hsl(220 8.9362% 46.0784%)",

    accent: "hsl(204 93.75% 93.7255%)",
    accentForeground: "hsl(224.4444 64.2857% 32.9412%)",

    destructive: "hsl(0 84.2365% 60.1961%)",
    destructiveForeground: "hsl(0 0% 100%)",

    border: "hsl(220 13.0435% 90.9804%)",
    input: "hsl(220 13.0435% 90.9804%)",
    ring: "hsl(217.2193 91.2195% 59.8039%)",

    radius: "0.375rem",

    chart1: "hsl(217.2193 91.2195% 59.8039%)",
    chart2: "hsl(221.2121 83.1933% 53.3333%)",
    chart3: "hsl(224.2781 76.3265% 48.0392%)",
    chart4: "hsl(225.931 70.7317% 40.1961%)",
    chart5: "hsl(224.4444 64.2857% 32.9412%)",
  },

  dark: {
    background: "hsl(0 0% 9.0196%)",
    foreground: "hsl(0 0% 89.8039%)",

    card: "hsl(0 0% 14.902%)",
    cardForeground: "hsl(0 0% 89.8039%)",

    popover: "hsl(0 0% 14.902%)",
    popoverForeground: "hsl(0 0% 89.8039%)",

    primary: "hsl(217.2193 91.2195% 59.8039%)",
    primaryForeground: "hsl(0 0% 100%)",

    secondary: "hsl(0 0% 14.902%)",
    secondaryForeground: "hsl(0 0% 89.8039%)",

    muted: "hsl(0 0% 12.1569%)",
    mutedForeground: "hsl(0 0% 63.9216%)",

    accent: "hsl(224.4444 64.2857% 32.9412%)",
    accentForeground: "hsl(213.3333 96.9231% 87.2549%)",

    destructive: "hsl(0 84.2365% 60.1961%)",
    destructiveForeground: "hsl(0 0% 100%)",

    border: "hsl(0 0% 25.098%)",
    input: "hsl(0 0% 25.098%)",
    ring: "hsl(217.2193 91.2195% 59.8039%)",

    radius: "0.375rem",

    chart1: "hsl(213.1169 93.9024% 67.8431%)",
    chart2: "hsl(217.2193 91.2195% 59.8039%)",
    chart3: "hsl(221.2121 83.1933% 53.3333%)",
    chart4: "hsl(224.2781 76.3265% 48.0392%)",
    chart5: "hsl(225.931 70.7317% 40.1961%)",
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

export function hslToHex(hslString: string, opacity: number = 1): string {
  const match = hslString.match(
    /hsla?\(\s*(\d+(?:\.\d+)?)(?:deg)?(?:[\s,]+)(\d+(?:\.\d+)?)%(?:[\s,]+)(\d+(?:\.\d+)?)%(?:\s*(?:\/|,)\s*(\d*\.?\d+))?\s*\)/i,
  );

  if (!match) {
    return hslString;
  }

  let h = (parseFloat(match[1]) % 360) / 360;
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;

  const inputAlpha = match[4] !== undefined ? parseFloat(match[4]) : 1;
  const alpha = Math.max(0, Math.min(1, inputAlpha * opacity));

  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
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

  const toHex = (value: number): string =>
    Math.round(value * 255)
      .toString(16)
      .padStart(2, "0");

  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  if (alpha >= 1) {
    return hex;
  }

  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");

  return `${hex}${alphaHex}`;
}
