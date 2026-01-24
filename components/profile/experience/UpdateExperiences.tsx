import { ApplicationHeader } from "@/components/shared/AppHeader";
import { Tappable } from "@/components/shared/scene-builder/Tappable";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { StableScrollView } from "@/components/shared/StableScrollView";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";
import { format } from "date-fns";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { View } from "react-native";

interface UpdateExperiencesProps {
  className?: string;
}

export const UpdateExperiences = ({ className }: UpdateExperiencesProps) => {
  const userStore = useUserStore();

  return (
    <StableSafeAreaView className={cn("flex flex-1", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
        title="Experiences"
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            icon: ArrowLeft,
            onPress: () => {
              router.back();
            },
          },
        ]}
      />
      <StableScrollView className={"bg-background flex-1"}>
        <View className="flex flex-col flex-1 gap-10 py-4 px-1 pb-10">
          {userStore.experiences?.map((exp, index) => {
            return (
              <View key={exp.id} className="mx-2">
                {/* Text */}
                <Text variant={"lead"}>Experience {index + 1}</Text>
                {/* Information */}
                <View className="flex flex-col bg-card p-4 rounded-lg border border-border mt-4">
                  {/* Job Title */}
                  <Text className="text-lg font-bold">{exp.title}</Text>
                  {/* Company */}

                  <Text className="text-sm text-muted-foreground">
                    {exp.company}
                  </Text>
                  {/* Start Date */}
                  <Text className="text-sm">
                    {format(new Date(exp.startDate), "MMM yyyy")} -{" "}
                    {exp.endDate
                      ? format(new Date(exp.endDate), "MMM yyyy")
                      : "Present"}
                  </Text>
                  {/* Description */}
                  <View className="flex-col items-start gap-2 mt-2">
                    <Text className="text-sm">{exp.description}</Text>
                  </View>
                </View>
                {/* Actions */}
                <View className="flex flex-col justify-between">
                  <Tappable className="border-x border-b border-border bg-muted">
                    Edit Experience
                  </Tappable>
                  <Tappable
                    className="border-x border-b border-border bg-muted"
                    classNames={{
                      content: "text-destructive",
                      pressable: "bg-destructive/25",
                    }}
                  >
                    Delete Experience
                  </Tappable>
                </View>
              </View>
            );
          })}
        </View>
      </StableScrollView>
    </StableSafeAreaView>
  );
};
