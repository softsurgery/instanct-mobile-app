import React from "react";
import { View, ScrollView } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { StablePressable } from "@/components/shared/StablePressable";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { X, Search, Loader2, CheckCircle2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";

export interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectBoxProps {
  className?: string;
  params: (SelectOption & { color?: string })[];
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

  const selectedOptions = React.useMemo(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    return (
      <View className={cn("flex items-center justify-center p-8", className)}>
        <Icon as={Loader2} className="text-muted-foreground animate-spin" />
      </View>
    );
  }

  return (
    <View className={cn("w-full gap-4 px-1", className)}>
      {/* Title Section */}
      {title && (
        <View className="gap-2">
          <Text className="text-2xl font-bold text-foreground">{title}</Text>
          <Text className="text-sm text-muted-foreground">
            {selected.length > 0
              ? `${selected.length} selected`
              : "Select items from the available options below"}
          </Text>
        </View>
      )}

      {/* Search Input */}
      <View className="flex flex-row items-center justify-between w-full">
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          editable={!isPending}
          className="flex-1"
        />
        <View className="absolute right-2">
          <Icon as={Search} size={16} color={"gray"} />
        </View>
      </View>

      {/* Selected Items Section */}
      {selectedOptions.length > 0 && (
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <Icon as={CheckCircle2} size={18} className="text-primary" />
            <Text className="text-sm font-semibold text-foreground">
              Selected Items ({selectedOptions.length})
            </Text>
          </View>
          <View className="bg-card rounded-xl border border-input p-4 gap-3">
            <View className="flex-row flex-wrap gap-2">
              {selectedOptions.map((param) => (
                <Badge
                  key={param.value}
                  className={cn("px-3 py-2 flex-row items-center gap-1.5")}
                  style={
                    param.color ? { backgroundColor: param.color } : undefined
                  }
                >
                  <Text className="text-xs font-medium">{param.label}</Text>
                  <StablePressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onRemoveParam(param.value);
                    }}
                    disabled={isPending}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon as={X} size={14} className="opacity-70" />
                  </StablePressable>
                </Badge>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Available Items Section */}
      <View className="gap-3">
        <Text className="text-sm font-semibold text-foreground">
          Available{" "}
          {filteredParams.length === params.length
            ? ""
            : `(${filteredParams.length})`}
        </Text>
        <View className="bg-card rounded-xl border border-input overflow-hidden">
          <ScrollView
            className="max-h-64"
            contentContainerClassName="gap-0"
            keyboardShouldPersistTaps="handled"
          >
            {filteredParams.length > 0 ? (
              filteredParams.map((param, index) => (
                <View key={param.value}>
                  <StablePressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onSelectParam(param.value);
                    }}
                    disabled={isPending}
                    className="px-4 py-3 flex-row items-center gap-3 active:bg-muted/50"
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-foreground">
                        {param.label}
                      </Text>
                    </View>
                    <View className="w-5 h-5 rounded-full border-2 border-input bg-background" />
                  </StablePressable>
                  {index < filteredParams.length - 1 && (
                    <Separator className="mx-0" />
                  )}
                </View>
              ))
            ) : (
              <View className="px-4 py-8 flex items-center justify-center">
                <Text className="text-sm text-muted-foreground text-center">
                  {searchQuery
                    ? "No items match your search"
                    : params.length === 0
                      ? "No items available"
                      : "All items are selected"}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
