import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { UserStore } from "@/stores/useUserStore";
import React from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

interface DeleteEducationDialogProps {
  userStore?: UserStore;
  trigger?: React.ReactNode;
  loading?: boolean;
  setLoading?: (loading: boolean) => void;
  handleDelete?: () => void;
}

export const DeleteEducationDialog = ({
  trigger,
  loading,
  handleDelete,
}: DeleteEducationDialogProps) => {
  const { t } = useTranslation("menu");
  const [visible, setVisible] = React.useState(false);

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogTrigger asChild>
        {trigger || (
          <Text className="text-red-500 text-sm font-semibold">
            {t("education.delete.trigger")}
          </Text>
        )}
      </DialogTrigger>

      <DialogContent className={cn("w-[90vw] rounded-lg")}>
        <DialogTitle>
          <Text className="text-lg font-semibold text-foreground">
            {t("education.delete.title")}
          </Text>
        </DialogTitle>

        <View className="flex flex-col gap-2">
          <Text className="text-sm text-muted-foreground">
            {t("education.delete.message")}
          </Text>
        </View>

        <View className="flex flex-row gap-3 justify-end">
          <Button
            variant="destructive"
            onPress={() => {
              handleDelete?.();
              setVisible(false);
            }}
            disabled={loading}
            className="flex-1"
          >
            <Text>
              {loading
                ? t("education.delete.actions.deletePending")
                : t("education.delete.actions.delete")}
            </Text>
          </Button>
          <Button
            variant="outline"
            onPress={() => setVisible(false)}
            disabled={loading}
            className="flex-1"
          >
            <Text>{t("education.delete.actions.cancel")}</Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
};
