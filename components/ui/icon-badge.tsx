import type { LucideIcon, LucideProps } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import { cn } from "~/lib/utils";
import { Icon } from "./icon";
import { Text } from "./text";

type IconBadgeProps = LucideProps & {
  as: LucideIcon;
  className?: string;
  size?: number;
  badgeText?: string;
  badgeClassName?: string;
};

export function IconBadge({
  as,
  className,
  size = 20,
  badgeText,
  badgeClassName,
  ...props
}: IconBadgeProps) {
  return (
    <View className="relative">
      <Icon as={as} className={className} size={size} {...props} />

      {badgeText != null && (
        <View
          className={cn(
            "absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[16px] h-[16px] items-center justify-center",
            badgeClassName
          )}
        >
          {badgeText ? (
            <Text variant={"small"} className="text-white font-bold -mt-0.5">
              {badgeText}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}
