import { SessionStore } from "@/stores/useSessionStore";
import {
  Field,
  FieldVariant,
  FormStructure,
  MultiSelectFieldProps,
  SelectOption,
  TimeFieldProps,
} from "../../shared/form-builder/types";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("explore");
  const endDateField: Field<TimeFieldProps> = {
    id: "end-date",
    label: t("session.manage.endTime"),
    variant: FieldVariant.TIME,
    error: store.errors.plannedEnd?.[0],
    description: t("session.manage.descriptions.endTime"),
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
    label: t("session.manage.objectives"),
    variant: FieldVariant.MULTISELECT,
    description: t("session.manage.descriptions.objectives"),
    placeholder: t("session.manage.placeholders.objectives"),
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
    title: t("session.manage.title"),
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
