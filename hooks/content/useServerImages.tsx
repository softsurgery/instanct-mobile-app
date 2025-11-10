import { cn } from "@/lib/utils";
import { useQueries } from "@tanstack/react-query";
import { Image, ImageSource } from "expo-image";
import React from "react";
import { api } from "~/api";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/shared/StableAvatar";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";

interface UseServerImagesProps {
  ids: (number | undefined)[];
  fallbacks?: (string | React.ReactNode | ImageSource | undefined)[];
  size: { width: number; height: number };
  className?: string;
  enabled?: boolean;
}

export const useServerImages = ({
  ids,
  fallbacks = [],
  size,
  className,
  enabled = true,
}: UseServerImagesProps) => {
  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["server-image", id],
      queryFn: async () => (id ? api.upload.getUploadById(id) : null),
      enabled: !!id && enabled,
    })),
  });

  const uploads = queries.map((q) => q.data ?? null);
  const isPending = queries.some((q) => q.isPending);

  const jsxArray = React.useMemo(() => {
    return queries.map((q, index) => {
      const upload = q.data;
      const id = ids[index];
      const fallback = fallbacks[index];

      if (upload && !q.isPending) {
        return (
          <Image
            key={id}
            source={upload}
            style={{
              width: size.width,
              height: size.height,
              borderRadius: size.width / 2,
            }}
            className={cn(className)}
            contentFit="cover"
          />
        );
      }

      if (q.isFetching && id) {
        return (
          <Skeleton
            key={id}
            style={{
              width: size.width,
              height: size.height,
              borderRadius: size.width / 2,
            }}
          />
        );
      }

      if (
        fallback &&
        typeof fallback === "object" &&
        ("uri" in fallback || typeof fallback === "number")
      ) {
        return (
          <Image
            key={id}
            source={fallback as ImageSource}
            className={cn(className)}
            style={{
              width: size.width,
              height: size.height,
              borderRadius: size.width / 2,
            }}
            contentFit="cover"
          />
        );
      }

      if (typeof fallback === "string") {
        return (
          <Avatar
            key={id}
            className={cn(className)}
            style={{
              width: size.width,
              height: size.height,
              borderRadius: size.width / 2,
            }}
          >
            <AvatarImage />
            <AvatarFallback>
              <Text>{fallback.toUpperCase()}</Text>
            </AvatarFallback>
          </Avatar>
        );
      }

      if (React.isValidElement(fallback)) {
        return React.cloneElement(fallback, { key: id });
      }

      return (
        <Skeleton
          key={id}
          style={{
            width: size.width,
            height: size.height,
            borderRadius: size.width / 2,
          }}
        />
      );
    });
  }, [queries, ids, fallbacks, size, className]);

  return { uploads, isPending, jsxArray };
};
