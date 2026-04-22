import { api } from "@/api";
import { useMutation, useQuery } from "@tanstack/react-query";

interface useBookmarkActionsProps {
  bookmarkId: string;
  enabled?: boolean;
  onSaveBookmarkSuccess?: () => void;
  onDeleteBookmarkSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useBookmarkActions = ({
  bookmarkId,
  enabled = true,
  onSaveBookmarkSuccess,
  onDeleteBookmarkSuccess,
  onError,
}: useBookmarkActionsProps) => {
  const {
    data: bookmark,
    isPending: isBookmarkPending,
    refetch: refetchBookmark,
  } = useQuery({
    queryKey: ["bookmark", bookmarkId],
    queryFn: () => api.bookmark.findBookmark(bookmarkId),
    enabled: enabled && !!bookmarkId,
  });

  const { mutate: saveBookmark, isPending: isSavingBookmark } = useMutation({
    mutationKey: ["save-bookmark", bookmarkId],
    mutationFn: () => api.bookmark.saveBookmark(bookmarkId),
    onSuccess: () => {
      refetchBookmark();
      onSaveBookmarkSuccess?.();
    },
    onError,
  });

  const { mutate: deleteBookmark, isPending: isDeletingBookmark } = useMutation(
    {
      mutationKey: ["delete-bookmark", bookmarkId],
      mutationFn: () => api.bookmark.deleteBookmark(bookmarkId),
      onSuccess: () => {
        refetchBookmark();
        onDeleteBookmarkSuccess?.();
      },
      onError,
    },
  );

  return {
    bookmark,
    isBookmarkPending,
    refetchBookmark,
    saveBookmark,
    isSavingBookmark,
    deleteBookmark,
    isDeletingBookmark,
  };
};
