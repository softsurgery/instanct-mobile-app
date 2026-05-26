import { ApplicationHeader } from "@/components/shared/AppHeader";
import { FormBuilder } from "@/components/shared/form-builder/FormBuilder";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { View } from "react-native";
import { useExploreFilterFormStructure } from "./useExploreFilterFormStructure";
import { StableKeyboardAwareScrollView } from "@/components/shared/StableKeyboardAwareScrollView";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useObjectives } from "@/hooks/content/reference-types/useObjectives";
import { mapToSelectOptions } from "@/components/shared/form-builder/utils/map-select-options";
import { useIndustries } from "@/hooks/content/reference-types/useIndustries";
import { useExploreFilterStore } from "@/stores/userExploreFilterStore";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import React from "react";
import { toast } from "sonner-native";

interface UserFilterPortalProps {
  className?: string;
}

export const UserFilterPortal = ({ className }: UserFilterPortalProps) => {
  const isKeyboardVisible = useKeyboardVisible();
  const exploreFilterStore = useExploreFilterStore();

  React.useEffect(() => {
    exploreFilterStore.set("dto", structuredClone(exploreFilterStore.filters));
    return () => {
      exploreFilterStore.resetDto();
    };
  }, []);

  const { t } = useTranslation();

  const { objectives, isObjectivesSubTypePending } = useObjectives();
  const { industries, isIndustriesSubTypePending } = useIndustries();

  const handleApplyFilters = () => {
    exploreFilterStore.apply();
    toast.success("Filters saved successfully");
    router.back();
  };

  const handleResetFilters = () => {
    exploreFilterStore.reset();
    toast.success("Filters reset successfully");
    router.back();
  };

  const structure = useExploreFilterFormStructure({
    store: exploreFilterStore,
    objectives: mapToSelectOptions({
      data: objectives,
      labelKey: "label",
      valueKey: "id",
    }),
    industries: mapToSelectOptions({
      data: industries,
      labelKey: "label",
      valueKey: "id",
    }),
    isPending: isObjectivesSubTypePending || isIndustriesSubTypePending,
  });

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={"User Filters"}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            icon: ArrowLeft,
            onPress: () => {
              exploreFilterStore.reset();
              router.back();
            },
          },
        ]}
      />
      <View className="flex-1 bg-background">
        <StableKeyboardAwareScrollView className="flex-1 bg-background">
          <View className="px-5 pt-4 pb-2">
            <Text className="text-sm text-muted-foreground leading-relaxed">
              You can apply filters to find users that match specific criteria.
              These filters will help you discover users based on their
              objectives, industries, and more.
            </Text>
          </View>
          <FormBuilder structure={structure} className="mt-4 px-2" />
        </StableKeyboardAwareScrollView>
      </View>
      {!isKeyboardVisible && (
        <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-card p-8 pt-4 gap-4">
          <View className="flex flex-col justify-between gap-2">
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl"
              onPress={handleResetFilters}
            >
              <Text className="text-md font-bold">Remove Filters</Text>
            </Button>
            <Button
              size="lg"
              className="rounded-xl"
              onPress={handleApplyFilters}
            >
              <Text className="text-md font-bold">Save Filters</Text>
            </Button>
          </View>
        </View>
      )}
    </StableSafeAreaView>
  );
};
