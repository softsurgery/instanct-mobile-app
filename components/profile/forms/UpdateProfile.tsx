import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ApplicationHeader } from "../../shared/AppHeader";
import { FormBuilder } from "../../shared/form-builder/FormBuilder";
import { StableKeyboardAwareScrollView } from "../../shared/StableKeyboardAwareScrollView";
import { StableSafeAreaView } from "../../shared/StableSafeAreaView";
import { useUpdateProfileFormStructure } from "./useUpdateProfileFormStructure";

interface UpdateProfileProps {
  className?: string;
}

export const UpdateProfile = ({ className }: UpdateProfileProps) => {
  const { t } = useTranslation("common");
  const userStore = useUserStore();
  const { structure } = useUpdateProfileFormStructure({
    store: userStore,
  });
  return (
    <StableSafeAreaView className={cn("flex flex-1", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
        title={t("screens.profile")}
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
      <StableKeyboardAwareScrollView
        className={cn("flex flex-col flex-1 p-4", className)}
      >
        <FormBuilder structure={structure} className="mb-10 " />
      </StableKeyboardAwareScrollView>
    </StableSafeAreaView>
  );
};
