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
import { useColorPalette } from "@/hooks/useColorPalette";

interface SelectProps {
  classNames?: {
    trigger?: string;
    content?: string;
    input?: string;
  };
  title?: string;
  description?: string;
  placeholder?: string;

  value?: string;
  onSelect?: (value: string) => void;
  disabled?: boolean;

  options?: SelectOption[];
  searchable?: boolean;
}

export default function Select({
  classNames,

  title,
  description,
  placeholder,

  value,
  onSelect,
  disabled,

  options = [],
  searchable = false,
}: SelectProps) {
  const { palette } = useColorPalette();
  const sheetRef = React.useRef<ActionSheetRef>(null);
  const [search, setSearch] = React.useState("");

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );
  const selectedOption = options.find((o) => o.value === value);

  const handleSelect = async (v: string) => {
    await Haptics.selectionAsync();
    sheetRef.current?.hide();
    setSearch("");
    onSelect?.(v);
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setSearch("");
  };

  return (
    <>
      <Pressable
        className={cn(
          disabled && "opacity-50 pointer-events-none",
          "flex justify-center",
          classNames?.trigger,
        )}
        onPress={() => {
          if (!disabled) sheetRef.current?.show();
        }}
      >
        <Input
          pointerEvents="none"
          editable={false}
          value={selectedOption?.label || ""}
          justify-center
          placeholder={placeholder || "Select an option"}
          className={cn("block opacity-100", classNames?.input)}
        />
        <View className="absolute right-3 text-muted-foreground">
          <Icon as={ChevronDown} size={18} color={"gray"} />
        </View>
      </Pressable>
      <ActionSheet
        ref={sheetRef}
        gestureEnabled
        statusBarTranslucent
        defaultOverlayOpacity={0.45}
        onClose={handleClose}
        containerStyle={{
          backgroundColor: palette.background,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 32,
        }}
      >
        <View className="mb-4">
          <Text className="text-lg font-semibold text-foreground">
            {title || "Select Option"}
          </Text>

          {description && (
            <Text className="mt-1 text-sm text-muted-foreground">
              {description}
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
          {filtered.length === 0 ? (
            <View className="py-8 items-center">
              <Text className="text-sm text-muted-foreground">
                {search ? "No options found" : "No options available"}
              </Text>
            </View>
          ) : (
            filtered.map((option, index) => {
              const isSelected = option.value === value;

              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.8}
                  onPress={() => {
                    Keyboard.dismiss();
                    handleSelect(option.value);
                  }}
                  className={cn(
                    "flex-row items-center justify-between rounded-xl px-4 py-3",
                    index !== filtered.length - 1 && "mb-1",
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
