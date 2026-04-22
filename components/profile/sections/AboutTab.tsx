import { SeeMoreText } from "@/components/shared/SeeMoreText";
import { StablePressable } from "@/components/shared/StablePressable";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { Globe, Linkedin } from "lucide-react-native";
import { Linking, ScrollView, View } from "react-native";

export const AboutTab = ({ user }: { user: any }) => (
  <ScrollView className="flex-1 bg-background">
    <View className="flex flex-col gap-4 pb-8">
      {/* Bio Section */}
      {user?.bio ? (
        <View>
          <View className="p-4">
            <Text variant="h4">About</Text>
          </View>
          <Separator />
          <View className="p-4">
            <SeeMoreText
              textClassname="text-sm leading-6 text-foreground"
              numberOfLines={4}
            >
              {user.bio}
            </SeeMoreText>
          </View>
        </View>
      ) : (
        <View className="p-4">
          <Text className="text-sm text-muted-foreground italic text-center">
            No bio added yet
          </Text>
        </View>
      )}

      {/* Links Section */}
      {(user?.website || user?.linkedin) && (
        <View className="flex flex-col gap-2">
          {user?.website && (
            <StablePressable
              className="bg-card border border-border p-4 flex-row items-center gap-3 rounded-lg"
              onPress={() => {
                if (user?.website) Linking.openURL(user?.website);
              }}
              onPressClassname="bg-muted"
            >
              <Icon as={Globe} size={20} className="text-primary" />
              <Text
                className="text-sm font-medium text-foreground flex-1"
                numberOfLines={1}
              >
                {user.website}
              </Text>
            </StablePressable>
          )}
          {user?.linkedin && (
            <StablePressable
              className="bg-card border border-border p-4 flex-row items-center gap-3 rounded-lg"
              onPress={() => {
                if (user?.linkedin) Linking.openURL(user?.linkedin);
              }}
              onPressClassname="bg-muted"
            >
              <Icon as={Linkedin} size={20} className="text-primary" />
              <Text className="text-sm font-medium text-foreground">
                LinkedIn Profile
              </Text>
            </StablePressable>
          )}
        </View>
      )}
    </View>
  </ScrollView>
);
