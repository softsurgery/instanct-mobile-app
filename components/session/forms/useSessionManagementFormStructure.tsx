import { SessionStore } from "@/stores/useSessionStore";
import {
  Field,
  FieldVariant,
  FormStructure,
  MultiSelectFieldProps,
  SelectOption,
  TimeFieldProps,
} from "../../shared/form-builder/types";

interface useSessionManagementFormStructureProps {
  store: SessionStore;
  objectives?: SelectOption[];
  isPending?: boolean;
}

export const useSessionManagementFormStructure = ({
  store,
  objectives,
  isPending,
}: useSessionManagementFormStructureProps) => {
  const endDateField: Field<TimeFieldProps> = {
    id: "end-date",
    label: "End Time",
    variant: FieldVariant.TIME,
    error: store.errors.plannedEnd?.[0],
    description: "You can adjust the planned end time",
    props: {
      editable: !isPending,
      value: store.updateDto?.plannedEnd,
      onTimeChange: (time) => {
        store.setNested("updateDto.plannedEnd", time);
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
      value: store.updateDto?.payload?.objectives.map(String) || [],
      onSelect: (values) => {
        store.setNested("updateDto.payload.objectives", values.map(Number));
        store.setNested("errors.payload.objectives", []);
      },
      options: objectives,
      max: 5,
    },
  };

  const structure: FormStructure = {
    title: "Manage Session",
    fieldsets: [
      {
        title: "",
        rows: [
          {
            id: 1,
            fields: [endDateField],
          },
          {
            id: 2,
            fields: [objectivesField],
          },
        ],
      },
    ],
  };
  return { structure };
};
