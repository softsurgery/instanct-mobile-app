import { ConversationReportStore } from "@/stores/useConversationReportStore";
import { ConversationReportReason } from "@/types";
import {
  Field,
  FieldVariant,
  FormStructure,
  SelectFieldProps,
  TextareaFieldProps,
} from "@/components/shared/form-builder/types";

interface UseConversationReportFormStructureProps {
  store: ConversationReportStore;
}

export const useConversationReportFormStructure = ({
  store,
}: UseConversationReportFormStructureProps) => {
  const reasonField: Field<SelectFieldProps> = {
    id: "report-reason",
    label: "Reason",
    variant: FieldVariant.SELECT,
    required: true,
    placeholder: "Select a reason",
    description: "Why are you reporting this conversation?",
    error: store.errors.reason?.[0],
    props: {
      value: store.createDto.reason,
      onSelect: (value: string) => {
        store.setNested("createDto.reason", value as ConversationReportReason);
        store.setNested("errors.reason", []);
      },
      options: Object.values(ConversationReportReason).map((reason) => ({
        label: reason,
        value: reason,
      })),
    },
  };

  const descriptionField: Field<TextareaFieldProps> = {
    id: "report-description",
    label: "Details",
    variant: FieldVariant.TEXTAREA,
    required: true,
    placeholder: "Describe what happened",
    description:
      "Provide as much detail as possible to help us review your report.",
    error: store.errors.description?.[0],
    props: {
      value: store.createDto.description,
      onChangeText: (value: string) => {
        store.setNested("createDto.description", value);
        store.setNested("errors.description", []);
      },
    },
  };

  const reportFormStructure: FormStructure = {
    title: "",
    description: "",
    isHeaderVisible: false,
    fieldsets: [
      {
        title: "Report Conversation",
        rows: [
          {
            id: 1,
            fields: [reasonField],
          },
          {
            id: 2,
            fields: [descriptionField],
          },
        ],
      },
    ],
  };

  return {
    reportFormStructure,
  };
};
