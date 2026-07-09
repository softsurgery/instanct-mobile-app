import { View } from "react-native";

import { useServerImages } from "@/hooks/content/useServerImages";

interface MessageSeenIndicatorProps {
  pictureId?: number;
  fallback: string;
}

/**
 * Small read-receipt indicator displaying the participant's avatar below the last seen outgoing message.
 */
export const MessageSeenIndicator = ({
  pictureId,
  fallback,
}: MessageSeenIndicatorProps) => {
  const { jsxArray: profilePictures } = useServerImages({
    ids: [pictureId],
    fallbacks: [fallback],
    className: "rounded-full",
    wrapperClassName: "rounded-full border border-border",
    size: { width: 18, height: 18 },
  });

  return (
    <View className="self-end mr-3 -mt-0.5 mb-1.5">{profilePictures[0]}</View>
  );
};
