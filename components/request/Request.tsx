import { api } from "@/api";
import { ApplicationHeader } from "@/components/shared/AppHeader";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
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
  Clock3,
  MapPin,
  MessageSquare,
  XCircle,
} from "lucide-react-native";
import { Alert, View } from "react-native";
import { Loader } from "../shared/Loader";
import { useServerImages } from "@/hooks/content/useServerImages";
import { identifyUser } from "@/lib/user";
import { useIdentifiedUser } from "@/hooks/content/users/useIdentifiedUser";
import { toDateOnly, toTimeOnly } from "@/lib/date";
import { RequestEvent, RequestStatus } from "@/types";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";

interface RequestProps {
  id: string;
  className?: string;
}

const StatusBadge = ({ status }: { status?: RequestStatus }) => {
  if (status === RequestStatus.Accepted) {
    return (
      <View className="flex-row items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-3 py-1">
        <Icon as={CheckCircle2} size={14} className="text-emerald-600" />
        <Text className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          Acceptée
        </Text>
      </View>
    );
  }

  if (status === RequestStatus.Rejected) {
    return (
      <View className="flex-row items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-950/40 px-3 py-1">
        <Icon as={XCircle} size={14} className="text-red-600" />
        <Text className="text-xs font-semibold text-red-700 dark:text-red-400">
          Refusée
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/40 px-3 py-1">
      <View className="h-2 w-2 rounded-full bg-amber-500" />
      <Text className="text-xs font-semibold text-amber-700 dark:text-amber-400">
        En attente
      </Text>
    </View>
  );
};

export const Request = ({ id, className }: RequestProps) => {
  const { currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const { data: request, isPending: isRequestPending } = useQuery({
    queryKey: ["request", id],
    queryFn: () =>
      api.request.findOneById(id, ["session", "session.user"].join(",")),
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
      size: { width: 80, height: 80 },
      enabled: !!user,
    });

  const isPending =
    isRequestPending || isUserPending || isProfilePicturesPending;

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={"Demande de réunion"}
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
      <View className="flex-1 bg-background px-4 pt-6">
        {isPending ? (
          <Loader className="flex flex-1 justify-center items-center" />
        ) : (
          <View className="flex flex-col gap-6">
            {/* Profile + Status */}
            <View className="items-center gap-3 pb-2">
              {user && (
                <>
                  <View className="overflow-hidden rounded-full bg-muted">
                    {profilePictures[0]}
                  </View>
                  <Text className="text-xl font-bold text-foreground">
                    {identifyUser(user)}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {user?.email}
                  </Text>
                </>
              )}
              <StatusBadge status={request?.status} />
            </View>

            {/* Details card */}
            <View className="rounded-2xl bg-card border border-border p-4 gap-4">
              {/* Message */}
              <View className="flex-row items-start gap-3">
                <Icon
                  as={MessageSquare}
                  size={18}
                  className="text-muted-foreground mt-0.5"
                />
                <View className="flex-1">
                  <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Message
                  </Text>
                  <Text className="text-sm text-foreground leading-5">
                    {request?.message || "Aucune description fournie"}
                  </Text>
                </View>
              </View>

              <View className="h-px bg-border" />

              {/* Time */}
              <View className="flex-row items-start gap-3">
                <Icon
                  as={Clock3}
                  size={18}
                  className="text-muted-foreground mt-0.5"
                />
                <View className="flex-1">
                  <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Date et heure
                  </Text>
                  {request?.time ? (
                    <Text className="text-sm text-foreground">
                      {toDateOnly(new Date(request.time))} ·{" "}
                      {toTimeOnly(new Date(request.time))}
                    </Text>
                  ) : (
                    <Text className="text-sm text-muted-foreground">
                      Non spécifié
                    </Text>
                  )}
                </View>
              </View>

              <View className="h-px bg-border" />

              {/* Location */}
              <View className="flex-row items-start gap-3">
                <Icon
                  as={MapPin}
                  size={18}
                  className="text-muted-foreground mt-0.5"
                />
                <View className="flex-1">
                  <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Lieu
                  </Text>
                  <Text className="text-sm text-foreground">
                    {request?.location || "Non spécifié"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Status info banner */}
            {request?.status === RequestStatus.Accepted && (
              <View className="flex-row items-center gap-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 p-4">
                <Icon as={Calendar} size={18} className="text-emerald-600" />
                <Text className="text-sm text-emerald-700 dark:text-emerald-400 flex-1">
                  Cette réunion a été ajoutée à votre programme.
                </Text>
              </View>
            )}

            {request?.status === RequestStatus.Rejected && (
              <View className="flex-row items-center gap-2.5 rounded-2xl bg-red-50 dark:bg-red-950/20 p-4">
                <Icon as={XCircle} size={18} className="text-red-600" />
                <Text className="text-sm text-red-700 dark:text-red-400 flex-1">
                  Vous avez refusé cette demande de réunion.
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
      {!isPending &&
        currentUser?.id !== request?.session?.user?.id &&
        (!request?.status || request?.status === RequestStatus.Sent) && (
          <View className="border-t border-border bg-card p-8 pt-4 gap-4">
            <View className="flex flex-col justify-between gap-2">
              <Button
                size="lg"
                className="rounded-xl"
                variant="destructive"
                onPress={handleReject}
                disabled={isUpdating}
              >
                <Text className="text-md font-bold">Refuser</Text>
              </Button>
              <Button
                size="lg"
                className="rounded-xl"
                onPress={handleAccept}
                disabled={isUpdating}
              >
                <Text className="text-md font-bold">Accepter</Text>
              </Button>
            </View>
          </View>
        )}
    </StableSafeAreaView>
  );
};
