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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("explore");

  const nowField: Field<CustomFieldProps> = {
    id: "start-now",
    label: t("session.start.startingOption"),
    description: t("session.start.descriptions.startingOption"),
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
            { label: t("session.start.options.now"), value: "now" },
            { label: t("session.start.options.schedule"), value: "schedule" },
          ]}
        />
      ),
    },
  };

  const startDateField: Field<TimeFieldProps> = {
    id: "start-date",
    label: t("session.start.startTime"),
    variant: FieldVariant.TIME,
    hidden: store.flags.startNow,
    error: t(store.errors.plannedStart?.[0]),
    description: t("session.start.descriptions.startTime"),
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
    label: t("session.start.endTime"),
    variant: FieldVariant.TIME,
    error: t(store.errors.plannedEnd?.[0]),
    description: t("session.start.descriptions.endTime"),
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
    label: t("session.start.objectives"),
    variant: FieldVariant.MULTISELECT,
    description: t("session.start.descriptions.objectives"),
    placeholder: t("session.start.placeholders.objectives"),
    error: t(store.errors?.payload?.objectives?.[0]),
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
    title: t("session.start.title"),
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
