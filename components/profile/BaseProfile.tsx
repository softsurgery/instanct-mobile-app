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
import { useFocusEffect, useNavigation } from "expo-router";
import { Image, ImageSourcePropType, Pressable, View } from "react-native";
import { Badge } from "../ui/badge";
import { ProfileStat } from "./ProfileStat";
import { useUserIndustries } from "@/hooks/content/users/useUserIndustries";
import { useIndustries } from "@/hooks/content/reference-types/useIndustries";
import { useServerImages } from "@/hooks/content/useServerImages";
import { Loader } from "../shared/Loader";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { AboutTab } from "./sections/AboutTab";
import { CareerTab } from "./sections/CareerTab";
import { InterestsTab } from "./sections/InterestsTab";
import { RenderSection } from "./sections/RenderSection";
import { PhotoPreview } from "../shared/PhotoPreview";
import { useUploadMutation } from "@/hooks/useUploadMutation";
import { toast } from "sonner-native";
import { api } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { Skeleton } from "../ui/skeleton";
import { Icon } from "../ui/icon";
import { Pencil } from "lucide-react-native";
import { BaseProfileSkeleton } from "./BaseProfileSkeleton";
import { ExperienceInstance } from "./experience/ExperienceInstance";
import { EducationInstance } from "./education/EducationInstance";

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
  const [draftCoverUri, setDraftCoverUri] = React.useState<string | null>(null);

  const storeRef = React.useRef(createClientStore());

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
  const {
    uploads: profileUploads,
    jsxArray: profilePictures,
    isPending: isProfilePicturePending,
    refetch: refetchProfilePictures,
  } = useServerImages({
    ids: [user?.pictureId],
    fallbacks: [fallback, ""],
    className: "border border-border bg-background rounded-full",
    size: { width: 100, height: 100 },
    enabled: !!user && !!user.pictureId,
  });
  const profilePictureSource = profileUploads?.[0];

  // cover picture side-effect
  const {
    uploads: coverUploads,
    isPending: isCoverPending,
    refetch: refetchCover,
  } = useServerImages({
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
        userStore.reset();
        queryClient.invalidateQueries({ queryKey: ["user", currentUser?.id] });
        queryClient.invalidateQueries({ queryKey: ["current-user"] });
        queryClient.invalidateQueries({
          queryKey: ["server-image", currentUser?.coverId],
        });
        refetchCurrentUser();
        toast.success("Cover updated successfully", {
          description: "Your cover has been successfully updated.",
        });
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

  const handlePickCover = async () => {
    if (currentUser?.id !== id) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    // INSTANT UI PREVIEW
    setDraftCoverUri(asset.uri);

    const fileLike = {
      uri: asset.uri,
      name: asset.uri.split("/").pop() || "cover.jpg",
      type: asset.mimeType || "image/jpeg",
    } as unknown as File;

    // AUTO UPLOAD
    uploadCover({
      files: [fileLike],
    });
  };

  const coverImageSource = React.useMemo<
    ImageSourcePropType | undefined
  >(() => {
    switch (typeof coverSource) {
      case "string":
        return { uri: coverSource };
      case "number":
        return coverSource;
      case "object": {
        if (!coverSource || !("uri" in coverSource)) return undefined;
        const uri = String(coverSource.uri ?? "");
        return uri ? { uri } : undefined;
      }
      default:
        return require("~/assets/images/partial-react-logo.png");
    }
  }, [coverSource]);

  const coverPreviewSource = React.useMemo<ImageSourcePropType | undefined>(
    () => (draftCoverUri ? { uri: draftCoverUri } : coverImageSource),
    [draftCoverUri, coverImageSource],
  );

  const onRefresh = React.useCallback(async () => {
    await Promise.allSettled([
      refetchUser(),
      refetchCurrentUser(),
      refetchExperiences(),
      refetchEducations(),
      refetchUserIndustries(),
      refetchCover(),
      refetchProfilePictures(),
    ]);
  }, []);

  const refreshing =
    isUserPending ||
    isExperiencesPending ||
    isEducationsPending ||
    isIndustriesSubTypePending ||
    isUserIndustriesPending ||
    isCoverPending ||
    isProfilePicturePending;

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        onRefresh();
      };
    }, [onRefresh]),
  );

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
          <ExperienceInstance className="mb-4" experience={experience} />
        ),
      },
      {
        key: "education",
        title: "Education",
        data: educations as unknown[],
        editable: currentUser?.id === user?.id,
        renderItem: (education: ResponseEducationDto) => (
          <EducationInstance className="mb-4" education={education} />
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

  if (refreshing || !user) {
    return <BaseProfileSkeleton className={className} />;
  }

  return (
    <View className={cn("bg-background flex-1", className)}>
      <View>
        <View>
          {/* Cover */}
          {coverExtra}
          <PhotoPreview
            className="active:opacity-70 relative w-full h-48 overflow-hidden"
            source={coverPreviewSource}
            footer={() => {
              if (currentUser?.id !== id) return null;

              return (
                <Pressable
                  className="flex flex-row gap-2 items-center px-4 py-2 m-4 mb-12 mx-auto border border-border rounded-full active:bg-muted"
                  onPress={() => {
                    handlePickCover();
                  }}
                >
                  <Icon as={Pencil} color="white" />
                  <Text className="text-white">Change Cover</Text>
                </Pressable>
              );
            }}
          >
            <Image
              source={coverImageSource}
              className="w-full h-full opacity-70"
              resizeMode="cover"
            />
          </PhotoPreview>
          {(isCoverUploadPending || isUpdateCoverPending) && (
            <View className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
              <Loader isPending={true} size="large" />
            </View>
          )}
          {/* Header */}
          <View className="flex-row items-center px-5 -mt-12">
            {isProfilePicturePending ? (
              <Skeleton className="w-[100px] h-[100px] rounded-full" />
            ) : (
              <PhotoPreview source={profilePictureSource}>
                {profilePictures[0]}
              </PhotoPreview>
            )}
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
        </View>
      </View>
      {/* Tabs */}
      <View style={{ flex: 1 }}>
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
            sceneStyle: { flex: 1 },
            swipeEnabled: true,
            animationEnabled: true,
          }}
        >
          <Tab.Screen
            name="About"
            options={{
              tabBarLabel: "About",
            }}
          >
            {() => (
              <AboutTab
                className="flex-1"
                user={user}
                onRefresh={onRefresh}
                refreshing={refreshing}
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="Career"
            options={{
              tabBarLabel: "Career",
            }}
          >
            {() => (
              <CareerTab
                profileSections={profileSections}
                renderSection={RenderSection}
                onRefresh={onRefresh}
                refreshing={refreshing}
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
                onRefresh={onRefresh}
                refreshing={refreshing}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </View>
    </View>
  );
};
