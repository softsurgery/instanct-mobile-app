import {
  CheckboxFieldProps,
  DateFieldProps,
  Field,
  FieldVariant,
  FormStructure,
  SelectFieldProps,
  TextareaFieldProps,
  TextFieldProps,
} from "@/components/shared/form-builder/types";
import { UserStore } from "@/stores/useUserStore";
import { LocationTypes, WorkTypes } from "@/types";
import { useTranslation } from "react-i18next";

interface UseUpdateExperienceFormStructureProps {
  store: UserStore;
}

export const useUpdateExperienceFormStructure = ({
  store,
}: UseUpdateExperienceFormStructureProps) => {
  const { t } = useTranslation("menu");
  const experienceTitle: Field<TextFieldProps> = {
    id: "title",
    label: t("experience.form.labels.title"),
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: t("experience.form.placeholders.title"),
    description: t("experience.form.descriptions.title"),
    error: t(store.experienceErrors?.title?.[0]),
    props: {
      value: store.updateExperienceDto.title,
      onChangeText: (value) => {
        store.setNested("updateExperienceDto.title", value);
        store.setNested("experienceErrors.title", []);
      },
    },
  };

  const companyName: Field<TextFieldProps> = {
    id: "company",
    label: t("experience.form.labels.company"),
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: t("experience.form.placeholders.company"),
    description: t("experience.form.descriptions.company"),
    error: t(store.experienceErrors?.company?.[0]),
    props: {
      value: store.updateExperienceDto?.company,
      onChangeText: (value) => {
        store.setNested("updateExperienceDto.company", value);
        store.setNested("experienceErrors.company", []);
      },
    },
  };

  const description: Field<TextareaFieldProps> = {
    id: "description",
    label: t("experience.form.labels.description"),
    variant: FieldVariant.TEXTAREA,
    required: false,
    placeholder: t("experience.form.placeholders.description"),
    description: t("experience.form.descriptions.description"),
    error: t(store.experienceErrors?.description?.[0]),
    props: {
      value: store.updateExperienceDto?.description,
      onChangeText: (value) => {
        store.setNested("updateExperienceDto.description", value);
        store.setNested("experienceErrors.description", []);
      },
      rows: 50,
    },
  };

  const location: Field<TextFieldProps> = {
    id: "location",
    label: t("experience.form.labels.location"),
    variant: FieldVariant.TEXT,
    required: false,
    placeholder: t("experience.form.placeholders.locationUpdate"),
    description: t("experience.form.descriptions.locationUpdate"),
    error: t(store.experienceErrors?.location?.[0]),
    hidden: store.updateExperienceDto?.locationType === LocationTypes.REMOTE,
    props: {
      value: store.updateExperienceDto?.location,
      onChangeText: (value) => {
        store.setNested("updateExperienceDto.location", value);
        store.setNested("experienceErrors.location", []);
      },
    },
  };

  const workType: Field<SelectFieldProps> = {
    id: "workType",
    label: t("experience.form.labels.workType"),
    variant: FieldVariant.SELECT,
    required: true,
    description: t("experience.form.descriptions.workType"),
    error: t(store.experienceErrors?.workType?.[0]),
    props: {
      value: store.updateExperienceDto?.workType,
      onSelect: (value) => {
        store.setNested("updateExperienceDto.workType", value);
        store.setNested("experienceErrors.workType", []);
      },
      options: Object.values(WorkTypes).map((type) => ({
        label: t(`experience.form.labels.workTypeOptions.${type}`),
        value: type,
      })),
    },
  };

  const locationType: Field<SelectFieldProps> = {
    id: "locationType",
    label: t("experience.form.labels.locationType"),
    variant: FieldVariant.SELECT,
    required: true,
    description: t("experience.form.descriptions.locationTypeUpdate"),
    error: t(store.experienceErrors?.locationType?.[0]),
    props: {
      value: store.updateExperienceDto?.locationType,
      onSelect: (value) => {
        store.setNested("updateExperienceDto.locationType", value);
        store.setNested("experienceErrors.locationType", []);
      },
      options: Object.values(LocationTypes).map((type) => ({
        label: t(`experience.form.labels.locationTypeOptions.${type}`),
        value: type,
      })),
    },
  };

  const startDate: Field<DateFieldProps> = {
    id: "startDate",
    label: t("experience.form.labels.startDate"),
    variant: FieldVariant.DATE,
    required: true,
    description: t("experience.form.descriptions.startDate"),
    error: t(store.experienceErrors?.startDate?.[0]),
    props: {
      value: store.updateExperienceDto?.startDate
        ? new Date(store.updateExperienceDto.startDate)
        : undefined,
      onDateChange: (value) => {
        store.setNested(
          "updateExperienceDto.startDate",
          value ? value.toISOString() : null,
        );
        store.setNested("experienceErrors.startDate", []);
      },
    },
  };

  const stillWorkHereField: Field<CheckboxFieldProps> = {
    id: "stillWorkHere",
    label: "",
    variant: FieldVariant.CHECKBOX,
    required: false,
    description: t("experience.form.descriptions.stillWorkHere"),
    props: {
      checked: store.present,
      onCheckedChange: (value) => {
        store.set("present", value);
        store.setNested("updateExperienceDto.endDate", null);
        store.setNested("experienceErrors.endDate", []);
      },
    },
  };

  const endDate: Field<DateFieldProps> = {
    id: "endDate",
    label: t("experience.form.labels.endDate"),
    variant: FieldVariant.DATE,
    required: false,
    description: t("experience.form.descriptions.endDate"),
    error: t(store.experienceErrors?.endDate?.[0]),
    hidden: store.present,
    props: {
      value: store.updateExperienceDto?.endDate
        ? new Date(store.updateExperienceDto.endDate)
        : undefined,
      onDateChange: (value) => {
        store.setNested(
          "updateExperienceDto.endDate",
          value ? value.toISOString() : null,
        );
        store.setNested("experienceErrors.endDate", []);
      },
    },
  };

  const structure: FormStructure = {
    title: t("experience.form.updateTitle"),
    fieldsets: [
      {
        title: t("experience.form.sectionTitle"),
        rows: [
          {
            id: 1,
            fields: [experienceTitle],
          },
          {
            id: 2,
            fields: [companyName],
          },
          {
            id: 3,
            fields: [description],
          },
          {
            id: 4,
            fields: [location],
          },
          {
            id: 5,
            fields: [workType, locationType],
          },
          {
            id: 6,
            fields: [startDate, stillWorkHereField, endDate],
          },
        ],
      },
    ],
  };

  return {
    structure,
  };
};
