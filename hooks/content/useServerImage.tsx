import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
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

interface UseServerImageProps {
  id?: number;
  size: { width: number; height: number };
  fallback?: string | React.ReactNode | ImageSource;
  className?: string;
  enabled?: boolean;
}

export const useServerImage = ({
  id,
  size,
  fallback,
  className,
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
        <Image
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

    if (isUploadPending && id) {
      return <Skeleton style={{ ...size, borderRadius: size.width / 2 }} />;
    }

    if (
      fallback &&
      typeof fallback === "object" &&
      ("uri" in fallback || typeof fallback === "number")
    ) {
      return (
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
