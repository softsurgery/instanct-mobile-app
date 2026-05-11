import { api } from "@/api";
import { ApplicationHeader } from "@/components/shared/AppHeader";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import StableScrollView from "@/components/shared/StableScrollView";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  ArrowLeft,
  Check,
  CircleArrowDown,
  CircleHelp,
  Clock3,
  MapPin,
  X,
} from "lucide-react-native";
import { View } from "react-native";
import { Loader } from "../shared/Loader";
import { useServerImages } from "@/hooks/content/useServerImages";
import { identifyUser } from "@/lib/user";
import { useIdentifiedUser } from "@/hooks/content/users/useIdentifiedUser";
import { toDateOnly, toTimeOnly } from "@/lib/date";

interface RequestProps {
  id: string;
  className?: string;
}

export const Request = ({ id, className }: RequestProps) => {
  const { data: request, isPending: isRequestPending } = useQuery({
    queryKey: ["request", id],
    queryFn: () => api.request.findOneById(id, ["session.user"].join(",")),
  });

  const { user, isUserPending } = useIdentifiedUser({
    id: request?.session?.user?.id!,
  });

  const { jsxArray: profilePictures, isPending: isProfilePicturesPending } =
    useServerImages({
      ids: [user?.pictureId],
      fallbacks: [identifyUser(user)],
      wrapperClassName:
        "border border-border bg-background rounded-full shadow-md",
      size: { width: 70, height: 70 },
      enabled: !!user,
    });

  const isPending =
    isRequestPending || isUserPending || isProfilePicturesPending;

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2 bg-transparent" }}
        title={"Answer request"}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            icon: ArrowLeft,
            onPress: () => {
              router.back();
            },
          },
        ]}
      />
      <View className="flex-1 bg-background">
        <StableScrollView className="px-4 pt-4">
          {isPending ? (
            <Loader className="flex flex-1 justify-center items-center" />
          ) : (
            <View className="flex flex-col gap-8">
              <View>
                <Text className="text-lg font-semibold text-foreground">
                  Partenaire de réunion
                </Text>

                {user && (
                  <View
                    key={user.id}
                    className="mt-4 flex-row items-center gap-4"
                  >
                    <View className="overflow-hidden rounded-full bg-muted">
                      {profilePictures[0]}
                    </View>

                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-foreground">
                        {identifyUser(user)}
                      </Text>
                      <Text className="text-lg opacity-50">{user?.email}</Text>
                    </View>
                  </View>
                )}
              </View>
              {/* Status */}
              <View>
                <Text className="text-lg font-semibold text-foreground">
                  Statut
                </Text>
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
                      {user
                        ? `Réunion demandée par ${identifyUser(user)}`
                        : "Réunion demandée"}
                    </Text>
                  </View>
                </View>
              </View>
              {/* description */}
              <View>
                <Text className="text-lg font-semibold text-foreground">
                  Description du rendez-vous
                </Text>
                <Text className="mt-4 text-sm leading-2 text-foreground">
                  {request?.message || "Aucune description fournie"}
                </Text>
              </View>
              {/* details */}
              <View>
                <Text className="text-lg font-semibold text-foreground">
                  Heure et lieu
                </Text>
                <View className="mt-4 gap-3">
                  <View className="flex-row items-center gap-3">
                    <Icon as={Clock3} size={24} />
                    <View className="flex-1">
                      {request?.time && (
                        <>
                          <Text className="text-md text-foreground">
                            {toDateOnly(new Date(request.time))}
                          </Text>
                          <Text className="text-sm text-foreground opacity-75">
                            {toTimeOnly(new Date(request.time))}
                          </Text>
                        </>
                      )}
                      {!request?.time && (
                        <Text className="text-md text-foreground opacity-50">
                          Non spécifié
                        </Text>
                      )}
                    </View>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Icon as={MapPin} size={24} />
                    <Text className="text-md text-foreground">
                      {request?.location || "Non spécifié"}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="rounded-2xl border border-border bg-muted/30 p-5">
                <Text className="text-sm font-semibold text-foreground">
                  Acceptez cette réunion pour l&apos;ajouter à votre programme.
                </Text>

                <View className="mt-2 gap-2">
                  <Button
                    className="bg-emerald-600"
                    size={"sm"}
                    onPress={() => {}}
                  >
                    <Icon as={Check} size={20} color="white" />
                    <Text className="text-sm text-white">Accepter</Text>
                  </Button>
                  <Button
                    size={"sm"}
                    variant={"destructive"}
                    onPress={() => {}}
                  >
                    <Icon as={X} size={20} color="white" />
                    <Text className="text-sm text-white">Refuser</Text>
                  </Button>
                </View>
              </View>
            </View>
          )}
        </StableScrollView>
      </View>
    </StableSafeAreaView>
  );
};
