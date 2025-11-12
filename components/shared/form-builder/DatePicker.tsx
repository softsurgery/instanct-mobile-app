/* eslint-disable react-hooks/rules-of-hooks */
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Text } from "@/components/ui/text";
import { toLongDateString } from "@/lib/date";
import { cn } from "@/lib/utils";
import DateTimePicker from "@react-native-community/datetimepicker";
import { X } from "lucide-react-native";
import React from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface DatePickerProps {
  className?: string;
  disabled?: boolean;
  date: Date | null;
  onChange: (date: Date | null) => void;
  nullable?: boolean;
}

export const DatePicker = ({
  className,
  disabled,
  date,
  onChange,
  nullable = false,
}: DatePickerProps) => {
  const [pickerVisible, setPickerVisible] = React.useState(
    Platform.OS === "ios"
  );

  const handleDateChange = (date?: Date) => {
    if (date) onChange(date);
    setPickerVisible(Platform.OS === "ios");
  };

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const displayText = date ? toLongDateString(date) : "Select a date";

  const clearDate = () => {
    onChange(null);
  };

  if (Platform.OS === "android") {
    return (
      <View className={cn("flex-1 justify-center items-center")}>
        <Button
          disabled={disabled}
          variant="outline"
          className={cn("w-full", className)}
          onPress={() => setPickerVisible(true)}
        >
          <Text>{displayText}</Text>
        </Button>
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
        {React.useMemo(() => {
          return (
            pickerVisible && (
              <DateTimePicker
                display="default"
                value={date ?? new Date()}
                onChange={(e, newDate) => {
                  handleDateChange(newDate);
                }}
              />
            )
          );
        }, [pickerVisible, date])}
      </View>
    );
  } else {
    return (
      <View
        className={cn(
          "flex flex-1 flex-row justify-center items-center px-6 gap-2"
        )}
      >
        <Popover className="w-full">
          <PopoverTrigger asChild>
            <Button
              disabled={disabled}
              variant="outline"
              className={cn("w-full", className)}
            >
              <Text>{displayText}</Text>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side={Platform.OS === "web" ? "bottom" : "top"}
            insets={contentInsets}
            className="w-fit"
          >
            <DateTimePicker
              display="inline"
              value={date ?? new Date()}
              onChange={(e, newDate) => {
                onChange(newDate || null);
              }}
            />
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
          </PopoverContent>
        </Popover>
        <Button variant="ghost" onPress={clearDate} size={"icon"}>
          <Icon as={X} size={24} />
        </Button>
      </View>
    );
  }
};
