import React from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { View } from "react-native";
import { Text } from "../ui/text";
import { Button } from "../ui/button";

interface EndSessionDialogProps {
  className?: string;
  trigger?: React.ReactNode;
  loading?: boolean;
  handleEndSession?: () => void;
}

export const EndSessionDialog = ({
  className,
  trigger,
  loading,
  handleEndSession,
}: EndSessionDialogProps) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant={"outline"} className="flex-1">
            <Text>End Session</Text>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className={cn("w-[90vw] rounded-lg", className)}>
        <DialogTitle>
          <Text className="text-lg font-semibold text-foreground">
            End session
          </Text>
        </DialogTitle>

        <View className="flex flex-col gap-2">
          <Text className="text-sm text-muted-foreground">
            Are you sure you want to end this session?
          </Text>
        </View>

        <View className="flex flex-row gap-3 justify-end">
          <Button
            variant="destructive"
            onPress={() => {
              handleEndSession?.();
              setVisible(false);
            }}
            disabled={loading}
            className="flex-1"
          >
            <Text>{loading ? "Ending..." : "End Session"}</Text>
          </Button>
          <Button
            variant="outline"
            disabled={loading}
            onPress={() => setVisible(false)}
            className="flex-1"
          >
            <Text>Cancel</Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
};
