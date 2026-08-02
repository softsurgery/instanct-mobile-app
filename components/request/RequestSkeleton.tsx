import { Dimensions, View } from "react-native";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const screenHeight = Dimensions.get("window").height;

interface RequestSkeletonProps {
  className?: string;
  hasLocation?: boolean;
}

export const RequestSkeleton = ({
  className,
  hasLocation,
}: RequestSkeletonProps) => {
  return (
    <View className={cn("flex-1 bg-background", className)}>
      {/* User header */}
      <View className="flex-row items-center gap-3">
        <Skeleton className="h-20 w-20 rounded-full" />
        <View className="flex-1 gap-2.5">
          <Skeleton className="h-4 w-36 rounded-full" />
          <Skeleton className="h-4 w-36 rounded-full" />
          <Skeleton className="h-4 w-24 rounded-full" />
        </View>
      </View>
      <View className="flex flex-col gap-6 pt-6">
        {/* Message */}
        <View className="flex-col items-start gap-2">
          <Skeleton className="h-10 w-1/2 rounded-xl" />
          <Skeleton className="h-10 w-1/2 rounded-xl" />
          <Skeleton className="h-10 w-1/2 rounded-xl" />
        </View>

        {/* Location */}
        {hasLocation && (
          <View>
            {/* Map preview */}
            <Skeleton
              className="mt-1 w-full rounded-xl"
              style={{ height: screenHeight * 0.4 }}
            />
          </View>
        )}
      </View>
    </View>
  );
};
