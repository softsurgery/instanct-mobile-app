import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Clock,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Wifi,
  type LucideIcon,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";
import { getDeviceIcon } from "@/lib/device-icon";
import { cn } from "~/lib/utils";
import { ApplicationHeader } from "../shared/AppHeader";
import { AppHeaderBack } from "../shared/AppHeaderBack";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import StableScrollView from "../shared/StableScrollView";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { Separator } from "../ui/separator";
import { Text } from "../ui/text";

const TRANSLATION_PREFIX = "screens.new-signin";

interface NewSignInPortalProps {
  className?: string;
  device?: string;
  os?: string;
  location?: string;
  ip?: string;
  time?: string;
  when?: string;
}

type SignInResolution = "trusted" | "secured";

interface SignInDetail {
  key: string;
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}

const RESOLUTIONS: Record<
  SignInResolution,
  { icon: LucideIcon; containerClassName: string; iconClassName: string }
> = {
  trusted: {
    icon: ShieldCheck,
    containerClassName: "bg-primary/10 border-primary/20",
    iconClassName: "text-primary",
  },
  secured: {
    icon: ShieldX,
    containerClassName: "bg-destructive/10 border-destructive/20",
    iconClassName: "text-destructive",
  },
};

/**
 * Row displaying a single piece of information about the reported sign-in.
 */
const SignInDetailRow = ({ icon, label, value, hint }: Omit<SignInDetail, 'key'>) => (
  <View className="flex-row items-center gap-3 px-4 py-3">
    <View className="h-9 w-9 items-center justify-center rounded-xl bg-background">
      <Icon as={icon} size={18} className="text-muted-foreground" />
    </View>

    <View className="flex-1">
      <Text className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </Text>
      <Text className="text-base font-semibold text-foreground">{value}</Text>
      {hint ? (
        <Text className="text-xs text-muted-foreground mt-0.5">{hint}</Text>
      ) : null}
    </View>
  </View>
);

/**
 * UI-only "New sign-in" security notification screen, showing where and when the
 * account was accessed and letting the user confirm or reject the sign-in.
 */
export const NewSignInPortal = ({
  className,
  device,
  os,
  location,
  ip,
  time,
  when,
}: NewSignInPortalProps) => {
  const { t } = useTranslation("notifications");
  const insets = useSafeAreaInsets();

  const [resolution, setResolution] = React.useState<SignInResolution | null>(
    null,
  );

  const details: SignInDetail[] = [
    {
      key: "device",
      icon: getDeviceIcon(os, device),
      label: t(`${TRANSLATION_PREFIX}.details.device`),
      value: device || "iPhone 15 Pro",
      hint: os || "iOS 18.5",
    },
    {
      key: "location",
      icon: MapPin,
      label: t(`${TRANSLATION_PREFIX}.details.location`),
      value: location || "Paris, France",
      hint: t(`${TRANSLATION_PREFIX}.details.locationHint`),
    },
    {
      key: "ip",
      icon: Wifi,
      label: t(`${TRANSLATION_PREFIX}.details.ip`),
      value: ip || "82.65.14.203",
    },
    {
      key: "time",
      icon: Clock,
      label: t(`${TRANSLATION_PREFIX}.details.time`),
      value: time || "12 August 2026 at 14:32",
    },
  ];

  const resolved = resolution ? RESOLUTIONS[resolution] : null;
  const isResolved = resolution !== null;

  /**
   * Marks the sign-in as legitimate. UI only — nothing is sent to the server.
   */
  const handleTrust = () => {
    setResolution("trusted");
    toast.success(t(`${TRANSLATION_PREFIX}.toasts.trusted.title`), {
      description: t(`${TRANSLATION_PREFIX}.toasts.trusted.description`),
    });
  };

  /**
   * Marks the sign-in as suspicious. UI only — nothing is sent to the server.
   */
  const handleSecure = () => {
    setResolution("secured");
    toast.error(t(`${TRANSLATION_PREFIX}.toasts.secured.title`), {
      description: t(`${TRANSLATION_PREFIX}.toasts.secured.description`),
    });
  };

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t(`${TRANSLATION_PREFIX}.header`)}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />

      <StableScrollView className="bg-background">
        <View className="items-center px-6 pt-8 pb-8">
          <View className="h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
            <Icon as={ShieldAlert} size={30} className="text-primary" />
          </View>

          <Text variant="h4" className="text-center mt-4">
            {t(`${TRANSLATION_PREFIX}.title`)}
          </Text>

          <Text className="text-center text-sm text-muted-foreground mt-2">
            {t(`${TRANSLATION_PREFIX}.description`)}
          </Text>

          <Badge variant="outline" className="mt-4">
            <Text className="text-xs font-medium">
              {when || t(`${TRANSLATION_PREFIX}.defaults.when`)}
            </Text>
          </Badge>
        </View>

        <View className="px-4 pb-2">
          <Text className="text-primary text-sm font-semibold uppercase tracking-wider">
            {t(`${TRANSLATION_PREFIX}.sections.details`)}
          </Text>
        </View>

        <View className="bg-card border border-border mx-4 rounded-2xl overflow-hidden">
          {details.map((detail, index) => {
            const { key, ...rest } = detail;
            return (
              <View key={key}>
                <SignInDetailRow {...rest} />
                {index < details.length - 1 ? (
                  <Separator className="ml-16" />
                ) : null}
              </View>
            );
          })}
        </View>

        <Text className="text-xs text-muted-foreground px-6 mt-3 mb-8">
          {t(`${TRANSLATION_PREFIX}.footnote`)}
        </Text>

        {resolved && resolution ? (
          <View className="px-4 pb-8">
            <View
              className={cn(
                "flex-row items-center gap-3 rounded-2xl border p-4",
                resolved.containerClassName,
              )}
            >
              <Icon
                as={resolved.icon}
                size={22}
                className={resolved.iconClassName}
              />
              <View className="flex-1">
                <Text className="font-semibold text-foreground">
                  {t(`${TRANSLATION_PREFIX}.resolutions.${resolution}.title`)}
                </Text>
                <Text className="text-sm text-muted-foreground mt-0.5">
                  {t(
                    `${TRANSLATION_PREFIX}.resolutions.${resolution}.description`,
                  )}
                </Text>
              </View>
            </View>
          </View>
        ) : null}
        <View
          className="flex-col gap-3 px-4 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <Button
            size="lg"
            variant={resolution === "secured" ? "outline" : "default"}
            className="flex-1 h-12 gap-2 rounded-2xl"
            onPress={handleTrust}
            disabled={isResolved}
          >
            <Icon as={ShieldCheck} size={18} />
            <Text className="text-sm font-bold" numberOfLines={1}>
              {t(`${TRANSLATION_PREFIX}.actions.trust`)}
            </Text>
          </Button>

          <Button
            size="lg"
            variant={resolution === "trusted" ? "outline" : "destructive"}
            className="flex-1 h-12 gap-2 rounded-2xl"
            onPress={handleSecure}
            disabled={isResolved}
          >
            <Icon as={ShieldX} size={18} />
            <Text className="text-sm font-bold" numberOfLines={1}>
              {t(`${TRANSLATION_PREFIX}.actions.secure`)}
            </Text>
          </Button>
        </View>
      </StableScrollView>
    </StableSafeAreaView>
  );
};
