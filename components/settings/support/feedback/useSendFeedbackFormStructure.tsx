import { useColorPalette } from "@/hooks/useColorPalette";
import { hslToHex } from "@/lib/theme";
import { SendFeedbackStore } from "@/stores/useFeedbackManager";
import { useTranslation } from "react-i18next";
import {
  Field,
  FieldVariant,
  FormStructure,
  RatingFieldProps,
  SelectFieldProps,
  TextareaFieldProps,
} from "~/components/shared/form-builder/types";
import { FeedbackCategory } from "~/types";

interface useSendFeedbackFormStructureProps {
  store: SendFeedbackStore;
}

export const useSendFeedbackFormStructure = ({
  store,
}: useSendFeedbackFormStructureProps) => {
  const { palette } = useColorPalette();
  const { t } = useTranslation("settings");
  //message
  const messageField: Field<TextareaFieldProps> = {
    id: "feedback-message",
    label: t("settings.support.screens.send-feedback.forms.message"),
    variant: FieldVariant.TEXTAREA,
    required: true,
    placeholder: t("settings.support.screens.send-feedback.forms.placeholders.message"),
    description: t("settings.support.screens.send-feedback.forms.descriptions.message"),
    error: store.errors.message?.[0],
    props: {
      value: store.createDto.message,
      onChangeText: (value: string) => {
        store.setNested("createDto.message", value);
        store.setNested("errors.message", []);
      },
    },
  };

  //category
  const categoryField: Field<SelectFieldProps> = {
    id: "feedback-category",
    label: t("settings.support.screens.send-feedback.forms.category"),
    variant: FieldVariant.SELECT,
    required: true,
    placeholder: t("settings.support.screens.send-feedback.forms.placeholders.category"),
    description: t("settings.support.screens.send-feedback.forms.descriptions.category"),
    error: store.errors.category?.[0],
    props: {
      value: store.createDto.category,
      onSelect: (value: string) => {
        store.setNested("createDto.category", value as FeedbackCategory);
        store.setNested("errors.category", []);
      },
      options: Object.values(FeedbackCategory).map((feedback) => ({
        label: feedback,
        value: feedback,
      })),
    },
  };

  //rating
  const ratingField: Field<RatingFieldProps> = {
    id: "feedback-rating",
    label: t("settings.support.screens.send-feedback.forms.rating"),
    variant: FieldVariant.RATING,
    required: true,
    placeholder: t("settings.support.screens.send-feedback.forms.placeholders.rating"),
    description: t("settings.support.screens.send-feedback.forms.descriptions.rating"),
    error: store.errors.rating?.[0],
    props: {
      color: hslToHex(palette.primary),
      starSize: 48,
      value: store.createDto.rating,
      onValueChange: (value: number) => {
        store.setNested("createDto.rating", value);
        store.setNested("errors.rating", []);
      },
    },
  };

  const feedbackFormStructure: FormStructure = {
    title: "",
    description: "",
    isHeaderVisible: false,
    fieldsets: [
      {
        title: "Send Feedback Form",
        rows: [
          {
            id: 1,
            fields: [messageField, categoryField],
          },
          {
            id: 2,
            fields: [ratingField],
          },
        ],
      },
    ],
  };

  return {
    feedbackFormStructure,
  };
};
