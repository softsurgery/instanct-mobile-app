import React from "react";
import { View, ScrollView, TextInput } from "react-native";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Checkbox } from "~/components/ui/checkbox";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { Search, X } from "lucide-react-native";

interface MultiSelectItem {
  id: number;
  label: string;
  description?: string;
}

interface MultiSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  items: MultiSelectItem[];
  selectedIds: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  searchPlaceholder?: string;
}

export const MultiSelectDialog = ({
  open,
  onOpenChange,
  title,
  description,
  items,
  selectedIds,
  onSelectionChange,
  searchPlaceholder = "Search...",
}: MultiSelectDialogProps) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [localSelection, setLocalSelection] =
    React.useState<number[]>(selectedIds);

  React.useEffect(() => {
    if (open) {
      setLocalSelection(selectedIds);
      setSearchQuery("");
    }
  }, [open, selectedIds]);

  const filteredItems = React.useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query),
    );
  }, [items, searchQuery]);

  const toggleItem = (id: number) => {
    setLocalSelection((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  const handleApply = () => {
    onSelectionChange(localSelection);
    onOpenChange(false);
  };

  const handleClear = () => {
    setLocalSelection([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <Text className="text-muted-foreground text-sm mt-1">
              {description}
            </Text>
          )}
        </DialogHeader>

        {/* Selected Count Badge */}
        {localSelection.length > 0 && (
          <View className="flex-row items-center gap-2">
            <Badge variant="secondary">
              <Text className="text-xs">{localSelection.length} selected</Text>
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onPress={handleClear}
              className="h-6"
            >
              <Text className="text-xs text-muted-foreground">Clear all</Text>
            </Button>
          </View>
        )}

        {/* Search Bar */}
        <View className="flex-row items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
          <Search size={18} className="text-muted-foreground" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={searchPlaceholder}
            placeholderTextColor="#999"
            className="flex-1 text-foreground"
          />
          {searchQuery.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onPress={() => setSearchQuery("")}
              className="p-0 h-6 w-6"
            >
              <X size={16} className="text-muted-foreground" />
            </Button>
          )}
        </View>

        {/* Items List */}
        <ScrollView
          className="flex-1 -mx-6 px-6"
          showsVerticalScrollIndicator={true}
        >
          <View className="gap-1 pb-4">
            {filteredItems.length === 0 ? (
              <View className="py-8 items-center">
                <Text className="text-muted-foreground text-center">
                  No items found
                </Text>
              </View>
            ) : (
              filteredItems.map((item) => {
                const isSelected = localSelection.includes(item.id);
                return (
                  <View
                    key={item.id}
                    className={cn(
                      "flex-row items-start gap-3 p-3 rounded-lg",
                      isSelected && "bg-primary/10",
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <View className="flex-1">
                      <Text
                        className={cn(
                          "font-medium",
                          isSelected && "text-primary",
                        )}
                      >
                        {item.label}
                      </Text>
                      {item.description && (
                        <Text className="text-muted-foreground text-xs mt-0.5">
                          {item.description}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View className="flex-row gap-2 mt-2">
          <Button
            variant="outline"
            className="flex-1"
            onPress={() => onOpenChange(false)}
          >
            <Text>Cancel</Text>
          </Button>
          <Button className="flex-1" onPress={handleApply}>
            <Text>Apply</Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
};
