/* eslint-disable react-hooks/rules-of-hooks */
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

import { Text } from "@/components/ui/text";
import { toLongDateString } from "@/lib/date";
import { cn } from "@/lib/utils";
import { X } from "lucide-react-native";
import React from "react";
import { View } from "react-native";
import DatePickerUI, { useDefaultClassNames } from "react-native-ui-datepicker";
import dayjs from "dayjs";
import Modal from "react-native-modal";

interface DatePickerProps {
  className?: string;
  date: Date | null;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
  nullable?: boolean;
}

export const DatePicker = ({
  className,
  disabled,
  date,
  onChange,
  nullable = false,
}: DatePickerProps) => {
  const defaultClassNames = useDefaultClassNames();
  const [visible, setVisible] = React.useState(false);

  const displayText = date ? toLongDateString(date) : "Select a date";

  const clearDate = () => {
    onChange(null);
  };

  return (
    <View className="flex flex-row items-center gap-2 w-full">
      <Button
        disabled={disabled}
        variant="outline"
        className={cn("w-full", className)}
        onPress={() => setVisible(true)}
      >
        <Text>{displayText}</Text>
      </Button>

      <Modal
        isVisible={visible}
        backdropOpacity={0.2}
        onBackdropPress={() => setVisible(false)}
        onBackButtonPress={() => setVisible(false)}
        style={{ justifyContent: "flex-end", margin: 0 }}
        avoidKeyboard
        onBlur={() => setVisible(false)}
      >
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
              // Dayjs
              onChange(value.toDate());
            }
          }}
          classNames={{
            ...defaultClassNames,
            today: "border-primary",
            selected: "bg-primary border-primary",
            selected_label: "text-foreground",
            day: `${defaultClassNames.day} hover:bg-primary/20`,
            disabled: "opacity-70",
          }}
        />
      </Modal>
      {nullable && date && (
        <Button
          variant="ghost"
          className="mt-2"
          onPress={clearDate}
          disabled={disabled}
        >
          <Text className="text-red-500">Clear</Text>
        </Button>
      )}

      {nullable && (
        <Button
          variant="ghost"
          onPress={clearDate}
          size="icon"
          disabled={disabled}
        >
          <Icon as={X} size={24} />
        </Button>
      )}
    </View>
  );
};
