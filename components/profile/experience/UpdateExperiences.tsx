import { ApplicationHeader } from "@/components/shared/AppHeader";
import { Tappable } from "@/components/shared/scene-builder/Tappable";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { StableScrollView } from "@/components/shared/StableScrollView";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { DeleteExperienceDialog } from "./DeleteExperienceDialog";
import { getExperienceYears } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";
import { ResponseExperienceDto, ServerErrorResponse } from "@/types";
import { format } from "date-fns";
import { Link, router } from "expo-router";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  FileText,
} from "lucide-react-native";
import { View } from "react-native";
import { api } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showToastable } from "react-native-toastable";

interface UpdateExperiencesProps {
  className?: string;
}

export const UpdateExperiences = ({ className }: UpdateExperiencesProps) => {
  const userStore = useUserStore();
  const queryClient = useQueryClient();

  const onUpdateExperiencePress = (exp: ResponseExperienceDto) => {
    userStore.set("responseExperience", exp);
    userStore.set("updateExperienceDto", {
      title: exp.title,
      company: exp.company,
      startDate: new Date(exp.startDate),
      endDate: exp.endDate ? new Date(exp.endDate) : null,
      description: exp.description,
    });
    router.push("/main/profile/update-experience");
  };

  const { mutate: deleteExperience, isPending: isDeletePending } = useMutation({
    mutationFn: (id: number) => api.experience.remove(id),
    onSuccess: () => {
      showToastable({
        message: "Experience deleted successfully",
        status: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["experiences", userStore.response?.id],
      });
    },
    onError: (error: ServerErrorResponse) => {
      showToastable({ message: error.response?.data?.message });
    },
  });

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
      <StableScrollView className="bg-background flex-1">
        <View className="flex flex-col flex-1 py-4 px-3 pb-10">
          {userStore.experiences && userStore.experiences.length > 0 ? (
            <View className="gap-3">
              {userStore.experiences.map((exp, index) => {
                return (
                  <View
                    key={exp.id}
                    className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm"
                  >
                    {/* Header with index badge */}
                    <View className="flex flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-border/50">
                      <View className="flex flex-row items-center gap-2">
                        <View className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon as={Briefcase} size={16} />
                        </View>
                        <Text className="text-base font-semibold">
                          Experience {index + 1}
                        </Text>
                      </View>
                      {exp.endDate === null && (
                        <View className="bg-green-500/20 px-2.5 py-1 rounded-full">
                          <Text className="text-xs font-medium text-black dark:text-white">
                            Current
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Content */}
                    <View className="px-4 py-4 gap-3.5">
                      {/* Job Title */}
                      <View className="gap-1.5">
                        <Text className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                          Job Title
                        </Text>
                        <Text className="text-lg font-bold text-foreground">
                          {exp.title}
                        </Text>
                      </View>

                      {/* Company */}
                      <View className="flex flex-row items-center gap-3">
                        <Icon as={Building2} size={18} />
                        <Text className="text-base text-muted-foreground flex-1">
                          {exp.company}
                        </Text>
                      </View>

                      {/* Duration */}
                      <View className="flex flex-row items-center gap-3">
                        <Icon as={Calendar} size={18} />
                        <View>
                          <Text className="text-sm text-foreground font-medium">
                            {format(new Date(exp.startDate), "MMM yyyy")} -{" "}
                            {exp.endDate
                              ? format(new Date(exp.endDate), "MMM yyyy")
                              : "Present"}
                          </Text>
                          <Text className="text-xs text-muted-foreground">
                            {getExperienceYears(exp.startDate, exp.endDate)}{" "}
                            years
                          </Text>
                        </View>
                      </View>

                      {/* Description */}
                      {exp.description && (
                        <View className="flex flex-row gap-3 mt-1">
                          <Icon as={FileText} size={18} />
                          <Text className="text-sm text-foreground flex-1 leading-5">
                            {exp.description}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Action Buttons */}
                    <View className="flex flex-col gap-2 px-4 py-3 border-t border-border/50 ">
                      <Tappable
                        className="py-2.5 flex flex-row"
                        classNames={{
                          content: "font-semibold text-sm",
                          pressable: "bg-primary/20",
                        }}
                        onPress={() => onUpdateExperiencePress(exp)}
                      >
                        Edit experience
                      </Tappable>
                      <DeleteExperienceDialog
                        handleDelete={() => deleteExperience(exp.id)}
                        loading={isDeletePending}
                        trigger={
                          <Tappable
                            className="py-2.5 flex flex-row"
                            classNames={{
                              content: "font-semibold text-sm",
                              pressable: "bg-destructive/50",
                            }}
                          >
                            Delete experience
                          </Tappable>
                        }
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-12">
              <View className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Briefcase size={32} className="text-muted-foreground" />
              </View>
              <Text className="text-lg font-semibold mb-2">
                No Experiences Yet
              </Text>
              <Text className="text-sm text-muted-foreground text-center">
                Add your work experience to showcase your professional journey
              </Text>
            </View>
          )}

          {/* Add Experience Button */}
          {userStore.experiences && userStore.experiences.length >= 0 && (
            <Link
              href="/main/settings"
              className="text-center mt-6 underline text-lg font-medium text-black dark:text-white"
            >
              Add Experience
            </Link>
          )}
        </View>
      </StableScrollView>
    </StableSafeAreaView>
  );
};
