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
          <Skeleton className="mb-1 h-9 w-28 rounded-lg" />
        </View>

        {/* Identity */}
        <View className="mt-3 gap-2">
          <Skeleton className="h-6 w-44 rounded-md" />
        </View>

      </View>

      {/* Tab label row */}
      <View className="mt-6 flex-row justify-around px-5">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-3 w-16 rounded-md" />
        ))}
      </View>

      {/* Content cards */}
      <View className="mt-6 gap-3 px-4">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </View>
    </View>
  );
};
