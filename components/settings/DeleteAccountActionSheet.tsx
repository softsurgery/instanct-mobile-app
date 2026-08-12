import React from "react";
import { View } from "react-native";
import ActionSheet, { type ActionSheetRef } from "react-native-actions-sheet";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { useColorPalette } from "@/hooks/useColorPalette";
import { hslToHex } from "@/lib/theme";
import { Trash2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";

interface DeleteAccountActionSheetProps {
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}

/**
 * Bottom sheet asking the user to confirm the permanent deletion of their account.
 */
export const DeleteAccountActionSheet = React.forwardRef<
  ActionSheetRef,
  DeleteAccountActionSheetProps
>(({ onConfirm, onClose, isPending }, ref) => {
  const { t } = useTranslation("settings");
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
        <View className="px-4 py-2">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-destructive/10">
              <Icon as={Trash2} size={19} color={hslToHex(palette.destructive)} />
            </View>

            <Text variant="large" className="text-foreground">
              {t("settings.session.deleteAlert.title")}
            </Text>
          </View>

          <Text className="mb-4 text-sm text-muted-foreground">
            {t("settings.session.deleteAlert.message")}
          </Text>

          <View className="flex flex-col gap-2 pt-2">
            <Button
              size="lg"
              variant="destructive"
              className="rounded-xl"
              onPress={onConfirm}
              disabled={isPending}
            >
              <Text className="text-md font-bold">
                {t("settings.session.deleteAlert.confirm")}
              </Text>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl"
              onPress={onClose}
              disabled={isPending}
            >
              <Text className="text-md font-bold">
                {t("settings.session.deleteAlert.cancel")}
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </ActionSheet>
  );
});

DeleteAccountActionSheet.displayName = "DeleteAccountActionSheet";
