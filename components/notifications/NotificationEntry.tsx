import { timeAgo } from "@/lib/date";
import { useTranslation } from "react-i18next";
import { Image, View } from "react-native";
import { cn } from "~/lib/utils";
import {
  NotificationType,
  ResponseNotificationDto,
} from "~/types/notifications";
import { HTMLText } from "../shared/HTMLText";
import { StablePressable } from "../shared/StablePressable";
import { Text } from "../ui/text";
import { useServerImages } from "@/hooks/content/useServerImages";
import { router } from "expo-router";

interface NotificationEntryProps {
  className?: string;
  notification: ResponseNotificationDto;
}

export const NotificationEntry = ({
  className,
  notification,
}: NotificationEntryProps) => {
  const { t } = useTranslation("notifications");
  const onPress = () => {
    switch (notification.type) {
      case NotificationType.REQUEST_RECEIVED:
        router.push({
          pathname: `/main/request/answer`,
          params: { id: notification.payload.requestId },
        });
        break;
      case NotificationType.NEW_SIGNIN:
        router.push("/main/(tabs)/menu");
        break;
      default:
        break;
    }
  };

  //profile picture side-effect
  const { uploads: profileUploads } = useServerImages({
    ids: [notification.payload.pictureId],
    fallbacks: ["?", ""],
    wrapperClassName:
      "border border-border bg-background rounded-full shadow-md",
    size: { width: 100, height: 100 },
    enabled: !!notification.payload.pictureId,
  });
  const profilePictureSource = profileUploads?.[0];

  return (
    <StablePressable
      className={cn("flex flex-row items-center gap-2 px-2 py-1", className)}
      onPress={onPress}
    >
      <Image
        className="w-16 h-16 rounded-full"
        source={
          profilePictureSource
            ? { uri: profilePictureSource }
            : require("@/assets/images/icon.png")
        }
      />
      <View className="flex flex-col gap-2 px-2 py-1 flex-1">
        <HTMLText variant={"large"}>
          {t(`titles.${notification.type}`)}
        </HTMLText>
        <HTMLText variant="muted" className="-mt-2">
          {t(
            `descriptions.${notification.type}`,
            notification.payload,
          ).toString()}
        </HTMLText>
        <Text variant={"muted"} className="ml-auto">
          {timeAgo(notification.createdAt)}
        </Text>
      </View>
    </StablePressable>
  );
};
