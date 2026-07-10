import React from "react";
import ActionSheet, { type ActionSheetRef } from "react-native-actions-sheet";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { Trash2 } from "lucide-react-native";
import { useColorPalette } from "@/hooks/useColorPalette";
import { useTranslation } from "react-i18next";

interface DeleteEducationActionSheetProps {
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}

export const DeleteEducationActionSheet = React.forwardRef<
  ActionSheetRef,
  DeleteEducationActionSheetProps
>(({ onConfirm, onClose, isPending }, ref) => {
  const { t } = useTranslation("menu");
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
      <View>
        <View className="p-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <Icon as={Trash2} size={20} />
              <Text variant="large" className="text-foreground">
                {t("education.delete.title")}
              </Text>
            </View>
          </View>

          <Text className="mt-1 mb-4 text-sm text-muted-foreground">
            {t("education.delete.message")}
          </Text>

          <View className="flex-row items-center gap-2 mt-2">
            <Button
              onPress={onConfirm}
              className="w-1/2"
              size="sm"
              disabled={isPending}
              variant="destructive"
            >
              <Text className="text-base font-semibold">
                {t("education.delete.actions.confirm")}
              </Text>
            </Button>
            <Button
              className="w-1/2"
              size="sm"
              variant="outline"
              onPress={onClose}
              disabled={isPending}
            >
              <Text>{t("education.delete.actions.cancel")}</Text>
            </Button>
          </View>
        </View>
      </View>
    </ActionSheet>
  );
});

DeleteEducationActionSheet.displayName = "DeleteEducationActionSheet";
