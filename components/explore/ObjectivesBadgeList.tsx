import { api } from "@/api";
import { cn } from "@/lib/utils";
import { ResponseRefTypeDto } from "@/types";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { StableScrollView } from "../shared/StableScrollView";
import { Text } from "../ui/text";

interface ObjectivesBadgeListProps {
  className?: string;
}

export const ObjectivesBadgeList = ({
  className,
}: ObjectivesBadgeListProps) => {
  const { data: objectifsResp } = useQuery({
    queryKey: ["objectives"],
    queryFn: () => api.refImpl.findAllObjectives(),
  });

  const objectives: ResponseRefTypeDto<{ color: string }>[] = React.useMemo(
    () => (objectifsResp as ResponseRefTypeDto<{ color: string }>[]) || [],
    [objectifsResp]
  );

  const objectivesParamsQueries = useQueries({
    queries: objectives.map((obj) => ({
      queryKey: ["objective-params", obj.id],
      queryFn: () => api.refImpl.findAllObjectiveParamsByLabel(obj.label),
      enabled: !!objectives.length,
    })),
  });

  const objectivesWithParams = React.useMemo(() => {
    return objectives.map((obj, idx) => ({
      ...obj,
      children: objectivesParamsQueries[idx]?.data || [],
    }));
  }, [objectives, objectivesParamsQueries]);

  // Track multiple open objectives
  const [expandedObjectives, setExpandedObjectives] = React.useState<number[]>(
    []
  );

  const toggleObjective = (id: number) => {
    setExpandedObjectives((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <StableScrollView>
      <Animated.View
        layout={LinearTransition.springify()}
        className={cn("flex flex-row flex-wrap gap-2 p-3", className)}
      >
        {objectivesWithParams.map((obj) => {
          const isExpanded = expandedObjectives.includes(obj.id);

          return (
            <React.Fragment key={obj.id}>
              {/* Objective badge */}
              <Pressable
                onPress={() => toggleObjective(obj.id)}
                style={{ backgroundColor: obj.extras.color }}
                className={cn(
                  "flex-row items-center px-3 py-1 rounded-full shadow-sm border border-border"
                )}
              >
                <Text className="text-white font-semibold mr-1">
                  {obj.label}
                </Text>
                {isExpanded ? (
                  <Minus size={14} color="white" />
                ) : (
                  <Plus size={14} color="white" />
                )}
              </Pressable>

              {/* Inline animated param badges */}
              {isExpanded &&
                obj.children.map((param) => (
                  <Animated.View
                    key={param.id}
                    entering={FadeIn.springify().delay(50)}
                    exiting={FadeOut.duration(150)}
                    layout={LinearTransition.springify()}
                    className="px-3 py-1 rounded-full border border-border bg-white/10"
                  >
                    <Text className="text-white text-sm">{param.label}</Text>
                  </Animated.View>
                ))}
            </React.Fragment>
          );
        })}
      </Animated.View>
    </StableScrollView>
  );
};
