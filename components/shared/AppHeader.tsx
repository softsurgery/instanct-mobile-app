import { LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import { useRTL } from "~/hooks/useRTL";
import { cn } from "~/lib/utils";
import { StablePressable } from "../shared/StablePressable";
import { Icon } from "../ui/icon";
import { IconBadge } from "../ui/icon-badge";
import { Text, TextVariantDefaults } from "../ui/text";

type Shortcut =
  | {
      icon: LucideIcon;
      onPress: () => void;
      badgeText?: string;
      hidden?: boolean;
    }
  | React.ReactNode;

interface ApplicationHeaderProps {
  className?: string;
  title: string | React.ReactNode;
  titleVariant?: TextVariantDefaults;
  shortcuts?: Shortcut[];
  reverse?: boolean;
}

export const ApplicationHeader = ({
  className,
  title,
  titleVariant = "h1",
  shortcuts,
  reverse = false,
}: ApplicationHeaderProps) => {
  const isRTL = useRTL();

  const renderTitle = () => {
    if (!title) return null;

    if (typeof title === "string") {
      return (
        <Text variant={titleVariant} className="mx-2">
          {title}
        </Text>
      );
    }

    return <View className="mx-2">{title}</View>;
  };
  return (
    <View
      className={cn(
        "flex flex-row justify-between items-center gap-2 px-2",
        isRTL || reverse ? "flex-row-reverse" : "flex-row",
        className,
      )}
    >
      {renderTitle()}
      <View
        className={cn("flex gap-2", reverse ? "flex-row-reverse" : "flex-row")}
      >
        {shortcuts?.map((shortcut, index) => {
          if (
            shortcut !== null &&
            typeof shortcut === "object" &&
            "icon" in shortcut
          ) {
            return (
              <StablePressable
                key={index}
                className={cn("p-1", shortcut.hidden && "hidden")}
                onPress={shortcut.onPress}
              >
                {shortcut.badgeText ? (
                  <IconBadge
                    as={shortcut.icon}
                    size={28}
                    badgeText={shortcut.badgeText}
                  />
                ) : (
                  <Icon as={shortcut.icon} size={28} />
                )}
              </StablePressable>
            );
          }
          return shortcut;
        })}
      </View>
    </View>
  );
};
