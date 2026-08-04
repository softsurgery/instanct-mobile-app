import React from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Text } from "~/components/ui/text";
import { useTranslation } from "react-i18next";

interface MediaUploadProgressProps {
  progress: number;
  failed?: boolean;
}

const SIZE = 52;
const STROKE = 3;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Circular SVG progress overlay displaying upload percentage or failure badge over pending media/files.
 */
export const MediaUploadProgress = ({
  progress,
  failed,
}: MediaUploadProgressProps) => {
  const { t } = useTranslation("chat");
  const clamped = Math.min(Math.max(progress, 0), 100);
  const offset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <View className="absolute inset-0 items-center justify-center bg-black/45 rounded-xl">
      <View className="items-center justify-center">
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={STROKE}
            fill="none"
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={failed ? "#f87171" : "white"}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE}`}
            strokeDashoffset={failed ? 0 : offset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>
        <Text className="absolute text-xs font-semibold text-white">
          {failed
            ? t("chat.conversation.upload.progressFailed")
            : `${clamped}%`}
        </Text>
      </View>
    </View>
  );
};
