import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";

interface useUserIndustriesProps {
  userId: string;
  enabled?: boolean;
}

export const useUserIndustries = ({
  userId,
  enabled = true,
}: useUserIndustriesProps) => {
  const {
    data: userIndustries,
    isPending: isUserIndustriesPending,
    refetch: refetchUserIndustries,
  } = useQuery({
    queryKey: ["userIndustries", userId],
    queryFn: () => api.user.getIndustries(userId),
    enabled,
  });

  return {
    userIndustries: userIndustries ?? [],
    isUserIndustriesPending,
    refetchUserIndustries,
  };
};
