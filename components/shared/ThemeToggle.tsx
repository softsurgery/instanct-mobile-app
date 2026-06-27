import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { cn } from "@/lib/utils";
import { usePreferencePersistStore } from "@/stores/usePreferencePersistStore";
import { MoonStar, Sun } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React from "react";
import { Platform, View } from "react-native";
import { StablePressable } from "./StablePressable";
import { Icon } from "../ui/icon";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { setColorScheme } = useColorScheme();
  const { theme, setTheme } = usePreferencePersistStore();
  const isDarkMode = React.useMemo(() => theme === "dark", [theme]);

  return (
    <StablePressable
      onPress={() => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setColorScheme(newTheme);
        if (Platform.OS === "android") setAndroidNavigationBar(newTheme);
        setTheme(newTheme);
      }}
      onPressClassname="bg-none"
    >
      <View className={cn("mx-2", className)}>
        {isDarkMode ? (
          <Icon as={MoonStar} className="text-foreground" size={24} />
        ) : (
          <Icon as={Sun} className="text-foreground" size={24} />
        )}
      </View>
    </StablePressable>
  );
}
