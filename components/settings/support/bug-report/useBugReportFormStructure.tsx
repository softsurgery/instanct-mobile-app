import { ReportBugStore } from "@/stores/useReportBugStore";
import { BugVariant } from "@/types";
import {
  Field,
  FieldVariant,
  FormStructure,
  SelectFieldProps,
  TextareaFieldProps,
  TextFieldProps,
} from "@/components/shared/form-builder/types";

interface useBugReportFormStructureProps {
  store: ReportBugStore;
}

export const useBugReportFormStructure = ({
  store,
}: useBugReportFormStructureProps) => {
  //title
  const titleField: Field<TextFieldProps> = {
    id: "bug-title",
    label: "Bug Title",
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: "Brief summary of the issue",
    description: "Please provide a brief summary of the issue",
    error: store.errors.title?.[0],
    props: {
      value: store.createDto.title,
      onChangeText: (value: string) => {
        store.setNested("createDto.title", value);
        store.setNested("errors.title", []);
      },
    },
  };

  // description
  const descriptionField: Field<TextareaFieldProps> = {
    id: "bug-description",
    label: "Description",
    variant: FieldVariant.TEXTAREA,
    required: true,
    placeholder: "Detailed description of the bug",
    description: "Please provide a detailed description of the bug",
    error: store.errors.description?.[0],
    props: {
      value: store.createDto.description,
      onChangeText: (value: string) => {
        store.setNested("createDto.description", value);
        store.setNested("errors.description", []);
      },
    },
  };

  // category
  const categoryField: Field<SelectFieldProps> = {
    id: "bug-category",
    label: "Category",
    variant: FieldVariant.SELECT,
    required: true,
    placeholder: "Select Bug Category",
    description: "Select the Bug Category you think you're looking for",
    error: store.errors.variant?.[0],
    props: {
      value: store.createDto.variant,
      onSelect: (value: string) => {
        store.setNested("createDto.variant", value as BugVariant);
        store.setNested("errors.variant", []);
      },
      options: Object.values(BugVariant).map((bug) => ({
        label: bug,
        value: bug,
      })),
    },
  };

  const bugFormStructure: FormStructure = {
    title: "",
    description: "",
    orientation: "vertical",
    isHeaderVisible: false,
    fieldsets: [
      {
        title: "Bug Report Form",
        rows: [
          {
            id: 1,
            fields: [titleField, descriptionField],
          },
          {
            id: 2,
            fields: [categoryField],
          },
        ],
      },
    ],
  };

  return {
    bugFormStructure,
  };
};
