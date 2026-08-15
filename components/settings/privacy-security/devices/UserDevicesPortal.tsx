import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { type ActionSheetRef } from "react-native-actions-sheet";
import {
  Monitor,
  Loader2,
  ChevronRight,
} from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { toast } from "sonner-native";

import { cn } from "~/lib/utils";
import { ApplicationHeader } from "~/components/shared/AppHeader";
import { StableSafeAreaView } from "~/components/shared/StableSafeAreaView";
import { AppHeaderBack } from "@/components/shared/AppHeaderBack";
import StableScrollView from "@/components/shared/StableScrollView";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/components/ui/icon";
import { api } from "@/api";
import { UserDevice } from "@/types";
import { getDeviceId } from "@/lib/device-id";
import { DeviceDetailsActionSheet } from "./DeviceDetailsActionSheet";
import { getDeviceIcon } from "@/lib/device-icon";

interface UserDevicesPortalProps {
  className?: string;
}

export const UserDevicesPortal = ({ className }: UserDevicesPortalProps) => {
  const { t } = useTranslation("settings");
  const queryClient = useQueryClient();
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<UserDevice | null>(null);
  const actionSheetRef = useRef<ActionSheetRef>(null);

  useEffect(() => {
    getDeviceId()
      .then((id) => setCurrentDeviceId(id))
      .catch(() => setCurrentDeviceId(null));
  }, []);

  const {
    data: devices = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<UserDevice[]>({
    queryKey: ["user-devices"],
    queryFn: async () => api.devices.getDevices(),
  });

  const trustMutation = useMutation({
    mutationFn: (id: string) => api.devices.trustDevice(id),
    onSuccess: (updatedDevice) => {
      queryClient.invalidateQueries({ queryKey: ["user-devices"] });
      if (selectedDevice && selectedDevice.id === updatedDevice.id) {
        setSelectedDevice(updatedDevice);
      }
      toast.success(
        t(
          "settings.account.screens.privacy-security.screens.account-security.devices.toasts.allowedSuccess",
          "Device allowed access",
        ),
      );
    },
    onError: () => {
      toast.error(
        t(
          "settings.account.screens.privacy-security.screens.account-security.devices.toasts.allowedError",
          "Failed to update device permission",
        ),
      );
    },
  });

  const untrustMutation = useMutation({
    mutationFn: (id: string) => api.devices.untrustDevice(id),
    onSuccess: (updatedDevice) => {
      queryClient.invalidateQueries({ queryKey: ["user-devices"] });
      if (selectedDevice && selectedDevice.id === updatedDevice.id) {
        setSelectedDevice(updatedDevice);
      }
      toast.success(
        t(
          "settings.account.screens.privacy-security.screens.account-security.devices.toasts.disallowedSuccess",
          "Device access restricted",
        ),
      );
    },
    onError: () => {
      toast.error(
        t(
          "settings.account.screens.privacy-security.screens.account-security.devices.toasts.disallowedError",
          "Failed to update device permission",
        ),
      );
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => api.devices.revokeDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-devices"] });
      actionSheetRef.current?.hide();
      setSelectedDevice(null);
      toast.success(
        t(
          "settings.account.screens.privacy-security.screens.account-security.devices.toasts.revokeSuccess",
          "Device access revoked successfully",
        ),
      );
    },
    onError: () => {
      toast.error(
        t(
          "settings.account.screens.privacy-security.screens.account-security.devices.toasts.revokeError",
          "Failed to revoke device",
        ),
      );
    },
  });

  const handleToggleTrust = (device: UserDevice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (device.isTrusted) {
      untrustMutation.mutate(device.id);
    } else {
      trustMutation.mutate(device.id);
    }
  };

  const handleRevoke = (device: UserDevice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      t(
        "settings.account.screens.privacy-security.screens.account-security.devices.revokeAlert.title",
        "Revoke Device Access",
      ),
      t(
        "settings.account.screens.privacy-security.screens.account-security.devices.revokeAlert.message",
        "Are you sure you want to revoke access for this device? You will need to sign in again from that device.",
      ),
      [
        {
          text: t(
            "settings.account.screens.privacy-security.screens.account-security.devices.revokeAlert.cancel",
            "Cancel",
          ),
          style: "cancel",
        },
        {
          text: t(
            "settings.account.screens.privacy-security.screens.account-security.devices.revokeAlert.confirm",
            "Revoke",
          ),
          style: "destructive",
          onPress: () => revokeMutation.mutate(device.id),
        },
      ],
    );
  };



  const handleDevicePress = (device: UserDevice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDevice(device);
    actionSheetRef.current?.show();
  };

  const isMutating =
    trustMutation.isPending ||
    untrustMutation.isPending ||
    revokeMutation.isPending;

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t(
          "settings.account.screens.privacy-security.screens.account-security.devices.title",
          "Devices & Allowed Access",
        )}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />

      <StableScrollView
        className="bg-background"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <View className="p-5 bg-card border-b border-border mb-4">
          <Text className="text-lg font-semibold">
            {t(
              "settings.account.screens.privacy-security.screens.account-security.devices.sectionTitle",
              "Registered Devices",
            )}
          </Text>
          <Text className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {t(
              "settings.account.screens.privacy-security.screens.account-security.devices.sectionDescription",
              "Manage devices that have signed into your account. Toggle access or tap a device to view full details.",
            )}
          </Text>
        </View>

        {isLoading ? (
          <View className="p-10 flex-row justify-center items-center gap-3">
            <Icon as={Loader2} className="animate-spin text-primary" size={24} />
            <Text className="text-muted-foreground font-medium">
              {t(
                "settings.account.screens.privacy-security.screens.account-security.devices.loading",
                "Loading devices...",
              )}
            </Text>
          </View>
        ) : devices.length === 0 ? (
          <View className="p-8 items-center justify-center">
            <View className="w-16 h-16 rounded-full bg-muted/30 items-center justify-center mb-4">
              <Icon as={Monitor} className="text-muted-foreground" size={32} />
            </View>
            <Text className="text-base font-semibold text-foreground mb-1">
              {t(
                "settings.account.screens.privacy-security.screens.account-security.devices.emptyTitle",
                "No registered devices",
              )}
            </Text>
            <Text className="text-sm text-muted-foreground text-center">
              {t(
                "settings.account.screens.privacy-security.screens.account-security.devices.emptyDescription",
                "Devices you sign in from will appear here.",
              )}
            </Text>
          </View>
        ) : (
          <View className="bg-card border-t border-b border-border flex-col">
            {devices.map((device, index) => {
              const isThisDevice =
                currentDeviceId && device.fingerprint === currentDeviceId;
              const DeviceIcon = getDeviceIcon(device.os, device.deviceName);
              const isLast = index === devices.length - 1;

              return (
                <View key={device.id}>
                  {/* Single Line Device Item */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleDevicePress(device)}
                    className="px-4 py-3.5 flex-row items-center justify-between bg-card"
                  >
                    {/* Left: Device Icon & Name */}
                    <View className="flex-row items-center gap-3 flex-1 pr-3">
                      <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                        <Icon
                          as={DeviceIcon}
                          className="text-primary"
                          size={20}
                        />
                      </View>

                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 flex-wrap">
                          <Text
                            className="font-semibold text-base text-foreground"
                            numberOfLines={1}
                          >
                            {device.deviceName || device.os || "Device"}
                          </Text>

                          {isThisDevice && (
                            <Badge
                              variant="secondary"
                              className="bg-primary/15 border-primary/20 px-1.5 py-0"
                            >
                              <Text className="text-[10px] font-semibold text-primary">
                                {t(
                                  "settings.account.screens.privacy-security.screens.account-security.devices.thisDevice",
                                  "This Device",
                                )}
                              </Text>
                            </Badge>
                          )}
                        </View>

                        {device.os && (
                          <Text
                            className="text-xs text-muted-foreground mt-0.5"
                            numberOfLines={1}
                          >
                            {device.os}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Right: Allowed Access Switch & Chevron */}
                    <View className="flex-row items-center gap-3">
                      <Switch
                        checked={device.isTrusted}
                        onCheckedChange={() => handleToggleTrust(device)}
                        disabled={isMutating}
                      />
                      <Icon
                        as={ChevronRight}
                        size={18}
                        className="text-muted-foreground"
                      />
                    </View>
                  </TouchableOpacity>

                  {!isLast && <Separator className="ml-16" />}
                </View>
              );
            })}
          </View>
        )}
      </StableScrollView>

      {/* ActionSheet for Device Details */}
      <DeviceDetailsActionSheet
        ref={actionSheetRef}
        device={selectedDevice}
        isThisDevice={
          !!(
            selectedDevice &&
            currentDeviceId &&
            selectedDevice.fingerprint === currentDeviceId
          )
        }
        onToggleTrust={handleToggleTrust}
        onRevoke={handleRevoke}
        isMutating={isMutating}
      />
    </StableSafeAreaView>
  );
};
