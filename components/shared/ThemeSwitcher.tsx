import { usePreferencePersistStore } from "@/stores/usePreferencePersistStore";
import Select from "./form-builder/components/Select";
import { useColorScheme } from "nativewind";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { Platform } from "react-native";
import { useTranslation } from "react-i18next";

interface ThemeSwitcherProps {
  classNames?: {
    trigger?: string;
    content?: string;
  };
}

export const ThemeSwitcher = ({ classNames }: ThemeSwitcherProps) => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const { setTheme } = usePreferencePersistStore();
  const { t } = useTranslation("common");
  return (
    <Select
      classNames={classNames}
      title={t("theme.title")}
      description={t("theme.description")}
      placeholder="Select a theme"
      value={colorScheme}
      onSelect={async (value) => {
        if (value === colorScheme) return;
        const newTheme = value as "light" | "dark";
        setColorScheme(newTheme);
        if (Platform.OS === "android") setAndroidNavigationBar(newTheme);
        setTheme(newTheme);
      }}
      options={[
        { label: t("theme.light"), value: "light" },
        { label: t("theme.dark"), value: "dark" },
      ]}
    />
  );
};
