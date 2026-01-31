import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { toLongDateString } from "@/lib/date";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { Calendar, X } from "lucide-react-native";
import React from "react";
import { Keyboard, View } from "react-native";
import DatePickerUI, { useDefaultClassNames } from "react-native-ui-datepicker";
import { StablePressable } from "../StablePressable";

interface DatePickerProps {
  className?: string;
  classNames?: {
    trigger: string;
    content: string;
  };
  date: Date | null;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
  nullable?: boolean;
}

export const DatePicker = ({
  className,
  classNames,
  disabled,
  date,
  onChange,
  nullable = true,
}: DatePickerProps) => {
  const defaultClassNames = useDefaultClassNames();
  const [visible, setVisible] = React.useState(false);

  const displayText = date ? toLongDateString(date) : "Select a date";

  const clearDate = () => {
    onChange(null);
  };

  return (
    <Dialog
      open={visible}
      onOpenChange={setVisible}
      className={cn("rounded-lg", className)}
    >
      <DialogTrigger
        onPress={() => !disabled && setVisible(true)}
        className="flex-row"
      >
        <Button
          disabled={disabled}
          variant="outline"
          className={cn("w-full h-8 p-0 px-2", className)}
          onPress={() => {
            setVisible(true);
            Keyboard.dismiss();
          }}
        >
          <View className="flex flex-row items-center justify-between w-full">
            <Text className="text-xs">{displayText}</Text>
            <Icon as={Calendar} size={16} color={"gray"} />
          </View>
        </Button>
      </DialogTrigger>

      <DialogContent
        className={cn("w-[90vw] p-0 pt-4 pb-6 px-2", classNames?.content)}
      >
        <View className="flex flex-row justify-between items-start p-2">
          <View>
            <Text className="font-bold">Pick a date</Text>
            <Text className="text-xs text-muted-foreground">
              Please select a date from the calendar below.
            </Text>
          </View>
          <StablePressable
            className="p-2 rounded-md"
            onPress={() => {
              setVisible(false);
            }}
          >
            <Icon as={X} size={20} color={"gray"} />
          </StablePressable>
        </View>

        <DatePickerUI
          mode="single"
          date={date ? dayjs(date) : undefined}
          onChange={(params) => {
            const value = params.date;
            if (!value) {
              onChange(null);
            } else if (value instanceof Date) {
              onChange(value);
            } else if (typeof value === "string" || typeof value === "number") {
              onChange(new Date(value));
            } else {
              onChange(value.toDate());
            }
          }}
          showOutsideDays
          className="rounded-lg h-fit px-4"
          classNames={{
            ...defaultClassNames,
            today: "border-primary",
            selected: "bg-primary border-border rounded-full",
            selected_label: "text-foreground",
            day: `${defaultClassNames.day} hover:bg-primary/20`,
            disabled: "opacity-70",
            header: "pb-5",
          }}
        />

        <View className="flex flex-row justify-between items-center gap-2 px-4">
          <Button
            size={"sm"}
            variant="outline"
            onPress={clearDate}
            disabled={disabled}
            className="flex-1"
          >
            <Text>Clear</Text>
          </Button>
          <Button
            size={"sm"}
            onPress={() => setVisible(false)}
            disabled={disabled}
            className="flex-1"
          >
            <Text>Done</Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
};
