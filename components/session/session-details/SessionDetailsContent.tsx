import { ResponseSessionDto } from "@/types/session";
import { View } from "react-native";
import { Text } from "../../ui/text";
import { Badge } from "../../ui/badge";
import { Section } from "./SessionDetailsSection";
import { InfoRow } from "./SessionInfoRow";
import { toTimeOnly } from "@/lib/date";

interface SessionDetailsContentProps {
  session: ResponseSessionDto;
  getStatus: (session: ResponseSessionDto) => string;
  formatSessionWindow: (session: ResponseSessionDto) => string;
}

const toSafeTime = (value?: Date | string) => {
  if (!value) return "N/A";
  const parsed = value instanceof Date ? value : new Date(value);
  if (isNaN(parsed.getTime())) return "N/A";
  return toTimeOnly(parsed);
};

export const SessionDetailsContent = ({
  session,
  getStatus,
  formatSessionWindow,
}: SessionDetailsContentProps) => {
  const scheduleRows: { label: string; value: string }[] = [
    { label: "Planned Date", value: formatSessionWindow(session) },
    {
      label: "Planned Start",
      value: session.plannedStart
        ? toTimeOnly(new Date(session.plannedStart))
        : "N/A",
    },
    { label: "Planned End", value: toSafeTime(session.plannedEnd) },
    { label: "Started At", value: toSafeTime(session.started) },
    { label: "Ended At", value: toSafeTime(session.ended) },
  ];

  return (
    <View className="flex flex-col">
      <View className="px-4 mb-4">
        <View className="mt-4 rounded-2xl border border-primary/10 bg-primary/5 shadow-sm overflow-hidden">
          <View className="flex flex-col justify-between p-4 gap-2">
            <View className="flex flex-row justify-between items-center w-full">
              <Text variant="h4">Session details</Text>
              <Badge variant="outline" className="self-start">
                <Text className="uppercase tracking-wide text-xs">
                  {getStatus(session)}
                </Text>
              </Badge>
            </View>
            <Text variant="muted">
              Session #{session.id ?? "N/A"} with planned window{" "}
              {formatSessionWindow(session)}.
            </Text>
          </View>
        </View>
      </View>

      <Section
        title="Schedule"
        description="Planned timing and progression of this session."
      >
        {scheduleRows.map((row, index) => (
          <InfoRow
            key={row.label}
            label={row.label}
            value={row.value}
            hideSeparator={index === scheduleRows.length - 1}
          />
        ))}
      </Section>
    </View>
  );
};
