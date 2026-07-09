import { View } from "react-native";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

interface UserEntrySkeletonProps {
  className?: string;
}

/**
 * Skeleton loading card shown for individual conversation rows in the chat portal list.
 */
export const UserEntrySkeleton = ({ className }: UserEntrySkeletonProps) => {
  return (
    <View
      className={cn(
        "w-full flex-row items-center justify-between rounded-2xl px-3 py-3",
        className,
      )}
    >
      {/* Left Content */}
      <View className="flex-1 flex-row items-center gap-3">
        {/* Avatar Skeleton */}
        <Skeleton className="w-[60px] h-[60px] rounded-full" />

        {/* Text Content */}
        <View className="flex-1">
          {/* Top Row */}
          <View className="flex-row items-center justify-between gap-4">
            <Skeleton className="h-5 w-1/2 rounded" />
            <Skeleton className="h-3 w-12 rounded" />
          </View>

          {/* Bottom Row */}
          <View className="mt-2 flex-row items-center justify-between gap-4">
            <Skeleton className="h-4 w-3/4 rounded" />
          </View>
        </View>
      </View>
    </View>
  );
};
