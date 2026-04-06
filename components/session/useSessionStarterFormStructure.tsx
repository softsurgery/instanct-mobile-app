import { SessionStore } from "@/stores/useSessionStore";
import {
  CustomFieldProps,
  Field,
  FieldVariant,
  FormStructure,
  MultiSelectFieldProps,
  SelectOption,
  TimeFieldProps,
} from "../shared/form-builder/types";
import React from "react";
import { View, Pressable } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "../ui/text";

interface useSessionStarterFormStructureProps {
  store: SessionStore;
  objectives?: SelectOption[];
  isPending?: boolean;
}

export const useSessionStarterFormStructure = ({
  store,
  objectives,
  isPending,
}: useSessionStarterFormStructureProps) => {
  const [now, setNow] = React.useState<boolean>(true);

  const nowField: Field<CustomFieldProps> = {
    id: "start-now",
    label: "",
    description: "If checked, you can schedule the session for later.",
    variant: FieldVariant.CUSTOM,
    disabled: isPending,
    props: {
      children: (
        <View className="-mt-4 pb-2 flex-row gap-2">
          <Pressable
            onPress={() => {
              setNow(true);
              store.setNested("createDto.plannedStart", null);
              store.setNested("createDto.plannedEnd", null);
            }}
            className={cn(
              "flex-1 py-3 px-4 rounded-lg items-center justify-center border-2",
              now
                ? "bg-primary border-primary"
                : "bg-transparent border-border",
            )}
          >
            <Text
              className={cn(
                "font-semibold",
                now ? "text-primary-foreground" : "text-foreground",
              )}
            >
              Démarrer maintenant
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setNow(false);
            }}
            className={cn(
              "flex-1 py-3 px-4 rounded-lg items-center justify-center border-2",
              !now
                ? "bg-primary border-primary"
                : "bg-transparent border-border",
            )}
          >
            <Text
              className={cn(
                "font-semibold",
                !now ? "text-primary-foreground" : "text-foreground",
              )}
            >
              Planifier
            </Text>
          </Pressable>
        </View>
      ),
    },
  };

  const startDateField: Field<TimeFieldProps> = {
    id: "start-date",
    label: "Start Time",
    variant: FieldVariant.TIME,
    hidden: now,
    error: store.createDtoErrors.plannedStart?.[0],
    description:
      "The start time of the session. If 'Start Now' is checked, this will be ignored and the session will start immediately.",
    disabled: isPending,
    props: {
      value: store.createDto.plannedStart,
      onTimeChange: (time) => {
        store.setNested("createDto.plannedStart", time);
        store.setNested("createDtoErrors.plannedStart", []);
      },
    },
  };

  const endDateField: Field<TimeFieldProps> = {
    id: "end-date",
    label: "End Time",
    variant: FieldVariant.TIME,
    error: store.createDtoErrors.plannedEnd?.[0],
    description:
      "The end time of the session. This will be ignored if 'Start Now' is checked.",
    disabled: isPending,
    props: {
      value: store.createDto.plannedEnd,
      onTimeChange: (time) => {
        store.setNested("createDto.plannedEnd", time);
        store.setNested("createDtoErrors.plannedEnd", []);
      },
    },
  };

  const objectivesField: Field<MultiSelectFieldProps> = {
    id: "objectives",
    label: "Objectives",
    variant: FieldVariant.MULTISELECT,
    description: "Select the objectives for this session.",
    placeholder: "Select objectives",
    error: store.createDtoErrors?.payload?.objectives?.[0],
    props: {
      value: store.createDto?.payload?.objectives,
      onSelect: (values) => {
        console.log(store.createDto?.payload);
        store.setNested("createDto.payload.objectives", values);
        store.setNested("createDtoErrors.payload.objectives", []);
      },
      options: objectives,
    },
  };

  const structure: FormStructure = {
    title: "Start a Session",
    fieldsets: [
      {
        title: "",
        rows: [
          {
            id: 1,
            fields: [nowField],
          },
          {
            id: 2,
            fields: [startDateField],
          },
          {
            id: 3,
            fields: [endDateField],
          },
          {
            id: 4,
            fields: [objectivesField],
          },
        ],
      },
    ],
  };
  return { structure };
};
