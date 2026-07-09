import { api } from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  const {
    data: bookmark,
    isLoading: isBookmarkPending,
    refetch: refetchBookmark,
  } = useQuery({
    queryKey: ["bookmark", bookmarkId],
    queryFn: () => api.bookmark.findBookmark(bookmarkId),
    enabled: enabled && !!bookmarkId,
  });

  const isBookmarked = !!bookmark;

  const { mutate: saveBookmark, isPending: isSavingBookmark } = useMutation({
    mutationKey: ["save-bookmark", bookmarkId],
    mutationFn: () => api.bookmark.saveBookmark(bookmarkId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["bookmark", bookmarkId] });
      const previous = queryClient.getQueryData(["bookmark", bookmarkId]);
      queryClient.setQueryData(["bookmark", bookmarkId], true);
      return { previous };
    },
    onSuccess: () => {
      onSaveBookmarkSuccess?.();
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(["bookmark", bookmarkId], context?.previous);
      onError?.(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmark", bookmarkId] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });

  const { mutate: deleteBookmark, isPending: isDeletingBookmark } = useMutation(
    {
      mutationKey: ["delete-bookmark", bookmarkId],
      mutationFn: () => api.bookmark.deleteBookmark(bookmarkId),
      onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: ["bookmark", bookmarkId] });
        const previous = queryClient.getQueryData(["bookmark", bookmarkId]);
        queryClient.setQueryData(["bookmark", bookmarkId], null);
        return { previous };
      },
      onSuccess: () => {
        onDeleteBookmarkSuccess?.();
      },
      onError: (error, _, context) => {
        queryClient.setQueryData(["bookmark", bookmarkId], context?.previous);
        onError?.(error);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["bookmark", bookmarkId] });
        queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      },
    },
  );

  const toggleBookmark = () => {
    if (isBookmarked) {
      deleteBookmark();
    } else {
      saveBookmark();
    }
  };

  return {
    isBookmarked,
    isBookmarkPending,
    refetchBookmark,
    toggleBookmark,
    saveBookmark,
    isSavingBookmark,
    deleteBookmark,
    isDeletingBookmark,
  };
};
