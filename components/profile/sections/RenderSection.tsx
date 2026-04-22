import { StablePressable } from "@/components/shared/StablePressable";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { router } from "expo-router";
import { Pen, Plus } from "lucide-react-native";
import { View } from "react-native";

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

  return (
    <View key={section.key}>
      <View className="flex flex-row items-center justify-between">
        <View className="p-4">
          <Text variant="h4">{section.title}</Text>
        </View>

        <View
          className={cn(
            "flex flex-row gap-1 items-center px-2",
            !section.editable && "hidden",
          )}
        >
          {!isBadge && (
            <StablePressable
              className="p-2"
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
              onPressClassname="bg-primary/25 rounded-full"
            >
              <Icon as={Plus} size={20} className="text-muted-foreground" />
            </StablePressable>
          )}

          <StablePressable
            className="p-2"
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
            onPressClassname="bg-primary/25 rounded-full"
          >
            <Icon as={Pen} size={18} className="text-muted-foreground" />
          </StablePressable>
        </View>
      </View>

      <Separator />

      <View className="p-4">
        {section.data?.length === 0 ? (
          <View key={section.key}>
            <Text className="text-sm text-muted-foreground italic text-center my-4">
              No {section.title} added yet
            </Text>
          </View>
        ) : isBadge ? (
          <View className="flex-row flex-wrap gap-2">
            {Array.isArray(section.data) &&
              section.data.map((sectionItem, idx) => (
                <View key={idx}>{section.renderItem(sectionItem)}</View>
              ))}
          </View>
        ) : (
          <View className="flex flex-col gap-4">
            {Array.isArray(section.data) &&
              section.data.map((sectionItem, idx) => (
                <View key={idx}>{section.renderItem(sectionItem)}</View>
              ))}
          </View>
        )}
      </View>
    </View>
  );
};
