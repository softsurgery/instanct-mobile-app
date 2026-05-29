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

interface UseCreateExperienceFormStructureProps {
  store: UserStore;
}

export const useCreateExperienceFormStructure = ({
  store,
}: UseCreateExperienceFormStructureProps) => {
  const experienceTitle: Field<TextFieldProps> = {
    id: "title",
    label: "Job Title",
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: "Enter your job title",
    description: "The title of your position (e.g., Software Engineer).",
    error: store.experienceErrors?.title?.[0],
    props: {
      value: store.createExperienceDto?.title,
      onChangeText: (value) => {
        store.setNested("createExperienceDto.title", value);
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
      value: store.createExperienceDto?.company,
      onChangeText: (value) => {
        store.setNested("createExperienceDto.company", value);
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
      value: store.createExperienceDto?.description,
      onChangeText: (value) => {
        store.setNested("createExperienceDto.description", value);
        store.setNested("experienceErrors.description", []);
      },
      rows: 50,
    },
  };

  const location: Field<TextFieldProps> = {
    id: "location",
    label: "Location",
    variant: FieldVariant.TEXT,
    required: false,
    placeholder: "Enter the location of your job",
    description: "The location where you worked (e.g., New York).",
    hidden: store.createExperienceDto?.locationType === LocationTypes.REMOTE,
    error: store.experienceErrors?.location?.[0],
    props: {
      value: store.createExperienceDto?.location,
      onChangeText: (value) => {
        store.setNested("createExperienceDto.location", value);
        store.setNested("experienceErrors.location", []);
      },
    },
  };

  const workType: Field<SelectFieldProps> = {
    id: "workType",
    label: "Work Type",
    variant: FieldVariant.SELECT,
    required: true,
    description: "The type of work arrangement for this position.",
    error: store.experienceErrors?.workType?.[0],
    props: {
      value: store.createExperienceDto?.workType || undefined,
      onSelect: (value) => {
        store.setNested("createExperienceDto.workType", value);
        store.setNested("experienceErrors.workType", []);
      },
      options: Object.values(WorkTypes).map((type) => ({
        label: type,
        value: type,
      })),
    },
  };

  const locationType: Field<SelectFieldProps> = {
    id: "locationType",
    label: "Location Type",
    variant: FieldVariant.SELECT,
    required: false,
    description: "The location type for this position (e.g., Remote).",
    error: store.experienceErrors?.locationType?.[0],
    props: {
      value: store.createExperienceDto?.locationType || undefined,
      onSelect: (value) => {
        store.setNested("createExperienceDto.locationType", value);
        store.setNested("experienceErrors.locationType", []);
      },
      options: Object.values(LocationTypes).map((type) => ({
        label: type,
        value: type,
      })),
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
      value: store.createExperienceDto?.startDate
        ? new Date(store.createExperienceDto.startDate)
        : undefined,
      onDateChange: (value) => {
        store.setNested(
          "createExperienceDto.startDate",
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
    description:
      "Currently work here? If checked, the end date will be set to 'Present'",
    props: {
      checked: store.present,
      onCheckedChange: (value) => {
        store.set("present", value);
        store.setNested("createExperienceDto.endDate", null);
        store.setNested("experienceErrors.endDate", []);
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
    hidden: store.present,
    props: {
      value: store.createExperienceDto?.endDate
        ? new Date(store.createExperienceDto.endDate)
        : undefined,
      onDateChange: (value) => {
        store.setNested(
          "createExperienceDto.endDate",
          value ? value.toISOString() : null,
        );
        store.setNested("experienceErrors.endDate", []);
      },
    },
  };

  const structure: FormStructure = {
    title: "Create Experience",
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
            fields: [workType],
          },
          {
            id: 5,
            fields: [locationType, location],
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
