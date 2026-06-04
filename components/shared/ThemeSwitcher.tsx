import { usePreferencePersistStore } from "@/stores/usePreferencePersistStore";
import Select from "./form-builder/Select";
import { useColorScheme } from "nativewind";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import React from "react";

interface ThemeSwitcherProps {
  classNames?: {
    trigger?: string;
    content?: string;
  };
}

export const ThemeSwitcher = ({ classNames }: ThemeSwitcherProps) => {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { toggleTheme } = usePreferencePersistStore();
  return (
    <Select
      classNames={classNames}
      title="Select Theme"
      description="Choose your preferred theme"
      placeholder="Select a theme"
      value={colorScheme}
      onSelect={async (value) => {
        if (value === colorScheme) return;
        toggleTheme();
        await setAndroidNavigationBar(
          colorScheme === "dark" ? "light" : "dark",
        );
        toggleColorScheme();
      }}
      options={[
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
      ]}
    />
  );
};
