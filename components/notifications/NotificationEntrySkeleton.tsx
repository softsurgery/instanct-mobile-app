import { View } from "react-native";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

interface NotificationEntrySkeletonProps {
  className?: string;
}

export const NotificationEntrySkeleton = ({
  className,
}: NotificationEntrySkeletonProps) => {
  return (
    <View
      className={cn("flex flex-row items-center gap-2 px-2 py-1", className)}
    >
      {/* Profile Picture Skeleton */}
      <Skeleton className="w-16 h-16 rounded-full" />

      {/* Text Skeletons */}
      <View className="flex flex-col gap-2 px-2 py-1 flex-1">
        {/* Title Skeleton */}
        <Skeleton className="h-5 w-2/3 rounded" />

        {/* Description Skeleton */}
        <Skeleton className="h-4 w-full rounded -mt-1" />
        <Skeleton className="h-4 w-5/6 rounded" />

        {/* Timestamp Skeleton */}
        <Skeleton className="h-3 w-1/4 rounded ml-auto" />
      </View>
    </View>
  );
};
