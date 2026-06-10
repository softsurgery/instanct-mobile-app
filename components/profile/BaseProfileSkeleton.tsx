import React from "react";
import { View } from "react-native";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BaseProfileSkeletonProps {
  className?: string;
}

export const BaseProfileSkeleton = ({
  className,
}: BaseProfileSkeletonProps) => {
  return (
    <View className={cn("flex-1 bg-background", className)}>
      {/* Cover */}
      <Skeleton className="h-48 w-full rounded-none bg-primary/25" />

      {/* Header */}
      <View className="-mt-12 px-5">
        <View className="flex-row items-end justify-between">
          <View className="rounded-full border-4 border-background">
            <Skeleton className="h-[100px] w-[100px] rounded-full" />
          </View>
        </View>
      </View>
    </View>
  );
};
