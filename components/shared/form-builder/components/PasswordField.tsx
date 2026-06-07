import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react-native";
import React from "react";
import { TextInputProps, TouchableOpacity, View } from "react-native";

interface PasswordFieldProps extends Omit<TextInputProps, "secureTextEntry"> {
  className?: string;
}

export const PasswordField = ({ className, ...props }: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = React.useState(false);
  return (
    <View className="w-full" style={{ position: "relative" }}>
      <Input
        {...props}
        className={cn(className)}
        style={{
          flex: 1,
          padding: 10,
          paddingRight: 40,
        }}
        placeholder={props?.placeholder || "••••••••"}
        secureTextEntry={!showPassword}
        value={props?.value?.toString() || ""}
        onChangeText={(text) => props?.onChangeText?.(text)}
        editable={props?.editable}
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
          top: 4,
          padding: 4,
        }}
        disabled={props?.editable === false}
      >
        <Icon as={showPassword ? Eye : EyeOff} size={20} color="gray" />
      </TouchableOpacity>
    </View>
  );
};
