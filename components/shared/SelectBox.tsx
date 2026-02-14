import React from "react";
import { View, ScrollView } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { StablePressable } from "@/components/shared/StablePressable";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { X, Search, Loader2, ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Loader } from "./Loader";

export interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectBoxProps {
  className?: string;
  classNames?: {
    searchInput?: string;
    selectedSection?: string;
    selectedItem?: string;
    availableSection?: string;
    availableItem?: string;
  };
  params: (SelectOption & { color?: string })[];
  selected: (string | number)[];
  isPending?: boolean;
  onSelectParam: (id: string | number) => void;
  onRemoveParam: (id: string | number) => void;
}

export function SelectBox({
  className,
  classNames,
  params,
  selected,
  isPending = false,
  onSelectParam,
  onRemoveParam,
}: SelectBoxProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedSet = React.useMemo(() => new Set(selected), [selected]);

  const selectedOptions = React.useMemo(() => {
    return params.filter((p) => selectedSet.has(p.value));
  }, [params, selectedSet]);

  const filteredParams = React.useMemo(
    () =>
      params.filter(
        (param) =>
          param.label?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !selectedSet.has(param.value),
      ),
    [params, searchQuery, selectedSet],
  );

  if (isPending) {
    return <Loader className="mx-auto" />;
  }

  return (
    <View className={cn("flex-1 w-full gap-2 px-4", className)}>
      {/* Search Input Container */}
      <View>
        <View className="relative flex-row items-center">
          <View className="absolute right-4 z-10">
            <Icon as={Search} size={18} className="text-muted-foreground/60" />
          </View>
          <Input
            placeholder="Search options..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            editable={!isPending}
            className={cn(classNames?.searchInput)}
          />
        </View>
      </View>

      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Selected Items Section */}
          {selectedOptions.length > 0 && (
            <View className={cn("mb-6", classNames?.selectedSection)}>
              <View className="flex-row items-center gap-2 mb-3 px-1">
                <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Selected Items ({selectedOptions.length})
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {selectedOptions.map((param) => (
                  <Badge
                    key={param.value}
                    variant="secondary"
                    className={cn(
                      "pl-3 pr-1 py-1.5 flex-row items-center gap-1.5 rounded-full border border-border/50 bg-secondary/80",
                      classNames?.selectedItem,
                    )}
                    style={
                      param.color
                        ? {
                            backgroundColor: param.color + "15",
                            borderColor: param.color + "40",
                          }
                        : undefined
                    }
                  >
                    <Text className="text-xs font-semibold text-foreground">
                      {param.label}
                    </Text>
                    <StablePressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onRemoveParam(param.value);
                      }}
                      disabled={isPending}
                      className="bg-foreground/10 rounded-full p-1"
                      hitSlop={8}
                    >
                      <Icon as={X} size={10} className="text-foreground/70" />
                    </StablePressable>
                  </Badge>
                ))}
              </View>
            </View>
          )}

          {/* Available Items Section */}
          <View className={cn("flex-1", classNames?.availableSection)}>
            <View className="flex-row items-center justify-between mb-3 px-1">
              <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {searchQuery ? "Search Results" : "Available Options"}
              </Text>
              {searchQuery !== "" && (
                <Text className="text-xs font-medium text-muted-foreground/60">
                  {filteredParams.length} found
                </Text>
              )}
            </View>

            <View className="bg-card rounded-lg border border-border overflow-hidden shadow-sm shadow-black/5">
              {filteredParams.length > 0 ? (
                filteredParams.map((param, index) => (
                  <View key={param.value}>
                    <StablePressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onSelectParam(param.value);
                      }}
                      disabled={isPending}
                      className="px-5 py-4 flex-row items-center gap-4 active:bg-muted/40"
                    >
                      <View className="flex-1">
                        <Text className="text-base font-medium text-foreground">
                          {param.label}
                        </Text>
                      </View>
                      <View className="w-6 h-6 rounded-full border border-border items-center justify-center bg-background">
                        <Icon
                          as={ChevronRight}
                          size={14}
                          className="text-muted-foreground/40"
                        />
                      </View>
                    </StablePressable>
                    {index < filteredParams.length - 1 && (
                      <Separator className="mx-5 bg-border/40" />
                    )}
                  </View>
                ))
              ) : (
                <View className="px-6 py-12 flex items-center justify-center">
                  <Text className="text-sm text-muted-foreground text-center font-medium">
                    {searchQuery
                      ? "No matching items found"
                      : "No more items available"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
