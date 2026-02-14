import { Pen } from "lucide-react-native";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useIndustries } from "@/hooks/content/reference-types/useIndustries";
import { useUserIndustries } from "@/hooks/content/users/useUserIndustries";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface IndustriesProps {
  className?: string;
  userId: string;
  editable?: boolean;
  showTitle?: boolean;
}

export const Industries = ({ className, userId }: IndustriesProps) => {
  const router = useRouter();
  const { industries, isIndustriesPending } = useIndustries();
  const { userIndustries, isUserIndustriesPending } = useUserIndustries({
    userId,
    enabled: !!userId,
  });

  const selectedIndustryDetails = React.useMemo(() => {
    if (userIndustries && industries.length > 0) {
      return industries.filter((industry) =>
        userIndustries.includes(industry.id),
      );
    }
    return [];
  }, [userIndustries, industries]);

  const handleNavigate = () => {
    router.push({
      pathname: "/main/profile/industries",
      params: { userId },
    });
  };

  const isPending = isIndustriesPending || isUserIndustriesPending;

  return (
    <View className={cn("w-full gap-2", className)}>
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-foreground">
          Industries
        </Text>
        <TouchableOpacity onPress={handleNavigate} className="p-1">
          <Icon as={Pen} size={18} />
        </TouchableOpacity>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {isPending ? (
          <Text>Loading...</Text>
        ) : selectedIndustryDetails.length > 0 ? (
          selectedIndustryDetails.map((industry) => (
            <Badge key={industry.id} variant="outline">
              <Text>{industry.label}</Text>
            </Badge>
          ))
        ) : (
          <Text className="text-sm text-muted-foreground">
            No industries selected.
          </Text>
        )}
      </View>
    </View>
  );
};
