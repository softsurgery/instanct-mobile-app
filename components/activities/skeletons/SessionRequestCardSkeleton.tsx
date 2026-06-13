import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { View } from "react-native";

interface SessionRequestCardSkeletonProps {
  className?: string;
  count: number;
}

export const SessionRequestCardSkeleton = ({
  className,
  count
}: SessionRequestCardSkeletonProps) => {
  return (
        <View className={cn("flex-1 pt-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
    <View key={i} className={cn("flex-row items-center gap-4 p-2", className)}>
      {/* Avatar with colored ring + direction badge */}
      <View className="relative">
        <View className="rounded-full p-[3px] bg-accent/40">
          <Skeleton className="w-12 h-12 rounded-full" />
        </View>
        <Skeleton className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full border-2 border-card" />
      </View>

      {/* Name + status row */}
      <View className="flex-1 gap-1.5">
        <Skeleton className="h-[17px] w-3/5 rounded" />
        <View className="flex-row items-center gap-2 mt-1">
          <Skeleton className="h-3 w-21 rounded" />
          <Skeleton className="h-3 w-21 rounded" />
        </View>
      </View>
    </View>
  ))}
    </View>
  );
};
