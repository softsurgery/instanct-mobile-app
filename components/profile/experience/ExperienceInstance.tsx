import { SeeMoreText } from "@/components/shared/SeeMoreText";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { hslToHex, THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { ResponseExperienceDto } from "@/types";
import { format } from "date-fns";
import { Briefcase, CalendarDays, Laptop, MapPin } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { View } from "react-native";

interface ExperienceInstanceProps {
  className?: string;
  experience: ResponseExperienceDto;
}

const PRIMARY = hslToHex(THEME.light.primary);

const MetaChip = ({
  icon,
  label,
  color,
}: {
  icon: React.ComponentProps<typeof Icon>["as"];
  label: string;
  color: string;
}) => (
  <View className="flex-row items-center gap-1 rounded-full bg-muted px-2.5 py-1">
    <Icon as={icon} size={12} color={color} />
    <Text className="text-[11px] font-medium text-muted-foreground">
      {label}
    </Text>
  </View>
);

export const ExperienceInstance = ({
  className,
  experience,
}: ExperienceInstanceProps) => {
  const { colorScheme } = useColorScheme();
  const mutedFg = hslToHex(
    colorScheme === "dark"
      ? THEME.dark.mutedForeground
      : THEME.light.mutedForeground,
  );

  const range = experience.startDate
    ? `${format(new Date(experience.startDate), "MMM yyyy")} — ${
        experience.endDate
          ? format(new Date(experience.endDate), "MMM yyyy")
          : "Present"
      }`
    : null;

  const place = [experience.location, experience.locationType]
    .filter(Boolean)
    .join(" · ");

  return (
    <View
      className={cn(
        "flex-row gap-3",
        className,
      )}
    >
      {/* Role tile */}
      <View
        className="h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${PRIMARY}14` }}
      >
        <Icon as={Briefcase} size={20} color={PRIMARY} />
      </View>

      <View className="flex-1">
        <Text className="text-[15px] font-bold text-foreground">
          {experience.title}
        </Text>
        {!!experience.company && (
          <Text className="mt-0.5 text-sm font-semibold text-muted-foreground">
            {experience.company}
          </Text>
        )}

        {(range || experience.workType || place) && (
          <View className="mt-2 flex-row flex-wrap gap-1.5">
            {range && (
              <MetaChip icon={CalendarDays} label={range} color={PRIMARY} />
            )}
            {!!experience.workType && (
              <MetaChip
                icon={Laptop}
                label={experience.workType}
                color={mutedFg}
              />
            )}
            {!!place && (
              <MetaChip icon={MapPin} label={place} color={mutedFg} />
            )}
          </View>
        )}

        {!!experience.description && (
          <SeeMoreText
            className="mt-2.5"
            textClassname="text-sm leading-5 text-muted-foreground"
            numberOfLines={2}
          >
            {experience.description}
          </SeeMoreText>
        )}
      </View>
    </View>
  );
};
