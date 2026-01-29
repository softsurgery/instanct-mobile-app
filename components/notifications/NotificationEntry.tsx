import { timeAgo } from "@/lib/date";
import { useTranslation } from "react-i18next";
import { Image, View } from "react-native";
import { cn } from "~/lib/utils";
import { ResponseNotificationDto } from "~/types/notifications";
import { HTMLText } from "../shared/HTMLText";
import { StablePressable } from "../shared/StablePressable";
import { Text } from "../ui/text";

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
    }
  };
  return (
    <StablePressable
      className={cn("flex flex-row items-center gap-2 px-2 py-1", className)}
      onPress={onPress}
    >
      <Image
        className="w-16 h-16 rounded-full"
        source={require("@/assets/images/icon.png")}
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
