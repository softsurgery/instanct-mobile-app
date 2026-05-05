import React from "react";
import ActionSheet, { type ActionSheetRef } from "react-native-actions-sheet";
import { THEME } from "~/lib/theme";
import { useColorScheme } from "nativewind";
import { Image, View } from "react-native";
import type { ImageSourcePropType } from "react-native";
import { Text } from "../ui/text";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { Image as ImageIcon } from "lucide-react-native";

interface ProfileCoverActionSheetProps {
  onConfirm: () => void;
  onPickImage: () => void;
  onClose: () => void;
  coverPreviewSource?: ImageSourcePropType;
  canUpload: boolean;
  canConfirm: boolean;
  isPending: boolean;
}

export const ProfileCoverActionSheet = React.forwardRef<
  ActionSheetRef,
  ProfileCoverActionSheetProps
>(
  (
    {
      onConfirm,
      onPickImage,
      onClose,
      isPending,
      canUpload,
      canConfirm,
      coverPreviewSource,
    },
    ref,
  ) => {
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
          <View className="flex-row items-center justify-between mb-4">
            <Text variant="large" className="text-foreground">
              Update Cover
            </Text>
          </View>

          <Image
            source={
              coverPreviewSource
                ? coverPreviewSource
                : require("@/assets/images/partial-react-logo.png")
            }
            className="w-full h-48 rounded-xl opacity-80"
            resizeMode="cover"
          />

          <Text className="mt-3 mb-4 text-sm text-muted-foreground">
            {canUpload
              ? "Preview your cover before confirming the update."
              : "You can preview this cover. Only the profile owner can upload a new cover."}
          </Text>

          <View className="flex-row items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 flex-row gap-2"
              onPress={onPickImage}
              disabled={isPending || !canUpload}
            >
              <Icon as={ImageIcon} size={16} />
              <Text>Choose Image</Text>
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onPress={onConfirm}
              disabled={!canUpload || !canConfirm || isPending}
            >
              <Text>Confirm</Text>
            </Button>
          </View>

          <Button
            size="sm"
            variant="ghost"
            className="mt-2"
            onPress={onClose}
            disabled={isPending}
          >
            <Text>Cancel</Text>
          </Button>
        </View>
      </ActionSheet>
    );
  },
);
