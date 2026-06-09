import React from "react";
import ActionSheet, { type ActionSheetRef } from "react-native-actions-sheet";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { useColorPalette } from "@/hooks/useColorPalette";

interface EndSessionActionSheetProps {
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}

export const EndSessionActionSheet = React.forwardRef<
  ActionSheetRef,
  EndSessionActionSheetProps
>(({ onConfirm, onClose, isPending }, ref) => {
  const { palette } = useColorPalette();
  return (
    <ActionSheet
      ref={ref}
      gestureEnabled
      statusBarTranslucent
      defaultOverlayOpacity={0.45}
      containerStyle={{
        backgroundColor: palette.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 32,
      }}
    >
      <View className="px-4">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2">
            <Text variant="large" className="text-foreground">
              End Session
            </Text>
          </View>
        </View>

        <Text className="mb-4 text-sm text-muted-foreground">
          Are you sure you want to end this session? This action cannot be
          undone.
        </Text>

        <View className="pt-4">
          <View className="flex flex-col justify-between gap-2">
            <Button
              size="lg"
              variant="destructive"
              className="rounded-xl"
              onPress={onConfirm}
              disabled={isPending}
            >
              <Text className="text-md font-bold">Yes, end session</Text>
            </Button>
            <Button
              size="lg"
              className="rounded-xl"
              variant="outline"
              onPress={onClose}
              disabled={isPending}
            >
              <Text className="text-md font-bold">No, cancel</Text>
            </Button>
          </View>
        </View>
      </View>
    </ActionSheet>
  );
});

EndSessionActionSheet.displayName = "EndSessionActionSheet";
