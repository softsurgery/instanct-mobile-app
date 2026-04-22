import type { MapSessionPayload, ResponseSessionDto } from "@/types/session";
import React from "react";
import { ScrollView, View } from "react-native";
import { Text } from "../../ui/text";
import { format } from "date-fns";
import { useObjectives } from "@/hooks/content/reference-types/useObjectives";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowRight } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { SessionIncomingRequests } from "./SessionIncomingRequests";
import { SessionOutgoingRequests } from "./SessionOutgoingRequests";

interface SessionDetailsContentProps {
  session: ResponseSessionDto<MapSessionPayload>;
}

const Tab = createMaterialTopTabNavigator();

const toValidDate = (value?: Date | string | null) => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  if (isNaN(parsed.getTime())) return null;
  return parsed;
};

export const SessionDetailsContent = ({
  session,
}: SessionDetailsContentProps) => {
  const { objectives, isObjectivesSubTypePending } = useObjectives();

  const payloadObjectiveIds = React.useMemo(
    () => (session.payload?.objectives ?? []).map(String),
    [session.payload?.objectives],
  );

  const objectivesById = React.useMemo(
    () => new Map(objectives.map((o) => [String(o.id), o.label])),
    [objectives],
  );

  const selectedObjectives = React.useMemo(
    () =>
      payloadObjectiveIds.map((id) => ({
        id,
        label: objectivesById.get(id) ?? id,
        isResolved: objectivesById.has(id),
      })),
    [payloadObjectiveIds, objectivesById],
  );

  const formatSessionWindow = (
    session: ResponseSessionDto<MapSessionPayload>,
  ) => {
    const start = toValidDate(session.plannedStart);
    const end = toValidDate(session.plannedEnd);

    return (
      <View className="bg-card border border-border rounded-lg px-4 py-4">
        <Text className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
          Planned Window
        </Text>

        <View className="flex-row items-center gap-2">
          {/* Start */}
          <View className="flex-1 items-start">
            <Text className="text-sm font-semibold">
              {start ? format(start, "MMM d, yyyy") : "N/A"}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              {start ? format(start, "p") : "—"}
            </Text>
          </View>

          {/* Arrow */}
          {end && (
            <View className="flex-1 flex-row items-center justify-center pb-0.5">
              <Icon as={ArrowRight} size={20} />
            </View>
          )}

          {/* End */}
          {end && (
            <View className="flex-1 items-start">
              <Text className="text-sm font-semibold">
                {format(end, "MMM d, yyyy")}
              </Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                {format(end, "p")}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="flex flex-1 flex-col">
      <View className="flex-1">
        <Tab.Navigator
          screenOptions={{
            tabBarScrollEnabled: false,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "600",
              textTransform: "none",
            },
            tabBarStyle: { backgroundColor: "transparent" },
          }}
          commonOptions={{
            sceneStyle: {
              flex: 1,
            },
          }}
        >
          <Tab.Screen name="Informations">
            {() => (
              <ScrollView
                className="flex-1"
                contentContainerClassName="px-4 pt-4 pb-8 gap-4"
                showsVerticalScrollIndicator={false}
              >
                {formatSessionWindow(session)}

                <View className="bg-card border border-border rounded-lg overflow-hidden">
                  <View className="px-4 py-4 flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                      <Text className="text-base font-semibold">
                        Objectives
                      </Text>
                      <Text className="text-xs text-muted-foreground mt-1">
                        Selected objectives for this session.
                      </Text>
                    </View>
                    {payloadObjectiveIds.length > 0 ? (
                      <Badge variant="secondary">
                        <Text className="text-xs">
                          {payloadObjectiveIds.length}
                        </Text>
                      </Badge>
                    ) : null}
                  </View>

                  <Separator />

                  <View className="px-4 py-4">
                    {payloadObjectiveIds.length === 0 ? (
                      <Text className="text-sm text-muted-foreground italic">
                        No objectives selected.
                      </Text>
                    ) : isObjectivesSubTypePending ? (
                      <Text className="text-sm text-muted-foreground">
                        Loading objectives…
                      </Text>
                    ) : (
                      <View className="flex-row flex-wrap gap-2">
                        {selectedObjectives.map(({ id, label, isResolved }) => (
                          <Badge
                            key={id}
                            variant={"outline"}
                            className={cn(
                              "px-2 py-1 rounded-full",
                              !isResolved && "opacity-70",
                            )}
                          >
                            <Text className="text-xs">{label}</Text>
                          </Badge>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </ScrollView>
            )}
          </Tab.Screen>
          <Tab.Screen name="Incoming">
            {() => <SessionIncomingRequests session={session} />}
          </Tab.Screen>
          <Tab.Screen name="Outgoing">
            {() => <SessionOutgoingRequests session={session} />}
          </Tab.Screen>
        </Tab.Navigator>
      </View>
    </View>
  );
};
