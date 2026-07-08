import React from "react";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { api } from "@/api";
import { MessageVariant, PendingFileUpload, ResponseMessageDto } from "@/types";
import { waitForUiReady } from "@/lib/device";
import { toast } from "sonner-native";
import { useChatPendingStore } from "@/stores/useChatPendingStore";
import { useShallow } from "zustand/react/shallow";
import { ReactNativeUploadFile } from "@/api/upload";

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
        if (!pending.uploadId) return true;
        return !serverUploadIds.has(pending.uploadId);
      }),
    [pendingUploads, serverUploadIds],
  );

  const uploadFileBatch = React.useCallback(
    async (
      files: DocumentPicker.DocumentPickerAsset[],
      content?: string,
    ) => {
      for (const file of files) {
        const clientId = `file-${Date.now()}-${Math.random()}`;
        const filename = file.name || "file";

        const pending: PendingFileUpload = {
          clientId,
          conversationId,
          filename,
          progress: 0,
          status: "uploading",
          createdAt: new Date(),
          content,
        };

        addPendingFile(pending);

        try {
          const uploadPayload: ReactNativeUploadFile = {
            uri: file.uri,
            name: filename,
            type: file.mimeType || "application/octet-stream",
          };

          const upload = await api.upload.uploadFile(
            uploadPayload,
            (percent) => updatePendingFile(clientId, { progress: percent }),
            true,
          );

          if (typeof upload.id !== "number") {
            throw new Error("Upload failed");
          }

          updatePendingFile(clientId, {
            progress: 100,
            uploadId: upload.id,
            status: "sending",
          });

          onSend({
            uploadIds: [upload.id],
            variant: MessageVariant.FILE,
            content,
          });
        } catch (error) {
          console.error("Failed to send file:", error);
          updatePendingFile(clientId, { status: "failed" });
          Alert.alert(
            "Upload failed",
            `Could not send ${filename}. Try again.`,
          );
        }
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
