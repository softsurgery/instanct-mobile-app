import { SeeMoreText } from "@/components/shared/SeeMoreText";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { ResponseEducationDto } from "@/types";
import { View } from "react-native";

interface EducationInstanceProps {
  className?: string;
  education: ResponseEducationDto;
}

export const EducationInstance = ({
  className,
  education,
}: EducationInstanceProps) => {
  return (
    <View className={cn("flex flex-col gap-2", className)}>
      <Text className="font-semibold">{education.title}</Text>
      <Text className="text-sm text-muted-foreground">
        {education.institution}
      </Text>
      {/* <Text className="text-xs text-muted-foreground my-1">
        {format(new Date(education.startDate!), "MMM yyyy")} —{" "}
        {education.endDate
          ? format(new Date(education.endDate), "MMM yyyy")
          : "Present"}
      </Text> */}
      <SeeMoreText textClassname="text-sm" numberOfLines={2}>
        {education.description || "No description provided."}
      </SeeMoreText>
    </View>
  );
};
