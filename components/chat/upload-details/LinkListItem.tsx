import { Text } from "@/components/ui/text";
import { identifyUser } from "@/lib/user";
import { normalizeMessageLinkUrl } from "@/lib/messageLinks";
import { ResponseMessageDto, ResponseMessageLinkDto } from "@/types";
import { format } from "date-fns";
import { Link2 } from "lucide-react-native";
import React from "react";
import { Linking, Pressable, View } from "react-native";
import { Icon } from "~/components/ui/icon";

interface LinkListItemProps {
  message: ResponseMessageDto;
  link: ResponseMessageLinkDto;
}

export const LinkListItem = React.memo(function LinkListItem({
  message,
  link,
}: LinkListItemProps) {
  const [isOpening, setIsOpening] = React.useState(false);
  const senderName = identifyUser(message.user);

  const handlePress = React.useCallback(async () => {
    if (isOpening) return;

    setIsOpening(true);
    try {
      const normalizedUrl = normalizeMessageLinkUrl(link.url);
      const canOpen = await Linking.canOpenURL(normalizedUrl);
      if (canOpen) {
        await Linking.openURL(normalizedUrl);
      }
    } finally {
      setIsOpening(false);
    }
  }, [isOpening, link.url]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={isOpening}
      className="px-4 py-3 border-b border-border active:bg-muted/30"
    >
      <View className="flex-row items-start">
        <View className="w-10 h-10 rounded-full bg-muted items-center justify-center mr-3 mt-0.5">
          <Icon as={Link2} size={18} className="text-primary" />
        </View>
        <View className="flex-1">
          <Text className="text-primary text-[15px] font-medium" numberOfLines={2}>
            {link.url}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-muted-foreground text-xs mr-2">
              {senderName}
            </Text>
            <Text className="text-muted-foreground text-xs">
              {format(new Date(message.createdAt), "MMM d, yyyy · hh:mm a")}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
});
