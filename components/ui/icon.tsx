import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { LucideIcon, LucideProps } from "lucide-react-native";
import { useColorScheme } from "nativewind";

type IconProps = LucideProps & {
  className?: string;
  as: LucideIcon;
};

function IconImpl({ as: IconComponent, ...props }: IconProps) {
  return <IconComponent {...props} />;
}

function Icon({
  as: IconComponent,
  className,
  size = 14,
  ...props
}: IconProps) {
  const { colorScheme } = useColorScheme();
  return (
    <IconImpl
      as={IconComponent}
      className={cn(className)}
      size={size}
      color={
        props.color || colorScheme === "dark"
          ? THEME.dark.foreground
          : THEME.light.foreground
      }
      fill={props.fill || "transparent"}
      {...props}
    />
  );
}

export { Icon };
