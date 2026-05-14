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
  const uniqueIds = React.useMemo(
    () =>
      Array.from(
        new Set(ids.filter((id) => typeof id === "number")),
      ) as number[],
    [ids],
  );

  const queries = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: ["server-image", id],
      queryFn: () => api.upload.getUploadById(id),
      enabled: enabled,
    })),
  });

  // Build a map from ID to query result for O(1) lookups
  const queryMap = React.useMemo(() => {
    const map = new Map<number, (typeof queries)[0]>();
    uniqueIds.forEach((id, index) => {
      map.set(id, queries[index]);
    });
    return map;
  }, [uniqueIds, queries]);

  const uploads = uniqueIds.map(
    (id) => queryMap.get(id)?.data as ImageSource | undefined,
  );
  const isPending = queries.some((q) => q.isPending);

  const jsxArray = React.useMemo(() => {
    return ids.map((id, index) => {
      const upload = id !== undefined ? queryMap.get(id)?.data : undefined;
      const query = id !== undefined ? queryMap.get(id) : undefined;
      const fallback = fallbacks[index];

      if (upload && !query?.isPending) {
        return (
          <View
            key={index}
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

      if (query?.isFetching && id !== undefined) {
        return (
          <Skeleton
            key={index}
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
            key={index}
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
            key={index}
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
        return React.cloneElement(fallback, { key: index });
      }

      return (
        <Skeleton
          key={index}
          style={{
            width: size.width,
            height: size.height,
            borderRadius: size.width / 2,
          }}
        />
      );
    });
  }, [
    queryMap,
    ids,
    fallbacks,
    size,
    className,
    wrapperClassName,
    fallbackClassName,
  ]);

  return {
    uploads,
    isPending,
    jsxArray,
    refetch: () => queries.forEach((q) => q.refetch()),
  };
};
