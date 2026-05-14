import { SeeMoreText } from "@/components/shared/SeeMoreText";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { ResponseExperienceDto } from "@/types";
import { format } from "date-fns";
import { View } from "react-native";

interface ExperienceInstanceProps {
  className?: string;
  experience: ResponseExperienceDto;
}

export const ExperienceInstance = ({
  className,
  experience,
}: ExperienceInstanceProps) => {
  return (
    <View className={cn("flex flex-col gap-2", className)}>
      <Text className="font-semibold">{experience.title}</Text>
      <Text className="text-sm text-muted-foreground font-bold">
        {experience.company}
      </Text>
      <Text className="text-xs text-muted-foreground my-1">
        {format(new Date(experience.startDate!), "MMM yyyy")} —{" "}
        {experience.endDate
          ? format(new Date(experience.endDate), "MMM yyyy")
          : "Present"}
      </Text>
      <SeeMoreText textClassname="text-sm" numberOfLines={2}>
        {experience.description || "No description provided."}
      </SeeMoreText>
    </View>
  );
};
