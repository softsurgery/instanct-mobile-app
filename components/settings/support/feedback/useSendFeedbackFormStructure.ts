import { SendFeedbackStore } from "@/stores/useFeedbackManager";
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
  //message
  const messageField: Field<TextareaFieldProps> = {
    id: "feedback-message",
    label: "Feedback Message",
    variant: FieldVariant.TEXTAREA,
    required: true,
    placeholder: "Share your feedback here...",
    description: "Share your feedback here",
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
    label: "Category",
    variant: FieldVariant.SELECT,
    required: true,
    placeholder: "Select Feedback Category",
    description: "Select the Feedback Category you think you're looking for",
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
    label: "Rating",
    variant: FieldVariant.RATING,
    required: true,
    placeholder: "Rate your experience",
    description: "Rate your experience",
    error: store.errors.rating?.[0],
    props: {
      color: "#b91c1c",
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
    orientation: "vertical",
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
