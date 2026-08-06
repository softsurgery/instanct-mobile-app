import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { View } from "react-native";
import StarRating from "react-native-star-rating-widget";
import { PictureUploader } from "./components/PictureUploader";
import Select from "./components/Select";
import { Field, FieldVariant } from "./types";
import { DatePicker } from "./components/DatePicker2";
import { TimePicker } from "./components/TimePicker";
import { ChoicePicker } from "../ChoicePicker";
import MultiSelect from "./components/MultiSelect";
import MapPinField from "./components/MapPinField";
import { PasswordField } from "./components/PasswordField";

interface FieldBuilderProps {
  field?: Field<any>;
}

export const FieldBuilder = ({ field }: FieldBuilderProps) => {
  const editable = field?.props?.editable ?? true;
  switch (field?.variant) {
    case "text":
    case "tel":
      return (
        <View className="flex flex-col w-full">
          <Input
            {...field?.props}
            editable={editable}
            keyboardType={
              field.variant === FieldVariant.TEL ? "phone-pad" : "default"
            }
            placeholder={field.placeholder}
            value={field?.props?.value?.toString() || ""}
            onChangeText={(text) => field?.props?.onChangeText?.(text)}
            onBlur={() => field?.props?.onBlur?.()}
            className={cn(field.className, field?.error && "border-red-500")}
          />
        </View>
      );
    case "number":
      return (
        <View className="flex flex-col w-full">
          <Input
            {...field?.props}
            editable={editable}
            keyboardType="number-pad"
            placeholder={field.placeholder}
            value={field?.props?.value}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, "");
              field?.props?.onChangeText?.(
                cleaned ? Number(cleaned) : undefined,
              );
            }}
            className={cn(field.className, field?.error && "border-red-500")}
          />
        </View>
      );
    case "email":
      return (
        <Input
          {...field?.props}
          editable={editable}
          keyboardType="email-address"
          placeholder={field.placeholder}
          value={field?.props?.value?.toString() || ""}
          onChangeText={(text) =>
            field?.props?.onChangeText?.(text.trim().toLowerCase())
          }
          onBlur={() => field?.props?.onBlur?.()}
          className={cn(field.className, field?.error && "border-red-500")}
        />
      );
    case "password":
      return (
        <PasswordField
          {...field.props}
          className={cn(
            field?.className,
            field?.error && "border border-red-500",
          )}
          placeholder={field?.placeholder}
          value={field?.props?.value?.toString() || ""}
          onChangeText={(text) => field?.props?.onChangeText?.(text)}
          editable={editable}
        />
      );
    case "select":
      return (
        <Select
          {...field?.props}
          classNames={{
            input: cn(field.className, field?.error && "border border-red-500"),
          }}
          title={field.label}
          description={field.description}
          placeholder={field?.placeholder}
          value={field?.props?.value?.toString()}
          onSelect={(value) => field?.props?.onSelect?.(value)}
          disabled={!editable}
          options={field?.props?.options}
        />
      );
    case "multi-select":
      return (
        <MultiSelect
          {...field?.props}
          classNames={{
            trigger: cn(field.className, field?.error && "border-red-500"),
          }}
          title={field.label}
          description={field.description}
          placeholder={field?.placeholder}
          value={field?.props?.value || []}
          onSelect={(value) => field?.props?.onSelect?.(value)}
          disabled={!editable}
          options={field?.props?.options}
          max={field?.props?.max || Infinity}
        />
      );
    case "date":
      return (
        <DatePicker
          {...field?.props}
          className={cn(
            field.className,
            field?.error && "border border-red-500 rounded-md",
          )}
          value={field?.props?.value}
          onDateChange={(date) => field?.props?.onDateChange?.(date)}
          disabled={!editable}
        />
      );
    case "time":
      return (
        <TimePicker
          {...field?.props}
          className={cn(
            field.className,
            field?.error && "border border-red-500 rounded-md",
          )}
          value={field?.props?.value}
          onTimeChange={(time) => field?.props?.onTimeChange?.(time)}
          disabled={!editable}
        />
      );
    case "checkbox":
      return (
        <View className="flex-row items-center gap-2">
          <Checkbox
            {...field?.props}
            disabled={!editable}
            checked={field?.props?.checked}
            onCheckedChange={(checked) => {
              field?.props?.onCheckedChange?.(checked);
            }}
            classNames={{
              root: cn(field?.className, field?.error && "border-red-500"),
            }}
          />
          <Text className="text-sm pr-8">{field.description}</Text>
        </View>
      );

    case "textarea":
      return (
        <View className="flex flex-col gap-2 w-full">
          <Textarea
            {...field?.props}
            className={cn(field.className, field?.error && "border-red-500")}
            editable={editable}
            placeholder={field.placeholder}
            value={field?.props?.value?.toString() || ""}
            onChangeText={field?.props?.onChangeText}
          />
        </View>
      );
    case "rating":
      return (
        <StarRating
          {...field?.props}
          className={cn(field.className, field?.error && "border-red-500")}
          rating={field?.props?.value || 0}
          starSize={field?.props?.starSize || 32}
          onChange={(rating) => field.props?.onValueChange?.(rating)}
          maxStars={field?.props?.maxStars || 5}
          color={field?.props?.color || "yellow"}
          disabled={!editable}
        />
      );
    case "picture":
      return (
        <PictureUploader
          {...field?.props}
          wrapperClassName={field?.wrapperClassName}
          className={cn(field.className, field?.error && "border-red-500")}
          image={field?.props?.image}
          fallback={field?.props?.alt}
          onFileChange={field?.props?.onFileChange}
          onUpload={field?.props?.onUpload}
          editable={editable}
        />
      );
    // case "radio":
    //   return (
    //     <RadioField
    //       {...field?.props}
    //       className={field?.className}
    //       itemWidthClass={field?.props?.itemWidthClass}
    //       options={field?.props?.options || []}
    //       checked={field?.props?.checked}
    //       onCheckedChange={field?.props?.onCheckedChange}
    //       disabled={!field?.props?.disabled}
    //     />
    //   );
    case "switch":
      return (
        <Switch
          {...field?.props}
          className={cn(field.className, field?.error && "border-red-500")}
          checked={field?.props?.checked}
          onCheckedChange={field?.props?.onCheckedChange}
          disabled={!editable}
        />
      );
    case "choice-picker":
      return (
        <ChoicePicker
          {...field?.props}
          className={cn(field.className, field?.error && "border-red-500")}
          options={field?.props?.options || []}
          value={field?.props?.value}
          onSelect={field?.props?.onSelectChange}
          disabled={!editable}
        />
      );
    case "map-pin":
      return (
        <MapPinField
          {...field?.props}
          className={cn(field?.className, field?.error && "border-red-500")}
          placeholder={field?.placeholder}
          latitude={field?.props?.latitude}
          longitude={field?.props?.longitude}
          locationName={field?.props?.locationName}
          onLocationChange={field?.props?.onLocationChange}
          editable={editable}
          changedOnFocus={field?.props?.changedOnFocus}
        />
      );
    case "custom":
      return (
        <View className={cn(field?.className)}>{field?.props?.children}</View>
      );
    default:
      return (
        <Text style={{ color: "red", fontSize: 12 }}>
          Cannot Render Element
        </Text>
      );
  }
};
