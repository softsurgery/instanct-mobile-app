import { ApplicationHeader } from "@/components/shared/AppHeader";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import StableScrollView from "@/components/shared/StableScrollView";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  Check,
  CircleArrowDown,
  CircleHelp,
  Clock3,
  EllipsisVertical,
  MapPin,
  X,
} from "lucide-react-native";
import { View } from "react-native";

interface RequestProps {
  className?: string;
}

export const Request = ({ className }: RequestProps) => {
  return (
    <StableSafeAreaView className={cn("flex-1", className)}>
      <ApplicationHeader
        className="border-b border-border pb-2 bg-transparent"
        title={<Icon as={EllipsisVertical} size={28} onPress={() => {}} />}
        reverse
        shortcuts={[
          {
            key: "back",
            icon: ArrowLeft,
            onPress: () => router.back(),
          },
        ]}
      />

      <StableScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-2xl border border-border bg-muted/30 p-5">
          <Text className="text-sm font-semibold text-foreground">
            Acceptez cette réunion pour l&apos;ajouter à votre programme.
          </Text>

          <View className="mt-2 gap-2">
            <Button className="bg-emerald-600" size={"sm"} onPress={() => {}}>
              <Icon as={Check} size={20} color="white" />
              <Text className="text-sm text-white">Accepter</Text>
            </Button>
            <Button size={"sm"} variant={"destructive"} onPress={() => {}}>
              <Icon as={X} size={20} color="white" />
              <Text className="text-sm text-white">Refuser</Text>
            </Button>
          </View>
        </View>

        <View className="mt-5">
          <Text className="text-lg font-semibold text-foreground">
            Partenaire de réunion
          </Text>

          <View className="mt-4 flex-row items-center gap-4 rounded-2xl border border-border bg-muted/10 p-4">
            <View>
              <View className="h-16 w-16 overflow-hidden rounded-full border border-border/50">
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
                  }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              </View>
              <View className="absolute -bottom-0.5 right-0 h-4 w-4 rounded-full border-2 border-background bg-emerald-500" />
            </View>

            <View className="flex-1">
              <Text className="text-lg font-semibold leading-10 text-foreground">
                Kateryna Pylypchuk
              </Text>
              <Text className="mt-1 text-base text-foreground/80">
                Strategist · Modulina Straw Panels · Lithuania
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-4">
          <Text className="text-lg font-semibold text-foreground">
            Heure et lieu
          </Text>
          <View className="mt-4 gap-3">
            <View className="flex-row items-center gap-3">
              <Icon as={Calendar} size={24} />
              <Text className="text-lg text-foreground">
                mardi 10 mars 2026
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Icon as={Clock3} size={24} />
              <Text className="text-md text-foreground">13:50–14:10</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Icon as={MapPin} size={24} />
              <Text className="text-md text-foreground">
                FIABCI matchmaking area
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-10">
          <Text className="text-lg font-semibold text-foreground">Statut</Text>
          <View className="mt-4 gap-3">
            <View className="flex-row items-center gap-3">
              <Icon as={CircleHelp} size={24} />
              <Text className="text-md text-foreground">
                En attente d&apos;une réponse
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Icon as={CircleArrowDown} size={24} />
              <Text className="text-md text-foreground">
                Réunion demandée par Kateryna
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-10 pb-10">
          <Text className="text-lg font-semibold text-foreground">
            Description du rendez-vous
          </Text>
          <Text className="mt-4 text-sm leading-2 text-foreground">
            I would like to discuss the possibilities of use of the circular
            materials such as Modulina straw panels for the walls of the future
            buildings in the newly built area. To explore the opportunity of
            implication of the prefabricated circular materials in the projects
            in Tunisia.
          </Text>
        </View>
      </StableScrollView>
    </StableSafeAreaView>
  );
};
