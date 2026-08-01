import {
  Field,
  FieldVariant,
  MultiSelectFieldProps,
  SelectOption,
} from "@/components/shared/form-builder/types";
import { ExploreFilterStore } from "@/stores/userExploreFilterStore";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("explore");
  const objectivesField: Field<MultiSelectFieldProps> = {
    id: "objectives",
    label: t("explore.objectives"),
    variant: FieldVariant.MULTISELECT,
    required: false,
    placeholder: t("explore.filter.placeholders.objectives"),
    description: t("explore.filter.descriptions.objectives"),
    props: {
      editable: !isPending,
      value: store.dto.objectives.map(String),
      onSelect: (value) => store.setNested("dto.objectives", value.map(Number)),
      options: objectives,
    },
  };

  const industryField: Field<MultiSelectFieldProps> = {
    id: "industry",
    label: t("explore.industries"),
    variant: FieldVariant.MULTISELECT,
    required: false,
    placeholder: t("explore.filter.placeholders.industries"),
    description: t("explore.filter.descriptions.industries"),
    props: {
      editable: !isPending,
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
