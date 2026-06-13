import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { View } from "react-native";

interface BookmarkSkeletonProps {
  className?: string;
  count: number;
}

export const BookmarkSkeleton = ({
  className,
  count,
}: BookmarkSkeletonProps) => {
  return (
    <View className="flex-1 pt-3">
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          className={cn("flex-row items-center gap-3.5 p-3", className)}
        >
          {/* Avatar with ring + bookmark badge */}
          <View className="relative">
            <View className="rounded-full p-[3px] bg-accent/40">
              <Skeleton className="w-14 h-14 rounded-full" />
            </View>
            <Skeleton className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full border-2 border-card" />
          </View>

          {/* Identity text */}
          <View className="flex-1 gap-1.5">
            <Skeleton className="h-[17px] w-2/5 rounded" />
            <Skeleton className="h-[14px] w-3/5 rounded mt-0.5" />
          </View>

          {/* ChevronRight */}
          <Skeleton className="h-5 w-5 rounded" />
        </View>
      ))}
    </View>
  );
};
