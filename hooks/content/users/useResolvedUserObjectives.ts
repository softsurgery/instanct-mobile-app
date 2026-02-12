import { useObjectives } from "@/hooks/content/reference-types/useObjectives";
import { useUserObjectives } from "@/hooks/content/users/useUserObjectives";
import React from "react";

interface useResolvedUserObjectivesProps {
  userId: string;
  enabled?: boolean;
}

export interface ResolvedObjective {
  id: number;
  label: string;
}

export const useResolvedUserObjectives = ({
  userId,
  enabled = true,
}: useResolvedUserObjectivesProps) => {
  const {
    objectives,
    isObjectivesPending,
    refetch: refetchObjectives,
  } = useObjectives({ enabled });
  const { userObjectives, isUserObjectivesPending, refetchUserObjectives } =
    useUserObjectives({
      userId,
      enabled,
    });

  const resolvedObjectives: ResolvedObjective[] = React.useMemo(() => {
    if (!objectives || !userObjectives) return [];
    return userObjectives
      .map((id) => {
        const objective = objectives.find((o) => o.id === id);
        return objective ? { id: objective.id, label: objective.label } : null;
      })
      .filter((o): o is ResolvedObjective => o !== null);
  }, [objectives, userObjectives]);

  const refetch = () => {
    refetchObjectives();
    refetchUserObjectives();
  };

  return {
    resolvedObjectives,
    isResolvedObjectivesPending: isObjectivesPending || isUserObjectivesPending,
    refetchResolvedObjectives: refetch,
  };
};
