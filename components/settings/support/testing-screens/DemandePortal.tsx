import React from "react";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import StableScrollView from "@/components/shared/StableScrollView";
import { ChoicePicker } from "@/components/shared/ChoicePicker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { Image } from "expo-image";
import { Search, X } from "lucide-react-native";
import { View } from "react-native";
import { ApplicationHeader } from "@/components/shared/AppHeader";
import { router } from "expo-router";
import { useIdentifiedUser } from "@/hooks/content/users/useIdentifiedUser";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { useServerImages } from "@/hooks/content/useServerImages";
import { Label } from "@/components/ui/label";

interface DemmandePortalProps {
  className?: string;
  id: string;
}

export const DemmandePortal = ({ className, id }: DemmandePortalProps) => {
  const { user } = useIdentifiedUser({ id });

  const identity = React.useMemo(() => identifyUser(user), [user]);
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

  const { jsxArray: profilePictures } = useServerImages({
    ids: [user?.pictureId],
    fallbacks: [fallback],
    wrapperClassName:
      "border border-border bg-background rounded-full shadow-md",
    size: { width: 70, height: 70 },
    enabled: !!user,
  });

  const [checked, setChecked] = React.useState(false);
  const [meetingChoice, setMeetingChoice] = React.useState("partner_decides");
  return (
    <StableSafeAreaView className="flex-1">
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
        title={"Demande de rendez-vous"}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            icon: X,
            onPress: () => router.back(),
          },
        ]}
      />

      <StableScrollView
        className="flex-1 bg-background px-4 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-lg font-semibold text-foreground">
          Partenaire de réunion
        </Text>

        <View className="mt-4 flex-row items-center gap-4">
          <View className="overflow-hidden rounded-full bg-muted">
            {profilePictures}
          </View>

          <View className="flex-1">
            <Text className="text-lg font-semibold leading-10 text-foreground">
              {identity}
            </Text>
            <Text className="text-lg leading-8 opacity-50">{user?.email}</Text>
          </View>
        </View>

        <View className="flex flex-col gap-2 mt-6">
          <Label>Message</Label>
          <Textarea className="h-40 px-4 py-4" />
          <Text className="mt-2 text-xs text-muted-foreground">
            Veuillez limiter le nombre de caractères à 280.
          </Text>
        </View>

        <View className="mt-4 flex-row items-start gap-3">
          <View className="mt-1 h-8 w-8 items-center justify-center">
            <Checkbox checked={checked} onCheckedChange={setChecked} />
          </View>
          <Text className="flex-1 text-md">
            Envoyez également la description du rendez-vous comme un message
          </Text>
        </View>

        <View className="mt-4">
          <Text className="text-lg font-semibold text-foreground">
            Heure et lieu
          </Text>

          <ChoicePicker
            className="my-4"
            value={meetingChoice}
            onChange={setMeetingChoice}
            options={[
              {
                value: "partner_decides",
                label:
                  "Laisser mon partenaire de réunion décider quand et où se rencontrer",
              },
              {
                value: "preferred_time_place",
                label: "Spécifiez une heure et un lieu préférés",
              },
            ]}
          />
        </View>
      </StableScrollView>
      <View className="py-6 border-t border-border">
        <Button size={"sm"} className="mx-6 mb-4 rounded-full">
          <Text>Envoyer une demande</Text>
        </Button>
      </View>
    </StableSafeAreaView>
  );
};
