import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import * as Haptics from "expo-haptics";
import { Check, ChevronDown, Search } from "lucide-react-native";
import React from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import type { SelectOption } from "~/components/shared/form-builder/types";
import { cn } from "~/lib/utils";
import ActionSheet, { type ActionSheetRef } from "react-native-actions-sheet";
import { useColorScheme } from "nativewind";
import { THEME } from "@/lib/theme";
import { toast } from "sonner-native";

interface MultiSelectProps {
  classNames?: {
    trigger: string;
    content: string;
  };
  title?: string;
  description?: string;
  placeholder?: string;

  value?: string[];
  onSelect?: (value: string[]) => void;
  disabled?: boolean;

  options?: SelectOption[];
  searchable?: boolean;
  max: number;
}

export default function MultiSelect({
  classNames,

  title,
  description,
  placeholder,

  value = [],
  onSelect,
  disabled,

  options = [],
  searchable = false,
  max = Infinity,
}: MultiSelectProps) {
  const { colorScheme } = useColorScheme();
  const isDarkColorScheme = colorScheme === "dark";
  const sheetRef = React.useRef<ActionSheetRef>(null);
  const [search, setSearch] = React.useState("");

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  // Sort: selected items first, then unselected
  const sorted = [...filtered].sort((a, b) => {
    const aSelected = value.includes(a.value);
    const bSelected = value.includes(b.value);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  const selectedLabels = options
    .filter((o) => value.includes(o.value))
    .map((o) => o.label);

  const handleToggle = async (v: string) => {
    await Haptics.selectionAsync();

    let next: string[];

    if (value.includes(v)) {
      next = value.filter((item) => item !== v);
    } else {
      if (value.length >= max) {
        toast.warning(`You can only select up to ${max} options.`);
        return;
      }
      next = [...value, v];
    }

    onSelect?.(next);
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setSearch("");
  };

  return (
    <>
      <Pressable
        className={cn(
          "min-h-9 w-full flex-row flex-wrap items-center rounded-md border border-input dark:bg-input/30 px-2 py-2",
          disabled && "opacity-50 pointer-events-none",
          classNames?.trigger,
        )}
        onPress={() => {
          if (!disabled) sheetRef.current?.show();
        }}
      >
        {selectedLabels.length === 0 ? (
          <Text className="text-sm">{placeholder || "Select options"}</Text>
        ) : (
          <View className="flex-1 flex-row flex-wrap gap-2 pr-8">
            {selectedLabels.map((label) => (
              <View
                key={label}
                className="rounded-full bg-primary/25 px-3 py-0.5"
              >
                <Text className="text-sm">{label}</Text>
              </View>
            ))}
          </View>
        )}

        <View className="absolute right-2 text-muted-foreground">
          <Icon as={ChevronDown} size={16} color={"gray"} />
        </View>
      </Pressable>
      <ActionSheet
        ref={sheetRef}
        gestureEnabled
        statusBarTranslucent
        defaultOverlayOpacity={0.45}
        onClose={handleClose}
        containerStyle={{
          backgroundColor: isDarkColorScheme
            ? THEME.dark.background
            : THEME.light.background,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 32,
        }}
      >
        <View className="mb-4">
          <Text className="text-lg font-semibold text-foreground">
            {title || "Select Options"}
          </Text>

          {description && (
            <Text className="mt-1 text-sm text-muted-foreground">
              {description}
            </Text>
          )}

          {value.length > 0 && (
            <Text className="mt-1 text-sm text-primary">
              {value.length} selected
            </Text>
          )}
        </View>

        {searchable && (
          <View className="relative mb-3">
            <Icon
              as={Search}
              size={18}
              className="absolute left-3 top-3 z-10 text-muted-foreground"
            />
            <Input
              value={search}
              onChangeText={setSearch}
              placeholder="Search..."
              className="pl-10"
              autoFocus
            />
          </View>
        )}

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 400 }}
        >
          {sorted.length === 0 ? (
            <View className="py-8 items-center">
              <Text className="text-sm text-muted-foreground">
                {search ? "No options found" : "No options available"}
              </Text>
            </View>
          ) : (
            sorted.map((option, index) => {
              const isSelected = value.includes(option.value);

              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.8}
                  onPress={() => {
                    Keyboard.dismiss();
                    handleToggle(option.value);
                  }}
                  className={cn(
                    "flex-row items-center justify-between rounded-xl px-4 py-3",
                    index !== sorted.length - 1 && "mb-1",
                    isSelected && "bg-primary/10",
                  )}
                >
                  <Text
                    className={cn(
                      "text-base text-foreground",
                      isSelected && "font-semibold text-primary",
                    )}
                  >
                    {option.label}
                  </Text>

                  {isSelected && (
                    <Icon as={Check} size={18} className="text-primary" />
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </ActionSheet>
    </>
  );
}
