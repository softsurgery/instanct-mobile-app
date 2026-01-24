import { Gender } from "@/types";
import {
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

interface useUpdateProfileFormStructureProps {
  store: UserStore;
}

export const useUpdateProfileFormStructure = ({
  store,
}: useUpdateProfileFormStructureProps) => {
  // picture
  const pictureField: Field<PictureFieldProps> = {
    id: "picture",
    label: "Profile Picture",
    variant: FieldVariant.PICTURE,
    description: "Upload a profile picture to personalize your account.",
    className: "h-40 w-40 rounded-full mt-2",
    wrapperClassName: "flex flex-row items-center justify-center",
    props: {
      image: store?.picture,
      alt: "?",
      editable: false,
      onFileChange: (value) => {
        store.set("picture", value);
      },
      onUpload: (file, onProgress) => {
        store.set("progress", 0);
        // uploadPicture({
        //   files: [file],
        //   onProgress: (progress: number) => {
        //     store.set("progress", progress);
        //     onProgress(progress);
        //   },
        // });
      },
    },
  };

  //name
  const firstNameField: Field<TextFieldProps> = {
    id: "firstName",
    label: "First Name",
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: "Enter your first name",
    disabled: false,
    description: "Your first name (e.g., John).",
    error: store?.errors?.firstName?.[0],
    props: {
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
    label: "Last Name",
    variant: FieldVariant.TEXT,
    required: true,
    placeholder: "Enter your last name",
    disabled: false,
    description: "Your last name (e.g., Doe).",
    error: store?.errors?.lastName?.[0],
    props: {
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
    label: "Date of Birth",
    variant: FieldVariant.DATE,
    disabled: false,
    description: "Let us know when you celebrate!",
    error: store?.errors?.dateOfBirth?.[0],
    props: {
      value: store?.updateDto?.dateOfBirth || undefined,
      onDateChange: (value: Date) => {
        store.setNested("updateDto.dateOfBirth", value);
        store.setNested("errors.dateOfBirth", []);
      },
    },
  };

  //bio
  const bioField: Field<TextareaFieldProps> = {
    id: "bio",
    label: "Bio",
    variant: FieldVariant.TEXTAREA,
    placeholder: "Write a short bio...",
    disabled: false,
    description: "Tell us a little bit about yourself.",
    error: store?.errors?.bio?.[0],
    props: {
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
    label: "Gender",
    variant: FieldVariant.SELECT,
    disabled: false,
    description: "Specifying your gender helps us personalize your experience.",
    error: store?.errors?.gender?.[0],
    props: {
      value: store?.updateDto?.gender?.toString(),
      onSelect: (value: string) => {
        store.setNested("updateDt.gender", value);
        store.setNested("errors.gender", []);
      },
      options: Object.entries(Gender).map(([value, label]) => ({
        label: label as string,
        value,
      })),
    },
  };

  const structure: FormStructure = {
    title: "Update Profile",
    fieldsets: [
      {
        title: "Personal Information",
        isHeaderVisible: true,
        rows: [
          {
            id: 1,
            fields: [pictureField],
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
        ],
      },
    ],
  };
  return { structure };
};
