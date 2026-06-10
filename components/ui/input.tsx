import { cn } from "@/lib/utils";
import { Platform, TextInput, type TextInputProps } from "react-native";

function Input({
  className,
  ...props
}: TextInputProps & React.RefAttributes<TextInput>) {
  return (
    <TextInput
      {...props}
      multiline={false}
      className={cn(
        "dark:bg-input/30 border border-input text-foreground h-11 w-full min-w-0 flex flex-row items-center rounded-xl px-3 shadow-sm shadow-black/5",
        props.editable === false &&
          cn(
            "opacity-50",
            Platform.select({
              web: "disabled:pointer-events-none disabled:cursor-not-allowed",
            }),
          ),
        Platform.select({
          native: "placeholder:text-muted-foreground/50",
        }),
        className,
      )}
    />
  );
}

export { Input };
