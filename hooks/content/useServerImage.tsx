import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
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

interface UseServerImageProps {
  id?: number;
  size: { width: number; height: number };
  fallback?: string | React.ReactNode | ImageSource;
  className?: string;
  wrapperClassName?: string;
  enabled?: boolean;
}

export const useServerImage = ({
  id,
  size,
  fallback,
  className,
  wrapperClassName,
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

    if (isUploadPending && id) {
      return <Skeleton style={{ ...size, borderRadius: size.width / 2 }} />;
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

    // 4️⃣ Fallback is a string → render Avatar with initials
    if (typeof fallback === "string") {
      return (
        <Avatar
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

    // 5️⃣ Fallback is a React element → render it directly
    if (React.isValidElement(fallback)) {
      return fallback;
    }

    // 6️⃣ Default → Skeleton
    return <Skeleton style={{ ...size, borderRadius: size.width / 2 }} />;
  }, [upload, isUploadPending, fallback, size]);

  return { upload, isUploadPending, jsx };
};
