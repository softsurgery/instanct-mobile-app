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
import { useTranslation } from "react-i18next";

interface useBugReportFormStructureProps {
  store: ReportBugStore;
}

export const useBugReportFormStructure = ({
  store,
}: useBugReportFormStructureProps) => {
  const { t } = useTranslation("settings");
  //title
  const titleField: Field<TextFieldProps> = {
    id: "bug-title",
    label: t("settings.support.screens.report-bug.forms.bug-title"),
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: t("settings.support.screens.report-bug.forms.placeholders.bug-title"),
    description: t("settings.support.screens.report-bug.forms.descriptions.bug-title"),
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
    label: t("settings.support.screens.report-bug.forms.bug-description"),
    variant: FieldVariant.TEXTAREA,
    required: true,
    placeholder: t("settings.support.screens.report-bug.forms.placeholders.bug-description"),
    description: t("settings.support.screens.report-bug.forms.descriptions.bug-description"),
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
    label: t("settings.support.screens.report-bug.forms.bug-category"),
    variant: FieldVariant.SELECT,
    required: true,
    placeholder: t("settings.support.screens.report-bug.forms.placeholders.bug-category"),
    description: t("settings.support.screens.report-bug.forms.descriptions.bug-category"),
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
    isHeaderVisible: false,
    fieldsets: [
      {
        title: "Bug Report Form",
        rows: [
          {
            id: 1,
            fields: [titleField],
          },
          {
            id: 2,
            fields: [descriptionField],
          },
          {
            id: 3,
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
