import {
  Field,
  FieldVariant,
  MultiSelectFieldProps,
  SelectOption,
} from "@/components/shared/form-builder/types";
import { ExploreFilterStore } from "@/stores/userExploreFilterStore";

interface UseExploreFilterFormStructureProps {
  store: ExploreFilterStore;
  objectives?: SelectOption[];
  industries?: SelectOption[];
  isPending?: boolean;
}

export const useExploreFilterFormStructure = ({
  store,
  objectives,
  industries,
  isPending,
}: UseExploreFilterFormStructureProps) => {
  const objectivesField: Field<MultiSelectFieldProps> = {
    id: "objectives",
    label: "Objectives",
    variant: FieldVariant.MULTISELECT,
    required: false,
    placeholder: "Select objectives",
    description: "Select the objectives you're looking for.",
    disabled: isPending,
    props: {
      value: store.dto.objectives.map(String),
      onSelect: (value) => store.setNested("dto.objectives", value.map(Number)),
      options: objectives,
    },
  };

  const industryField: Field<MultiSelectFieldProps> = {
    id: "industry",
    label: "Industry",
    variant: FieldVariant.MULTISELECT,
    required: false,
    placeholder: "Select industries",
    description: "Select the industries you're interested in.",
    disabled: isPending,
    props: {
      value: store.dto.industry.map(String),
      onSelect: (value) => store.setNested("dto.industry", value.map(Number)),
      options: industries,
    },
  };

  return {
    title: "Explore Filters",
    fieldsets: [
      {
        rows: [
          {
            id: 1,
            fields: [objectivesField, industryField],
          },
        ],
      },
    ],
  };
};
