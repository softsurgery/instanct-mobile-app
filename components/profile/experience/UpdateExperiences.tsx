import React from "react";
import { api } from "@/api";
import { ApplicationHeader } from "@/components/shared/AppHeader";
import { Tappable } from "@/components/shared/Tappable";
import { StablePressable } from "@/components/shared/StablePressable";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import StableScrollView from "@/components/shared/StableScrollView";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { getExperienceYears } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";
import { ResponseExperienceDto, ServerErrorResponse } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { router } from "expo-router";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  FileText,
} from "lucide-react-native";
import { View } from "react-native";
import { toast } from "sonner-native";
import { ActionSheetRef } from "react-native-actions-sheet";
import { DeleteExperienceActionSheet } from "./DeleteExperienceActionSheet";

import { AppHeaderBack } from "@/components/shared/AppHeaderBack";
interface UpdateExperiencesProps {
  className?: string;
}

export const UpdateExperiences = ({ className }: UpdateExperiencesProps) => {
  const userStore = useUserStore();
  const queryClient = useQueryClient();
  const deleteSheetRef = React.useRef<ActionSheetRef>(null);
  const [selectedExperienceId, setSelectedExperienceId] = React.useState<
    number | null
  >(null);

  const onUpdateExperiencePress = (exp: ResponseExperienceDto) => {
    userStore.set("responseExperience", exp);
    userStore.set("updateExperienceDto", {
      title: exp.title,
      company: exp.company,
      location: exp.location,
      workType: exp.workType,
      locationType: exp.locationType,
      startDate: new Date(exp.startDate!),
      endDate: exp.endDate ? new Date(exp.endDate) : undefined,
      description: exp.description,
    });
    userStore.set("present", exp.endDate === null);
    router.push("/main/profile/update-experience");
  };

  const { mutate: deleteExperience, isPending: isDeletePending } = useMutation({
    mutationFn: (id: number) => api.experience.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["experiences", userStore.response?.id],
      });
      toast.success("Experience deleted successfully", {
        description: "Your experience has been successfully deleted.",
      });
      deleteSheetRef.current?.hide();
      setSelectedExperienceId(null);
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(error.response?.data?.message || "An error occurred", {});
    },
  });

  const onDeleteExperiencePress = (experienceId: number) => {
    setSelectedExperienceId(experienceId);
    deleteSheetRef.current?.show();
  };

  const onCloseDeleteExperienceSheet = () => {
    deleteSheetRef.current?.hide();
    setSelectedExperienceId(null);
  };

  const onConfirmDeleteExperience = () => {
    if (!selectedExperienceId) {
      toast.error("No experience selected");
      return;
    }

    deleteExperience(selectedExperienceId);
  };

  return (
    <StableSafeAreaView className={cn("flex flex-1", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2 bg-transparent" }}
        title="Experiences"
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />
      <StableScrollView className="bg-background flex-1">
        <View className="flex flex-col flex-1 pb-10">
          {userStore.experiences && userStore.experiences.length > 0 ? (
            <View className="gap-5">
              {userStore.experiences.map((exp, index) => {
                return (
                  <View
                    key={exp.id}
                    className="bg-card border border-border overflow-hidden shadow-sm"
                  >
                    {/* Content */}
                    <View className="px-4 py-4 gap-3.5">
                      {/* Job Title */}
                      <View className="flex flex-row justify-between">
                        <View className="gap-1.5">
                          <Text className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                            Job Title
                          </Text>
                          <Text className="text-lg font-bold text-foreground">
                            {exp.title}
                          </Text>
                        </View>
                        <View className="flex flex-row items-center justify-between px-4">
                          {exp.endDate === null && (
                            <View className="bg-green-500/20 px-2.5 py-1 rounded-full">
                              <Text className="text-xs font-medium">
                                Current
                              </Text>
                            </View>
                          )}
                        </View>
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
                            {format(new Date(exp.startDate!), "MMM yyyy")} -{" "}
                            {exp.endDate
                              ? format(new Date(exp.endDate), "MMM yyyy")
                              : "Present"}
                          </Text>
                          <Text className="text-xs text-muted-foreground">
                            {getExperienceYears(exp.startDate!, exp.endDate)}{" "}
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
                    <View className="flex flex-col border-t border-border">
                      <Tappable
                        className="p-4 flex flex-row border-b border-border"
                        classNames={{
                          content: "font-semibold text-sm",
                          pressable: "bg-primary/20",
                        }}
                        onPress={() => onUpdateExperiencePress(exp)}
                      >
                        Edit experience
                      </Tappable>
                      <Tappable
                        className="p-4 flex flex-row"
                        classNames={{
                          content: "font-semibold text-sm",
                          pressable: "bg-destructive/50",
                        }}
                        onPress={() => onDeleteExperiencePress(exp.id)}
                      >
                        Delete experience
                      </Tappable>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-12">
              <View className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Icon as={Briefcase} size={32} />
              </View>
              <Text className="text-lg font-semibold mb-2">
                No Experiences Yet
              </Text>
              <Text className="text-sm text-muted-foreground text-center">
                Add your work experience to showcase your professional journey
              </Text>
              <StablePressable
                className="text-center mt-4 underline font-medium w-fit mx-auto rounded-lg"
                onPress={() => router.push("/main/profile/create-experience")}
              >
                <Text className="text-sm underline p-2">New Experience ?</Text>
              </StablePressable>
            </View>
          )}
        </View>
      </StableScrollView>
      <DeleteExperienceActionSheet
        ref={deleteSheetRef}
        onConfirm={onConfirmDeleteExperience}
        onClose={onCloseDeleteExperienceSheet}
        isPending={isDeletePending}
      />
    </StableSafeAreaView>
  );
};
