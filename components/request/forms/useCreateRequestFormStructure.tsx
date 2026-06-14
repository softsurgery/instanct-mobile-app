import {
  CustomFieldProps,
  Field,
  FieldVariant,
  FormStructure,
  MapPinFieldProps,
  TextareaFieldProps,
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
    placeholder: "Écrivez un message au destinataire",
    description:
      "Ce message sera envoyé au destinataire avec votre demande.",
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
    label: "Lieu et horaire",
    variant: FieldVariant.CUSTOM,
    required: true,
    placeholder: "Choisir une option",
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
              store.setNested("createDto.latitude", undefined);
              store.setNested("createDto.longitude", undefined);
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
              Je choisis
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
              Laisser décider
            </Text>
          </Pressable>
        </View>
      ),
    },
  };

  const timeField: Field<TimeFieldProps> = {
    id: "time",
    label: "Heure",
    variant: FieldVariant.TIME,
    required: true,
    placeholder: "Sélectionner une heure",
    description: "Choisissez l'heure de la réunion",
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

  const locationField: Field<MapPinFieldProps> = {
    id: "location",
    label: "Lieu",
    variant: FieldVariant.MAPPIN,
    required: true,
    placeholder: "Sélectionner un lieu sur la carte",
    description: "Indiquez où se déroulera la réunion",
    hidden: !store.flags.mentionTimeAndPlace,
    error: store.errors?.location?.[0] || "",
    props: {
      longitude: store.createDto.longitude ?? store.flags.location.longitude,
      latitude: store.createDto.latitude ?? store.flags.location.latitude,
      locationName: store.createDto?.location,
      editable: true,
      onLocationChange: (value) => {
        store.setNested("flags.location", {
          latitude: value.latitude,
          longitude: value.longitude,
        });
        store.setNested("createDto.latitude", value.latitude);
        store.setNested("createDto.longitude", value.longitude);
        store.setNested("createDto.location", value.name);
        store.setNested("errors.location", []);
      },
    },
  };

  const structure: FormStructure = {
    title: "Envoyer une demande",
    fieldsets: [
      {
        title: "Détails de la demande",
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
