import React from "react";
import { View } from "react-native";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";

interface BaseProfileSkeletonProps {
  className?: string;
}

export const BaseProfileSkeleton = ({
  className,
}: BaseProfileSkeletonProps) => {
  return (
    <StableSafeAreaView className={cn("flex-1 bg-background", className)}>
      {/* Cover */}
      <Skeleton className="w-full h-48 rounded-none bg-primary/25" />

      {/* Header with Profile Picture */}
      <View className="relative -mt-12">
        <View className="flex flex-row items-end justify-between mb-4 px-5">
          <View className="flex flex-row justify-start items-end">
            <Skeleton className="w-[100px] h-[100px] rounded-full" />
            <View className="gap-2 ml-1">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-2 w-20 rounded-md" />
            </View>
          </View>
        </View>

        {/* Bio */}
        <View className="gap-2 mb-6 mt-2 ml-1 px-5">
          <Skeleton className="h-3 w-48 rounded-md" />
        </View>

        {/* Sections (Experience, Education etc) */}
        <View className="flex flex-col gap-4 mt-6">
          <Skeleton className="w-full h-40 rounded-none bg-primary/25" />
        </View>
      </View>
    </StableSafeAreaView>
  );
};
