import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Clock, X } from "lucide-react-native";
import React from "react";
import { Keyboard, View } from "react-native";
import { StablePressable } from "../StablePressable";
import { StableScrollable } from "../StableScrollable";

interface TimePickerProps {
  className?: string;
  classNames?: {
    trigger: string;
    content: string;
  };
  value?: Date | null;
  onTimeChange: (date: Date | null) => void;
  disabled?: boolean;
  nullable?: boolean;
}

const HOURS = Array.from({ length: 12 }, (_, i) => {
  const h = i + 1;
  return { label: String(h), value: String(h) };
});

const MINUTES = Array.from({ length: 60 }, (_, i) => ({
  label: String(i).padStart(2, "0"),
  value: String(i),
}));

const PERIODS = [
  { label: "AM", value: "AM" },
  { label: "PM", value: "PM" },
];

function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${String(minutes).padStart(2, "0")} ${period}`;
}

export const TimePicker = ({
  className,
  classNames,
  disabled,
  value: time = null,
  onTimeChange,
  nullable = true,
}: TimePickerProps) => {
  const [visible, setVisible] = React.useState(false);

  const displayText = React.useMemo(
    () => (time ? formatTime(time) : "Select a time"),
    [time],
  );

  const getInitialHour = () => {
    if (!time) return "12";
    const h = time.getHours() % 12 || 12;
    return String(h);
  };

  const getInitialMinute = () => {
    if (!time) return "0";
    return String(time.getMinutes());
  };

  const getInitialPeriod = () => {
    if (!time) return "AM";
    return time.getHours() >= 12 ? "PM" : "AM";
  };

  const [hour, setHour] = React.useState(getInitialHour);
  const [minute, setMinute] = React.useState(getInitialMinute);
  const [period, setPeriod] = React.useState(getInitialPeriod);

  const handleTimeChange = (
    key: "hour" | "minute" | "period",
    value: string,
  ) => {
    let newHour = hour;
    let newMinute = minute;
    let newPeriod = period;

    switch (key) {
      case "hour":
        newHour = value;
        break;
      case "minute":
        newMinute = value;
        break;
      case "period":
        newPeriod = value;
        break;
    }

    setHour(newHour);
    setMinute(newMinute);
    setPeriod(newPeriod);

    if (onTimeChange) {
      let hours24 = Number(newHour) % 12;
      if (newPeriod === "PM") hours24 += 12;

      const base = time ? new Date(time) : new Date();
      base.setHours(hours24, Number(newMinute), 0, 0);
      onTimeChange(base);
    }
  };

  const clearTime = () => {
    onTimeChange(null);
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
            <Icon as={Clock} size={16} color={"gray"} />
          </View>
        </Button>
      </DialogTrigger>

      <DialogContent
        className={cn("w-[90vw] p-0 pt-4 pb-6 px-2", classNames?.content)}
      >
        <View className="flex flex-row justify-between items-start p-2">
          <View>
            <Text className="font-bold">Pick a time</Text>
            <Text className="text-xs text-muted-foreground">
              Please select a time below.
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
            options={HOURS}
            value={hour}
            onChange={(opt) => handleTimeChange("hour", opt.value)}
            className="flex-1 h-12 border bg-card rounded-lg"
          />
          <StableScrollable
            options={MINUTES}
            value={minute}
            onChange={(opt) => handleTimeChange("minute", opt.value)}
            className="flex-1 h-12 border bg-card rounded-lg"
          />
          <StableScrollable
            options={PERIODS}
            value={period}
            onChange={(opt) => handleTimeChange("period", opt.value)}
            className="flex-1 h-12 border bg-card rounded-lg"
          />
        </View>

        <View className="flex flex-row justify-between items-center gap-2 px-4">
          <Button
            size={"sm"}
            variant="outline"
            onPress={clearTime}
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
