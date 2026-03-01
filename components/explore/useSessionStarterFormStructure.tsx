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
      },
    },
  };

  const startDateField: Field<TimeFieldProps> = {
    id: "start-date",
    label: "Start Time",
    variant: FieldVariant.TIME,
    hidden: now,
    props: {
      value: store.createDto.plannedStart,
      onTimeChange: (time) => {
        store.setNested("createDto.plannedStart", time);
      },
    },
  };

  const endDateField: Field<TimeFieldProps> = {
    id: "end-date",
    label: "End Time",
    variant: FieldVariant.TIME,
    props: {
      value: store.createDto.plannedEnd,
      onTimeChange: (time) => {
        store.setNested("createDto.plannedEnd", time);
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
