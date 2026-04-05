import React from "react";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { X } from "lucide-react-native";
import { View } from "react-native";
import { ApplicationHeader } from "@/components/shared/AppHeader";
import { router } from "expo-router";
import { useIdentifiedUser } from "@/hooks/content/users/useIdentifiedUser";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { useServerImages } from "@/hooks/content/useServerImages";
import { cn } from "@/lib/utils";
import { FormBuilder } from "../shared/form-builder/FormBuilder";
import { useCreateNewRequestFormStructure } from "./forms/useCreateRequestFormStructure";
import { useRequestStore } from "@/stores/useRequestStore";
import { StableKeyboardAwareScrollView } from "../shared/StableKeyboardAwareScrollView";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";

interface NewRequestProps {
  className?: string;
  id: string;
}

export const NewRequest = ({ className, id }: NewRequestProps) => {
  const isKeyboardVisible = useKeyboardVisible();
  const requestStore = useRequestStore();
  const { user } = useIdentifiedUser({ id });

  const identity = React.useMemo(() => identifyUser(user), [user]);
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

  const { jsxArray: profilePictures } = useServerImages({
    ids: [user?.pictureId],
    fallbacks: [fallback],
    wrapperClassName:
      "border border-border bg-background rounded-full shadow-md",
    size: { width: 70, height: 70 },
    enabled: !!user,
  });

  const { structure } = useCreateNewRequestFormStructure({
    store: requestStore,
  });

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2"
        title={"Demande de rendez-vous"}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            icon: X,
            onPress: () => router.back(),
          },
        ]}
      />

      <View className="flex-1 bg-background px-2">
        <StableKeyboardAwareScrollView>
          <View className="px-4 pt-4">
            <Text className="text-lg font-semibold text-foreground">
              Partenaire de réunion
            </Text>

            <View className="mt-4 flex-row items-center gap-4">
              <View className="overflow-hidden rounded-full bg-muted">
                {profilePictures}
              </View>

              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">
                  {identity}
                </Text>
                <Text className="text-lg opacity-50">{user?.email}</Text>
              </View>
            </View>
          </View>
          <FormBuilder structure={structure} className="mt-4" />
        </StableKeyboardAwareScrollView>
      </View>
      {!isKeyboardVisible && (
        <View className="py-6 border-t border-border">
          <Button size={"sm"} className="mx-6 mb-4 rounded-full">
            <Text>Envoyer une demande</Text>
          </Button>
        </View>
      )}
    </StableSafeAreaView>
  );
};
