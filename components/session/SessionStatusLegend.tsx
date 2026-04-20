import React from "react";
import { View } from "react-native";
import { Text } from "../ui/text";
import { SessionStatus } from "@/types/session";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface LegendItemProps {
  status: SessionStatus;
  colorClass: string;
  label: string;
}

const LegendItem = ({ status, colorClass, label }: LegendItemProps) => {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className={cn("w-3 h-3 rounded-full", colorClass)} />
      <Text className="text-xs font-medium text-muted-foreground">{label}</Text>
    </View>
  );
};

export const SessionStatusLegend = () => {
  const { t } = useTranslation("common");

  return (
    <View className="flex-row items-center justify-start px-4 gap-6 py-2 pb-4">
      <LegendItem
        status={SessionStatus.ACTIVE}
        colorClass="bg-green-500"
        label={t("status.active", "Active")}
      />
      <LegendItem
        status={SessionStatus.SCHEDULED}
        colorClass="bg-primary"
        label={t("status.scheduled", "Scheduled")}
      />
      <LegendItem
        status={SessionStatus.CANCELLED}
        colorClass="bg-destructive"
        label={t("status.cancelled", "Cancelled")}
      />
    </View>
  );
};
