import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { StablePressable } from "@/components/shared/StablePressable";
import { cn } from "@/lib/utils";
import { ResponseUserDto } from "@/types";
import {
  format,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  getHours,
  setHours,
  setMinutes,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Search,
  Plus,
  ArrowLeft,
} from "lucide-react-native";
import React from "react";
import { View, ScrollView } from "react-native";
import { StableSafeAreaView } from "../../shared/StableSafeAreaView";
import { router } from "expo-router";
import { ApplicationHeader } from "../../shared/AppHeader";

// Mock event types for demonstration
export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  color: "red" | "yellow" | "pink" | "blue" | "green" | "purple";
  isAllDay?: boolean;
}

interface UserCalendarProps {
  user?: ResponseUserDto;
  events?: CalendarEvent[];
  onAddEvent?: () => void;
  onEventPress?: (event: CalendarEvent) => void;
  className?: string;
}

const DAYS_OF_WEEK = ["S", "M", "T", "W", "T", "F", "S"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

const EVENT_COLORS = {
  red: { bg: "bg-red-100", border: "border-l-red-500", text: "text-red-600" },
  yellow: {
    bg: "bg-yellow-100",
    border: "border-l-yellow-500",
    text: "text-yellow-700",
  },
  pink: {
    bg: "bg-pink-100",
    border: "border-l-pink-500",
    text: "text-pink-600",
  },
  blue: {
    bg: "bg-blue-100",
    border: "border-l-blue-500",
    text: "text-blue-600",
  },
  green: {
    bg: "bg-green-100",
    border: "border-l-green-500",
    text: "text-green-600",
  },
  purple: {
    bg: "bg-purple-100",
    border: "border-l-purple-500",
    text: "text-purple-600",
  },
};

// Mock events for demonstration
const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Portfolio work session",
    startTime: setMinutes(setHours(new Date(), 10), 0),
    endTime: setMinutes(setHours(new Date(), 11), 0),
    color: "red",
  },
  {
    id: "2",
    title: "Presentation prep",
    startTime: setMinutes(setHours(new Date(), 13), 0),
    endTime: setMinutes(setHours(new Date(), 14), 0),
    color: "red",
  },
  {
    id: "3",
    title: "Singing group",
    startTime: setMinutes(setHours(new Date(), 15), 0),
    endTime: setMinutes(setHours(new Date(), 16), 0),
    color: "pink",
  },
  {
    id: "4",
    title: "Project presentations",
    startTime: setMinutes(setHours(new Date(), 17), 0),
    endTime: setMinutes(setHours(new Date(), 19), 0),
    color: "yellow",
  },
];

const MOCK_ALL_DAY_EVENTS: CalendarEvent[] = [
  {
    id: "all-1",
    title: "Chad Benjamin P...",
    startTime: new Date(),
    endTime: new Date(),
    color: "blue",
    isAllDay: true,
  },
  {
    id: "all-2",
    title: "Melody Cheung's...",
    startTime: new Date(),
    endTime: new Date(),
    color: "blue",
    isAllDay: true,
  },
];

export const UserCalendar = ({
  user,
  events = MOCK_EVENTS,
  onAddEvent,
  onEventPress,
  className,
}: UserCalendarProps) => {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  // Get calendar days for the current week view
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Get events for selected date
  const dayEvents = events.filter((event) =>
    isSameDay(event.startTime, selectedDate),
  );

  const allDayEvents = MOCK_ALL_DAY_EVENTS.filter((event) =>
    isSameDay(event.startTime, selectedDate),
  );

  const handlePrevMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    setSelectedDate(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    setSelectedDate(newMonth);
  };

  const handleTodayPress = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
  };

  const getEventPosition = (event: CalendarEvent) => {
    const startHour = getHours(event.startTime);
    const endHour = getHours(event.endTime);
    const duration = endHour - startHour;
    return {
      top: (startHour - 8) * 60, // 60px per hour, starting from 8 AM
      height: duration * 60,
    };
  };

  return (
    <StableSafeAreaView className="flex-1 bg-card">
      {/* Custom Header */}
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={"Calendar"}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            icon: ArrowLeft,
            onPress: () => {
              router.back();
            },
          },
        ]}
      />
      <View className={cn("flex-1 bg-background", className)}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <StablePressable
            onPress={handlePrevMonth}
            className="flex-row items-center"
          >
            <Icon as={ChevronLeft} size={20} className="text-red-500" />
          </StablePressable>

          <Text className="text-red-500 text-lg font-medium">
            {format(currentMonth, "MMMM yyyy")}
          </Text>

          <StablePressable
            onPress={handleNextMonth}
            className="flex-row items-center"
          >
            <Icon as={ChevronRight} size={20} className="text-red-500" />
          </StablePressable>
        </View>

        {/* Action Bar */}
        <View className="flex-row items-center justify-end px-4 py-2 border-b border-border gap-4">
          <StablePressable>
            <Icon as={CalendarDays} size={22} className="text-foreground" />
          </StablePressable>
          <StablePressable>
            <Icon as={Search} size={22} className="text-foreground" />
          </StablePressable>
          <StablePressable onPress={onAddEvent}>
            <Icon as={Plus} size={22} className="text-foreground" />
          </StablePressable>
        </View>

        {/* Week Row */}
        <View className="flex-row px-2 py-2 border-b border-border">
          {DAYS_OF_WEEK.map((day, index) => (
            <View key={index} className="flex-1 items-center">
              <Text
                className={cn(
                  "text-xs font-medium",
                  index === 0 ? "text-red-500" : "text-muted-foreground",
                )}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Date Row */}
        <View className="flex-row px-2 py-2 border-b border-border">
          {weekDays.map((day, index) => {
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);

            return (
              <StablePressable
                key={index}
                className="flex-1 items-center"
                onPress={() => setSelectedDate(day)}
              >
                <View
                  className={cn(
                    "w-8 h-8 rounded-full items-center justify-center",
                    isSelected && isTodayDate && "bg-red-500",
                    isSelected && !isTodayDate && "bg-primary",
                  )}
                >
                  <Text
                    className={cn(
                      "text-base font-medium",
                      isSelected
                        ? "text-white"
                        : isTodayDate
                          ? "text-red-500"
                          : "text-foreground",
                    )}
                  >
                    {format(day, "d")}
                  </Text>
                </View>
              </StablePressable>
            );
          })}
        </View>

        {/* Selected Date Display */}
        <View className="px-4 py-3 border-b border-border">
          <Text className="text-base font-medium text-foreground">
            {format(selectedDate, "EEEE — MMM d, yyyy")}
          </Text>
        </View>

        {/* All-day Events */}
        {allDayEvents.length > 0 && (
          <View className="flex-row items-center px-4 py-2 border-b border-border">
            <Text className="text-xs text-muted-foreground w-12">all-day</Text>
            <View className="flex-1 flex-row gap-2">
              {allDayEvents.map((event) => (
                <StablePressable
                  key={event.id}
                  onPress={() => onEventPress?.(event)}
                  className="flex-row items-center bg-blue-100 px-2 py-1 rounded-md"
                >
                  <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                  <Text
                    className="text-xs text-blue-600 font-medium"
                    numberOfLines={1}
                  >
                    {event.title}
                  </Text>
                </StablePressable>
              ))}
            </View>
          </View>
        )}

        {/* Time Grid */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Current Time Indicator */}
          <View
            className="absolute left-0 right-0 flex-row items-center z-10"
            style={{ top: (new Date().getHours() - 8) * 60 }}
          >
            <View className="w-12 pr-2">
              <Text className="text-xs text-red-500 text-right">
                {format(new Date(), "h:mm")}
              </Text>
            </View>
            <View className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
            <View className="flex-1 h-0.5 bg-red-500" />
          </View>

          {HOURS.map((hour) => (
            <View key={hour} className="flex-row" style={{ height: 60 }}>
              <View className="w-12 pr-2 pt-0">
                <Text className="text-xs text-muted-foreground text-right">
                  {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </Text>
              </View>
              <View className="flex-1 border-t border-border" />
            </View>
          ))}

          {/* Events Overlay */}
          <View
            className="absolute left-12 right-0"
            style={{ top: 0 }}
            pointerEvents="box-none"
          >
            {dayEvents.map((event) => {
              const position = getEventPosition(event);
              const colors = EVENT_COLORS[event.color];

              return (
                <StablePressable
                  key={event.id}
                  onPress={() => onEventPress?.(event)}
                  className={cn(
                    "absolute left-2 right-2 rounded-md px-2 py-1 border-l-4",
                    colors.bg,
                    colors.border,
                  )}
                  style={{
                    top: position.top,
                    height: position.height - 4,
                  }}
                >
                  <Text
                    className={cn("text-sm font-medium", colors.text)}
                    numberOfLines={1}
                  >
                    {event.title}
                  </Text>
                  {position.height > 40 && (
                    <Text className={cn("text-xs", colors.text)}>
                      {format(event.startTime, "h")}–
                      {format(event.endTime, "haa")}
                    </Text>
                  )}
                </StablePressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Tab Bar */}
        <View className="flex-row items-center justify-around pt-6 pb-8 border-t border-border bg-card">
          <StablePressable
            onPress={handleTodayPress}
            className="items-center px-6"
          >
            <Text className="text-red-500 font-medium">Today</Text>
          </StablePressable>
          <StablePressable className="items-center px-6">
            <Text className="text-muted-foreground font-medium">Calendars</Text>
          </StablePressable>
          <StablePressable className="items-center px-6">
            <Text className="text-muted-foreground font-medium">Inbox</Text>
          </StablePressable>
        </View>
      </View>
    </StableSafeAreaView>
  );
};

// Button component to access calendar from UserCard
interface CalendarButtonProps {
  onPress: () => void;
  className?: string;
}

export const CalendarButton = ({ onPress, className }: CalendarButtonProps) => {
  return (
    <Button
      variant="outline"
      className={cn(
        "flex-1 h-12 rounded-xl flex-row gap-2 border-purple-300",
        className,
      )}
      onPress={onPress}
    >
      <Icon as={CalendarDays} size={18} className="text-purple-500" />
      <Text className="text-purple-500">Calendar</Text>
    </Button>
  );
};
