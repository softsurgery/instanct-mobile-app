import { SeeMoreText } from "@/components/shared/SeeMoreText";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useColorPalette } from "@/hooks/useColorPalette";
import { hslToHex } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { ResponseExperienceDto } from "@/types";
import { format } from "date-fns";
import { Briefcase, CalendarDays, Laptop, MapPin } from "lucide-react-native";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

interface ExperienceInstanceProps {
  className?: string;
  experience: ResponseExperienceDto;
}

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
  const { t } = useTranslation("menu");
  const { palette } = useColorPalette();
  const primary = hslToHex(palette.primary);

  const range = experience.startDate
    ? `${format(new Date(experience.startDate), "MMM yyyy")} — ${
        experience.endDate
          ? format(new Date(experience.endDate), "MMM yyyy")
          : t("experience.instance.present")
      }`
    : null;

  const place = [
    experience.location,
    t(`experience.form.labels.locationTypeOptions.${experience.locationType}`),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View
      className={cn(
        "flex-row gap-3",
        experience.description ? "items-start" : "items-center",
        className,
      )}
    >
      {/* Role tile */}
      <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary/50">
        <Icon as={Briefcase} size={20} color={"white"} />
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
              <MetaChip icon={CalendarDays} label={range} color={primary} />
            )}
            {!!experience.workType && (
              <MetaChip
                icon={Laptop}
                label={t(
                  `experience.form.labels.workTypeOptions.${experience.workType}`,
                )}
                color={primary}
              />
            )}
            {!!place && (
              <MetaChip icon={MapPin} label={place} color={primary} />
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
