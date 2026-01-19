import React from "react";
import { View } from "react-native";
import { StablePressable } from "../StablePressable";
import { Text } from "~/components/ui/text";
import { DynamicSceneRow, DynamicSceneRowVariant } from "./types";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { Icon } from "~/components/ui/icon";
import { ChevronRight } from "lucide-react-native";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";

interface SceneRowBuilderProps {
  className?: string;
  row: DynamicSceneRow;
}

export const SceneRowBuilder = ({ className, row }: SceneRowBuilderProps) => {
  let content = null;

  switch (row.variant) {
    case DynamicSceneRowVariant.TAPPABLE:
      content = (
        <Icon
          as={ChevronRight}
          size={20}
          color={"gray"}
          className={row.className}
        />
      );
      break;

    case DynamicSceneRowVariant.NON_TAPPABLE:
      content = (
        <Text className={cn("text-xs opacity-80", row.className)}>
          {row.props?.text}
        </Text>
      );
      break;

    case DynamicSceneRowVariant.TEXT:
      content = (
        <Input
          className={cn("text-sm w-[60vw] h-10 -my-3", row.className)}
          defaultValue={row.props?.value}
          onChangeText={(text) => {
            row.props?.onChangeText?.(text);
          }}
        />
      );
      break;

    // case DynamicSceneRowVariant.DATE:
    //   content = (
    //     <DatePicker
    //       className={cn("text-sm w-[60vw] h-10 -my-3", row.className)}
    //       defaultDate={row.props?.date}
    //       nullable={false}
    //       onChange={row.props?.onChangeDate}
    //     />
    //   );
    //   break;

    case DynamicSceneRowVariant.SWITCH:
      content = (
        <Switch
          className={cn(row.className)}
          checked={!!row.props?.checked}
          onCheckedChange={(v) => {
            row.props?.onCheckedChange?.(v);
          }}
        />
      );
      break;

    case DynamicSceneRowVariant.CUSTOM:
      content = row.props?.render?.() ?? (
        <Text className={cn("text-xs opacity-80", row.className)}>
          [Custom]
        </Text>
      );
      break;

    default:
      content = null;
  }

  return (
    <>
      <StablePressable
        className={cn(
          "flex flex-row justify-between items-center bg-card py-3 pl-3 rounded-none",
          row.wrapperClassName,
          className,
        )}
        onPress={row.props?.onPress}
        disabled={row.variant !== DynamicSceneRowVariant.TAPPABLE}
      >
        {row.variant !== DynamicSceneRowVariant.CUSTOM ? (
          <View className="flex-1">
            <Text
              className={cn(
                "text-sm text-muted-foreground",
                row.labelClassName,
              )}
            >
              {row.label}
            </Text>

            {row.description ? (
              <Text className="text-xs opacity-60">{row.description}</Text>
            ) : null}
          </View>
        ) : null}

        <View>{content}</View>
      </StablePressable>

      <Separator />
    </>
  );
};
