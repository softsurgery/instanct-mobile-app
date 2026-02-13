import { Pen } from "lucide-react-native";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";

import { useObjectives } from "@/hooks/content/reference-types/useObjectives";
import { useUserObjectives } from "@/hooks/content/users/useUserObjectives";

import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

interface ObjectivesProps {
  className?: string;
  userId: string;
}

export const Objectives = ({ className, userId }: ObjectivesProps) => {
  const router = useRouter();
  const { objectives, isObjectivesPending } = useObjectives();
  const { userObjectives, isUserObjectivesPending } = useUserObjectives({
    userId,
    enabled: !!userId,
  });

  const selectedObjectiveDetails = React.useMemo(() => {
    if (userObjectives && objectives.length > 0) {
      return objectives.filter((objective) =>
        userObjectives.includes(objective.id),
      );
    }
    return [];
  }, [userObjectives, objectives]);

  const handleNavigate = () => {
    router.push({
      pathname: "/main/profile/objectives",
      params: { userId },
    });
  };

  const isPending = isObjectivesPending || isUserObjectivesPending;

  return (
    <View className={cn("w-full gap-2", className)}>
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-foreground">
          Objectives
        </Text>
        <TouchableOpacity onPress={handleNavigate} className="p-1">
          <Icon as={Pen} size={18} />
        </TouchableOpacity>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {isPending ? (
          <Text>Loading...</Text>
        ) : selectedObjectiveDetails.length > 0 ? (
          selectedObjectiveDetails.map((objective) => (
            <Badge key={objective.id} variant="outline">
              <Text>{objective.label}</Text>
            </Badge>
          ))
        ) : (
          <Text className="text-sm text-muted-foreground">
            No objectives selected.
          </Text>
        )}
      </View>
    </View>
  );
};
