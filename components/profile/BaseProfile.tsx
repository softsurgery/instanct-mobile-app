import React from "react";
import { Text } from "@/components/ui/text";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useEducations } from "@/hooks/content/users/useEducations";
import { useExperiences } from "@/hooks/content/users/useExperiences";
import { useIdentifiedUser } from "@/hooks/content/users/useIdentifiedUser";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { cn } from "@/lib/utils";
import { createClientStore, useUserStore } from "@/stores/useUserStore";
import {
  ResponseEducationDto,
  ResponseExperienceDto,
  ResponseRefParamDto,
  ServerErrorResponse,
  UpdateUserCoverDto,
  Upload,
} from "@/types";
import { format } from "date-fns";
import { useNavigation } from "expo-router";
import { Image, Pressable, View } from "react-native";
import { SeeMoreText } from "../shared/SeeMoreText";
import { Badge } from "../ui/badge";
import { ProfileStat } from "./ProfileStat";
import { useUserIndustries } from "@/hooks/content/users/useUserIndustries";
import { useIndustries } from "@/hooks/content/reference-types/useIndustries";
import { useServerImages } from "@/hooks/content/useServerImages";
import { BaseProfileSkeleton } from "./BaseProfileSkeleton";
import { Loader } from "../shared/Loader";
import { useDebounce } from "@/hooks/useDebounce";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { AboutTab } from "./sections/AboutTab";
import { ExperienceTab } from "./sections/ExperienceTab";
import { InterestsTab } from "./sections/InterestsTab";
import { RenderSection } from "./sections/RenderSection";
import { ProfilePhotoPreview } from "../shared/ProfilePhotoPreview";
import { useUploadMutation } from "@/hooks/useUploadMutation";
import { toast } from "sonner-native";
import { api } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { Skeleton } from "../ui/skeleton";

interface ProfileSection<T = unknown> {
  key: string;
  title: string;
  data: T[];
  editable: boolean;
  color?: string;
  renderItem: (item: any) => React.ReactNode;
}

interface InspectBaseProfileProps {
  className?: string;
  id: string;
  coverExtra?: React.ReactNode;
}

export const InspectBaseProfile = ({
  className,
  id,
  coverExtra,
}: InspectBaseProfileProps) => {
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  const storeRef = React.useRef(createClientStore());
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const { loading: isRefreshDebounced } = useDebounce(isRefreshing, 500);

  const userStore = useUserStore();

  // user side-effects
  const { currentUser, refetchCurrentUser } = useCurrentUser();
  const { user, isUserPending, refetchUser } = useIdentifiedUser({ id });
  React.useEffect(() => {
    if (user) userStore?.set("response", user);
    navigation.setOptions({
      title: user?.username,
    });
  }, [user]);

  // experience side-effects
  const { experiences, isExperiencesPending, refetchExperiences } =
    useExperiences({ id, enabled: !!user });
  React.useEffect(() => {
    if (experiences) userStore?.set("experiences", experiences);
  }, [experiences]);

  // education side-effects
  const { educations, isEducationsPending, refetchEducations } = useEducations({
    id,
    enabled: !!user,
  });
  React.useEffect(() => {
    if (educations) userStore?.set("educations", educations);
  }, [educations]);

  // industries side-effects
  const { userIndustries, isUserIndustriesPending, refetchUserIndustries } =
    useUserIndustries({ userId: id, enabled: !!user });

  const { industries, isIndustriesSubTypePending } = useIndustries({
    enabled: !!user,
  });

  const identity = React.useMemo(() => identifyUser(user), [user]);
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

  //profile picture side-effect
  const { uploads: profileUploads, jsxArray: profilePictures } =
    useServerImages({
      ids: [user?.pictureId],
      fallbacks: [fallback, ""],
      wrapperClassName:
        "border border-border bg-background rounded-full shadow-md",
      size: { width: 100, height: 100 },
      enabled: !!user && !!user.pictureId,
    });
  const profilePictureSource = profileUploads?.[0];

  // cover picture side-effect
  const { uploads: coverUploads, isPending: isCoverPending } = useServerImages({
    ids: [user?.coverId],
    fallbacks: [""],
    wrapperClassName: "",
    size: { width: 100, height: 100 },
    enabled: !!user && !!user.coverId,
  });
  const coverSource = coverUploads?.[0];

  const { uploadFiles: uploadCover, isUploadPending: isCoverUploadPending } =
    useUploadMutation({
      onSuccess: (response: Upload[]) => {
        const coverId = response?.[0]?.id;
        if (coverId) {
          updateUserCover({ coverId: coverId });
        }
      },
      onError: (error: ServerErrorResponse) => {
        toast.error(
          error.response?.data?.message || "Failed to upload image",
          {},
        );
      },
    });

  const { mutate: updateUserCover, isPending: isUpdateCoverPending } =
    useMutation({
      mutationFn: (coverDto: UpdateUserCoverDto) =>
        api.user.updateCover(coverDto),
      onSuccess: () => {
        toast.success("Cover updated successfully", {
          description: "Your cover has been successfully updated.",
        });
        userStore.reset();
        queryClient.invalidateQueries({ queryKey: ["user", currentUser?.id] });
        queryClient.invalidateQueries({ queryKey: ["current-user"] });
        queryClient.invalidateQueries({
          queryKey: ["server-image", currentUser?.coverId],
        });
        refetchCurrentUser();
      },
      onError: (error: ServerErrorResponse) => {
        toast.error(
          error.response?.data?.message || "Failed to update cover",
          {},
        );
      },
    });

  React.useEffect(() => {
    return () => {
      userStore?.reset();
      storeRef.current = null as any;
    };
  }, []);

  const handleCoverPress = async () => {
    if (currentUser?.id !== id) return; // Prevent others from updating

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const fileLike = {
        uri: asset.uri,
        name: asset.uri.split("/").pop() || "cover.jpg",
        type: asset.type || "image/jpeg",
      } as unknown as File;
      uploadCover({ files: [fileLike] });
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.allSettled([
      refetchUser(),
      refetchCurrentUser(),
      refetchExperiences(),
      refetchEducations(),
      refetchUserIndustries(),
    ]);
    setIsRefreshing(false);
  };

  const isInitialLoading =
    isRefreshDebounced ||
    isUserPending ||
    isExperiencesPending ||
    isEducationsPending ||
    isIndustriesSubTypePending ||
    isUserIndustriesPending;

  // ---------------------------------------------------------------
  //  PROFILE SECTIONS CONFIG
  // ---------------------------------------------------------------
  const profileSections: ProfileSection[] = React.useMemo(
    () => [
      {
        key: "experience",
        title: "Experience",
        data: experiences as unknown[],
        editable: currentUser?.id === user?.id,
        renderItem: (experience: ResponseExperienceDto) => (
          <View className="flex flex-col mb-4 mt-2">
            <Text className="font-semibold">{experience.title}</Text>
            <Text className="text-sm text-muted-foreground font-bold">
              {experience.company}
            </Text>
            <Text className="text-xs text-muted-foreground my-1">
              {format(new Date(experience.startDate!), "MMM yyyy")} —{" "}
              {format(new Date(experience.endDate!), "MMM yyyy")}
            </Text>
            <SeeMoreText textClassname="text-sm" numberOfLines={2}>
              {experience.description || "No description provided."}
            </SeeMoreText>
          </View>
        ),
      },
      {
        key: "education",
        title: "Education",
        data: educations as unknown[],
        editable: currentUser?.id === user?.id,
        renderItem: (education: ResponseEducationDto) => (
          <View className="flex flex-col mb-4 gap-4">
            <Text className="font-semibold">{education.title}</Text>
            <Text className="text-sm text-muted-foreground">
              {education.institution}
            </Text>
            <SeeMoreText textClassname="text-sm" numberOfLines={2}>
              {education.description || "No description provided."}
            </SeeMoreText>
          </View>
        ),
      },
      {
        key: "industries",
        title: "Industries",
        data: industries.filter((industry) =>
          userIndustries?.some((id) => id === industry.id),
        ) as unknown[],
        editable: currentUser?.id === user?.id,
        renderItem: (industry: ResponseRefParamDto) => (
          <Badge variant={"outline"} className={cn("px-2 py-1 rounded-full")}>
            <Text className="text-xs">{industry.label}</Text>
          </Badge>
        ),
      },
    ],
    [
      experiences,
      educations,
      industries,
      userIndustries,
      currentUser?.id,
      user?.id,
    ],
  );

  const Tab = createMaterialTopTabNavigator();

  return (
    <View className={cn("flex-1 bg-background", className)}>
      <View className="absolute top-2 left-0 right-0 items-center z-20 pointer-events-none">
        <Loader isPending={isRefreshing} size="small" />
      </View>

      {isInitialLoading ? (
        <BaseProfileSkeleton className={className} />
      ) : (
        <>
          {/* Cover */}
          {!isCoverPending ? (
            <Pressable
              className="active:opacity-70 relative w-full h-48 overflow-hidden"
              onPress={handleCoverPress}
              disabled={
                currentUser?.id !== id ||
                isCoverUploadPending ||
                isUpdateCoverPending
              }
            >
              <Image
                source={
                  coverSource
                    ? { uri: coverSource }
                    : require("@/assets/images/partial-react-logo.png")
                }
                className="w-full h-full opacity-70"
                resizeMode="cover"
              />
            </Pressable>
          ) : (
            <Skeleton className="w-full h-48" />
          )}
          {coverExtra}
          {(isCoverUploadPending || isUpdateCoverPending) && (
            <View className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
              <Loader isPending={true} size="large" />
            </View>
          )}
          {/* Header */}
          <View className="flex-row items-center px-5 -mt-12">
            <ProfilePhotoPreview source={profilePictureSource}>
              <View>{profilePictures[0]}</View>
            </ProfilePhotoPreview>
            <View className="flex-1 mt-16">
              <View className="flex-row items-center justify-between mx-2">
                <View>
                  <Text className="text-xl font-semibold text-foreground">
                    {identity}
                  </Text>
                  {id && (
                    <Text className="text-sm text-muted-foreground">
                      @{user?.username}
                    </Text>
                  )}
                </View>
                {currentUser?.id === id && (
                  <ProfileStat className="flex flex-row gap-4" />
                )}
              </View>
            </View>
          </View>
          {/* Tabs */}
          <View className="flex-1 mt-4" style={{ minHeight: 400 }}>
            <Tab.Navigator
              screenOptions={{
                tabBarScrollEnabled: false,
                tabBarLabelStyle: {
                  fontSize: 12,
                  fontWeight: "600",
                  textTransform: "none",
                },
                tabBarIndicatorStyle: { backgroundColor: "#6366f1" },
                tabBarStyle: { backgroundColor: "transparent" },
              }}
              commonOptions={{
                sceneStyle: {
                  flex: 1,
                },
              }}
            >
              <Tab.Screen
                name="About"
                options={{
                  tabBarLabel: "About",
                }}
              >
                {() => <AboutTab user={user} />}
              </Tab.Screen>
              <Tab.Screen
                name="Career"
                options={{
                  tabBarLabel: "Career",
                }}
              >
                {() => (
                  <ExperienceTab
                    profileSections={profileSections}
                    renderSection={RenderSection}
                  />
                )}
              </Tab.Screen>
              <Tab.Screen
                name="Interests"
                options={{
                  tabBarLabel: "Interests",
                }}
              >
                {() => (
                  <InterestsTab
                    profileSections={profileSections}
                    renderSection={RenderSection}
                    userId={id}
                  />
                )}
              </Tab.Screen>
            </Tab.Navigator>
          </View>
        </>
      )}
    </View>
  );
};
