import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import StarRating from "react-native-star-rating-widget";
import { DatePicker } from "./DatePicker";
import Select from "./Select";
import { Field, FieldVariant } from "./types";

interface FieldBuilderProps {
  field?: Field<any>;
}

export const FieldBuilder = ({ field }: FieldBuilderProps) => {
  const [showPassword, setShowPassword] = React.useState(false);

  switch (field?.variant) {
    case "text":
    case "tel":
      return (
        <View className="flex flex-col w-full">
          <Input
            {...field?.props}
            editable={field?.props?.editable}
            id={field.label}
            keyboardType={
              field.variant === FieldVariant.TEL ? "phone-pad" : "default"
            }
            placeholder={field.placeholder}
            value={field?.props?.value?.toString() || ""}
            onChangeText={(text) => field?.props?.onChangeText?.(text)}
            className={cn("p-3 rounded-md", field?.error && "border-red-500")}
          />
        </View>
      );
    case "number":
      return (
        <View className="flex flex-col w-full">
          <Input
            {...field?.props}
            editable={field?.props?.editable}
            keyboardType="number-pad"
            placeholder={field.placeholder}
            value={field?.props?.value}
            onChangeText={(text) => field?.props?.onChangeText?.(Number(text))}
            className={cn("p-3 rounded-md", field?.error && "border-red-500")}
          />
        </View>
      );
    case "email":
      return (
        <Input
          {...field?.props}
          editable={field?.props?.editable}
          keyboardType="email-address"
          placeholder={field.placeholder}
          value={field?.props?.value?.toString() || ""}
          onChangeText={(text) => field?.props?.onChangeText?.(text)}
          className={cn("p-3 rounded-md", field?.error && "border-red-500")}
          style={field?.error ? { borderColor: "red" } : {}}
          {...field.props?.other}
        />
      );
    case "select":
      return (
        <Select
          {...field?.props}
          className={cn(field?.error && "border-red-500")}
          title={field.label}
          description={field.description}
          placeholder={field?.placeholder}
          value={field?.props?.value?.toString()}
          onSelect={(value) => field?.props?.onSelect?.(value)}
          disabled={field?.props?.other}
          options={field?.props?.options}
        />
      );
    case "date":
      return (
        <DatePicker
          {...field?.props}
          className={cn(field?.error && "border border-red-500 rounded-md")}
          date={field?.props?.value}
          onChange={(date) => field?.props?.onDateChange?.(date)}
          disabled={field?.props?.editable}
        />
      );
    case "checkbox":
      return (
        <View className="flex-row items-center gap-2">
          <Checkbox
            {...field?.props}
            checked={!!field?.props?.value}
            onCheckedChange={(checked) =>
              field?.props?.onValueChange?.(checked)
            }
          />
          <Text>{field.label}</Text>
        </View>
      );
    case "password":
      return (
        <View className="w-full" style={{ position: "relative" }}>
          <Input
            {...field?.props}
            className={cn(field?.error && "border-red-500")}
            style={{
              flex: 1,
              padding: 10,
              paddingRight: 40,
            }}
            placeholder={field?.props?.placeholder || "••••••••"}
            secureTextEntry={!showPassword}
            value={field?.props?.value?.toString() || ""}
            onChangeText={(text) => field?.props?.onChangeText?.(text)}
            editable={field?.props?.editable}
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
            textContentType="none"
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 10,
              top: 7,
              padding: 4,
            }}
            disabled={!field?.props?.editable}
          >
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="gray"
            />
          </TouchableOpacity>
        </View>
      );
    case "textarea":
      return (
        <View className="flex flex-col gap-2 w-full">
          <Textarea
            {...field?.props}
            className={cn("h-52", field?.error && "border-red-500")}
            editable={field?.props?.other}
            placeholder={field.placeholder}
            value={field?.props?.value?.toString() || ""}
            onChangeText={field?.props?.onChangeText}
            {...field.props?.other}
          />
        </View>
      );
    case "rating":
      return (
        <View className="flex flex-col w-full">
          <View className="mx-auto">
            <StarRating
              {...field?.props}
              rating={field?.props?.value || 0}
              onChange={(rating) => field.props?.onValueChange?.(rating)}
              maxStars={5}
              color={field?.props?.color || "yellow"}
            />
          </View>
        </View>
      );
    // case "picture":
    //   return (
    //     <PictureUploader
    //       {...field?.props}
    //       image={field?.props?.image}
    //       onFileChange={field?.props?.onFileChange}
    //       onUpload={field?.props?.onUpload}
    //       className={field?.className}
    //       editable={field?.props?.editable}
    //     />
    //   );
    // case "radio":
    //   return (
    //     <RadioField
    //       {...field?.props}
    //       className={field?.className}
    //       itemWidthClass={field?.props?.itemWidthClass}
    //       options={field?.props?.options || []}
    //       checked={field?.props?.checked}
    //       onCheckedChange={field?.props?.onCheckedChange}
    //       disabled={field?.props?.disabled}
    //     />
    //   );
    case "switch":
      return (
        <Switch
          {...field?.props}
          className={field?.className}
          checked={field?.props?.checked}
          onCheckedChange={field?.props?.onCheckedChange}
          disabled={field?.props?.disabled}
        />
      );
    default:
      return (
        <Text style={{ color: "red", fontSize: 12 }}>
          Cannot Render Element
        </Text>
      );
  }
};
