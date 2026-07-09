import React from "react";
import { Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { api } from "@/api";
import {
  MediaKind,
  MessageVariant,
  PendingMediaUpload,
  ResponseMessageDto,
  StagedMedia,
} from "@/types";
import { waitForUiReady } from "@/lib/device";
import { toast } from "sonner-native";
import { useChatPendingStore } from "@/stores/useChatPendingStore";
import { useShallow } from "zustand/react/shallow";

const MAX_SELECTION = 10;

interface useSendChatMediaProps {
  conversationId: number;
  messages: ResponseMessageDto[];
  onSend: (payload: {
    uploadIds: number[];
    variant: MessageVariant.IMAGE | MessageVariant.VIDEO;
    content?: string;
  }) => void;
}

/**
 * Hook managing media selection (photo/video), preview staging, batch uploading, and optimistic pending state.
 */
export const useSendChatMedia = ({
  conversationId,
  messages,
  onSend,
}: useSendChatMediaProps) => {
  const [stagedMedia, setStagedMedia] = React.useState<StagedMedia[]>([]);
  const stagedMediaRef = React.useRef(stagedMedia);

  React.useEffect(() => {
    stagedMediaRef.current = stagedMedia;
  }, [stagedMedia]);

  const pendingUploads = useChatPendingStore(
    useShallow((state) =>
      state.pendingMediaUploads.filter(
        (pending) => pending.conversationId === conversationId,
      ),
    ),
  );
  const addPendingMedia = useChatPendingStore((state) => state.addPendingMedia);
  const updatePendingMedia = useChatPendingStore(
    (state) => state.updatePendingMedia,
  );

  const updatePending = React.useCallback(
    (clientId: string, patch: Partial<PendingMediaUpload>) => {
      updatePendingMedia(clientId, patch);
    },
    [updatePendingMedia],
  );

  const serverUploadIds = React.useMemo(
    () =>
      new Set(
        messages.flatMap((message) =>
          (message.uploads ?? []).map((upload) => upload.uploadId),
        ),
      ),
    [messages],
  );

  const activePendingUploads = React.useMemo(
    () =>
      pendingUploads.filter((pending) => {
        if (!pending.uploadIds?.length) return true;
        return !pending.uploadIds.every((id) => serverUploadIds.has(id));
      }),
    [pendingUploads, serverUploadIds],
  );

  const buildPickerOptionsCallback = React.useCallback(
    (kind?: MediaKind) => buildPickerOptions(kind),
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

  const uploadMediaBatch = React.useCallback(
    async (
      items: StagedMedia[],
      variant: MessageVariant.IMAGE | MessageVariant.VIDEO,
      content?: string,
    ) => {
      const clientId = `batch-${Date.now()}-${Math.random()}`;

      const pending: PendingMediaUpload = {
        clientId,
        conversationId,
        items: items.map((item) => ({ uri: item.uri, kind: item.kind })),
        variant,
        progress: 0,
        status: "uploading",
        createdAt: new Date(),
        content,
      };

      addPendingMedia(pending);

      try {
        const totalBytes = items.reduce(
          (sum, item) => sum + (item.fileSize ?? 0),
          0,
        );

        const uploads = await api.upload.uploadFiles(
          items.map((item) => item.file),
          (percent) => updatePending(clientId, { progress: percent }),
          true,
          totalBytes > 0 ? totalBytes : undefined,
        );

        const uploadIds = uploads
          .map((upload) => upload.id)
          .filter((id): id is number => typeof id === "number");

        if (uploadIds.length !== items.length) {
          throw new Error("Upload failed");
        }

        updatePending(clientId, {
          progress: 100,
          uploadIds,
          status: "sending",
        });
        onSend({ uploadIds, variant, content });
      } catch (error) {
        console.error("Failed to send media:", error);
        updatePending(clientId, { status: "failed" });
        Alert.alert("Upload failed", "Could not send your media. Try again.");
      }
    },
    [conversationId, onSend, updatePending, addPendingMedia],
  );

  const confirmSendStagedMedia = React.useCallback(
    (caption?: string) => {
      if (stagedMedia.length === 0) return;

      const trimmedCaption = caption?.trim() || undefined;
      const itemsToSend = [...stagedMedia];
      const images = itemsToSend.filter((item) => item.kind === "image");
      const videos = itemsToSend.filter((item) => item.kind === "video");

      setStagedMedia([]);

      if (images.length > 0) {
        void uploadMediaBatch(images, MessageVariant.IMAGE, trimmedCaption);
      }

      if (videos.length > 0) {
        void uploadMediaBatch(
          videos,
          MessageVariant.VIDEO,
          images.length === 0 ? trimmedCaption : undefined,
        );
      }
    },
    [stagedMedia, uploadMediaBatch],
  );

  // This function is used to pick and stage the media.
  const pickAndStage = React.useCallback(
    async (kind?: MediaKind, append = false) => {
      await waitForUiReady();

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        toast.error("Permission required", {
          description:
            "Please allow access to your photo library to send media.",
        });
        return;
      }

      const effectiveKind =
        kind ??
        (append && stagedMediaRef.current[0]
          ? stagedMediaRef.current[0].kind
          : undefined);

      try {
        const result = await ImagePicker.launchImageLibraryAsync(
          buildPickerOptionsCallback(effectiveKind),
        );

        if (result.canceled || result.assets.length === 0) return;

        const incoming = result.assets.map(toStagedMedia);

        // Wait for the native picker to fully dismiss before showing staging.
        await waitForUiReady();

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
    [buildPickerOptionsCallback, mergeStagedMedia],
  );

  /**
   * Clears all currently staged media items from state.
   */
  const cancelStagedMedia = React.useCallback(() => {
    setStagedMedia([]);
  }, []);

  /**
   * Removes a single staged media item by its unique ID.
   */
  const removeStagedMedia = React.useCallback((id: string) => {
    setStagedMedia((current) => current.filter((item) => item.id !== id));
  }, []);

  /**
   * Opens the picker to append additional media items to the staged list.
   */
  const addMoreStagedMedia = React.useCallback(() => {
    pickAndStage(undefined, true);
  }, [pickAndStage]);

  /**
   * Triggers image selection via ImagePicker and stages selected items.
   */
  const pickImage = React.useCallback(
    () => pickAndStage("image", stagedMediaRef.current.length > 0),
    [pickAndStage],
  );

  /**
   * Triggers video selection via ImagePicker and stages selected items.
   */
  const pickVideo = React.useCallback(
    () => pickAndStage("video", stagedMediaRef.current.length > 0),
    [pickAndStage],
  );

  return {
    pickImage,
    pickVideo,
    stagedMedia,
    pendingUploads: activePendingUploads,
    confirmSendStagedMedia,
    cancelStagedMedia,
    removeStagedMedia,
    addMoreStagedMedia,
  };
};

/**
 * Determines whether the picked asset is a video or image.
 */
const assetKind = (asset: ImagePicker.ImagePickerAsset): MediaKind =>
  asset.type === "video" ? "video" : "image";

/**
 * Converts a React Native ImagePickerAsset into a File-like structure for uploading.
 */
const toUploadFile = (asset: ImagePicker.ImagePickerAsset) =>
  ({
    uri: asset.uri,
    name: asset.fileName || asset.uri.split("/").pop() || "media",
    type:
      asset.mimeType || (asset.type === "video" ? "video/mp4" : "image/jpeg"),
  }) as unknown as File;

/**
 * Converts a raw ImagePickerAsset into a StagedMedia domain model.
 */
const toStagedMedia = (asset: ImagePicker.ImagePickerAsset): StagedMedia => ({
  id: `${asset.assetId ?? asset.uri}-${Date.now()}-${Math.random()}`,
  file: toUploadFile(asset),
  kind: assetKind(asset),
  uri: asset.uri,
  fileSize: asset.fileSize,
});

/**
 * Builds configuration options for ImagePicker depending on the requested media kind.
 */
const buildPickerOptions = (
  kind?: MediaKind,
): ImagePicker.ImagePickerOptions => {
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
};
