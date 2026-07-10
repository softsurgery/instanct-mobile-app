import { SegmentedToggle } from "@/components/shared/SegmentedToggle";
import {
  CustomFieldProps,
  Field,
  FieldVariant,
  FormStructure,
  MapPinFieldProps,
  TextareaFieldProps,
  TimeFieldProps,
} from "@/components/shared/form-builder/types";

import { RequestStore } from "@/stores/useRequestStore";
import { useTranslation } from "react-i18next";

interface UseCreateRequestFormStructureProps {
  store: RequestStore;
  isPending?: boolean;
}

export const useCreateNewRequestFormStructure = ({
  store,
  isPending,
}: UseCreateRequestFormStructureProps) => {
  const { t } = useTranslation("explore");
  const messageField: Field<TextareaFieldProps> = {
    id: "message",
    label: t("request.newRequest.labels.message"),
    variant: FieldVariant.TEXTAREA,
    required: true,
    placeholder: t("request.newRequest.placeholders.message"),
    description: t("request.newRequest.descriptions.message"),
    error: store.errors?.message?.[0] || "",
    props: {
      editable: !isPending,
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
    label: t("request.newRequest.labels.choice"),
    variant: FieldVariant.CUSTOM,
    required: true,
    placeholder: t("request.newRequest.placeholders.choice"),
    className: "mt-4",
    props: {
      children: (
        <SegmentedToggle
          disabled={isPending}
          value={store.flags.mentionTimeAndPlace ? "choose" : "let-decide"}
          onChange={(next) => {
            if (next === "choose") {
              store.setNested("flags.mentionTimeAndPlace", true);
            } else {
              store.setNested("flags.mentionTimeAndPlace", false);
              store.setNested("createDto.time", undefined);
              store.setNested("createDto.location", undefined);
              store.setNested("createDto.latitude", undefined);
              store.setNested("createDto.longitude", undefined);
            }
          }}
          options={[
            { label: t("request.newRequest.options.choose"), value: "choose" },
            {
              label: t("request.newRequest.options.letDecide"),
              value: "let-decide",
            },
          ]}
        />
      ),
    },
  };

  const timeField: Field<TimeFieldProps> = {
    id: "time",
    label: t("request.newRequest.labels.time"),
    variant: FieldVariant.TIME,
    required: true,
    placeholder: t("request.newRequest.placeholders.time"),
    description: t("request.newRequest.descriptions.time"),
    hidden: !store.flags.mentionTimeAndPlace,
    error: store.errors?.time?.[0] || "",
    props: {
      editable: !isPending,
      value: store.createDto?.time,
      onTimeChange: (value) => {
        store.setNested("createDto.time", new Date(value));
        store.setNested("errors.time", []);
      },
    },
  };

  const locationField: Field<MapPinFieldProps> = {
    id: "location",
    label: t("request.newRequest.labels.location"),
    variant: FieldVariant.MAPPIN,
    required: true,
    placeholder: t("request.newRequest.placeholders.location"),
    description: t("request.newRequest.descriptions.location"),
    hidden: !store.flags.mentionTimeAndPlace,
    error: store.errors?.location?.[0] || "",
    props: {
      editable: !isPending,
      changedOnFocus: true,
      longitude: store.createDto.longitude ?? store.flags.location.longitude,
      latitude: store.createDto.latitude ?? store.flags.location.latitude,
      locationName: store.createDto?.location,
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
    title: t("request.newRequest.formTitle"),
    fieldsets: [
      {
        title: t("request.newRequest.sectionTitle"),
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
