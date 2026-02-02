import {
  DateFieldProps,
  Field,
  FieldVariant,
  FormStructure,
  TextareaFieldProps,
  TextFieldProps,
} from "@/components/shared/form-builder/types";
import { UserStore } from "@/stores/useUserStore";

interface UseUpdateExperienceFormStructureProps {
  store: UserStore;
}

export const useUpdateExperienceFormStructure = ({
  store,
}: UseUpdateExperienceFormStructureProps) => {
  const experienceTitle: Field<TextFieldProps> = {
    id: "title",
    label: "Job Title",
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: "Enter your job title",
    description: "The title of your position (e.g., Software Engineer).",
    error: store.experienceErrors?.title?.[0],
    props: {
      value: store.updateExperienceDto.title,
      onChangeText: (value) => {
        console.log("Updating title to:", value);
        store.setNested("updateExperienceDto.title", value);
        store.setNested("experienceErrors.title", []);
      },
    },
  };

  const companyName: Field<TextFieldProps> = {
    id: "company",
    label: "Company Name",
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: "Enter the company name",
    description: "The name of the company you worked for.",
    error: store.experienceErrors?.company?.[0],
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
    label: "Description",
    variant: FieldVariant.TEXTAREA,
    required: false,
    placeholder: "Describe your role and responsibilities",
    description:
      "A brief description of your role, responsibilities, and achievements.",
    error: store.experienceErrors?.description?.[0],
    props: {
      value: store.updateExperienceDto?.description,
      onChangeText: (value) => {
        store.setNested("updateExperienceDto.description", value);
        store.setNested("experienceErrors.description", []);
      },
      rows: 50,
    },
  };

  const startDate: Field<DateFieldProps> = {
    id: "startDate",
    label: "Start Date",
    variant: FieldVariant.DATE,
    required: true,
    description: "The date you started this position.",
    error: store.experienceErrors?.startDate?.[0],
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

  const endDate: Field<DateFieldProps> = {
    id: "endDate",
    label: "End Date",
    variant: FieldVariant.DATE,
    required: false,
    description:
      "The date you ended this position. Leave blank if it's your current role.",
    error: store.experienceErrors?.endDate?.[0],
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
    title: "Update Experience",
    fieldsets: [
      {
        title: "Experience Details",
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
