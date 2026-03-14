import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";

interface useExperiencesProps {
  id: string;
  enabled?: boolean;
}

export const useExperiences = ({ id, enabled }: useExperiencesProps) => {
  const {
    data: experiences,
    isPending: isExperiencesPending,
    refetch: refetchExperiences,
  } = useQuery({
    queryKey: ["experiences", id],
    queryFn: () => api.experience.findByUserId(id),
    enabled,
  });

  return { experiences, isExperiencesPending, refetchExperiences };
};
