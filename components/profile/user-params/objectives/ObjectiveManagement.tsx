import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
import { showToastable } from "react-native-toastable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { SelectBox } from "@/components/shared/SelectBox";
import { useObjectives } from "@/hooks/content/reference-types/useObjectives";
import { useUserObjectives } from "@/hooks/content/users/useUserObjectives";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { ApplicationHeader } from "@/components/shared/AppHeader";
import { Text } from "@/components/ui/text";
import { ArrowLeft, Loader2, Save } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import * as Haptics from "expo-haptics";
import { Icon } from "@/components/ui/icon";

interface ObjectivesManagementProps {
  className?: string;
}

export const ObjectivesManagement = ({
  className,
}: ObjectivesManagementProps) => {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const queryClient = useQueryClient();
  const { objectives, isObjectivesPending } = useObjectives();
  const { userObjectives, isUserObjectivesPending } = useUserObjectives({
    userId,
    enabled: !!userId,
  });

  const [selectedObjectives, setSelectedObjectives] = React.useState<number[]>(
    [],
  );

  React.useEffect(() => {
    if (userObjectives) {
      setSelectedObjectives(userObjectives);
    }
  }, [userObjectives]);

  const handleSelectObjective = (id: number | string) => {
    setSelectedObjectives((prev) => [...prev, Number(id)]);
  };

  const handleRemoveObjective = (id: number | string) => {
    setSelectedObjectives((prev) => prev.filter((i) => i !== Number(id)));
  };

  const { mutate: updateObjectives, isPending: isMutationPending } =
    useMutation({
      mutationFn: async (objectiveIds: number[]) =>
        api.user.updateObjectives(userId, objectiveIds),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["userObjectives", userId],
        });
        showToastable({
          message: "Objectives updated successfully",
          status: "success",
        });
        router.back();
      },
      onError: (error: Error) => {
        showToastable({
          message: error.message || "Failed to update objectives",
          status: "danger",
        });
      },
    });

  const handleSave = () => {
    if (selectedObjectives.length > 0) {
      updateObjectives(selectedObjectives);
    } else {
      showToastable({
        message: "Please select at least one objective.",
        status: "warning",
      });
    }
  };

  const isPending =
    isObjectivesPending || isUserObjectivesPending || isMutationPending;

  const options = React.useMemo(
    () =>
      objectives.map((objective) => ({
        label: objective.label,
        value: objective.id,
      })),
    [objectives],
  );

  return (
    <StableSafeAreaView className={cn("flex-1", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
        title="Objectives"
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            icon: ArrowLeft,
            onPress: () => router.back(),
          },
        ]}
      />
      <View className="flex-1 bg-background">
        <View className="px-5 pt-4 pb-2">
          <Text className="text-sm text-muted-foreground leading-relaxed">
            Select one or more objectives that align with your professional
            goals and aspirations. This helps you connect with like-minded
            professionals and opportunities.
          </Text>
        </View>
        <SelectBox
          params={options}
          selected={selectedObjectives}
          isPending={isPending}
          onSelectParam={handleSelectObjective}
          onRemoveParam={handleRemoveObjective}
          className="flex-1"
        />
      </View>
      <View className="py-6 border-t border-border">
        <Button
          className="mx-6 mb-4 rounded-full"
          size="sm"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleSave();
          }}
          disabled={isPending || selectedObjectives.length === 0}
        >
          {isPending ? (
            <React.Fragment>
              <Icon
                as={Loader2}
                size={18}
                className="text-primary-foreground animate-spin"
              />
              <Text className="text-primary-foreground font-semibold">
                Saving...
              </Text>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Icon as={Save} size={18} className="text-primary-foreground" />
              <Text className="text-primary-foreground font-semibold">
                Save Selection
              </Text>
            </React.Fragment>
          )}
        </Button>
      </View>
    </StableSafeAreaView>
  );
};
