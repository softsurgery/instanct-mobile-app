import * as ImagePicker from "expo-image-picker";
import { api } from "@/api";
import { MessageVariant } from "@/types";
import React from "react";
import { Alert, InteractionManager } from "react-native";

type MediaKind = "image" | "video";

const toUploadFile = (asset: ImagePicker.ImagePickerAsset) =>
  ({
    uri: asset.uri,
    name: asset.fileName || asset.uri.split("/").pop() || "media",
    type:
      asset.mimeType ||
      (asset.type === "video" ? "video/mp4" : "image/jpeg"),
  }) as unknown as File;

const waitForUiReady = () =>
  new Promise<void>((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => resolve());
    });
  });

interface UseSendChatMediaProps {
  conversationId: number;
  onSend: (payload: {
    uploadIds: number[];
    variant: MessageVariant.IMAGE | MessageVariant.VIDEO;
    content?: string;
  }) => void;
}

export const useSendChatMedia = ({
  conversationId,
  onSend,
}: UseSendChatMediaProps) => {
  const [isSendingMedia, setIsSendingMedia] = React.useState(false);

  const pickAndSend = React.useCallback(
    async (kind: MediaKind) => {
      await waitForUiReady();

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow access to your photo library to send media.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: kind === "image" ? ["images"] : ["videos"],
        allowsEditing: false,
        quality: 0.85,
        videoMaxDuration: 120,
      });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      const file = toUploadFile(asset);

      setIsSendingMedia(true);
      try {
        const uploads = await api.upload.uploadFiles([file], undefined, true);
        const uploadIds = uploads.map((upload) => upload.id);

        if (uploadIds.length === 0) {
          throw new Error("Upload failed");
        }

        onSend({
          uploadIds,
          variant:
            kind === "video" ? MessageVariant.VIDEO : MessageVariant.IMAGE,
        });
      } catch (error) {
        console.error("Failed to send media:", error);
        Alert.alert("Upload failed", "Could not send your media. Try again.");
      } finally {
        setIsSendingMedia(false);
      }
    },
    [onSend],
  );

  const pickImage = React.useCallback(() => pickAndSend("image"), [pickAndSend]);
  const pickVideo = React.useCallback(() => pickAndSend("video"), [pickAndSend]);

  return {
    pickImage,
    pickVideo,
    isSendingMedia,
  };
};
