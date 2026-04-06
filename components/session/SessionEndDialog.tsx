import React from "react";
import { cn } from "@/lib/utils";
import { Keyboard, View } from "react-native";
import { Text } from "../ui/text";
import { Button } from "../ui/button";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";
import { useColorScheme } from "nativewind";
import { THEME } from "@/lib/theme";
import { StablePressable } from "../shared/StablePressable";

interface EndSessionModalProps {
  className?: string;
  trigger?: React.ReactNode;
  loading?: boolean;
  handleEndSession?: () => void;
}

export const EndSessionModal = ({
  className,
  trigger,
  loading,
  handleEndSession,
}: EndSessionModalProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const sheetRef = React.useRef<ActionSheetRef>(null);

  const handleClose = () => Keyboard.dismiss();

  return (
    <>
      <StablePressable
        className={cn("flex-row items-center p-1")}
        onPress={() => sheetRef.current?.show()}
      >
        {trigger || (
          <Button size="sm" variant="outline" className="flex-1">
            <Text>End Session</Text>
          </Button>
        )}
      </StablePressable>

      <ActionSheet
        ref={sheetRef}
        gestureEnabled
        statusBarTranslucent
        defaultOverlayOpacity={0.5}
        onClose={handleClose}
        containerStyle={{
          backgroundColor: isDark
            ? THEME.dark.background
            : THEME.light.background,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 40,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 5,
        }}
      >
        <View className="flex flex-col justify-between ">
          {/* Header */}
          <View className="flex flex-col gap-3 mb-6">
            <Text className="text-lg font-semibold text-destructive">
              End Session
            </Text>
            <Text className="text-sm text-muted-foreground">
              Are you sure you want to end this session? This action cannot be
              undone.
            </Text>
          </View>

          {/* Actions */}
          <Button
            variant="destructive"
            onPress={() => {
              handleEndSession?.();
              handleClose();
            }}
            disabled={loading}
            className="py-3 rounded-lg"
          >
            <Text className="text-base font-medium">
              {loading ? "Ending..." : "Yes, I'm sure"}
            </Text>
          </Button>
        </View>
      </ActionSheet>
    </>
  );
};
