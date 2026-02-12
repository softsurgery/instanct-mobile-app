import React from "react";
import { View, ScrollView } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StablePressable } from "@/components/shared/StablePressable";
import { cn } from "@/lib/utils";
import { X, Search, Save, Loader2 } from "lucide-react-native";

export interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectBoxProps {
  className?: string;
  params: SelectOption[];
  selected: (string | number)[];
  isPending?: boolean;
  onSelectParam: (id: string | number) => void;
  onRemoveParam: (id: string | number) => void;
  onSave: () => void;
  title?: string;
}

export function SelectBox({
  params,
  selected,
  isPending = false,
  onSelectParam,
  onRemoveParam,
  onSave,
  className,
  title,
}: SelectBoxProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedSet = React.useMemo(() => new Set(selected), [selected]);

  const selectedOptions = React.useMemo(
    () => params.filter((p) => selectedSet.has(p.value)),
    [params, selectedSet],
  );

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
    return (
      <View className={cn("flex items-center justify-center p-8", className)}>
        <Icon as={Loader2} className="text-muted-foreground animate-spin" />
      </View>
    );
  }

  return (
    <View className={cn("w-full gap-4", className)}>
      {/* Title */}
      {title && (
        <Text className="text-base font-semibold text-foreground">{title}</Text>
      )}

      {/* Search */}
      <View className="relative flex-row items-center">
        <Icon
          as={Search}
          size={16}
          className="absolute left-3 text-muted-foreground z-10"
        />
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          editable={!isPending}
          className="flex-1 pl-9"
        />
      </View>

      {/* Selected Params */}
      {selectedOptions.length > 0 && (
        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">
            Selected ({selectedOptions.length})
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {selectedOptions.map((param) => (
              <Badge
                key={param.value}
                variant="secondary"
                className="flex-row items-center gap-1 px-3 py-1.5"
              >
                <Text className="text-xs">{param.label}</Text>
                <StablePressable
                  onPress={() => onRemoveParam(param.value)}
                  disabled={isPending}
                  className="ml-1"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon as={X} size={12} className="text-foreground" />
                </StablePressable>
              </Badge>
            ))}
          </View>
        </View>
      )}

      {/* Available Params */}
      <View className="gap-2">
        <Text className="text-sm font-medium text-foreground">Available</Text>
        <ScrollView
          className="max-h-40 rounded-lg border border-input bg-background p-3"
          contentContainerClassName="flex-row flex-wrap gap-2"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {filteredParams.length > 0 ? (
            filteredParams.map((param) => (
              <StablePressable
                key={param.value}
                onPress={() => onSelectParam(param.value)}
                disabled={isPending}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Badge
                  variant="outline"
                  className="px-3 py-1.5"
                  pointerEvents="none"
                >
                  <Text className="text-xs">{param.label}</Text>
                </Badge>
              </StablePressable>
            ))
          ) : (
            <Text className="text-sm text-muted-foreground w-full text-center py-4">
              {searchQuery
                ? "No items match your search"
                : params.length === 0
                  ? "No items available"
                  : "All items are selected"}
            </Text>
          )}
        </ScrollView>
      </View>

      {/* Save Button */}
      <Button
        onPress={onSave}
        disabled={isPending}
        className="flex-row items-center justify-center gap-2"
      >
        {isPending ? (
          <Icon
            as={Loader2}
            size={16}
            className="text-primary-foreground animate-spin"
          />
        ) : (
          <Icon as={Save} size={16} className="text-primary-foreground" />
        )}
        <Text className="text-primary-foreground font-medium">Save</Text>
      </Button>
    </View>
  );
}
