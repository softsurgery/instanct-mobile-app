import React from "react";
import { View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useIndustries } from "@/hooks/content/reference-types/useIndustries";
import { useUserIndustries } from "@/hooks/content/users/useUserIndustries";
import { SelectBox } from "@/components/shared/SelectBox";
import { api } from "@/api";
import { cn } from "@/lib/utils";
import { showToastable } from "react-native-toastable";

interface IndustriesProps {
  className?: string;
  userId: string;
  editable?: boolean;
  showTitle?: boolean;
}

export const Industries = ({
  className,
  userId,
  editable = false,
  showTitle = true,
}: IndustriesProps) => {
  const queryClient = useQueryClient();
  const { industries, isIndustriesPending } = useIndustries();
  const { userIndustries, isUserIndustriesPending } = useUserIndustries({
    userId,
    enabled: !!userId,
  });

  const [selectedIndustries, setSelectedIndustries] = React.useState<number[]>(
    [],
  );

  // Sync selected industries when user industries are loaded
  React.useEffect(() => {
    if (userIndustries) {
      setSelectedIndustries(userIndustries);
    }
  }, [userIndustries]);

  const handleSelectIndustry = (id: number | string) => {
    setSelectedIndustries((prev) => [...prev, Number(id)]);
  };

  const handleRemoveIndustry = (id: number | string) => {
    setSelectedIndustries((prev) => prev.filter((i) => i !== Number(id)));
  };

  const { mutate: updateIndustries, isPending: isMutationPending } =
    useMutation({
      mutationFn: async (industryIds: number[]) =>
        api.user.updateIndustries(userId, industryIds),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["userIndustries", userId] });
        showToastable({
          message: "Industries updated successfully",
          status: "success",
        });
      },
      onError: (error: Error) => {
        showToastable({
          message: error.message || "Failed to update industries",
          status: "danger",
        });
      },
    });

  const handleSave = () => {
    updateIndustries(selectedIndustries);
  };

  const isPending =
    isIndustriesPending || isUserIndustriesPending || isMutationPending;

  const options = React.useMemo(
    () =>
      industries.map((industry) => ({
        label: industry.label,
        value: industry.id,
      })),
    [industries],
  );

  if (!editable) {
    return null;
  }

  return (
    <View className={cn("w-full", className)}>
      <SelectBox
        title={showTitle ? "Industries" : undefined}
        params={options}
        selected={selectedIndustries}
        isPending={isPending}
        onSelectParam={handleSelectIndustry}
        onRemoveParam={handleRemoveIndustry}
        onSave={handleSave}
      />
    </View>
  );
};
