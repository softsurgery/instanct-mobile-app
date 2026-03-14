import { UserCalendar } from "@/components/calendar/UserCalendar";
import { useLocalSearchParams } from "expo-router";

export default function Screen() {
  const { id } = useLocalSearchParams();

  return (
    <UserCalendar
      onAddEvent={() => {
        // Handle add event - can be implemented later
        console.log("Add event for user:", id);
      }}
      onEventPress={(event) => {
        // Handle event press - can be implemented later
        console.log("Event pressed:", event);
      }}
    />
  );
}
