import {
  DateFieldProps,
  Field,
  FieldVariant,
  FormStructure,
} from "../shared/form-builder/types";

interface useSessionStarterFormStructureProps {}

export const useSessionStarterFormStructure =
  ({}: useSessionStarterFormStructureProps) => {
    const startDateField: Field<DateFieldProps> = {
      id: "startDate",
      label: "Start Date",
      variant: FieldVariant.DATE,
      disabled: false,
      description: "Select the time when you want to start the session.",
      error: "",
      props: {
        value: new Date(),
        onDateChange: (value: Date) => {},
      },
    };

    const endDateField: Field<DateFieldProps> = {
      id: "endDate",
      label: "End Date",
      variant: FieldVariant.DATE,
      disabled: false,
      description: "Select the time when you want to end the session.",
      error: "",
      props: {
        value: new Date(),
        onDateChange: (value: Date) => {},
      },
    };

    const structure: FormStructure = {
      title: "Start a Session",
      fieldsets: [
        {
          title: "",
          rows: [
            {
              id: 1,
              fields: [startDateField],
            },
            {
              id: 2,
              fields: [endDateField],
            },
          ],
        },
      ],
    };
    return { structure };
  };
