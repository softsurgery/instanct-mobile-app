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

export const DemmandePortal = () => {
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
          <View className="h-16 w-16 overflow-hidden rounded-full bg-muted">
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=300&q=80",
              }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </View>

          <View className="flex-1">
            <Text className="text-lg font-semibold leading-10 text-foreground">
              Yasser Al Jaidah
            </Text>
            <Text className="mt-1 text-lg leading-8 text-foreground/80">
              United Development Company
            </Text>
          </View>
        </View>

        <View className="mt-6">
          <View className="relative">
            <Input
              className="text-lg"
              placeholder="Ajouter des partenaires de rendez-vous"
              editable={false}
            />
            <View className="absolute inset-y-0 right-4 items-center justify-center">
              <Icon as={Search} size={18} />
            </View>
          </View>
          <Text className="mt-2 text-xs text-muted-foreground">
            Vous pouvez ajouter 2 partenaires de réunion supplémentaires.
          </Text>
        </View>

        <View className="mt-6">
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
