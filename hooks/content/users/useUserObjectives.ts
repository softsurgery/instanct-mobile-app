import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";

interface useUserObjectivesProps {
  userId: string;
  enabled?: boolean;
}

export const useUserObjectives = ({
  userId,
  enabled = true,
}: useUserObjectivesProps) => {
  const {
    data: userObjectives,
    isPending: isUserObjectivesPending,
    refetch: refetchUserObjectives,
  } = useQuery({
    queryKey: ["userObjectives", userId],
    queryFn: () => api.user.getObjectives(userId),
    enabled,
  });

  return {
    userObjectives: userObjectives ?? [],
    isUserObjectivesPending,
    refetchUserObjectives,
  };
};
