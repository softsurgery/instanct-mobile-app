import { cn } from "@/lib/utils";
import { router } from "expo-router";
import { View } from "react-native";
import { Checkbox } from "../ui/checkbox";
import { Text } from "../ui/text";
import { useTranslation } from "react-i18next";

interface AcceptTermsProps {
  className?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const AcceptTerms = ({
  className,
  checked,
  onCheckedChange,
  disabled,
}: AcceptTermsProps) => {
  const { t } = useTranslation("explore");
  return (
    <View className={cn("flex flex-row items-start gap-2.5", className)}>
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      <Text className="flex-1 text-sm text-muted-foreground">
        {t("onBoarding.terms.iAccept")}{" "}
        <Text
          className="text-sm text-foreground underline"
          onPress={() => router.push("/auth/legal?type=terms")}
        >
          {t("onBoarding.terms.termsOfUse")}
        </Text>{" "}
        {t("onBoarding.terms.and")}{" "}
        <Text
          className="text-sm text-foreground underline"
          onPress={() => router.push("/auth/legal?type=privacy")}
        >
          {t("onBoarding.terms.privacyPolicy")}
        </Text>
        .
      </Text>
    </View>
  );
};
