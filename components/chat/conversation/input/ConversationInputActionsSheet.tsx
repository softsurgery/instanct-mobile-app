import React from "react";
import { hslToHex } from "@/lib/theme";
import { useColorPalette } from "@/hooks/useColorPalette";
import { File, Hand, Image as ImageIcon, Video } from "lucide-react-native";
import { View } from "react-native";
import ActionSheet, { type ActionSheetRef } from "react-native-actions-sheet";
import { ChatActionGridItem } from "./ChatActionGridItem";

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

  const actions = [
    {
      label: "Photo",
      sublabel: "Send image",
      icon: ImageIcon,
      iconColor: "#3B82F6",
      onPress: () => runAction(onPickImage),
      disabled,
    },
    {
      label: "Video",
      sublabel: "Send video",
      icon: Video,
      iconColor: "#8B5CF6",

      onPress: () => runAction(onPickVideo),
      disabled,
    },
    {
      label: "File",
      sublabel: "Send file",
      icon: File,
      iconColor: "#eab308",

      onPress: () => runAction(onPickVideo),
      disabled,
    },
    {
      label: "Poke",
      sublabel: "Say hello",
      icon: Hand,
      iconColor: "#F97316",
      onPress: () => runAction(onPoke),
      disabled,
    },
  ];

  return (
    <ActionSheet
      ref={innerRef}
      gestureEnabled
      statusBarTranslucent
      defaultOverlayOpacity={0.45}
      onClose={handleClose}
      containerStyle={{
        backgroundColor: hslToHex(palette.background),
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 16,
        paddingTop: 0,
        paddingBottom: 36,
      }}
    >
      {/* Action grid */}
      <View className="flex-row flex-wrap pt-4 my-4 gap-y-5">
        {actions.map((item) => (
          <ChatActionGridItem
            key={item.label}
            {...item}
            className="flex-none basis-1/4 px-1.5 py-1.5"
          />
        ))}
      </View>
    </ActionSheet>
  );
});

ConversationInputActionsSheet.displayName = "ConversationInputActionsSheet";
