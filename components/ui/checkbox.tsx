import { cn } from "@/lib/utils";
import * as CheckboxPrimitive from "@rn-primitives/checkbox";
import { Check } from "lucide-react-native";
import { Platform } from "react-native";
import { Icon } from "./icon";

const DEFAULT_HIT_SLOP = 24;

interface CheckboxProps {
  classNames?: {
    root?: string;
    checked?: string;
    indicator?: string;
    icon?: string;
  };
  icon?: {
    color?: string;
    size?: number;
  };
}

function Checkbox({
  classNames,
  icon = {
    color: undefined,
    size: 12,
  },
  ...props
}: CheckboxPrimitive.RootProps &
  React.RefAttributes<CheckboxPrimitive.RootRef> &
  CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "border-input dark:bg-input/30 size-4 shrink-0 rounded-[4px] border shadow-sm shadow-black/5",
        Platform.select({
          web: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive peer cursor-default outline-none transition-shadow focus-visible:ring-[3px] disabled:cursor-not-allowed",
          native: "overflow-hidden",
        }),
        props.checked && cn("border-primary", classNames?.checked),
        props.disabled && "opacity-50",
        classNames?.root,
      )}
      hitSlop={DEFAULT_HIT_SLOP}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn(
          "bg-primary h-full w-full items-center justify-center",
          classNames?.indicator,
        )}
      >
        <Icon
          as={Check}
          color={icon.color || "white"}
          size={icon.size}
          strokeWidth={Platform.OS === "web" ? 2.5 : 3.5}
          className={cn("text-primary-foreground")}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
