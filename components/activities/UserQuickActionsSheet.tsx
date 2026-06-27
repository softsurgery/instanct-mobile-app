import React from "react";
import { View } from "react-native";
import ActionSheet, { type ActionSheetRef } from "react-native-actions-sheet";
import { useColorScheme } from "nativewind";
import { Text } from "../ui/text";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { hslToHex, THEME } from "@/lib/theme";
import { identifyUser } from "@/lib/user";
import { ResponseUserDto } from "@/types";
import { LucideIcon } from "lucide-react-native";

export interface QuickAction {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  onPress: () => void;
  destructive?: boolean;
}

interface UserQuickActionsSheetProps {
  user?: ResponseUserDto;
  avatar?: React.ReactNode;
  subtitle?: string;
  actions: QuickAction[];
}

export const UserQuickActionsSheet = React.forwardRef<
  ActionSheetRef,
  UserQuickActionsSheetProps
>(({ user, avatar, subtitle, actions }, ref) => {
  const innerRef = React.useRef<ActionSheetRef>(null);
  React.useImperativeHandle(ref, () => innerRef.current as ActionSheetRef);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const foreground = hslToHex(
    isDark ? THEME.dark.foreground : THEME.light.foreground,
  );

  return (
    <ActionSheet
      ref={innerRef}
      gestureEnabled
      statusBarTranslucent
      defaultOverlayOpacity={0.45}
      containerStyle={{
        backgroundColor: isDark
          ? THEME.dark.background
          : THEME.light.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 32,
      }}
    >
      <View className="mb-8">
        <View className="px-2 my-5">
          {/* identity header */}
          <View className="mb-4 flex-row items-center gap-3">
            {!!avatar && (
              <View className="overflow-hidden rounded-full bg-muted">
                {avatar}
              </View>
            )}
            <View className="flex-1 ">
              <Text numberOfLines={1} variant="large" className="text-foreground">
                {identifyUser(user)}
              </Text>
              {!!subtitle && (
                <Text
                  numberOfLines={1}
                  className="mt-0.5 text-sm text-muted-foreground"
                >
                  {subtitle}
                </Text>
              )}
            </View>
          </View>

          {/* actions as buttons */}
          <View className="flex flex-col gap-2">
            {actions.map((a) => (
              <Button
                key={a.key}
                size="lg"
                variant={a.destructive ? "destructive" : "outline"}
                className="flex-row items-center justify-center gap-2 rounded-xl"
                onPress={() => {
                  innerRef.current?.hide();
                  requestAnimationFrame(a.onPress);
                }}
              >
                <Icon
                  as={a.icon as LucideIcon}
                  size={18}
                  color={a.destructive ? "#ffffff" : foreground}
                />
                <Text className="text-md font-bold">{a.label}</Text>
              </Button>
            ))}
          </View>
        </View>
      </View>
    </ActionSheet>
  );
});

UserQuickActionsSheet.displayName = "UserQuickActionsSheet";
