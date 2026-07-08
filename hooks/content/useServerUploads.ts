import { useQueries } from "@tanstack/react-query";
import React from "react";
import { api } from "@/api";
import { Upload } from "@/types/upload";

export const useServerUploads = (ids: (number | undefined)[]) => {
  const idsString = JSON.stringify(ids);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedIds = React.useMemo(() => ids, [idsString]);

  const uniqueIds = React.useMemo(
    () =>
      [...new Set(memoizedIds.filter((id): id is number => typeof id === "number"))],
    [memoizedIds],
  );

  const queries = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: ["upload", id],
      queryFn: () => api.upload.fetchUploadById(id),
      staleTime: Infinity,
    })),
  });

  const uploadsById = React.useMemo(() => {
    const map = new Map<number, Upload>();

    uniqueIds.forEach((id, index) => {
      const upload = queries[index]?.data;
      if (upload) {
        map.set(id, upload);
      }
    });

    return map;
  }, [queries, uniqueIds]);

  const uploads = React.useMemo(
    () =>
      memoizedIds.map((id) => {
        if (typeof id !== "number") return undefined;
        return uploadsById.get(id);
      }),
    [memoizedIds, uploadsById],
  );

  const isLoading = queries.some((query) => query.isLoading);

  return {
    uploads,
    isLoading,
  };
};
