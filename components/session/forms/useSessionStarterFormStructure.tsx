import { SessionStore } from "@/stores/useSessionStore";
import {
  CustomFieldProps,
  Field,
  FieldVariant,
  FormStructure,
  MultiSelectFieldProps,
  SelectOption,
  TimeFieldProps,
} from "../../shared/form-builder/types";
import React from "react";
import { SessionStartModeToggle } from "../SessionStarterModeToggle";

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
  const nowField: Field<CustomFieldProps> = {
    id: "start-now",
    label: "",
    description: "If checked, you can schedule the session for later.",
    variant: FieldVariant.CUSTOM,
    props: {
      children: <SessionStartModeToggle store={store} disabled={isPending} />,
    },
  };

  const startDateField: Field<TimeFieldProps> = {
    id: "start-date",
    label: "Start Time",
    variant: FieldVariant.TIME,
    hidden: store.flags.startNow,
    error: store.errors.plannedStart?.[0],
    description:
      "The start time of the session. If 'Start Now' is checked, this will be ignored and the session will start immediately.",
    props: {
      editable: !isPending,
      value: store.createDto.plannedStart,
      onTimeChange: (time) => {
        store.setNested("createDto.plannedStart", time);
        store.setNested("errors.plannedStart", []);
      },
    },
  };

  const endDateField: Field<TimeFieldProps> = {
    id: "end-date",
    label: "End Time",
    variant: FieldVariant.TIME,
    error: store.errors.plannedEnd?.[0],
    description:
      "The end time of the session. This will be ignored if 'Start Now' is checked.",
    props: {
      editable: !isPending,
      value: store.createDto.plannedEnd,
      onTimeChange: (time) => {
        store.setNested("createDto.plannedEnd", time);
        store.setNested("errors.plannedEnd", []);
      },
    },
  };

  const objectivesField: Field<MultiSelectFieldProps> = {
    id: "objectives",
    label: "Objectives",
    variant: FieldVariant.MULTISELECT,
    description: "Select the objectives for this session.",
    placeholder: "Select objectives",
    error: store.errors?.payload?.objectives?.[0],
    props: {
      editable: !isPending,
      value: store.createDto?.payload?.objectives.map(String) || [],
      onSelect: (values) => {
        store.setNested("createDto.payload.objectives", values.map(Number));
        store.setNested("errors.payload.objectives", []);
      },
      options: objectives,
      max: 5,
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
