import { cn } from "@/lib/utils";
import { ResponseSessionDto } from "@/types/session";
import React from "react";
import { View } from "react-native";
import { Text } from "../ui/text";

interface SessionCountdownProps {
  session: ResponseSessionDto;
  classNames?: {
    wrapper?: string;
    text?: string;
  };
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const computeTimeLeft = (targetDate: Date): TimeLeft => {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const total = Math.max(0, target - now);

  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
};

const pad = (n: number): string => String(n).padStart(2, "0");

export const SessionCountdown = ({
  session,
  classNames,
}: SessionCountdownProps) => {
  const targetDate = session.plannedEnd ?? session.ended;

  const [timeLeft, setTimeLeft] = React.useState<TimeLeft>(() =>
    targetDate
      ? computeTimeLeft(targetDate)
      : { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 },
  );

  React.useEffect(() => {
    if (!targetDate) return;

    setTimeLeft(computeTimeLeft(targetDate));

    const interval = setInterval(() => {
      const updated = computeTimeLeft(targetDate);
      setTimeLeft(updated);

      if (updated.total <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate) {
    return null;
  }

  const isExpired = timeLeft.total <= 0;

  const formatted =
    timeLeft.days > 0
      ? `${timeLeft.days}d ${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`
      : `${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`;

  return (
    <View className={cn("flex-row items-center gap-1", classNames?.wrapper)}>
      <Text
        className={cn(
          "font-bold tabular-nums",
          isExpired ? "text-destructive" : "text-foreground",
          classNames?.text,
        )}
      >
        {isExpired ? "00:00:00" : formatted}
      </Text>
    </View>
  );
};
