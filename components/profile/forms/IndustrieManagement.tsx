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
import { Loader2 } from "lucide-react-native";
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
import { BottomButtonWrapper } from "@/components/shared/BottomButtonBlockWrapper";
import { useTranslation } from "react-i18next";

import { AppHeaderBack } from "@/components/shared/AppHeaderBack";
interface IndustriesManagementProps {
  className?: string;
}

export const IndustriesManagement = ({
  className,
}: IndustriesManagementProps) => {
  const { t } = useTranslation("menu");
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
    () => userIndustries ?? [],
  );

  // React.useEffect(() => {
  //   if (userIndustries) {
  //     setSelectedIndustries(userIndustries);
  //   }
  // }, [userIndustries]);

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
        toast.success(t("menu.industries.toasts.updated"), {
          description: t("menu.industries.toasts.updatedDescription"),
        });
        router.back();
      },
      onError: (error: Error) => {
        toast.error(error.message || t("menu.industries.toasts.error"), {});
      },
    });

  const handleSave = () => {
    if (selectedIndustries.length > 0) {
      updateIndustries(selectedIndustries);
    } else {
      toast.warning(t("menu.industries.toasts.noSelection"), {
        description: t("menu.industries.toasts.noSelectionDescription"),
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
    title: t("menu.industries.title"),
    fieldsets: [
      {
        rows: [
          {
            id: 1,
            fields: [
              {
                id: "industries",
                variant: FieldVariant.MULTISELECT,
                label: t("menu.industries.labels.industries"),
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
        classNames={{ wrapper: "border-b border-border pb-2 bg-transparent" }}
        title={t("menu.industries.title")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />
      <View className="flex-1 bg-background">
        <View className="px-5 pt-4 pb-2">
          <Text className="text-sm text-muted-foreground leading-relaxed">
            {t("menu.industries.description")}
          </Text>
        </View>
        <StableKeyboardAwareScrollView className="flex-1 bg-background">
          <FormBuilder structure={strurcture} className="mt-4 px-2" />
        </StableKeyboardAwareScrollView>
      </View>
      {!isKeyboardVisible && (
        <BottomButtonWrapper>
          <Button
            size="lg"
            className="rounded-xl"
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
                <Text className="text-primary-foreground text-md font-bold">
                  {t("menu.industries.actions.updatePending")}
                </Text>
              </React.Fragment>
            ) : (
              <Text className="text-primary-foreground text-md font-bold">
                {t("menu.industries.actions.update")}
              </Text>
            )}
          </Button>
        </BottomButtonWrapper>
      )}
    </StableSafeAreaView>
  );
};
