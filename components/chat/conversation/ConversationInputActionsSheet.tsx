import { hslToHex } from "@/lib/theme";
import { useColorPalette } from "@/hooks/useColorPalette";
import { Hand } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import ActionSheet, { type ActionSheetRef } from "react-native-actions-sheet";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { Text } from "~/components/ui/text";

interface ConversationInputActionsSheetProps {
  onPoke: () => void;
}

export const ConversationInputActionsSheet = React.forwardRef<
  ActionSheetRef,
  ConversationInputActionsSheetProps
>(({ onPoke }, ref) => {
  const { palette } = useColorPalette();
  const innerRef = React.useRef<ActionSheetRef>(null);
  React.useImperativeHandle(ref, () => innerRef.current as ActionSheetRef);

  return (
    <ActionSheet
      ref={innerRef}
      gestureEnabled
      statusBarTranslucent
      defaultOverlayOpacity={0.45}
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
            className="flex-row items-center justify-center gap-2 rounded-xl"
            onPress={() => {
              innerRef.current?.hide();
              requestAnimationFrame(onPoke);
            }}
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
