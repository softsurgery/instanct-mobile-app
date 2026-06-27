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
import { SegmentedToggle } from "@/components/shared/SegmentedToggle";

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
    label: "Starting Option",
    description:
      "Choose whether to start the session immediately or schedule it for later.",
    variant: FieldVariant.CUSTOM,
    props: {
      children: (
        <SegmentedToggle
          disabled={isPending}
          value={store.flags.startNow ? "now" : "schedule"}
          onChange={(next) => {
            if (next === "now") {
              store.setNested("flags.startNow", true);
              store.setNested("createDto.plannedStart", undefined);
            } else {
              store.setNested("flags.startNow", false);
            }
          }}
          options={[
            { label: "Démarrer maintenant", value: "now" },
            { label: "Planifier", value: "schedule" },
          ]}
        />
      ),
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
