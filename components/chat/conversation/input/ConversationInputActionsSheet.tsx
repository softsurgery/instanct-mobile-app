import React from "react";
import { useColorPalette } from "@/hooks/useColorPalette";
import { File, Hand, Image as ImageIcon, Video } from "lucide-react-native";
import { View } from "react-native";
import ActionSheet, { type ActionSheetRef } from "react-native-actions-sheet";
import { ChatActionGridItem } from "./ChatActionGridItem";
import { useTranslation } from "react-i18next";

interface ConversationInputActionsSheetProps {
  onPoke: () => void;
  onPickImage: () => void;
  onPickVideo: () => void;
  onPickFile: () => void;
  disabled?: boolean;
}

export const ConversationInputActionsSheet = React.forwardRef<
  ActionSheetRef,
  ConversationInputActionsSheetProps
>(({ onPoke, onPickImage, onPickVideo, onPickFile, disabled }, ref) => {
  const { t } = useTranslation("chat");
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
      label: t("chat.conversation.attachments.photo.label"),
      sublabel: t("chat.conversation.attachments.photo.sublabel"),
      icon: ImageIcon,
      iconColor: "#3B82F6",
      onPress: () => runAction(onPickImage),
      disabled,
    },
    {
      label: t("chat.conversation.attachments.video.label"),
      sublabel: t("chat.conversation.attachments.video.sublabel"),
      icon: Video,
      iconColor: "#8B5CF6",

      onPress: () => runAction(onPickVideo),
      disabled,
    },
    {
      label: t("chat.conversation.attachments.file.label"),
      sublabel: t("chat.conversation.attachments.file.sublabel"),
      icon: File,
      iconColor: "#eab308",

      onPress: () => runAction(onPickFile),
      disabled,
    },
    {
      label: t("chat.conversation.attachments.poke.label"),
      sublabel: t("chat.conversation.attachments.poke.sublabel"),
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
        backgroundColor: palette.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 32,
      }}
    >
      {/* Action grid */}
      <View className="flex-row flex-wrap my-5 gap-y-5">
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
