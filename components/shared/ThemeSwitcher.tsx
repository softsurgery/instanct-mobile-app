import { usePreferencePersistStore } from "@/stores/usePreferencePersistStore";
import Select from "./form-builder/components/Select";
import { useColorScheme } from "nativewind";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { Platform } from "react-native";

interface ThemeSwitcherProps {
  classNames?: {
    trigger?: string;
    content?: string;
  };
}

export const ThemeSwitcher = ({ classNames }: ThemeSwitcherProps) => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const { setTheme } = usePreferencePersistStore();
  return (
    <Select
      classNames={classNames}
      title="Select Theme"
      description="Choose your preferred theme"
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
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
      ]}
    />
  );
};
