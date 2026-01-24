import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import * as Haptics from "expo-haptics";
import { Check, ChevronDown, Search } from "lucide-react-native";
import React from "react";
import { Keyboard, ScrollView, TouchableOpacity, View } from "react-native";
import type { SelectOption } from "~/components/shared/form-builder/types";
import { cn } from "~/lib/utils";

interface SelectProps {
  className?: string;
  classNames?: {
    trigger: string;
    content: string;
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
  className,
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
  const [visible, setVisible] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );
  const selectedOption = options.find((o) => o.value === value);

  const handleSelect = async (v: string) => {
    await Haptics.selectionAsync();
    onSelect?.(v);
    setVisible(false);
    setSearch("");
  };

  return (
    <Dialog
      open={visible}
      onOpenChange={setVisible}
      className={cn("rounded-lg", className)}
    >
      <DialogTrigger
        onPress={() => !disabled && setVisible(true)}
        className="flex-row"
      >
        <View
          className={cn(
            "flex-row items-center w-full",
            disabled && "opacity-50 pointer-events-none",
          )}
        >
          <Input
            pointerEvents="none"
            value={selectedOption?.label || ""}
            placeholder={placeholder || "Select an option"}
            className={cn("text-sm pb-2", classNames?.trigger)}
          />
          <View className="absolute right-3 text-muted-foreground">
            <Icon as={ChevronDown} size={18} />
          </View>
        </View>
      </DialogTrigger>

      <DialogContent
        className={cn("w-[90vw] p-0 py-4 px-2", classNames?.content)}
      >
        <DialogTitle>
          <View className="flex flex-col w-full px-2">
            <Text className="text-lg font-semibold text-foreground">
              {title || "Select Option"}
            </Text>

            {description && (
              <Text className="text-muted-foreground text-sm">
                {description}
              </Text>
            )}
          </View>
        </DialogTitle>
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
            filtered.map((option, index) => {
              const isSelected = option.value === value;
              const isLast = index === filtered.length - 1;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    handleSelect(option.value);
                    Keyboard.dismiss();
                  }}
                  className={cn(
                    "flex-row justify-between items-center p-3 border-border/20",
                    !isLast && "border-b",
                    isSelected && "bg-primary/10 rounded-lg",
                  )}
                  activeOpacity={0.8}
                >
                  <Text
                    className={cn(
                      "text-base",
                      isSelected
                        ? "text-primary font-semibold"
                        : "text-foreground",
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
      </DialogContent>
    </Dialog>
  );
}
