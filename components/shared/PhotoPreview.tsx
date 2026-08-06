import React, { useCallback } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { Image, ImageSource } from "expo-image";
import { GestureViewer } from "react-native-gesture-image-viewer";
import { cn } from "@/lib/utils";

interface PhotoPreviewProps {
  className?: string;
  children: React.ReactNode;
  source?: ImageSource;
  sources?: ImageSource[];
  index?: number;
  color?: string;
  presentationStyle?:
    | "fullScreen"
    | "overFullScreen"
    | "pageSheet"
    | "formSheet";
  onPress?: () => void;
  footer?: (helpers: {
    close: () => void;
    open: () => void;
  }) => React.ReactNode;
}

export function PhotoPreview({
  className,
  children,
  source,
  sources,
  index = 0,
  color = "rgba(0,0,0,0.8)",
  presentationStyle = "overFullScreen",
  onPress,
  footer,
}: PhotoPreviewProps) {
  const [visible, setVisible] = React.useState(false);

  const images = sources?.length ? sources : source ? [source] : [];
  const initialIndex = images.length
    ? Math.min(Math.max(index, 0), images.length - 1)
    : 0;

  const open = async () => {
    onPress?.();
    if (!images.length) return;
    setVisible(true);
  };

  const close = () => setVisible(false);

  const renderImage = useCallback((item: ImageSource) => {
    return (
      <Image
        source={item}
        style={{ width: "100%", height: "100%" }}
        contentFit="contain"
      />
    );
  }, []);

  return (
    <View className={className}>
      <Pressable className={cn("active:opacity-80", className)} onPress={open}>
        {children}
      </Pressable>

      <Modal
        transparent
        visible={visible}
        presentationStyle={presentationStyle}
        onRequestClose={close}
      >
        <GestureViewer
          data={images}
          initialIndex={initialIndex}
          renderItem={renderImage}
          ListComponent={ScrollView}
          onDismiss={close}
          backdropStyle={{ backgroundColor: color }}
          renderContainer={
            footer
              ? (children, helpers) => (
                  <View style={{ flex: 1 }}>
                    {children}
                    {footer({ close: helpers.dismiss, open })}
                  </View>
                )
              : undefined
          }
        />
      </Modal>
    </View>
  );
}
