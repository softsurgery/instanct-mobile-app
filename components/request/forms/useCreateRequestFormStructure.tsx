import {
  CheckboxFieldProps,
  ChoicePickerFieldProps,
  Field,
  FieldVariant,
  FormStructure,
  TextareaFieldProps,
  TextFieldProps,
  TimeFieldProps,
} from "@/components/shared/form-builder/types";
import { RequestStore } from "@/stores/useRequestStore";
import React from "react";

interface UseCreateRequestFormStructureProps {
  store: RequestStore;
}

export const useCreateNewRequestFormStructure = ({
  store,
}: UseCreateRequestFormStructureProps) => {
  const [pick, setPick] = React.useState("partner_decides");

  const description: Field<TextareaFieldProps> = {
    id: "description",
    label: "Description",
    variant: FieldVariant.TEXTAREA,
    required: true,
    placeholder: "Describe your studies, achievements, or activities",
    description: "A brief description of the reason for your request.",
    error: store.createDto?.description?.[0] || "",
    props: {
      value: store.createDto?.description,
      onChangeText: (value) => {
        store.setNested("createtDto.description", value);
        store.setNested("errors.description", []);
      },
      rows: 50,
    },
  };

  const choice: Field<ChoicePickerFieldProps> = {
    id: "choicePicker",
    label: "Location & Time",
    variant: FieldVariant.CHOICEPICKER,
    required: true,
    placeholder: "Select a reason",
    description: "",
    error: "",
    className: "mt-4",
    props: {
      value: pick,
      onSelectChange: (value) => {
        setPick(value);
      },
      options: [
        {
          value: "partner_decides",
          label:
            "Laisser mon partenaire de réunion décider quand et où se rencontrer",
        },
        {
          value: "preferred_time_place",
          label: "Spécifiez une heure et un lieu préférés",
        },
      ],
    },
  };

  const time: Field<TimeFieldProps> = {
    id: "time",
    label: "Time",
    variant: FieldVariant.TIME,
    required: true,
    placeholder: "Select a time",
    description: "Select a time for your request",
    hidden: choice.props?.value !== "preferred_time_place",
    error: "",
    props: {
      value: store.createDto?.time,
      onTimeChange: (value) => {
        store.setNested("createDto.time", value);
      },
    },
  };

  const place: Field<TextFieldProps> = {
    id: "place",
    label: "Place",
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: "Select a place",
    description: "Select a place for your request",
    hidden: choice.props?.value !== "preferred_time_place",
    error: "",
    props: {
      value: store.createDto?.place,
      onChangeText: (value) => {
        store.setNested("createDto.place", value);
      },
    },
  };

  const structure: FormStructure = {
    title: "Send a Request",
    fieldsets: [
      {
        title: "Request Details",
        rows: [
          {
            id: 1,
            fields: [description],
          },

          {
            id: 3,
            fields: [choice],
          },
          {
            id: 4,
            fields: [time, place],
          },
        ],
      },
    ],
  };
  return {
    structure,
  };
};
