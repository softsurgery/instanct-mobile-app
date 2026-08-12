import { usePreferencePersistStore } from "@/stores/usePreferencePersistStore";
import Select from "./form-builder/components/Select";
import { useColorScheme } from "nativewind";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { Platform, Appearance } from "react-native";
import { useTranslation } from "react-i18next";

interface ThemeSwitcherProps {
  classNames?: {
    trigger?: string;
    content?: string;
  };
  showSystemOption?: boolean;
}

export const ThemeSwitcher = ({ classNames, showSystemOption = true }: ThemeSwitcherProps) => {
  const { setColorScheme } = useColorScheme();
  const { theme, setTheme } = usePreferencePersistStore();
  const { t } = useTranslation("common");

  const options = [
    { label: t("theme.light"), value: "light" },
    { label: t("theme.dark"), value: "dark" },
  ];
  if (showSystemOption) {
    options.push({ label: t("theme.system"), value: "system" });
  }

  return (
    <Select
      classNames={classNames}
      title={t("theme.title")}
      description={t("theme.description")}
      placeholder="Select a theme"
      value={theme}
      onSelect={async (value) => {
        if (value === theme) return;
        const newTheme = value as "light" | "dark" | "system";
        setColorScheme(newTheme);
        if (Platform.OS === "android") {
          const activeTheme = newTheme === "system" ? (Appearance.getColorScheme() ?? "light") : newTheme;
          setAndroidNavigationBar(activeTheme);
        }
        setTheme(newTheme);
      }}
      options={options}
    />
  );
};
