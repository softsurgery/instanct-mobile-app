import { Gender } from "@/types";
import {
  CustomFieldProps,
  DateFieldProps,
  Field,
  FieldVariant,
  FormStructure,
  PictureFieldProps,
  SelectFieldProps,
  TextareaFieldProps,
  TextFieldProps,
} from "../../shared/form-builder/types";
import { UserStore } from "@/stores/useUserStore";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";

interface useUpdateProfileFormStructureProps {
  store: UserStore;
  fallback?: string;
  uploadPicture: (options: {
    files: File[];
    onProgress: (progress: number) => void;
  }) => void;
  isProfilePictureUploadPending: boolean;
  isPending?: boolean;
}

export const useUpdateProfileFormStructure = ({
  store,
  fallback,
  uploadPicture,
  isProfilePictureUploadPending,
  isPending = false,
}: useUpdateProfileFormStructureProps) => {
  const { t } = useTranslation("settings");
  // picture
  const pictureField: Field<PictureFieldProps> = {
    id: "picture",
    label: t("settings.account.screens.profile.form.profile-picture"),
    variant: FieldVariant.PICTURE,
    description: t(
      "settings.account.screens.profile.form.descriptions.profile-picture",
    ),
    className: "h-40 w-40 rounded-full mt-2",
    wrapperClassName: "flex flex-row items-center justify-center",
    props: {
      image: store?.picture,
      alt: fallback,
      editable: !isProfilePictureUploadPending && !isPending,
      onFileChange: (value) => {
        store.set("picture", value);
      },
      onUpload: (file, onProgress) => {
        store.set("progress", 0);
        uploadPicture({
          files: [file],
          onProgress: (progress: number) => {
            store.set("progress", progress);
            onProgress(progress);
          },
        });
      },
    },
  };

  const pictureRemovalButton: Field<CustomFieldProps> = {
    id: "pictureRemoval",
    label: "",
    variant: FieldVariant.CUSTOM,
    props: {
      children: (
        <View className="flex-row items-center justify-center -mt-6">
          <Pressable
            onPress={() => {
              store.set("picture", undefined);
              store.setNested("updateDto.pictureId", null);
            }}
            className="mt-2 rounded-full border border-border px-3 py-2 active:bg-muted"
          >
            <Text className="text-sm font-bold">
              {t("settings.account.screens.profile.actions.remove-picture")}
            </Text>
          </Pressable>
        </View>
      ),
    },
  };

  //name
  const firstNameField: Field<TextFieldProps> = {
    id: "firstName",
    label: t("settings.account.screens.profile.form.first-name"),
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: t("settings.account.screens.profile.form.placeholders.first-name"),
    description: t("settings.account.screens.profile.form.descriptions.first-name"),
    error: store?.errors?.firstName?.[0],
    props: {
      editable: !isPending,
      value: store?.updateDto?.firstName,
      onChangeText: (value: string) => {
        store.setNested("updateDto.firstName", value);
        store.setNested("errors.firstName", []);
      },
    },
  };

  //surname
  const lastNameField: Field<TextFieldProps> = {
    id: "lastName",
    label: t("settings.account.screens.profile.form.last-name"),
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: t("settings.account.screens.profile.form.placeholders.last-name"),
    description: t("settings.account.screens.profile.form.descriptions.last-name"),
    error: store?.errors?.lastName?.[0],
    props: {
      editable: !isPending,
      value: store?.updateDto?.lastName,
      onChangeText: (value: string) => {
        store.setNested("updateDto.lastName", value);
        store.setNested("errors.lastName", []);
      },
    },
  };

  // date of birth
  const dateOfBirthField: Field<DateFieldProps> = {
    id: "dateOfBirth",
    label: t("settings.account.screens.profile.form.date-of-birth"),
    variant: FieldVariant.DATE,
    description: t("settings.account.screens.profile.form.descriptions.date-of-birth"),
    error: store?.errors?.dateOfBirth?.[0],
    props: {
      editable: !isPending,
      value: store?.updateDto?.dateOfBirth,
      onDateChange: (value: Date) => {
        store.setNested("updateDto.dateOfBirth", value);
        store.setNested("errors.dateOfBirth", []);
      },
    },
  };

  //bio
  const bioField: Field<TextareaFieldProps> = {
    id: "bio",
    label: t("settings.account.screens.profile.form.bio"),
    variant: FieldVariant.TEXTAREA,
    placeholder: t("settings.account.screens.profile.form.placeholders.bio"),
    description: t("settings.account.screens.profile.form.descriptions.bio"),
    error: store?.errors?.bio?.[0],
    props: {
      editable: !isPending,
      value: store?.updateDto?.bio,
      onChangeText: (value: string) => {
        store.setNested("updateDto.bio", value);
        store.setNested("errors.bio", []);
      },
    },
  };

  //gender
  const genderField: Field<SelectFieldProps> = {
    id: "gender",
    label: t("settings.account.screens.profile.form.gender"),
    variant: FieldVariant.SELECT,
    description: t("settings.account.screens.profile.form.descriptions.gender"),
    error: store?.errors?.gender?.[0],
    props: {
      editable: !isPending,
      value: store?.updateDto?.gender?.toString(),
      onSelect: (value: string) => {
        store.setNested("updateDto.gender", value);
        store.setNested("errors.gender", []);
      },
      options: Object.entries(Gender).map(([value, label]) => ({
        label: label as string,
        value,
      })),
    },
  };

  //website
  const websiteField: Field<TextFieldProps> = {
    id: "website",
    label: t("settings.account.screens.profile.form.website"),
    variant: FieldVariant.TEXT,
    required: false,
    placeholder: t("settings.account.screens.profile.form.placeholders.website"),
    description: t("settings.account.screens.profile.form.descriptions.website"),
    error: store?.errors?.website?.[0],
    props: {
      value: store?.updateDto?.website,
      onChangeText: (value: string) => {
        store.setNested("updateDto.website", value);
        store.setNested("errors.website", []);
      },
    },
  };

  //linkedin
  const linkedinField: Field<TextFieldProps> = {
    id: "linkedin",
    label: t("settings.account.screens.profile.form.linkedin"),
    variant: FieldVariant.TEXT,
    required: false,
    placeholder: t("settings.account.screens.profile.form.placeholders.linkedin"),
    description: t("settings.account.screens.profile.form.descriptions.linkedin"),
    error: store?.errors?.linkedin?.[0],
    props: {
      value: store?.updateDto?.linkedin,
      onChangeText: (value: string) => {
        store.setNested("updateDto.linkedin", value);
        store.setNested("errors.linkedin", []);
      },
    },
  };

  const structure: FormStructure = {
    title: t("settings.account.screens.profile.title"),
    fieldsets: [
      {
        title: t("settings.account.screens.profile.form.personal-information"),
        rows: [
          {
            id: 1,
            fields: [pictureField, pictureRemovalButton],
          },
          {
            id: 2,
            fields: [firstNameField, lastNameField],
          },
          {
            id: 3,
            fields: [dateOfBirthField],
          },
          {
            id: 4,
            fields: [bioField],
          },
          {
            id: 5,
            fields: [genderField],
          },
          {
            id: 6,
            fields: [websiteField],
          },
          {
            id: 7,
            fields: [linkedinField],
          },
        ],
      },
    ],
  };
  return { structure };
};
