import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
import { showToastable } from "react-native-toastable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { SelectBox } from "@/components/shared/SelectBox";
import { useIndustries } from "@/hooks/content/reference-types/useIndustries";
import { useUserIndustries } from "@/hooks/content/users/useUserIndustries";
import { cn } from "@/lib/utils";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { ApplicationHeader } from "@/components/shared/AppHeader";
import { Text } from "@/components/ui/text";
import { ArrowLeft, Save, Loader2 } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/button";
import StableScrollView from "@/components/shared/StableScrollView";

interface IndustriesManagementProps {
  className?: string;
}

export const IndustriesManagement = ({
  className,
}: IndustriesManagementProps) => {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const queryClient = useQueryClient();
  const { industries, isIndustriesPending } = useIndustries();
  const { userIndustries, isUserIndustriesPending } = useUserIndustries({
    userId,
    enabled: !!userId,
  });

  const [selectedIndustries, setSelectedIndustries] = React.useState<number[]>(
    [],
  );

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
        queryClient.invalidateQueries({
          queryKey: ["userIndustries", userId],
        });
        showToastable({
          message: "Industries updated successfully",
          status: "success",
        });
        router.back();
      },
      onError: (error: Error) => {
        showToastable({
          message: error.message || "Failed to update industries",
          status: "danger",
        });
      },
    });

  const handleSave = () => {
    if (selectedIndustries.length > 0) {
      updateIndustries(selectedIndustries);
    } else {
      showToastable({
        message: "Please select at least one industry.",
        status: "warning",
      });
    }
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

  return (
    <StableSafeAreaView className={cn("flex-1", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
        title="Industries"
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
      <StableScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-6 px-4 py-6 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-2">
          <Text className="text-sm text-muted-foreground leading-relaxed">
            Select one or more industries that match your professional
            background and interests. This helps others discover you and find
            relevant connections.
          </Text>
        </View>
        <SelectBox
          title="Choose your industries"
          params={options}
          selected={selectedIndustries}
          isPending={isPending}
          onSelectParam={handleSelectIndustry}
          onRemoveParam={handleRemoveIndustry}
          onSave={handleSave}
          className="pb-4"
        />
      </StableScrollView>
      <View className="py-6 border-t border-border">
        <Button
          className="mx-6 mb-4 rounded-full"
          size="sm"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleSave();
          }}
          disabled={isPending || selectedIndustries.length === 0}
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
