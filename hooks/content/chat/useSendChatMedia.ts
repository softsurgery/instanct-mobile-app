import * as ImagePicker from "expo-image-picker";
import { api } from "@/api";
import { MessageVariant, PendingMediaUpload, ResponseMessageDto } from "@/types";
import React from "react";
import { Alert, InteractionManager, Platform } from "react-native";

type MediaKind = "image" | "video";

const MAX_SELECTION = 10;

export interface StagedMedia {
  id: string;
  file: File;
  kind: MediaKind;
  uri: string;
}

const toUploadFile = (asset: ImagePicker.ImagePickerAsset) =>
  ({
    uri: asset.uri,
    name: asset.fileName || asset.uri.split("/").pop() || "media",
    type:
      asset.mimeType ||
      (asset.type === "video" ? "video/mp4" : "image/jpeg"),
  }) as unknown as File;

const assetKind = (asset: ImagePicker.ImagePickerAsset): MediaKind =>
  asset.type === "video" ? "video" : "image";

const toStagedMedia = (asset: ImagePicker.ImagePickerAsset): StagedMedia => ({
  id: `${asset.assetId ?? asset.uri}-${Date.now()}-${Math.random()}`,
  file: toUploadFile(asset),
  kind: assetKind(asset),
  uri: asset.uri,
});

const waitForUiReady = () =>
  new Promise<void>((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => resolve());
    });
  });

interface UseSendChatMediaProps {
  messages: ResponseMessageDto[];
  onSend: (payload: {
    uploadIds: number[];
    variant: MessageVariant.IMAGE | MessageVariant.VIDEO;
    content?: string;
  }) => void;
}

export const useSendChatMedia = ({
  messages,
  onSend,
}: UseSendChatMediaProps) => {
  const [stagedMedia, setStagedMedia] = React.useState<StagedMedia[]>([]);
  const [pendingUploads, setPendingUploads] = React.useState<
    PendingMediaUpload[]
  >([]);

  const updatePending = React.useCallback(
    (clientId: string, patch: Partial<PendingMediaUpload>) => {
      setPendingUploads((current) =>
        current.map((item) =>
          item.clientId === clientId ? { ...item, ...patch } : item,
        ),
      );
    },
    [],
  );

  React.useEffect(() => {
    if (pendingUploads.length === 0) return;

    const serverUploadIds = new Set(
      messages.flatMap((message) =>
        (message.uploads ?? []).map((upload) => upload.uploadId),
      ),
    );

    setPendingUploads((current) =>
      current.filter(
        (pending) =>
          !pending.uploadId || !serverUploadIds.has(pending.uploadId),
      ),
    );
  }, [messages, pendingUploads.length]);

  const buildPickerOptions = React.useCallback(
    (kind?: MediaKind): ImagePicker.ImagePickerOptions => {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes:
          kind === "image"
            ? ["images"]
            : kind === "video"
              ? ["videos"]
              : ["images", "videos"],
        allowsEditing: false,
        allowsMultipleSelection: true,
        selectionLimit: MAX_SELECTION,
        quality: 0.85,
      };

      if (kind !== "image") {
        options.videoMaxDuration = 120;
      }

      if (Platform.OS === "ios") {
        options.shouldDownloadFromNetwork = true;
      }

      return options;
    },
    [],
  );

  const mergeStagedMedia = React.useCallback(
    (current: StagedMedia[], incoming: StagedMedia[]) => {
      if (incoming.length === 0) return current;

      const incomingKind = incoming[0].kind;
      const hasMixedIncoming = incoming.some(
        (item) => item.kind !== incomingKind,
      );
      if (hasMixedIncoming) {
        Alert.alert(
          "Mixed media",
          "Photos and videos can't be sent together. Please select one type.",
        );
        return current;
      }

      if (current.length > 0 && current[0].kind !== incomingKind) {
        Alert.alert(
          "Mixed media",
          "Photos and videos can't be sent together. Remove current items first or pick the same type.",
        );
        return current;
      }

      const merged = [...current, ...incoming];
      if (merged.length > MAX_SELECTION) {
        Alert.alert(
          "Limit reached",
          `You can send up to ${MAX_SELECTION} items at once.`,
        );
        return merged.slice(0, MAX_SELECTION);
      }

      return merged;
    },
    [],
  );

  const uploadStagedItem = React.useCallback(
    async (item: StagedMedia, content?: string) => {
      const variant =
        item.kind === "video" ? MessageVariant.VIDEO : MessageVariant.IMAGE;
      const clientId = item.id;

      const pending: PendingMediaUpload = {
        clientId,
        uri: item.uri,
        kind: item.kind,
        variant,
        progress: 0,
        status: "uploading",
        createdAt: new Date(),
        content,
      };

      setPendingUploads((current) => [pending, ...current]);

      try {
        const uploads = await api.upload.uploadFiles(
          [item.file],
          (percent) => updatePending(clientId, { progress: percent }),
          true,
        );

        const uploadId = uploads[0]?.id;
        if (!uploadId) {
          throw new Error("Upload failed");
        }

        updatePending(clientId, { progress: 100, uploadId });
        onSend({ uploadIds: [uploadId], variant, content });
      } catch (error) {
        console.error("Failed to send media:", error);
        updatePending(clientId, { status: "failed" });
        Alert.alert("Upload failed", "Could not send your media. Try again.");
      }
    },
    [onSend, updatePending],
  );

  const confirmSendStagedMedia = React.useCallback(
    (caption?: string) => {
      if (stagedMedia.length === 0) return;

      const trimmedCaption = caption?.trim() || undefined;
      const itemsToSend = [...stagedMedia];
      const images = itemsToSend.filter((item) => item.kind === "image");
      const videos = itemsToSend.filter((item) => item.kind === "video");

      setStagedMedia([]);

      let captionRemaining = trimmedCaption;

      for (const item of itemsToSend) {
        let content: string | undefined;

        if (captionRemaining) {
          if (item.kind === "image" && images[0]?.id === item.id) {
            content = captionRemaining;
            captionRemaining = undefined;
          } else if (
            item.kind === "video" &&
            images.length === 0 &&
            videos[0]?.id === item.id
          ) {
            content = captionRemaining;
            captionRemaining = undefined;
          }
        }

        void uploadStagedItem(item, content);
      }
    },
    [stagedMedia, uploadStagedItem],
  );

  const cancelStagedMedia = React.useCallback(() => {
    setStagedMedia([]);
  }, []);

  const removeStagedMedia = React.useCallback((id: string) => {
    setStagedMedia((current) => current.filter((item) => item.id !== id));
  }, []);

  const pickAndStage = React.useCallback(
    async (kind?: MediaKind, append = false) => {
      await waitForUiReady();

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow access to your photo library to send media.",
        );
        return;
      }

      const effectiveKind =
        kind ?? (append && stagedMedia[0] ? stagedMedia[0].kind : undefined);

      try {
        const result = await ImagePicker.launchImageLibraryAsync(
          buildPickerOptions(effectiveKind),
        );

        if (result.canceled || result.assets.length === 0) return;

        const incoming = result.assets.map(toStagedMedia);
        setStagedMedia((current) =>
          append
            ? mergeStagedMedia(current, incoming)
            : mergeStagedMedia([], incoming),
        );
      } catch (error) {
        console.error("Failed to pick media:", error);
        Alert.alert(
          "Couldn't load media",
          "The selected item may still be downloading from iCloud. Try again in a moment.",
        );
      }
    },
    [buildPickerOptions, mergeStagedMedia, stagedMedia],
  );

  const addMoreStagedMedia = React.useCallback(() => {
    pickAndStage(undefined, true);
  }, [pickAndStage]);

  const pickImage = React.useCallback(
    () => pickAndStage("image", stagedMedia.length > 0),
    [pickAndStage, stagedMedia.length],
  );
  const pickVideo = React.useCallback(
    () => pickAndStage("video", stagedMedia.length > 0),
    [pickAndStage, stagedMedia.length],
  );

  return {
    pickImage,
    pickVideo,
    stagedMedia,
    pendingUploads,
    confirmSendStagedMedia,
    cancelStagedMedia,
    removeStagedMedia,
    addMoreStagedMedia,
  };
};
