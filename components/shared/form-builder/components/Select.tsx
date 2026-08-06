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
import { useRTL } from "@/hooks/useRTL";

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
  customTrigger?: React.ReactNode;
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
  customTrigger,
}: SelectProps) {
  const isRTL = useRTL();
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
        {customTrigger ? (
          customTrigger
        ) : (
          <>
            <Input
              pointerEvents="none"
              editable={false}
              value={selectedOption?.label || ""}
              justify-center
              placeholder={placeholder || "Select an option"}
              className={cn("block opacity-100", classNames?.input)}
            />
            <View
              className={cn(
                "absolute text-muted-foreground",
                isRTL ? "left-3" : "right-3",
              )}
            >
              <Icon as={ChevronDown} size={16} color={"gray"} />
            </View>
          </>
        )}
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
        <View>
          <View className="mb-4">
            <Text
              className={cn(
                "text-lg font-semibold text-foreground",
                isRTL && "text-right",
              )}
            >
              {title || "Select Option"}
            </Text>

            {description && (
              <Text
                className={cn(
                  "mt-1 text-sm text-muted-foreground",
                  isRTL && "text-right",
                )}
              >
                {description}
              </Text>
            )}
          </View>

          {searchable && (
            <View className="relative mb-3">
              <Icon
                as={Search}
                size={18}
                className={cn(
                  "absolute top-3 z-10 text-muted-foreground",
                  isRTL ? "left-3" : "right-3",
                )}
              />
              <Input
                value={search}
                onChangeText={setSearch}
                placeholder="Search..."
                className={cn(isRTL ? "pr-10" : "pl-10")}
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
                      isRTL && "flex-row-reverse",
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
        </View>
      </ActionSheet>
    </>
  );
}
