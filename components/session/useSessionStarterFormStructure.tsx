import { SessionStore } from "@/stores/useSessionStore";
import {
  CheckboxFieldProps,
  Field,
  FieldVariant,
  FormStructure,
  TimeFieldProps,
} from "../shared/form-builder/types";
import React from "react";

interface useSessionStarterFormStructureProps {
  store: SessionStore;
}

export const useSessionStarterFormStructure = ({
  store,
}: useSessionStarterFormStructureProps) => {
  const [now, setNow] = React.useState<boolean>(true);

  const nowField: Field<CheckboxFieldProps> = {
    id: "start-now",
    label: "Start Now",
    description: "If checked, you can schedule the session for later.",
    variant: FieldVariant.CHECKBOX,
    className: "size-5",
    props: {
      checked: now,
      onCheckedChange: (value) => {
        setNow(value);
        store.setNested("createDto.plannedStart", undefined);
        store.setNested("createDtoErrors.plannedStart", []);
      },
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
    props: {
      value: store.createDto.plannedEnd,
      onTimeChange: (time) => {
        store.setNested("createDto.plannedEnd", time);
        store.setNested("createDtoErrors.plannedEnd", []);
      },
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
        ],
      },
    ],
  };
  return { structure };
};
