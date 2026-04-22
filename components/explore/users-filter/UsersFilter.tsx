import React from "react";
import { View, ScrollView } from "react-native";
import { Text } from "~/components/ui/text";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { cn } from "~/lib/utils";
import { Button } from "../../ui/button";
import { Badge } from "~/components/ui/badge";
import { useObjectives } from "~/hooks/content/reference-types/useObjectives";
import { useIndustries } from "~/hooks/content/reference-types/useIndustries";
import { MultiSelectDialog } from "../../shared/MultiSelectDialog";
import { ChevronRight } from "lucide-react-native";

interface UsersFilterProps {
  className?: string;
  onApplyPress?: () => void;
}

export const UsersFilter = ({ className, onApplyPress }: UsersFilterProps) => {
  // Hooks
  const { objectives } = useObjectives();
  const { industries } = useIndustries();

  const [selectedObjectives, setSelectedObjectives] = React.useState<number[]>(
    [],
  );
  const [selectedIndustries, setSelectedIndustries] = React.useState<number[]>(
    [],
  );
  // Dialog states
  const [showObjectivesDialog, setShowObjectivesDialog] = React.useState(false);
  const [showIndustriesDialog, setShowIndustriesDialog] = React.useState(false);

  // Computed values

  const hasActiveFilters = React.useMemo(() => {
    return selectedObjectives.length > 0 || selectedIndustries.length > 0;
  }, [selectedObjectives, selectedIndustries]);

  const accordionTriggerClassName = "flex flex-row items-center";

  const resetAllFilters = () => {
    setSelectedObjectives([]);
    setSelectedIndustries([]);
  };

  const filterContent = (
    <React.Fragment>
      <View>
        <View className="flex-row items-center justify-between">
          <Text variant={"large"}>User Filters</Text>
          {hasActiveFilters && (
            <Badge variant="secondary">
              <Text className="text-xs">Active</Text>
            </Badge>
          )}
        </View>
        <Text variant={"muted"} className="text-xs mt-1">
          Apply filters to find users that match your criteria.
        </Text>
      </View>

      <ScrollView className="flex-grow-0" showsVerticalScrollIndicator={false}>
        <View>
          <Accordion type="single" collapsible>
            {/* Objectives */}
            <AccordionItem value="objectives">
              <AccordionTrigger className={accordionTriggerClassName}>
                <View className="w-[90%] flex-row items-center justify-between">
                  <View>
                    <Text className="font-semibold">Objectives</Text>
                    <Text className="text-muted-foreground text-xs">
                      Filter by user objectives and interests.
                    </Text>
                  </View>
                  {selectedObjectives.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      <Text className="text-xs">
                        {selectedObjectives.length}
                      </Text>
                    </Badge>
                  )}
                </View>
              </AccordionTrigger>
              <AccordionContent>
                <Button
                  variant="outline"
                  onPress={() => setShowObjectivesDialog(true)}
                  className="w-full flex-row items-center justify-between"
                >
                  <Text className="text-sm">
                    {selectedObjectives.length > 0
                      ? `${selectedObjectives.length} objective${selectedObjectives.length > 1 ? "s" : ""} selected`
                      : "Select objectives"}
                  </Text>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </Button>
                {selectedObjectives.length > 0 && (
                  <View className="flex-row flex-wrap gap-1 mt-2">
                    {selectedObjectives.slice(0, 3).map((id) => {
                      const objective = objectives.find((o) => o.id === id);
                      return objective ? (
                        <Badge key={id} variant="secondary">
                          <Text className="text-xs">{objective.label}</Text>
                        </Badge>
                      ) : null;
                    })}
                    {selectedObjectives.length > 3 && (
                      <Badge variant="secondary">
                        <Text className="text-xs">
                          +{selectedObjectives.length - 3} more
                        </Text>
                      </Badge>
                    )}
                  </View>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Industries */}
            <AccordionItem value="industries">
              <AccordionTrigger className={accordionTriggerClassName}>
                <View className="w-[90%] flex-row items-center justify-between">
                  <View>
                    <Text className="font-semibold">Industries</Text>
                    <Text className="text-muted-foreground text-xs">
                      Filter by industry experience or interest.
                    </Text>
                  </View>
                  {selectedIndustries.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      <Text className="text-xs">
                        {selectedIndustries.length}
                      </Text>
                    </Badge>
                  )}
                </View>
              </AccordionTrigger>
              <AccordionContent>
                <Button
                  variant="outline"
                  onPress={() => setShowIndustriesDialog(true)}
                  className="w-full flex-row items-center justify-between"
                >
                  <Text className="text-sm">
                    {selectedIndustries.length > 0
                      ? `${selectedIndustries.length} industr${selectedIndustries.length > 1 ? "ies" : "y"} selected`
                      : "Select industries"}
                  </Text>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </Button>
                {selectedIndustries.length > 0 && (
                  <View className="flex-row flex-wrap gap-1 mt-2">
                    {selectedIndustries.slice(0, 3).map((id) => {
                      const industry = industries.find((i) => i.id === id);
                      return industry ? (
                        <Badge key={id} variant="secondary">
                          <Text className="text-xs">{industry.label}</Text>
                        </Badge>
                      ) : null;
                    })}
                    {selectedIndustries.length > 3 && (
                      <Badge variant="secondary">
                        <Text className="text-xs">
                          +{selectedIndustries.length - 3} more
                        </Text>
                      </Badge>
                    )}
                  </View>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </View>
      </ScrollView>

      {/* Actions */}
      <View className="flex-row justify-between w-full gap-2 mt-4">
        <Button
          className="flex-1"
          onPress={() => {
            onApplyPress?.();
          }}
        >
          <Text>Apply Filters</Text>
        </Button>
        {hasActiveFilters && (
          <Button
            className="flex-1"
            variant="outline"
            onPress={() => {
              resetAllFilters();
            }}
          >
            <Text>Reset All</Text>
          </Button>
        )}
      </View>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <View className={cn("flex-1 px-4 pb-4 pt-2", className)}>
        {filterContent}
      </View>

      {/* Multi-Select Dialogs */}
      <MultiSelectDialog
        open={showObjectivesDialog}
        onOpenChange={setShowObjectivesDialog}
        title="Select Objectives"
        description="Choose one or more objectives to filter users."
        items={objectives.map((obj) => ({
          id: obj.id,
          label: obj.label,
          description: obj.description,
        }))}
        selectedIds={selectedObjectives}
        onSelectionChange={setSelectedObjectives}
        searchPlaceholder="Search objectives..."
      />

      <MultiSelectDialog
        open={showIndustriesDialog}
        onOpenChange={setShowIndustriesDialog}
        title="Select Industries"
        description="Choose one or more industries to filter users."
        items={industries.map((ind) => ({
          id: ind.id,
          label: ind.label,
          description: ind.description,
        }))}
        selectedIds={selectedIndustries}
        onSelectionChange={setSelectedIndustries}
        searchPlaceholder="Search industries..."
      />
    </React.Fragment>
  );
};
