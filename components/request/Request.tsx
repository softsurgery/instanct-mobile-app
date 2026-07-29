import React from "react";
import { api } from "@/api";
import { ApplicationHeader } from "@/components/shared/AppHeader";
import { StableSafeAreaView } from "@/components/shared/StableSafeAreaView";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  CheckCheck,
  Clock3,
  MessageSquare,
  XCircle,
} from "lucide-react-native";
import { View } from "react-native";
import { type ActionSheetRef } from "react-native-actions-sheet";
import { useTranslation } from "react-i18next";
import { Loader } from "@/components/shared/Loader";
import { useServerImages } from "@/hooks/content/useServerImages";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { useIdentifiedUser } from "@/hooks/content/users/useIdentifiedUser";
import { toDateOnly, toTimeOnly } from "@/lib/date";
import { RequestEvent, RequestStatus } from "@/types";
import { toast } from "sonner-native";
import { RequestDetailsCard } from "./RequestDetailsCard";
import { RequestLocationSection } from "./RequestLocationSection";
import { RequestSkeleton } from "./RequestSkeleton";
import { StatusBadge } from "./RequestStatus";
import { AppHeaderBack } from "@/components/shared/AppHeaderBack";
import { RequestConfirmActionSheet } from "./RequestConfirmActionSheet";

interface RequestProps {
  id: string;
  isIncoming?: boolean;
  className?: string;
}

export const Request = ({ id, className, isIncoming }: RequestProps) => {
  const { t } = useTranslation("activities");
  const queryClient = useQueryClient();

  const [confirmEvent, setConfirmEvent] = React.useState<RequestEvent | null>(
    null,
  );
  const confirmSheetRef = React.useRef<ActionSheetRef>(null);

  const { data: request, isPending: isRequestPending } = useQuery({
    queryKey: ["request", id],
    queryFn: () =>
      api.request.findOneById(
        id,
        ["session", "session.user", "receivers"].join(","),
      ),
  });

  const receiver = request?.receivers?.[0];
  const displayUserId = isIncoming ? request?.session?.user?.id : receiver?.id;
  const isPendingStatus =
    !request?.status || request?.status === RequestStatus.Sent;

  const { mutate: updateLocation, isPending: isUpdatingLocation } = useMutation(
    {
      mutationFn: (payload: {
        location: string;
        latitude: number;
        longitude: number;
      }) => api.request.update(id, payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["request", id] });
        queryClient.invalidateQueries({ queryKey: ["requests"] });
        toast.success(t("activities.request.toasts.locationUpdated"));
      },
      onError: () => {
        toast.error(t("activities.request.toasts.locationError"));
      },
    },
  );

  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: (event: RequestEvent) =>
      api.request.updateStatus(Number(id), event),
    onSuccess: (_data, event) => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success(
        event === RequestEvent.Accept
          ? t("activities.incomming.request.toasts.accepted")
          : t("activities.incomming.request.toasts.rejected"),
      );
    },
    onError: () => {
      toast.error(t("activities.request.toasts.error"));
    },
  });

  const handleConfirmClose = () => {
    confirmSheetRef.current?.hide();
    setConfirmEvent(null);
  };

  const handleConfirm = () => {
    if (!confirmEvent) return;
    const event = confirmEvent;
    handleConfirmClose();
    updateStatus(event);
  };

  const askConfirmation = (event: RequestEvent) => {
    setConfirmEvent(event);
    confirmSheetRef.current?.show();
  };

  const { user, isUserPending } = useIdentifiedUser({
    id: displayUserId!,
  });
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

  const { jsxArray: profilePictures } = useServerImages({
    ids: [user?.pictureId],
    fallbacks: [fallback],
    wrapperClassName:
      "border border-border bg-background rounded-full shadow-md",
    size: { width: 80, height: 80 },
  });

  const editable =
    request?.status === RequestStatus.Accepted ||
    request?.status === RequestStatus.Rejected
      ? false
      : true;

  const isPending = isRequestPending || isUserPending;

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("activities.request.title")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            render: <AppHeaderBack />,
          },
        ]}
      />
      <View className="flex-1 bg-background px-4">
        {isPending ? (
          <RequestSkeleton />
        ) : (
          <View className="flex flex-col gap-4">
            <View className="p-4">
              {user && (
                <View className="flex flex-row items-center gap-3">
                  <View className="overflow-hidden rounded-full">
                    {profilePictures[0] ? profilePictures[0] : fallback}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-foreground">
                      {identifyUser(user)}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {user?.email}
                    </Text>
                    <View className="mt-1">
                      <StatusBadge status={request?.status} />
                    </View>
                  </View>
                </View>
              )}
            </View>

            <View className="flex flex-col gap-4">
              <RequestDetailsCard
                icon={MessageSquare}
                label={t("activities.request.labels.message")}
                value={request?.message}
                emptyText={t("activities.request.placeholders.message")}
              />

              <RequestDetailsCard
                icon={Clock3}
                label={t("activities.request.labels.dateTime")}
              >
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
                    {t("activities.request.placeholders.dateTime")}
                  </Text>
                )}
              </RequestDetailsCard>

              <RequestLocationSection
                location={request?.location}
                latitude={request?.latitude}
                longitude={request?.longitude}
                editable={editable}
              />

              {isUpdatingLocation && (
                <View className="mt-3 flex-row items-center gap-2">
                  <Loader size="small" />
                  <Text className="text-sm text-muted-foreground">
                    {t("activities.request.location.updating")}
                  </Text>
                </View>
              )}
            </View>

            {request?.status === RequestStatus.Accepted && (
              <View className="flex-row items-center gap-2.5 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/20">
                <Icon as={Calendar} size={18} className="text-emerald-600" />
                <Text className="flex-1 text-sm text-emerald-700 dark:text-emerald-400">
                  {t("activities.request.banners.accepted")}
                </Text>
              </View>
            )}

            {request?.status === RequestStatus.Rejected && (
              <View className="flex-row items-center gap-2.5 rounded-2xl bg-red-50 p-4 dark:bg-red-950/20">
                <Icon as={XCircle} size={18} className="text-red-600" />
                <Text className="flex-1 text-sm text-red-700 dark:text-red-400">
                  {t("activities.request.banners.rejected")}
                </Text>
              </View>
            )}

            {isPendingStatus && !isIncoming && (
              <View className="flex-row items-center gap-2.5 rounded-2xl bg-amber-50 p-4 dark:bg-amber-950/20">
                <Icon as={Clock3} size={18} className="text-amber-600" />
                <Text className="flex-1 text-sm text-amber-700 dark:text-amber-400">
                  {t("activities.outgoing.request.banners.pending")}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {!isPending && isIncoming && isPendingStatus && (
        <View className="gap-3 border-t border-border bg-card p-8 pt-4">
          <Button
            size="lg"
            className="flex-row items-center justify-center gap-2 rounded-xl bg-emerald-600 active:bg-emerald-500"
            onPress={() => askConfirmation(RequestEvent.Accept)}
            disabled={isUpdating}
          >
            <Icon as={CheckCheck} size={24} />
            <Text className="text-md font-bold">
              {t("activities.incomming.request.actions.accept")}
            </Text>
          </Button>
          <Button
            size="lg"
            variant="destructive"
            className="flex-row items-center justify-center gap-2 rounded-xl active:bg-red-500"
            onPress={() => askConfirmation(RequestEvent.Reject)}
            disabled={isUpdating}
          >
            <Icon as={XCircle} size={24} />
            <Text className="text-md font-bold">
              {t("activities.incomming.request.actions.reject")}
            </Text>
          </Button>
        </View>
      )}

      <RequestConfirmActionSheet
        ref={confirmSheetRef}
        event={confirmEvent}
        onConfirm={handleConfirm}
        onClose={handleConfirmClose}
        isPending={isUpdating}
      />
    </StableSafeAreaView>
  );
};
