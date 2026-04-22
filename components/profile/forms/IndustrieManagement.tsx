import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
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
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { toast } from "sonner-native";
import { FormBuilder } from "@/components/shared/form-builder/FormBuilder";
import {
  FieldVariant,
  FormStructure,
  MultiSelectFieldProps,
} from "@/components/shared/form-builder/types";
import { StableKeyboardAwareScrollView } from "@/components/shared/StableKeyboardAwareScrollView";

interface IndustriesManagementProps {
  className?: string;
}

export const IndustriesManagement = ({
  className,
}: IndustriesManagementProps) => {
  const isKeyboardVisible = useKeyboardVisible();
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const queryClient = useQueryClient();
  const { industries, isIndustriesSubTypePending } = useIndustries();
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

  const { mutate: updateIndustries, isPending: isMutationPending } =
    useMutation({
      mutationFn: async (industryIds: number[]) =>
        api.user.updateIndustries(userId, industryIds),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["user", userId],
        });
        queryClient.invalidateQueries({
          queryKey: ["user-industries", userId],
        });
        toast.success("Industries updated successfully", {
          description: "Your industries have been successfully updated.",
        });
        router.back();
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to update industries", {});
      },
    });

  const handleSave = () => {
    if (selectedIndustries.length > 0) {
      updateIndustries(selectedIndustries);
    } else {
      toast.warning("Please select at least one industry.", {
        description: "You need to select at least one industry before saving.",
      });
    }
  };

  const isPending =
    isIndustriesSubTypePending || isUserIndustriesPending || isMutationPending;

  const options = React.useMemo(
    () =>
      industries.map((industry) => ({
        label: industry.label,
        value: industry.id.toString(),
      })),
    [industries],
  );

  const strurcture: FormStructure = {
    title: "Industries",
    fieldsets: [
      {
        rows: [
          {
            id: 1,
            fields: [
              {
                id: "industries",
                variant: FieldVariant.MULTISELECT,
                label: "Industries",
                props: {
                  value: selectedIndustries.map(String),
                  onSelect: (ids) => setSelectedIndustries(ids.map(Number)),
                  options: options,
                  max: 5,
                } satisfies MultiSelectFieldProps,
              },
            ],
          },
        ],
      },
    ],
  };

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
        title="Industries"
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
            Select one or more industries that align with your professional
            goals and aspirations. This helps you connect with like-minded
            professionals and opportunities.
          </Text>
        </View>
        <StableKeyboardAwareScrollView className="flex-1 bg-background">
          <FormBuilder structure={strurcture} className="mt-4 px-2" />
        </StableKeyboardAwareScrollView>
      </View>
      {!isKeyboardVisible && (
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
      )}
    </StableSafeAreaView>
  );
};
