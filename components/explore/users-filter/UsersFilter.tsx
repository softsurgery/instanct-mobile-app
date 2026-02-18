import React from "react";
import { Keyboard, View, ScrollView } from "react-native";
import { Text } from "~/components/ui/text";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { cn } from "~/lib/utils";
import Select from "../../shared/form-builder/Select";
import { Button } from "../../ui/button";
import { Dialog, DialogContent } from "../../ui/dialog";
import { Badge } from "~/components/ui/badge";
import { useObjectives } from "~/hooks/content/reference-types/useObjectives";
import { useIndustries } from "~/hooks/content/reference-types/useIndustries";
import { Gender } from "~/types/user-management";
import { MultiSelectDialog } from "../../shared/MultiSelectDialog";
import { ChevronRight } from "lucide-react-native";

interface UsersFilterProps {
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const UsersFilter = ({
  className,
  open,
  onOpenChange,
}: UsersFilterProps) => {
  // Hooks
  const { objectives } = useObjectives();
  const { industries } = useIndustries();

  const [selectedGender, setSelectedGender] = React.useState<
    string | undefined
  >(undefined);
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
    return (
      selectedGender !== undefined ||
      selectedObjectives.length > 0 ||
      selectedIndustries.length > 0
    );
  }, [selectedGender, selectedObjectives, selectedIndustries]);

  const handleOpenChange = (open: boolean) => {
    onOpenChange?.(open);
    Keyboard.dismiss();
  };

  const closeDialog = () => {
    onOpenChange?.(false);
    Keyboard.dismiss();
  };

  const accordionTriggerClassName = "flex flex-row items-center";

  const resetAllFilters = () => {
    setSelectedGender(undefined);
    setSelectedObjectives([]);
    setSelectedIndustries([]);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className={cn(className)}>
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

          <ScrollView
            className="flex-1 -mx-6"
            showsVerticalScrollIndicator={false}
          >
            <View className="px-6">
              <Accordion type="single" collapsible>
                {/* Gender */}
                <AccordionItem value="gender">
                  <AccordionTrigger className={accordionTriggerClassName}>
                    <View className="w-[90%] flex-row items-center justify-between">
                      <View>
                        <Text className="font-semibold">Gender</Text>
                        <Text className="text-muted-foreground text-xs">
                          Filter by gender preference.
                        </Text>
                      </View>
                      {selectedGender && (
                        <Badge variant="secondary" className="ml-2">
                          <Text className="text-xs">{selectedGender}</Text>
                        </Badge>
                      )}
                    </View>
                  </AccordionTrigger>
                  <AccordionContent>
                    <View className="bg-muted/30 p-3 rounded-lg">
                      <Select
                        title="Select gender"
                        value={selectedGender}
                        onSelect={(value) =>
                          setSelectedGender(value || undefined)
                        }
                        options={[
                          { label: Gender.Male, value: Gender.Male },
                          { label: Gender.Female, value: Gender.Female },
                        ]}
                      />
                    </View>
                  </AccordionContent>
                </AccordionItem>

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
                      <ChevronRight
                        size={18}
                        className="text-muted-foreground"
                      />
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
                      <ChevronRight
                        size={18}
                        className="text-muted-foreground"
                      />
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
          <View className="flex-row justify-between w-full gap-2 mt-4 pt-4 border-t border-border">
            <Button
              className="flex-1"
              onPress={() => {
                closeDialog();
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
        </DialogContent>
      </Dialog>

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
    </>
  );
};
