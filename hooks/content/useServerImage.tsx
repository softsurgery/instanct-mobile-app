import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Image, View } from "react-native";
import { api } from "~/api";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/shared/StableAvatar";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";

interface UseServerImageProps {
  id?: number;
  size?: { width: number; height: number };
  fallback?: string | React.ReactNode;
  className?: string;
  wrapperClassName?: string;
  fallbackClassName?: string;
  enabled?: boolean;
}

export const useServerImage = ({
  id,
  size,
  fallback,
  className,
  wrapperClassName,
  fallbackClassName,
  enabled = true,
}: UseServerImageProps) => {
  const { data: uploadResp, isPending: isUploadPending } = useQuery({
    queryKey: ["server-image", id],
    queryFn: async () => api.upload.getUploadById(id!),
    enabled: !!id && enabled,
  });

  const upload = React.useMemo(() => uploadResp ?? null, [uploadResp]);

  const jsx = React.useMemo(() => {
    if (upload && !isUploadPending) {
      return (
        <View
          className={cn(wrapperClassName, "flex items-center justify-center")}
          style={{
            width: size?.width ? size.width * 1.05 : undefined,
            height: size?.height ? size.height * 1.05 : undefined,
            borderRadius: size?.width ? (size.width * 1.05) / 2 : undefined,
          }}
        >
          <Image
            className={cn(className)}
            source={{
              uri: upload,
            }}
            style={{
              width: size?.width || "auto",
              height: size?.height || "auto",
              borderRadius: size?.width ? size.width / 2 : undefined,
            }}
          />
        </View>
      );
    }

    if (isUploadPending && id) {
      return (
        <Skeleton
          style={{
            ...size,
            borderRadius: size?.width ? size.width / 2 : undefined,
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
          className={cn(wrapperClassName, "flex items-center justify-center")}
          style={{
            width: size?.width ? size.width * 1.05 : undefined,
            height: size?.height ? size.height * 1.05 : undefined,
            borderRadius: size?.width ? (size.width * 1.05) / 2 : undefined,
          }}
        >
          <Image
            alt={typeof fallback === "string" ? fallback : ""}
            className={cn(className)}
            style={{
              width: size?.width || "auto",
              height: size?.height || "auto",
              borderRadius: size?.width ? size.width / 2 : undefined,
            }}
          />
        </View>
      );
    }

    // 4️⃣ Fallback is a string → render Avatar with initials
    if (typeof fallback === "string") {
      return (
        <Avatar
          className={cn(className)}
          style={{
            width: size?.width || "auto",
            height: size?.height || "auto",
            borderRadius: size?.width ? size.width / 2 : undefined,
          }}
        >
          <AvatarImage />
          <AvatarFallback>
            <Text className={fallbackClassName}>{fallback.toUpperCase()}</Text>
          </AvatarFallback>
        </Avatar>
      );
    }

    // 5️⃣ Fallback is a React element → render it directly
    if (React.isValidElement(fallback)) {
      return fallback;
    }

    // 6️⃣ Default → Skeleton
    return (
      <Skeleton
        style={{ ...size, borderRadius: size?.width ? size.width / 2 : "auto" }}
      />
    );
  }, [upload, isUploadPending, fallback, size]);

  return { upload, isUploadPending, jsx };
};
