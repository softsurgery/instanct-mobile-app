import {
  Field,
  FieldVariant,
  FormStructure,
  TextareaFieldProps,
  TextFieldProps,
} from "@/components/shared/form-builder/types";
import { UserStore } from "@/stores/useUserStore";
import { useTranslation } from "react-i18next";

interface UseUpdateEducationFormStructureProps {
  store: UserStore;
}

export const useUpdateEducationFormStructure = ({
  store,
}: UseUpdateEducationFormStructureProps) => {
  const { t } = useTranslation("menu");
  const educationTitle: Field<TextFieldProps> = {
    id: "title",
    label: t("education.form.labels.title"),
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: t("education.form.placeholders.title"),
    description: t("education.form.descriptions.title"),
    error: store.educationErrors?.title?.[0],
    props: {
      value: store.updateEducationDto.title,
      onChangeText: (value) => {
        store.setNested("updateEducationDto.title", value);
        store.setNested("educationErrors.title", []);
      },
    },
  };

  const institutionName: Field<TextFieldProps> = {
    id: "institution",
    label: t("education.form.labels.institution"),
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: t("education.form.placeholders.institution"),
    description: t("education.form.descriptions.institution"),
    error: store.educationErrors?.institution?.[0],
    props: {
      value: store.updateEducationDto?.institution,
      onChangeText: (value) => {
        store.setNested("updateEducationDto.institution", value);
        store.setNested("educationErrors.institution", []);
      },
    },
  };

  const description: Field<TextareaFieldProps> = {
    id: "description",
    label: t("education.form.labels.description"),
    variant: FieldVariant.TEXTAREA,
    required: false,
    placeholder: t("education.form.placeholders.description"),
    description: t("education.form.descriptions.description"),
    error: store.educationErrors?.description?.[0],
    props: {
      value: store.updateEducationDto?.description,
      onChangeText: (value) => {
        store.setNested("updateEducationDto.description", value);
        store.setNested("educationErrors.description", []);
      },
      rows: 50,
    },
  };

  // const startDate: Field<DateFieldProps> = {
  //   id: "startDate",
  //   label: "Start Date",
  //   variant: FieldVariant.DATE,
  //   required: true,
  //   description: "The date you started this education program.",
  //   error: store.educationErrors?.startDate?.[0],
  //   props: {
  //     value: store.updateEducationDto?.startDate
  //       ? new Date(store.updateEducationDto.startDate)
  //       : undefined,
  //     onDateChange: (value) => {
  //       store.setNested(
  //         "updateEducationDto.startDate",
  //         value ? value.toISOString() : null,
  //       );
  //       store.setNested("educationErrors.startDate", []);
  //     },
  //   },
  // };

  // const endDate: Field<DateFieldProps> = {
  //   id: "endDate",
  //   label: "End Date",
  //   variant: FieldVariant.DATE,
  //   required: false,
  //   description:
  //     "The date you completed or expect to complete this program. Leave blank if currently enrolled.",
  //   error: store.educationErrors?.endDate?.[0],
  //   props: {
  //     value: store.updateEducationDto?.endDate
  //       ? new Date(store.updateEducationDto.endDate)
  //       : undefined,
  //     onDateChange: (value) => {
  //       store.setNested(
  //         "updateEducationDto.endDate",
  //         value ? value.toISOString() : null,
  //       );
  //       store.setNested("educationErrors.endDate", []);
  //     },
  //   },
  // };

  const structure: FormStructure = {
    title: t("education.form.updateTitle"),
    fieldsets: [
      {
        title: t("education.form.sectionTitle"),
        rows: [
          {
            id: 1,
            fields: [educationTitle],
          },
          {
            id: 2,
            fields: [institutionName],
          },
          {
            id: 3,
            fields: [description],
          },
          // {
          //   id: 4,
          //   fields: [startDate, endDate],
          // },
        ],
      },
    ],
  };

  return {
    structure,
  };
};
