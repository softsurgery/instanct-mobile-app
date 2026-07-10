import { Dimensions, View } from "react-native";
import { Skeleton } from "@/components/ui/skeleton";

const screenHeight = Dimensions.get("window").height;

export const RequestSkeleton = () => {
  return (
    <View className="flex-1 bg-background">
      <View className="flex flex-col gap-6 px-4 pt-6">
        {/* User header */}
        <View className="flex-row items-center gap-3 py-2">
          <Skeleton className="h-20 w-20 rounded-full" />
          <View className="flex-1 gap-2.5">
            <Skeleton className="h-4 w-36 rounded-md" />
            <Skeleton className="h-3 w-48 rounded-md" />
            <Skeleton className="mt-0.5 h-5 w-24 rounded-full" />
          </View>
        </View>

        {/* Message */}
        <View className="flex-col items-start gap-3">
          <Skeleton className="h-4 w-1/2 rounded-xl" />
          <Skeleton className="h-4 w-1/3 rounded-xl" />
          <Skeleton className="h-4 w-3/4 rounded-xl" />
        </View>

        {/* Location */}
        <View className="gap-3">
          {/* Map preview */}
          <Skeleton
            className="mt-1 w-full rounded-xl"
            style={{ height: screenHeight * 0.4 }}
          />
        </View>
        <Skeleton className="h-9 w-full mt-4 rounded-xl" />
      </View>
    </View>
  );
};
