import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "../ui/text";

interface SeeMoreTextProps {
  children: string;
  className?: string;
  numberOfLines?: number;
  textClassname?: string;
  pressableClassname?: string;
}

export const SeeMoreText = ({
  children,
  numberOfLines = 2,
  className,
  textClassname,
  pressableClassname,
}: SeeMoreTextProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [measured, setMeasured] = useState(false);

  return (
    <View className={className}>
      <Text
        className={textClassname}
        numberOfLines={measured && !expanded ? numberOfLines : undefined}
        onTextLayout={(e) => {
          if (measured) return;
          if (e.nativeEvent.lines.length > numberOfLines) {
            setShowButton(true);
          }
          setMeasured(true);
        }}
        style={{ opacity: measured ? 1 : 0 }}
      >
        {children}
      </Text>
      {showButton && (
        <Pressable
          className={pressableClassname}
          onPress={() => setExpanded(!expanded)}
        >
          <Text className="text-primary text-sm">
            {expanded ? "See less" : "See more"}
          </Text>
        </Pressable>
      )}
    </View>
  );
};
