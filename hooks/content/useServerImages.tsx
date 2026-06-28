import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";
import { ImageSource } from "expo-image";
import React from "react";
import { View } from "react-native";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/shared/StableAvatar";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { useAuthPersistStore } from "../useAuthPersistStore";
import { api } from "@/api";

interface UseServerImagesProps {
  ids: (number | undefined)[];
  fallbacks?: (string | React.ReactNode | ImageSource | undefined)[];
  size?: { width?: number; height?: number };
  className?: string;
  wrapperClassName?: string;
  fallbackClassName?: string;
}

export const useServerImages = ({
  ids,
  fallbacks = [],
  size,
  className,
  wrapperClassName,
  fallbackClassName,
}: UseServerImagesProps) => {
  const accessToken = useAuthPersistStore((s) => s.accessToken);

  const getUploadSource = React.useCallback(
    (id?: number): ImageSource | undefined => {
      if (!id || !accessToken) return undefined;

      return api.upload.getUploadById(id);
    },
    [accessToken],
  );

  const idsString = JSON.stringify(ids);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedIds = React.useMemo(() => ids, [idsString]);

  const uploads = React.useMemo(() => {
    return memoizedIds.map((id) => {
      if (!id) return undefined;
      return getUploadSource(id);
    });
  }, [memoizedIds, getUploadSource]);

  const jsxArray = React.useMemo(() => {
    return memoizedIds.map((id, index) => {
      const source = getUploadSource(id);
      const fallback = fallbacks[index];

      if (source) {
        return (
          <View
            key={index}
            className={cn(wrapperClassName, "items-center justify-center")}
            style={{
              width: size?.width ?? "100%",
              height: size?.height ?? "100%",
            }}
          >
            <Image
              source={source}
              className={className}
              style={{
                width: size?.width,
                height: size?.height,
              }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          </View>
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
            className={cn(wrapperClassName, "items-center justify-center")}
            style={{
              width: size?.width ?? "100%",
              height: size?.height ?? "100%",
            }}
          >
            <Image
              source={fallback}
              className={className}
              style={{
                width: size?.width,
                height: size?.height,
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
            className={className}
            style={{
              width: size?.width,
              height: size?.height,
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
          className={className}
          style={{
            width: size?.width,
            height: size?.height,
          }}
        />
      );
    });
  }, [
    memoizedIds,
    fallbacks,
    getUploadSource,
    size,
    className,
    wrapperClassName,
    fallbackClassName,
  ]);

  return {
    uploads,
    jsxArray,
    getUploadSource,
  };
};
