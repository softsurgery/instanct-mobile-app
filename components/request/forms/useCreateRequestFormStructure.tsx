import {
  CustomFieldProps,
  Field,
  FieldVariant,
  FormStructure,
  TextareaFieldProps,
  TextFieldProps,
  TimeFieldProps,
} from "@/components/shared/form-builder/types";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { RequestStore } from "@/stores/useRequestStore";
import React from "react";
import { Pressable, View } from "react-native";

interface UseCreateRequestFormStructureProps {
  store: RequestStore;
}

export const useCreateNewRequestFormStructure = ({
  store,
}: UseCreateRequestFormStructureProps) => {
  const messageField: Field<TextareaFieldProps> = {
    id: "message",
    label: "Message",
    variant: FieldVariant.TEXTAREA,
    required: true,
    placeholder: "Write a message to the recipient",
    description:
      "This message will be sent to the recipient along with the request.",
    error: store.errors?.message?.[0] || "",
    props: {
      value: store.createDto?.message,
      onChangeText: (value) => {
        store.setNested("createDto.message", value);
        store.setNested("errors.message", []);
      },
      rows: 50,
    },
  };

  const choiceField: Field<CustomFieldProps> = {
    id: "choicePicker",
    label: "Location & Time",
    variant: FieldVariant.CUSTOM,
    required: true,
    placeholder: "Select a reason",
    description: "",
    error: "",
    className: "mt-4",
    props: {
      children: (
        <View className="-mt-4 pb-2 flex-row gap-2">
          <Pressable
            onPress={() => {
              store.setNested("flags.mentionTimeAndPlace", true);
              store.setNested("createDto.location", undefined);
              store.setNested("createDto.time", undefined);
            }}
            className={cn(
              "flex-1 py-3 px-4 rounded-lg items-center justify-center border-2",
              store.flags.mentionTimeAndPlace
                ? "bg-primary border-primary"
                : "bg-transparent border-border",
            )}
          >
            <Text
              className={cn(
                "font-semibold",
                store.flags.mentionTimeAndPlace
                  ? "text-primary-foreground"
                  : "text-foreground",
              )}
            >
              Let me decide
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              store.setNested("flags.mentionTimeAndPlace", false);
            }}
            className={cn(
              "flex-1 py-3 px-4 rounded-lg items-center justify-center border-2",
              !store.flags.mentionTimeAndPlace
                ? "bg-primary border-primary"
                : "bg-transparent border-border",
            )}
          >
            <Text
              className={cn(
                "font-semibold",
                !store.flags.mentionTimeAndPlace
                  ? "text-primary-foreground"
                  : "text-foreground",
              )}
            >
              Let them decide
            </Text>
          </Pressable>
        </View>
      ),
    },
  };

  const timeField: Field<TimeFieldProps> = {
    id: "time",
    label: "Time",
    variant: FieldVariant.TIME,
    required: true,
    placeholder: "Select a time",
    description: "Select a time for your request",
    hidden: !store.flags.mentionTimeAndPlace,
    error: store.errors?.time?.[0] || "",
    props: {
      value: store.createDto?.time,
      onTimeChange: (value) => {
        store.setNested("createDto.time", new Date(value));
        store.setNested("errors.time", []);
      },
    },
  };

  const locationField: Field<TextFieldProps> = {
    id: "location",
    label: "Location",
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: "Select a location",
    description: "Select a location for your request",
    hidden: !store.flags.mentionTimeAndPlace,
    error: store.errors?.location?.[0] || "",
    props: {
      value: store.createDto?.location,
      onChangeText: (value) => {
        store.setNested("createDto.location", value);
        store.setNested("errors.location", []);
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
            fields: [messageField],
          },
          {
            id: 2,
            fields: [choiceField],
          },
          {
            id: 3,
            fields: [timeField, locationField],
          },
        ],
      },
    ],
  };
  return {
    structure,
  };
};
