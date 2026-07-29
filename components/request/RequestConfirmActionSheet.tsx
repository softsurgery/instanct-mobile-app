import React from "react";
import ActionSheet, { type ActionSheetRef } from "react-native-actions-sheet";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { useColorPalette } from "@/hooks/useColorPalette";
import { useTranslation } from "react-i18next";
import { RequestEvent } from "@/types";

interface RequestConfirmActionSheetProps {
  event: RequestEvent | null;
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}

export const RequestConfirmActionSheet = React.forwardRef<
  ActionSheetRef,
  RequestConfirmActionSheetProps
>(({ event, onConfirm, onClose, isPending }, ref) => {
  const { t } = useTranslation("activities");
  const { palette } = useColorPalette();

  // ponytail: accept/reject differ only in copy + button variant
  const scope = event === RequestEvent.Accept ? "accept" : "reject";

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
        <View className="px-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <Text variant="large" className="text-foreground">
                {t(`activities.incomming.request.actionSheet.${scope}.title`)}
              </Text>
            </View>
          </View>

          <Text className="mb-4 text-sm text-muted-foreground">
            {t(`activities.incomming.request.actionSheet.${scope}.message`)}
          </Text>

          <View className="pt-4">
            <View className="flex flex-col justify-between gap-2">
              <Button
                size="lg"
                variant={
                  event === RequestEvent.Accept ? "default" : "destructive"
                }
                className="rounded-xl"
                onPress={onConfirm}
                disabled={isPending}
              >
                <Text className="text-md font-bold">
                  {t(
                    `activities.incomming.request.actionSheet.${scope}.confirm`,
                  )}
                </Text>
              </Button>
              <Button
                size="lg"
                className="rounded-xl"
                variant="outline"
                onPress={onClose}
                disabled={isPending}
              >
                <Text className="text-md font-bold">
                  {t(
                    `activities.incomming.request.actionSheet.${scope}.cancel`,
                  )}
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </View>
    </ActionSheet>
  );
});

RequestConfirmActionSheet.displayName = "RequestConfirmActionSheet";
