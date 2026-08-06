import { ConversationReportStore } from "@/stores/useConversationReportStore";
import { ConversationReportReason } from "@/types";
import {
  Field,
  FieldVariant,
  FormStructure,
  SelectFieldProps,
  TextareaFieldProps,
} from "@/components/shared/form-builder/types";
import { useTranslation } from "react-i18next";

interface UseConversationReportFormStructureProps {
  store: ConversationReportStore;
}

/**
 * Maps each report reason enum value to its translation key under chat.report.reasons.
 */
const REPORT_REASON_KEYS: Record<ConversationReportReason, string> = {
  [ConversationReportReason.SPAM]: "spam",
  [ConversationReportReason.HARASSMENT]: "harassment",
  [ConversationReportReason.INAPPROPRIATE_CONTENT]: "inappropriateContent",
  [ConversationReportReason.SCAM]: "scam",
  [ConversationReportReason.OTHER]: "other",
};

/**
 * Hook providing FormBuilder configuration fields (reason and description) for conversation reports.
 */
export const useConversationReportFormStructure = ({
  store,
}: UseConversationReportFormStructureProps) => {
  const { t } = useTranslation("chat");

  const reasonField: Field<SelectFieldProps> = {
    id: "report-reason",
    label: t("chat.report.form.reason.label"),
    variant: FieldVariant.SELECT,
    required: true,
    placeholder: t("chat.report.form.reason.placeholder"),
    description: t("chat.report.form.reason.description"),
    error: t(store.errors.reason?.[0]),
    props: {
      value: store.createDto.reason,
      onSelect: (value: string) => {
        store.setNested("createDto.reason", value as ConversationReportReason);
        store.setNested("errors.reason", []);
      },
      options: Object.values(ConversationReportReason).map((reason) => ({
        label: t(`chat.report.reasons.${REPORT_REASON_KEYS[reason]}`),
        value: reason,
      })),
    },
  };

  const descriptionField: Field<TextareaFieldProps> = {
    id: "report-description",
    label: t("chat.report.form.details.label"),
    variant: FieldVariant.TEXTAREA,
    required: true,
    placeholder: t("chat.report.form.details.placeholder"),
    description: t("chat.report.form.details.description"),
    error: t(store.errors.description?.[0]),
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
        title: t("chat.report.form.sectionTitle"),
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
