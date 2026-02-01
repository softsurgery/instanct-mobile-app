import {
  DateFieldProps,
  Field,
  FieldVariant,
  FormStructure,
  TextareaFieldProps,
  TextFieldProps,
} from "@/components/shared/form-builder/types";
import { UserStore } from "@/stores/useUserStore";

interface UseCreateEducationFormStructureProps {
  store: UserStore;
}

export const useCreateEducationFormStructure = ({
  store,
}: UseCreateEducationFormStructureProps) => {
  const educationTitle: Field<TextFieldProps> = {
    id: "title",
    label: "Degree/Field of Study",
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: "Enter your degree or field of study",
    description:
      "The degree or field of study (e.g., Bachelor of Science in Computer Science).",
    error: store.educationErrors?.title?.[0],
    props: {
      value: store.createEducationDto?.title,
      onChangeText: (value) => {
        store.setNested("createEducationDto.title", value);
        store.setNested("educationErrors.title", []);
      },
    },
  };

  const institutionName: Field<TextFieldProps> = {
    id: "institution",
    label: "Institution Name",
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: "Enter the institution name",
    description: "The name of the school, college, or university you attended.",
    error: store.educationErrors?.institution?.[0],
    props: {
      value: store.createEducationDto?.institution,
      onChangeText: (value) => {
        store.setNested("createEducationDto.institution", value);
        store.setNested("educationErrors.institution", []);
      },
    },
  };

  const description: Field<TextareaFieldProps> = {
    id: "description",
    label: "Description",
    variant: FieldVariant.TEXTAREA,
    required: false,
    placeholder: "Describe your studies, achievements, or activities",
    description:
      "A brief description of your studies, achievements, relevant coursework, or extracurricular activities.",
    error: store.educationErrors?.description?.[0],
    props: {
      value: store.createEducationDto?.description,
      onChangeText: (value) => {
        store.setNested("createEducationDto.description", value);
        store.setNested("educationErrors.description", []);
      },
      rows: 50,
    },
  };

  const startDate: Field<DateFieldProps> = {
    id: "startDate",
    label: "Start Date",
    variant: FieldVariant.DATE,
    required: true,
    description: "The date you started this education program.",
    error: store.educationErrors?.startDate?.[0],
    props: {
      value: store.createEducationDto?.startDate
        ? new Date(store.createEducationDto.startDate)
        : undefined,
      onDateChange: (value) => {
        store.setNested(
          "createEducationDto.startDate",
          value ? value.toISOString() : null,
        );
        store.setNested("educationErrors.startDate", []);
      },
    },
  };

  const endDate: Field<DateFieldProps> = {
    id: "endDate",
    label: "End Date",
    variant: FieldVariant.DATE,
    required: false,
    description:
      "The date you completed or expect to complete this program. Leave blank if currently enrolled.",
    error: store.educationErrors?.endDate?.[0],
    props: {
      value: store.createEducationDto?.endDate
        ? new Date(store.createEducationDto.endDate)
        : undefined,
      onDateChange: (value) => {
        store.setNested(
          "createEducationDto.endDate",
          value ? value.toISOString() : null,
        );
        store.setNested("educationErrors.endDate", []);
      },
    },
  };

  const structure: FormStructure = {
    title: "Create Education",
    fieldsets: [
      {
        title: "Education Details",
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
          {
            id: 4,
            fields: [startDate, endDate],
          },
        ],
      },
    ],
  };

  return {
    structure,
  };
};
