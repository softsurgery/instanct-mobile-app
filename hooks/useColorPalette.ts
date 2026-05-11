import { THEME } from "@/lib/theme";
import { useColorScheme } from "nativewind";

interface useColorPaletteProps {}

export const useColorPalette = ({}: useColorPaletteProps = {}) => {
  const { colorScheme } = useColorScheme();
  const isDarkColorScheme = colorScheme === "dark";
  return {
    palette: isDarkColorScheme ? THEME.dark : THEME.light,
  };
};
