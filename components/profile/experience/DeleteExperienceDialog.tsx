import { UserStore } from "@/stores/useUserStore";
import React from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface DeleteExperienceDialogProps {
  userStore?: UserStore;
  trigger?: React.ReactNode;
  loading?: boolean;
  setLoading?: (loading: boolean) => void;
  handleDelete?: () => void;
}

export const DeleteExperienceDialog = ({
  trigger,
  loading,
  handleDelete,
}: DeleteExperienceDialogProps) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogTrigger asChild>
        {trigger || (
          <Text className="text-red-500 text-sm font-semibold">Delete</Text>
        )}
      </DialogTrigger>

      <DialogContent className={cn("w-[90vw] rounded-lg")}>
        <DialogTitle>
          <Text className="text-lg font-semibold text-foreground">
            Delete Experience
          </Text>
        </DialogTitle>

        <View className="flex flex-col gap-3 py-4">
          <Text className="text-sm text-muted-foreground">
            Are you sure you want to delete this experience? This action cannot
            be undone.
          </Text>
        </View>

        <View className="flex flex-row gap-3 justify-end">
          <Button
            variant="outline"
            onPress={() => setVisible(false)}
            disabled={loading}
            className="flex-1"
          >
            <Text>Cancel</Text>
          </Button>
          <Button
            variant="destructive"
            onPress={() => {
              handleDelete?.();
              setVisible(false);
            }}
            disabled={loading}
            className="flex-1"
          >
            <Text>{loading ? "Deleting..." : "Delete"}</Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
};
