import { useIndustries } from "@/hooks/content/reference-types/useIndustries";
import { useUserIndustries } from "@/hooks/content/users/useUserIndustries";
import React from "react";

interface useResolvedUserIndustriesProps {
  userId: string;
  enabled?: boolean;
}

export interface ResolvedIndustry {
  id: number;
  label: string;
}

export const useResolvedUserIndustries = ({
  userId,
  enabled = true,
}: useResolvedUserIndustriesProps) => {
  const {
    industries,
    isIndustriesPending,
    refetch: refetchIndustries,
  } = useIndustries({ enabled });
  const { userIndustries, isUserIndustriesPending, refetchUserIndustries } =
    useUserIndustries({
      userId,
      enabled,
    });

  const resolvedIndustries: ResolvedIndustry[] = React.useMemo(() => {
    if (!industries || !userIndustries) return [];
    return userIndustries
      .map((id) => {
        const industry = industries.find((i) => i.id === id);
        return industry ? { id: industry.id, label: industry.label } : null;
      })
      .filter((i): i is ResolvedIndustry => i !== null);
  }, [industries, userIndustries]);

  const refetch = () => {
    refetchIndustries();
    refetchUserIndustries();
  };

  return {
    resolvedIndustries,
    isResolvedIndustriesPending: isIndustriesPending || isUserIndustriesPending,
    refetchResolvedIndustries: refetch,
  };
};
