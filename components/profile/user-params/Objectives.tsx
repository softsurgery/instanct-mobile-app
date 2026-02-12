import React from "react";
import { View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useObjectives } from "@/hooks/content/reference-types/useObjectives";
import { useUserObjectives } from "@/hooks/content/users/useUserObjectives";
import { SelectBox, SelectOption } from "@/components/shared/SelectBox";
import { api } from "@/api";
import { cn } from "@/lib/utils";
import { showToastable } from "react-native-toastable";

interface ObjectivesProps {
  className?: string;
  userId: string;
  editable?: boolean;
  showTitle?: boolean;
}

export const Objectives = ({
  className,
  userId,
  editable = false,
  showTitle = true,
}: ObjectivesProps) => {
  const queryClient = useQueryClient();
  const { objectives, isObjectivesPending } = useObjectives();
  const { userObjectives, isUserObjectivesPending } = useUserObjectives({
    userId,
    enabled: !!userId,
  });

  const [selectedObjectives, setSelectedObjectives] = React.useState<number[]>(
    [],
  );

  // Sync selected objectives when user objectives are loaded
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
        queryClient.invalidateQueries({ queryKey: ["userObjectives", userId] });
        showToastable({
          message: "Objectives updated successfully",
          status: "success",
        });
      },
      onError: (error: Error) => {
        showToastable({
          message: error.message || "Failed to update objectives",
          status: "danger",
        });
      },
    });

  const handleSave = () => {
    updateObjectives(selectedObjectives);
  };

  const isPending =
    isObjectivesPending || isUserObjectivesPending || isMutationPending;

  const options: SelectOption[] = React.useMemo(
    () =>
      objectives.map((objective) => ({
        label: objective.label,
        value: objective.id,
      })),
    [objectives],
  );

  if (!editable) {
    return null;
  }

  return (
    <View className={cn("w-full", className)}>
      <SelectBox
        title={showTitle ? "Objectives" : undefined}
        params={options}
        selected={selectedObjectives}
        isPending={isPending}
        onSelectParam={handleSelectObjective}
        onRemoveParam={handleRemoveObjective}
        onSave={handleSave}
      />
    </View>
  );
};
