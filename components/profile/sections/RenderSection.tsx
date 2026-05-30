import { StablePressable } from "@/components/shared/StablePressable";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { hslToHex, THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { router } from "expo-router";
import {
  Briefcase,
  GraduationCap,
  LucideIcon,
  Pen,
  Plus,
  Tag,
} from "lucide-react-native";
import { View } from "react-native";

const PRIMARY = hslToHex(THEME.light.primary);

const SECTION_ICONS: Record<string, LucideIcon> = {
  experience: Briefcase,
  education: GraduationCap,
  industries: Tag,
};

export interface ProfileSection<T = unknown> {
  key: string;
  title: string;
  data: T[];
  editable: boolean;
  userId?: string;
  renderItem: (item: any) => React.ReactNode;
}

export const RenderSection = (section: ProfileSection) => {
  const isBadge = section.key === "industries";
  const count = section.data?.length ?? 0;
  const SectionIcon = SECTION_ICONS[section.key] ?? Briefcase;

  return (
    <View key={section.key} className="px-4">
      {/* Section header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Icon as={SectionIcon} size={18} color={PRIMARY} />
          <Text className="text-base font-bold text-foreground">
            {section.title}
          </Text>
          {count > 0 && (
            <View
              className="min-w-5 items-center rounded-full px-1.5 py-0.5"
              style={{ backgroundColor: `${PRIMARY}14` }}
            >
              <Text
                className="text-[11px] font-bold"
                style={{ color: PRIMARY }}
              >
                {count}
              </Text>
            </View>
          )}
        </View>

        <View
          className={cn(
            "flex-row items-center gap-1.5",
            !section.editable && "hidden",
          )}
        >
          {!isBadge && (
            <StablePressable
              className="h-9 w-9 items-center justify-center rounded-full border border-border"
              onPress={() => {
                switch (section.key) {
                  case "experience":
                    router.push("/main/profile/create-experience");
                    break;
                  case "education":
                    router.push("/main/profile/create-education");
                    break;
                }
              }}
              onPressClassname="bg-primary/15"
            >
              <Icon as={Plus} size={18} color={PRIMARY} />
            </StablePressable>
          )}

          <StablePressable
            className="h-9 w-9 items-center justify-center rounded-full border border-border"
            onPress={() => {
              switch (section.key) {
                case "experience":
                  router.push("/main/profile/update-experiences");
                  break;
                case "education":
                  router.push("/main/profile/update-educations");
                  break;
                case "industries":
                  router.push({
                    pathname: "/main/profile/industries",
                    params: { userId: section?.userId },
                  });
                  break;
              }
            }}
            onPressClassname="bg-primary/15"
          >
            <Icon as={Pen} size={16} color={PRIMARY} />
          </StablePressable>
        </View>
      </View>

      {/* Section content */}
      <View className="pt-3">
        {count === 0 ? (
          <View className="items-center rounded-2xl border border-dashed border-border py-6">
            <Text className="text-sm italic text-muted-foreground">
              No {section.title.toLowerCase()} added yet
            </Text>
          </View>
        ) : isBadge ? (
          <View className="flex-row flex-wrap gap-2">
            {section.data.map((sectionItem, idx) => (
              <View key={idx}>{section.renderItem(sectionItem)}</View>
            ))}
          </View>
        ) : (
          <View>
            {section.data.map((sectionItem, idx) => (
              <View key={idx} className="my-4">
                {section.renderItem(sectionItem)}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};
