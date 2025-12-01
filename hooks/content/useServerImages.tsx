import { cn } from "@/lib/utils";
import { useQueries } from "@tanstack/react-query";
import { Image, ImageSource } from "expo-image";
import React from "react";
import { View } from "react-native";
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
  wrapperClassName?: string;
  fallbackClassName?: string;
  className?: string;
  enabled?: boolean;
}

export const useServerImages = ({
  ids,
  fallbacks = [],
  size,
  className,
  wrapperClassName,
  fallbackClassName,
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
          <View
            key={id}
            className={cn(wrapperClassName, "flex items-center justify-center")}
            style={{
              width: size.width * 1.05,
              height: size.height * 1.05,
              borderRadius: size.width / 2,
            }}
          >
            <Image
              className={cn(className)}
              source={upload}
              style={{
                width: size.width,
                height: size.height,
                borderRadius: size.width / 2,
              }}
              contentFit="cover"
            />
          </View>
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
          <View
            key={id}
            className={cn(wrapperClassName, "flex items-center justify-center")}
            style={{
              width: size.width * 1.05,
              height: size.height * 1.05,
              borderRadius: size.width / 2,
            }}
          >
            <Image
              source={fallback as ImageSource}
              className={cn(className)}
              style={{
                width: size.width,
                height: size.height,
                borderRadius: size.width / 2,
              }}
              contentFit="cover"
            />
          </View>
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
              <Text className={fallbackClassName}>
                {fallback.toUpperCase()}
              </Text>
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
