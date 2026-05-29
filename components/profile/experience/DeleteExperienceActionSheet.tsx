import React from "react";
import ActionSheet, { type ActionSheetRef } from "react-native-actions-sheet";
import { useColorScheme } from "nativewind";
import { THEME } from "~/lib/theme";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { Trash2 } from "lucide-react-native";

interface DeletExperienceActionSheetProps {
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}

export const DeleteExperienceActionSheet = React.forwardRef<
  ActionSheetRef,
  DeletExperienceActionSheetProps
>(({ onConfirm, onClose, isPending }, ref) => {
  const { colorScheme } = useColorScheme();
  const isDarkColorScheme = colorScheme === "dark";
  return (
    <ActionSheet
      ref={ref}
      gestureEnabled
      statusBarTranslucent
      defaultOverlayOpacity={0.45}
      containerStyle={{
        backgroundColor: isDarkColorScheme
          ? THEME.dark.background
          : THEME.light.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 32,
      }}
    >
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2">
            <Icon as={Trash2} size={20} />
            <Text variant="large" className="text-foreground">
              Delete Experience
            </Text>
          </View>
        </View>

        <Text className="mt-1 mb-4 text-sm text-muted-foreground">
          Are you sure you want to delete this experience? This action cannot be
          undone.
        </Text>

        <View className="flex-row items-center gap-2 mt-2">
          <Button
            onPress={onConfirm}
            className="w-1/2"
            size="sm"
            disabled={isPending}
            variant="destructive"
          >
            <Text className="text-base font-semibold">Confirm</Text>
          </Button>
          <Button
            className="w-1/2"
            size="sm"
            variant="outline"
            onPress={onClose}
            disabled={isPending}
          >
            <Text>Cancel</Text>
          </Button>
        </View>
      </View>
    </ActionSheet>
  );
});
