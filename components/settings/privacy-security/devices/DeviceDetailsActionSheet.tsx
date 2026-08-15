import React from "react";
import { View, Alert } from "react-native";
import ActionSheet, { type ActionSheetRef } from "react-native-actions-sheet";
import {
  Trash2,
  Clock,
  MapPin,
  Globe,
  SmartphoneNfc,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useColorPalette } from "@/hooks/useColorPalette";
import { Text } from "~/components/ui/text";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { UserDevice } from "@/types";
import { getDeviceIcon } from "@/lib/device-icon";

interface DeviceDetailsActionSheetProps {
  device: UserDevice | null;
  isThisDevice: boolean;
  onToggleTrust: (device: UserDevice) => void;
  onRevoke: (device: UserDevice) => void;
  isMutating?: boolean;
}

export const DeviceDetailsActionSheet = React.forwardRef<
  ActionSheetRef,
  DeviceDetailsActionSheetProps
>(({ device, isThisDevice, onToggleTrust, onRevoke, isMutating }, ref) => {
  const { t } = useTranslation("settings");
  const { palette } = useColorPalette();

  if (!device) return <ActionSheet ref={ref} />;



  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(dateString);
    }
  };

  const DeviceIcon = getDeviceIcon(device.os, device.deviceName);

  return (
    <ActionSheet
      ref={ref}
      gestureEnabled
      statusBarTranslucent
      defaultOverlayOpacity={0.45}
      containerStyle={{
        backgroundColor: palette.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 32,
      }}
    >
      <View className="px-2 my-3 flex-col gap-4">
        {/* Device Header */}
        <View className="flex-row items-center gap-3 pb-2">
          <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
            <Icon as={DeviceIcon} className="text-primary" size={24} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2 flex-wrap">
              <Text className="font-bold text-lg text-foreground">
                {device.deviceName || device.os || "Device Details"}
              </Text>
              {isThisDevice && (
                <Badge
                  variant="secondary"
                  className="bg-primary/15 border-primary/20 px-2 py-0.5"
                >
                  <Text className="text-xs font-semibold text-primary">
                    {t(
                      "settings.account.screens.privacy-security.screens.account-security.devices.thisDevice",
                      "This Device",
                    )}
                  </Text>
                </Badge>
              )}
            </View>
            <Text className="text-xs text-muted-foreground mt-0.5">
              {device.os || "Device"}
            </Text>
          </View>
        </View>

        {/* Detailed Info Grid */}
        <View className="flex-col gap-3 py-1">
          {device.os && (
            <View className="flex-row items-center justify-between gap-4">
              <View className="flex-row items-center gap-2 flex-shrink-0">
                <Icon
                  as={SmartphoneNfc}
                  size={16}
                  className="text-muted-foreground"
                />
                <Text className="text-sm text-muted-foreground">
                  {t(
                    "settings.account.screens.privacy-security.screens.account-security.devices.details.os",
                    "Operating System",
                  )}
                </Text>
              </View>
              <Text 
                className="text-sm font-medium text-foreground text-right flex-shrink"
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {device.os}
              </Text>
            </View>
          )}

          {device.ipAddress && (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Icon as={Globe} size={16} className="text-muted-foreground" />
                <Text className="text-sm text-muted-foreground">
                  IP Address
                </Text>
              </View>
              <Text className="text-sm font-medium text-foreground">
                {device.ipAddress}
              </Text>
            </View>
          )}

          {device.location && (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Icon as={MapPin} size={16} className="text-muted-foreground" />
                <Text className="text-sm text-muted-foreground">Location</Text>
              </View>
              <Text className="text-sm font-medium text-foreground">
                {device.location}
              </Text>
            </View>
          )}

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Icon as={Clock} size={16} className="text-muted-foreground" />
              <Text className="text-sm text-muted-foreground">
                {t(
                  "settings.account.screens.privacy-security.screens.account-security.devices.lastSignIn",
                  "Last active",
                )}
              </Text>
            </View>
            <Text className="text-sm font-medium text-foreground">
              {formatDate(device.lastSignInAt)}
            </Text>
          </View>

          {device.signInCount > 0 && (
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted-foreground pl-6">
                Sign-ins
              </Text>
              <Text className="text-sm font-medium text-foreground">
                {device.signInCount}
              </Text>
            </View>
          )}
        </View>

        {/* Access Switch Control Row */}
        <View className="flex-row items-center justify-between py-1">
          <Text className="text-base font-semibold text-foreground">
            {t(
              "settings.account.screens.privacy-security.screens.account-security.devices.allowDeviceAccess",
              "Allow Device Access",
            )}
          </Text>
          <Switch
            checked={device.isTrusted}
            onCheckedChange={() => onToggleTrust(device)}
            disabled={isMutating}
          />
        </View>

        {/* Revoke Action Button */}
        <Button
          variant="destructive"
          size="lg"
          className="rounded-xl flex-row items-center justify-center gap-2 mt-2"
          onPress={() => onRevoke(device)}
          disabled={isMutating}
        >
          <Icon as={Trash2} size={18} className="text-destructive-foreground" />
          <Text className="text-destructive-foreground text-md font-bold">
            {t(
              "settings.account.screens.privacy-security.screens.account-security.devices.actions.revoke",
              "Revoke Access",
            )}
          </Text>
        </Button>
      </View>
    </ActionSheet>
  );
});

DeviceDetailsActionSheet.displayName = "DeviceDetailsActionSheet";
