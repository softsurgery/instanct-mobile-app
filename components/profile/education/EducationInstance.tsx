import { SeeMoreText } from "@/components/shared/SeeMoreText";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { hslToHex, THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { ResponseEducationDto } from "@/types";
import { format } from "date-fns";
import { CalendarDays, GraduationCap } from "lucide-react-native";
import { View } from "react-native";

interface EducationInstanceProps {
  className?: string;
  education: ResponseEducationDto;
}

const PRIMARY = hslToHex(THEME.light.primary);

export const EducationInstance = ({
  className,
  education,
}: EducationInstanceProps) => {
  const range = education.startDate
    ? `${format(new Date(education.startDate), "yyyy")} — ${
        education.endDate
          ? format(new Date(education.endDate), "yyyy")
          : "Present"
      }`
    : null;

  return (
    <View
      className={cn(
        "flex-row gap-3",
        className,
      )}
    >
      {/* School tile */}
      <View
        className="h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${PRIMARY}14` }}
      >
        <Icon as={GraduationCap} size={20} color={PRIMARY} />
      </View>

      <View className="flex-1">
        <Text className="text-[15px] font-bold text-foreground">
          {education.title}
        </Text>
        {!!education.institution && (
          <Text className="mt-0.5 text-sm font-semibold text-muted-foreground">
            {education.institution}
          </Text>
        )}

        {range && (
          <View className="mt-2 flex-row">
            <View className="flex-row items-center gap-1 rounded-full bg-muted px-2.5 py-1">
              <Icon as={CalendarDays} size={12} color={PRIMARY} />
              <Text className="text-[11px] font-medium text-muted-foreground">
                {range}
              </Text>
            </View>
          </View>
        )}

        {!!education.description && (
          <SeeMoreText
            className="mt-2.5"
            textClassname="text-sm leading-5 text-muted-foreground"
            numberOfLines={2}
          >
            {education.description}
          </SeeMoreText>
        )}
      </View>
    </View>
  );
};
