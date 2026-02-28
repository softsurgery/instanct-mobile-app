import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { toLongDateString } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Calendar, X } from "lucide-react-native";
import React from "react";
import { Keyboard, View } from "react-native";
import { StablePressable } from "../StablePressable";
import { StableScrollable } from "../StableScrollable";

interface DatePickerProps {
  className?: string;
  classNames?: {
    trigger: string;
    content: string;
  };
  value?: Date | null;
  onDateChange: (date: Date | null) => void;
  disabled?: boolean;
  nullable?: boolean;
}

export const DatePicker = ({
  className,
  classNames,
  disabled,
  value: date = null,
  onDateChange,
  nullable = true,
}: DatePickerProps) => {
  const [visible, setVisible] = React.useState(false);

  const displayText = React.useMemo(
    () => (date ? toLongDateString(date) : "Select a date"),
    [date],
  );

  const MONTHS = [
    { label: "January", value: "jan" },
    { label: "February", value: "feb" },
    { label: "March", value: "mar" },
    { label: "April", value: "apr" },
    { label: "May", value: "may" },
    { label: "June", value: "jun" },
    { label: "July", value: "jul" },
    { label: "August", value: "aug" },
    { label: "September", value: "sep" },
    { label: "October", value: "oct" },
    { label: "November", value: "nov" },
    { label: "December", value: "dec" },
  ];

  const [year, setYear] = React.useState(
    date ? String(date.getFullYear()) : "2023",
  );
  const [month, setMonth] = React.useState(
    date ? MONTHS[date.getMonth()].value : "jan",
  );
  const [day, setDay] = React.useState(date ? String(date.getDate()) : "1");

  const years = Array.from({ length: 50 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { label: String(y), value: String(y) };
  }).reverse();

  const days = Array.from({ length: 31 }, (_, i) => {
    const d = i + 1;
    return { label: String(d), value: String(d) };
  }).filter(
    (d) =>
      Number(d.value) <=
      new Date(
        Number(year),
        MONTHS.findIndex((m) => m.value === month) + 1,
        0,
      ).getDate(),
  );

  const handleDateChange = (key: "day" | "month" | "year", value: string) => {
    let newYear = year;
    let newMonth = month;
    let newDay = day;

    switch (key) {
      case "day":
        newDay = value;
        break;
      case "month":
        newMonth = value;
        newDay = "1";
        break;
      case "year":
        newYear = value;
        newDay = "1";
        break;
    }

    setYear(newYear);
    setMonth(newMonth);
    setDay(newDay);

    if (onDateChange) {
      const newDate = new Date(
        Number(newYear),
        MONTHS.findIndex((m) => m.value === newMonth),
        Number(newDay),
      );
      onDateChange(newDate);
    }
  };

  const clearDate = () => {
    onDateChange(null);
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

        <View className={cn("flex-row items-center justify-center gap-4 px-4")}>
          <StableScrollable
            options={days}
            value={day}
            onChange={(opt) => handleDateChange("day", opt.value)}
            className="flex-1 h-12  border bg-card rounded-lg"
          />
          <StableScrollable
            options={MONTHS}
            value={month}
            onChange={(opt) => handleDateChange("month", opt.value)}
            className="flex-1 h-12  border bg-card rounded-lg"
          />
          <StableScrollable
            options={years}
            value={year}
            onChange={(opt) => handleDateChange("year", opt.value)}
            className="flex-1 h-12  border bg-card rounded-lg"
          />
        </View>

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
