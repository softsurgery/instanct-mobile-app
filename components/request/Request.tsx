import { api } from "@/api";
import { ApplicationHeader } from "@/components/shared/AppHeader";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import StableScrollView from "@/components/shared/StableScrollView";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CircleArrowDown,
  CircleHelp,
  Clock3,
  MapPin,
  XCircle,
} from "lucide-react-native";
import { Alert, View } from "react-native";
import { Loader } from "../shared/Loader";
import { useServerImages } from "@/hooks/content/useServerImages";
import { identifyUser } from "@/lib/user";
import { useIdentifiedUser } from "@/hooks/content/users/useIdentifiedUser";
import { toDateOnly, toTimeOnly } from "@/lib/date";
import { RequestEvent, RequestStatus } from "@/types";

interface RequestProps {
  id: string;
  className?: string;
}

export const Request = ({ id, className }: RequestProps) => {
  const queryClient = useQueryClient();

  const { data: request, isPending: isRequestPending } = useQuery({
    queryKey: ["request", id],
    queryFn: () => api.request.findOneById(id, ["session.user"].join(",")),
  });

  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: (event: RequestEvent) =>
      api.request.updateStatus(Number(id), event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: () => {
      Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.");
    },
  });

  const handleAccept = () => {
    Alert.alert(
      "Accepter la demande",
      "Êtes-vous sûr de vouloir accepter cette demande de réunion ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Accepter", onPress: () => updateStatus(RequestEvent.Accept) },
      ],
    );
  };

  const handleReject = () => {
    Alert.alert(
      "Refuser la demande",
      "Êtes-vous sûr de vouloir refuser cette demande de réunion ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Refuser",
          style: "destructive",
          onPress: () => updateStatus(RequestEvent.Reject),
        },
      ],
    );
  };

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
                  {request?.status === RequestStatus.Accepted && (
                    <View className="flex-row items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3">
                      <Icon
                        as={CheckCircle2}
                        size={24}
                        className="text-emerald-600"
                      />
                      <Text className="text-md text-emerald-700 dark:text-emerald-400 font-medium">
                        Demande acceptée
                      </Text>
                    </View>
                  )}
                  {request?.status === RequestStatus.Rejected && (
                    <View className="flex-row items-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/30 p-3">
                      <Icon as={XCircle} size={24} className="text-red-600" />
                      <Text className="text-md text-red-700 dark:text-red-400 font-medium">
                        Demande refusée
                      </Text>
                    </View>
                  )}
                  {(!request?.status ||
                    request?.status === RequestStatus.Sent) && (
                    <>
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
                    </>
                  )}
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
                <View className="flex flex-row justify-between mt-4">
                  <View className="flex-row items-center gap-3">
                    <Icon as={Clock3} size={24} />
                    <View className="flex-1">
                      {!request?.time && (
                        <Text className="text-md text-foreground opacity-50">
                          Non spécifié
                        </Text>
                      )}
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

              {request?.status === RequestStatus.Accepted && (
                <View className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-5">
                  <View className="flex-row items-center gap-2">
                    <Icon
                      as={Calendar}
                      size={20}
                      className="text-emerald-600"
                    />
                    <Text className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      Cette réunion a été ajoutée à votre programme.
                    </Text>
                  </View>
                </View>
              )}

              {request?.status === RequestStatus.Rejected && (
                <View className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-5">
                  <Text className="text-sm font-semibold text-red-700 dark:text-red-400">
                    Vous avez refusé cette demande de réunion.
                  </Text>
                </View>
              )}

              <Text className="text-sm text-white">{request?.status}</Text>
            </View>
          )}
        </StableScrollView>
      </View>
      {!isPending && (
        <View className="border-t border-border bg-card p-8 pt-4 gap-4">
          <View className="flex flex-col justify-between gap-2">
            {(!request?.status || request?.status === RequestStatus.Sent) && (
              <>
                <Button
                  size="lg"
                  className="rounded-xl"
                  onPress={handleAccept}
                  disabled={isUpdating}
                >
                  <Text className="text-md font-bold">Accepter</Text>
                </Button>
                <Button
                  size="lg"
                  className="rounded-xl"
                  variant="destructive"
                  onPress={handleReject}
                  disabled={isUpdating}
                >
                  <Text className="text-md font-bold">Refuser</Text>
                </Button>
              </>
            )}
          </View>
        </View>
      )}
    </StableSafeAreaView>
  );
};
