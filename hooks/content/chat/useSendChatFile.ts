import React from "react";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { api } from "@/api";
import { ReactNativeUploadFile } from "@/api/upload";
import { MessageVariant, PendingFileUpload, ResponseMessageDto } from "@/types";
import { waitForUiReady } from "@/lib/device";
import { toast } from "sonner-native";
import { useChatPendingStore } from "@/stores/useChatPendingStore";
import { useShallow } from "zustand/react/shallow";

const MAX_FILE_SELECTION = 10;

interface UseSendChatFileProps {
  conversationId: number;
  messages: ResponseMessageDto[];
  onSend: (payload: {
    uploadIds: number[];
    variant: MessageVariant.FILE;
    content?: string;
  }) => void;
}

export const useSendChatFile = ({
  conversationId,
  messages,
  onSend,
}: UseSendChatFileProps) => {
  const pendingUploads = useChatPendingStore(
    useShallow((state) =>
      state.pendingFileUploads.filter(
        (pending) => pending.conversationId === conversationId,
      ),
    ),
  );
  const addPendingFile = useChatPendingStore((state) => state.addPendingFile);
  const updatePendingFile = useChatPendingStore(
    (state) => state.updatePendingFile,
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

  const uploadFileBatch = React.useCallback(
    async (
      files: DocumentPicker.DocumentPickerAsset[],
      content?: string,
    ) => {
      const clientId = `file-batch-${Date.now()}-${Math.random()}`;

      const pending: PendingFileUpload = {
        clientId,
        conversationId,
        items: files.map((file) => ({
          filename: file.name || "File",
          mimetype: file.mimeType || undefined,
          fileSize: file.size,
        })),
        progress: 0,
        status: "uploading",
        createdAt: new Date(),
        content,
      };

      addPendingFile(pending);

      try {
        const uploadPayloads: ReactNativeUploadFile[] = files.map((file) => ({
          uri: file.uri,
          name: file.name || "File",
          type: file.mimeType || "application/octet-stream",
        }));

        const uploadIds: number[] = [];

        for (let index = 0; index < uploadPayloads.length; index++) {
          const upload = await api.upload.uploadFile(
            uploadPayloads[index],
            (filePercent) => {
              const overall = Math.round(
                (index * 100 + filePercent) / uploadPayloads.length,
              );
              updatePendingFile(clientId, {
                progress: Math.min(99, overall),
              });
            },
            true,
          );

          if (typeof upload.id !== "number") {
            throw new Error("Upload failed");
          }

          uploadIds.push(upload.id);
        }

        if (uploadIds.length !== files.length) {
          throw new Error("Upload failed");
        }

        updatePendingFile(clientId, {
          progress: 100,
          uploadIds,
          status: "sending",
        });

        onSend({
          uploadIds,
          variant: MessageVariant.FILE,
          content,
        });
      } catch (error) {
        console.error("Failed to send files:", error);
        updatePendingFile(clientId, { status: "failed" });
        Alert.alert("Upload failed", "Could not send your files. Try again.");
      }
    },
    [conversationId, onSend, addPendingFile, updatePendingFile],
  );

  const pickFile = React.useCallback(async () => {
    await waitForUiReady();

    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled || result.assets.length === 0) return;

      const files = result.assets.slice(0, MAX_FILE_SELECTION);
      if (result.assets.length > MAX_FILE_SELECTION) {
        toast.error("Limit reached", {
          description: `You can send up to ${MAX_FILE_SELECTION} files at once.`,
        });
      }

      await waitForUiReady();
      void uploadFileBatch(files);
    } catch (error) {
      console.error("Failed to pick file:", error);
      Alert.alert("Couldn't load file", "Please try again in a moment.");
    }
  }, [uploadFileBatch]);

  return {
    pickFile,
    pendingUploads: activePendingUploads,
  };
};
