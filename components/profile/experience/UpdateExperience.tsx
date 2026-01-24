import { useUserStore } from "@/stores/useUserStore";
import { View } from "react-native";

interface UpdateExperienceProps {
  className?: string;
}

export const UpdateExperience = ({ className }: UpdateExperienceProps) => {
  const userStore = useUserStore();

  return <View className={className}></View>;
};
