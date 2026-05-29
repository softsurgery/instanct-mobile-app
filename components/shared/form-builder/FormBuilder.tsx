import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import React from "react";
import { View } from "react-native";
import { FieldBuilder } from "./FieldBuilder";
import { FieldVariant, FormStructure } from "./types";
import { getItemWidth } from "./utils/item-width";

interface FormBuilderProps {
  className?: string;
  structure: FormStructure;
}

export const FormBuilder = React.forwardRef(
  ({ className, structure }: FormBuilderProps, ref) => {
    const fieldRefs = React.useRef<Record<string, any>>({});

    React.useImperativeHandle(ref, () => ({
      scrollToError: (id: string, scrollRef?: any) => {
        const target = fieldRefs.current[id];
        if (target && scrollRef?.current) {
          scrollRef.current.scrollToFocusedInput(target);
        }
      },
    }));

    return (
      <View className={cn("flex flex-col w-full", className)}>
        {structure.isHeaderVisible && (
          <View className="py-5 space-y-1">
            <Text className="text-2xl font-bold">{structure.title}</Text>
            <Text className="text-muted-foreground">
              {structure.description}
            </Text>
            <Separator className="my-2" />
          </View>
        )}

        <View
          className={cn(
            "flex gap-4",
            structure.orientation === "vertical" ? "flex-col" : "flex-col",
          )}
        >
          {structure?.fieldsets?.map((fieldset, fieldsetIndex) => (
            <View
              key={fieldsetIndex}
              className={cn(
                "flex w-full border-border rounded-lg",
                structure.orientation === "vertical"
                  ? "flex-col gap-10"
                  : "flex-col",
              )}
            >
              {fieldset.isHeaderVisible && (
                <View className="flex flex-col gap-2 mb-2">
                  <Text className="text-xl font-semibold">
                    {fieldset.title}
                  </Text>
                  <Separator className="my-1" />
                </View>
              )}

              {fieldset?.rows?.map((row) => {
                const fieldCount = row.fields.length;
                return (
                  <View key={row.id} className="flex flex-row flex-wrap w-full">
                    {row.fields.map((field, fieldIndex) => {
                      if (field.hidden) return null;

                      return (
                        <View
                          key={fieldIndex}
                          ref={(r) => {
                            fieldRefs.current[field.id] = r;
                          }}
                          className={cn(
                            "flex flex-col p-2",
                            structure.orientation === "vertical"
                              ? "w-full"
                              : getItemWidth(fieldCount),
                            field.fieldClassName,
                          )}
                        >
                          {/* Label */}
                          {field.variant !== "check" && (
                            <Label className="text-sm font-semibold mb-1 w-full">
                              {field.label}{" "}
                              {field.required && (
                                <Text className="text-red-500">*</Text>
                              )}
                            </Label>
                          )}

                          {/* Field */}
                          <FieldBuilder field={field} />

                          {/* Description & Error */}
                          <View className="pt-1">
                            {field.description && (
                              <View className="flex flex-col justify-between">
                                {!field?.error &&
                                  (![FieldVariant.CHECKBOX].includes(
                                    field.variant,
                                  ) ? (
                                    <Text className={cn("text-sm opacity-70")}>
                                      {field.description}
                                    </Text>
                                  ) : null)}
                              </View>
                            )}
                            {field?.error ? (
                              <Text className="text-sm font-medium text-destructive">
                                {field?.error}
                              </Text>
                            ) : null}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  },
);

FormBuilder.displayName = "FormBuilder";
