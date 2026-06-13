import { hslToHex } from "@/lib/theme";
import { useColorPalette } from "@/hooks/useColorPalette";
import { Hand, Image as ImageIcon, Video } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import ActionSheet, { type ActionSheetRef } from "react-native-actions-sheet";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { Text } from "~/components/ui/text";

interface ConversationInputActionsSheetProps {
  onPoke: () => void;
  onPickImage: () => void;
  onPickVideo: () => void;
  disabled?: boolean;
}

export const ConversationInputActionsSheet = React.forwardRef<
  ActionSheetRef,
  ConversationInputActionsSheetProps
>(({ onPoke, onPickImage, onPickVideo, disabled }, ref) => {
  const { palette } = useColorPalette();
  const innerRef = React.useRef<ActionSheetRef>(null);
  const pendingActionRef = React.useRef<(() => void) | null>(null);
  React.useImperativeHandle(ref, () => innerRef.current as ActionSheetRef);

  const runAction = (action: () => void) => {
    pendingActionRef.current = action;
    innerRef.current?.hide();
  };

  const handleClose = () => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    if (!action) return;
    setTimeout(action, 300);
  };

  return (
    <ActionSheet
      ref={innerRef}
      gestureEnabled
      statusBarTranslucent
      defaultOverlayOpacity={0.45}
      onClose={handleClose}
      containerStyle={{
        backgroundColor: hslToHex(palette.background),
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 32,
      }}
    >
      <View className="px-2 my-5">
        <View className="mb-4">
          <Text
            variant="large"
            className="text-foreground text-center font-bold"
          >
            Actions
          </Text>
        </View>

        <View className="flex flex-col gap-2">
          <Button
            size="lg"
            variant="outline"
            disabled={disabled}
            className="flex-row items-center justify-center gap-2 rounded-xl"
            onPress={() => runAction(onPickImage)}
          >
            <Icon as={ImageIcon} size={18} color={hslToHex(palette.foreground)} />
            <Text className="text-md font-bold">Photo</Text>
          </Button>

          <Button
            size="lg"
            variant="outline"
            disabled={disabled}
            className="flex-row items-center justify-center gap-2 rounded-xl"
            onPress={() => runAction(onPickVideo)}
          >
            <Icon as={Video} size={18} color={hslToHex(palette.foreground)} />
            <Text className="text-md font-bold">Video</Text>
          </Button>

          <Button
            size="lg"
            variant="outline"
            disabled={disabled}
            className="flex-row items-center justify-center gap-2 rounded-xl"
            onPress={() => runAction(onPoke)}
          >
            <Icon as={Hand} size={18} color={hslToHex(palette.foreground)} />
            <Text className="text-md font-bold">Poke</Text>
          </Button>
        </View>
      </View>
    </ActionSheet>
  );
});

ConversationInputActionsSheet.displayName = "ConversationInputActionsSheet";
