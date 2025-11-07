import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import * as Haptics from "expo-haptics";
import { Check, ChevronDown, Search } from "lucide-react-native";
import React from "react";
import { Keyboard, ScrollView, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import type { SelectOption } from "~/components/shared/form-builder/types";
import { cn } from "~/lib/utils";

interface SelectProps {
  className?: string;
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
  className,
  title,
  placeholder,
  value,
  onSelect,
  disabled,
  options = [],
  searchable = false,
}: SelectProps) {
  const [visible, setVisible] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );
  const selectedOption = options.find((o) => o.value === value);

  const handleSelect = async (v: string) => {
    await Haptics.selectionAsync();
    onSelect?.(v);
    setVisible(false);
    setSearch("");
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => !disabled && setVisible(true)}
        activeOpacity={0.8}
        className={cn(
          "relative flex flex-row items-center w-full",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
      >
        <Input
          pointerEvents="none"
          value={selectedOption?.label || ""}
          placeholder={placeholder || "Select an option"}
          className="pr-10 cursor-pointer"
        />
        <View className="absolute right-3 text-muted-foreground">
          <Icon as={ChevronDown} size={18} />
        </View>
      </TouchableOpacity>
      <Modal
        isVisible={visible}
        useNativeDriver
        useNativeDriverForBackdrop
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={100}
        animationOutTiming={1000}
        onBackdropPress={() => setVisible(false)}
        onBackButtonPress={() => setVisible(false)}
        style={{ justifyContent: "flex-end", margin: 0 }}
        hideModalContentWhileAnimating
        avoidKeyboard
      >
        <View className={cn("bg-card rounded-t-2xl p-4 pb-8 max-h-[50vh]")}>
          <View className="w-12 h-1.5 bg-muted-foreground/40 self-center rounded-full mb-4" />
          <Text className="text-lg font-semibold mb-2 text-foreground text-center">
            {title || "Select Option"}
          </Text>

          {searchable && (
            <View className="mb-3 relative">
              <Icon
                as={Search}
                size={22}
                className="absolute left-3 top-3  text-muted-foreground z-10"
              />
              <Input
                value={search}
                onChangeText={setSearch}
                placeholder="Search..."
                className="pl-10"
              />
            </View>
          )}

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {filtered.length === 0 ? (
              <View className="py-8 px-4 text-center">
                <Text className="text-muted-foreground text-sm">
                  {search ? "No options found" : "No options available"}
                </Text>
              </View>
            ) : (
              filtered.map((option) => {
                const isSelected = option.value === value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      handleSelect(option.value);
                      Keyboard.dismiss();
                    }}
                    className={cn(
                      "flex-row justify-between items-center p-3 border-b border-border/20",
                      isSelected && "bg-primary/10 rounded-lg"
                    )}
                    activeOpacity={0.8}
                  >
                    <Text
                      className={cn(
                        "text-base",
                        isSelected
                          ? "text-primary font-semibold"
                          : "text-foreground"
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
      </Modal>
    </>
  );
}
