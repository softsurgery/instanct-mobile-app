import { useQuery } from "@tanstack/react-query";
import axios from "@/api/axios";

interface useCheckHealthProps {
  enabled?: boolean;
  refetchInterval?: number;
}

export const useCheckHealth = (
  { enabled = true, refetchInterval = 5000 }: useCheckHealthProps = {
    enabled: true,
    refetchInterval: 5000,
  },
) => {
  const { data } = useQuery({
    queryKey: ["checkHealth"],
    queryFn: async () => {
      try {
        const response = await axios.get("/app/health");
        console.log("Health check response:", response.data);
        return response.data;
      } catch (error) {
        console.log("Health check failed:", error);
        return { status: "unhealthy" };
      }
    },
    enabled,
    refetchInterval,
  });

  return data;
};
