import React from "react";
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
  Clock3,
  MapPin,
  MessageSquare,
  XCircle,
} from "lucide-react-native";
import { Alert, View } from "react-native";
import { Loader } from "../shared/Loader";
import { useServerImages } from "@/hooks/content/useServerImages";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { useIdentifiedUser } from "@/hooks/content/users/useIdentifiedUser";
import { toDateOnly, toTimeOnly } from "@/lib/date";
import { RequestEvent, RequestStatus } from "@/types";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { toast } from "sonner-native";
import { RequestDetailsCard } from "./RequestDetailsCard";
import { StatusBadge } from "./RequestStatus";
import MapPinField from "../shared/form-builder/components/MapPinField";

interface RequestProps {
  id: string;
  className?: string;
}

export const Request = ({ id, className }: RequestProps) => {
  const { currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  // track which action is in flight so only that button spins
  const [pendingEvent, setPendingEvent] = React.useState<RequestEvent | null>(
    null,
  );

  const { data: request, isPending: isRequestPending } = useQuery({
    queryKey: ["request", id],
    queryFn: () =>
      api.request.findOneById(id, ["session", "session.user"].join(",")),
  });

  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: (event: RequestEvent) =>
      api.request.updateStatus(Number(id), event),
    onSuccess: (_data, event) => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success(
        event === RequestEvent.Accept ? "Demande acceptée" : "Demande refusée",
      );
    },
    onError: () => {
      Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.");
    },
    onSettled: () => setPendingEvent(null),
  });

  const runUpdate = (event: RequestEvent) => {
    setPendingEvent(event);
    updateStatus(event);
  };

  const handleAccept = () => {
    Alert.alert(
      "Accepter la demande",
      "Êtes-vous sûr de vouloir accepter cette demande de réunion ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Accepter",
          onPress: () => runUpdate(RequestEvent.Accept),
        },
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
          onPress: () => runUpdate(RequestEvent.Reject),
        },
      ],
    );
  };

  const { user, isUserPending } = useIdentifiedUser({
    id: request?.session?.user?.id!,
  });
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

  const { jsxArray: profilePictures, isPending: isProfilePicturesPending } =
    useServerImages({
      ids: [user?.pictureId],
      fallbacks: [fallback],
      wrapperClassName:
        "border border-border bg-background rounded-full shadow-md",
      size: { width: 80, height: 80 },
      enabled: !!user,
    });

  const isPending =
    isRequestPending || isUserPending || isProfilePicturesPending;

  const isOwner = currentUser?.id === request?.session?.user?.id;
  const isPendingStatus =
    !request?.status || request?.status === RequestStatus.Sent;

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
          <Loader className="flex flex-1 items-center justify-center" />
        ) : (
          <View className="flex flex-col gap-4">
            {/* Profile + Status */}
            <View className="items-start gap-3">
              {user && (
                <View className="flex flex-row items-center gap-2.5">
                  <View className="overflow-hidden rounded-full">
                    {profilePictures[0] ? profilePictures[0] : fallback}
                  </View>
                  <View>
                    <Text className="text-base font-bold text-foreground">
                      {identifyUser(user)}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {user?.email}
                    </Text>
                    <View>
                      <StatusBadge status={request?.status} />
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Details card */}
            <View className="gap-1 py-4">
              <RequestDetailsCard
                icon={MessageSquare}
                label="Message"
                value={request?.message}
                emptyText="Aucune description fournie"
              />

              <View className="my-3 h-px bg-border" />

              <RequestDetailsCard icon={Clock3} label="Date et heure">
                {request?.time ? (
                  <View className="flex-row items-baseline gap-1.5">
                    <Text className="text-sm font-medium text-foreground">
                      {toDateOnly(new Date(request.time))}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      · {toTimeOnly(new Date(request.time))}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-sm italic text-muted-foreground/70">
                    Non spécifié
                  </Text>
                )}
              </RequestDetailsCard>

              <View className="my-3 h-px bg-border" />

              <RequestDetailsCard
                icon={MapPin}
                label="Lieu"
                value={request?.location}
              />
              <MapPinField
                className="mt-4"
                placeholder="See the location on the map"
                value={request?.location}
                readOnly
              />
            </View>

            {/* Status info banners */}
            {request?.status === RequestStatus.Accepted && (
              <View className="flex-row items-center gap-2.5 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/20">
                <Icon as={Calendar} size={18} className="text-emerald-600" />
                <Text className="flex-1 text-sm text-emerald-700 dark:text-emerald-400">
                  Cette réunion a été ajoutée à votre programme.
                </Text>
              </View>
            )}

            {request?.status === RequestStatus.Rejected && (
              <View className="flex-row items-center gap-2.5 rounded-2xl bg-red-50 p-4 dark:bg-red-950/20">
                <Icon as={XCircle} size={18} className="text-red-600" />
                <Text className="flex-1 text-sm text-red-700 dark:text-red-400">
                  Cette demande de réunion a été refusée.
                </Text>
              </View>
            )}

            {/* Awaiting response — shown to the sender (session owner) */}
            {isPendingStatus && isOwner && (
              <View className="flex-row items-center gap-2.5 rounded-2xl bg-amber-50 p-4 dark:bg-amber-950/20">
                <Icon as={Clock3} size={18} className="text-amber-600" />
                <Text className="flex-1 text-sm text-amber-700 dark:text-amber-400">
                  En attente de la réponse du destinataire.
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {!isPending && !isOwner && isPendingStatus && (
        <View className="gap-3 border-t border-border bg-card p-8 pt-4">
          <Button
            size="lg"
            className="flex-row items-center justify-center gap-2 rounded-xl"
            onPress={handleAccept}
            disabled={isUpdating}
          >
            {pendingEvent === RequestEvent.Accept && <Loader size="small" />}
            <Text className="text-md font-bold">Accepter</Text>
          </Button>
          <Button
            size="lg"
            variant="destructive"
            className="flex-row items-center justify-center gap-2 rounded-xl"
            onPress={handleReject}
            disabled={isUpdating}
          >
            {pendingEvent === RequestEvent.Reject && <Loader size="small" />}
            <Text className="text-md font-bold">Refuser</Text>
          </Button>
        </View>
      )}
    </StableSafeAreaView>
  );
};
