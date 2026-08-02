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
import { Pressable, View } from "react-native";
import { ImageSource } from "expo-image";
import { ProfileStat } from "./ProfileStat";
import { useUserIndustries } from "@/hooks/content/users/useUserIndustries";
import { useIndustries } from "@/hooks/content/reference-types/useIndustries";
import { useServerImages } from "@/hooks/content/useServerImages";
import { Loader } from "../shared/Loader";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { AboutTab } from "./sections/AboutTab";
import { CareerTab } from "./sections/CareerTab";
import { RenderSection } from "./sections/RenderSection";
import { PhotoPreview } from "../shared/PhotoPreview";
import { useUploadMutation } from "@/hooks/useUploadMutation";
import { toast } from "sonner-native";
import { api } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { Skeleton } from "../ui/skeleton";
import { Icon } from "../ui/icon";
import { Mail, Pencil } from "lucide-react-native";
import { BaseProfileSkeleton } from "./BaseProfileSkeleton";
import { ExperienceInstance } from "./experience/ExperienceInstance";
import { EducationInstance } from "./education/EducationInstance";
import { hslToHex } from "@/lib/theme";
import { useColorPalette } from "@/hooks/useColorPalette";
import { useScrollableElement } from "@/hooks/useScrollableElement";
import Animated from "react-native-reanimated";
import { Image } from "@/components/ui/image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { useLuminance } from "@/hooks/useLuminance";

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
  const { animatedHeaderStyle, handleScroll, onLayout } = useScrollableElement({
    deltaThreshold: 250,
    duration: 400,
    checkScrollable: true,
  });
  const insets = useSafeAreaInsets();
  const { palette } = useColorPalette();
  const { t } = useTranslation("menu");
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
  const { uploads: profilePictureUploads, jsxArray: profilePictures } =
    useServerImages({
      ids: [user?.pictureId],
      fallbacks: [fallback],
      className: "rounded-full",
      wrapperClassName: "border border-border bg-background rounded-full",
      size: { width: 100, height: 100 },
    });
  const profilePictureSource = profilePictureUploads?.[0];

  // cover picture side-effect
  const { uploads: coverUploads } = useServerImages({
    ids: [user?.coverId],
    fallbacks: [""],
    wrapperClassName: "",
    size: { width: 100, height: 100 },
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

  const { mutate: sendVerifyEmail, isPending: isSendVerifyEmailPending } =
    useMutation({
      mutationFn: () => api.auth.sendVerifyEmail(user?.email),
      onSuccess: () => {
        toast.success("Email sent successfully", {
          description: "Check your email for verification link.",
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

  const coverPreviewSource = React.useMemo<ImageSource | undefined>(
    () =>
      draftCoverUri
        ? { uri: draftCoverUri }
        : (coverSource as ImageSource | undefined),
    [draftCoverUri, coverSource],
  );

  const onRefresh = React.useCallback(async () => {
    await Promise.allSettled([
      refetchUser(),
      refetchCurrentUser(),
      refetchExperiences(),
      refetchEducations(),
      refetchUserIndustries(),
    ]);
  }, []);

  const refreshing =
    isUserPending ||
    isExperiencesPending ||
    isEducationsPending ||
    isIndustriesSubTypePending ||
    isUserIndustriesPending;

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
        title: t("menu.tabs.career.experience.title"),
        data: experiences as unknown[],
        editable: currentUser?.id === user?.id,
        renderItem: (experience: ResponseExperienceDto) => (
          <ExperienceInstance experience={experience} />
        ),
      },
      {
        key: "education",
        title: t("menu.tabs.career.education.title"),
        data: educations as unknown[],
        editable: currentUser?.id === user?.id,
        renderItem: (education: ResponseEducationDto) => (
          <EducationInstance education={education} />
        ),
      },
      {
        key: "industries",
        title: t("menu.tabs.career.industries.title"),
        data: industries.filter((industry) =>
          userIndustries?.some((id) => id === industry.id),
        ) as unknown[],
        editable: currentUser?.id === user?.id,
        renderItem: (industry: ResponseRefParamDto) => (
          <View className="rounded-full border border-border px-3 py-1.5">
            <Text className="text-[13px] font-semibold">{industry.label}</Text>
          </View>
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
      t,
    ],
  );

  const { isLight: isLightCover } = useLuminance(coverPreviewSource);
  const [isHovered, setIsHovered] = React.useState(false);

  const Tab = createMaterialTopTabNavigator();

  if (refreshing || !user) {
    return <BaseProfileSkeleton className={className} />;
  }

  return (
    <View className={cn("bg-background flex-1", className)}>
      <Animated.View style={animatedHeaderStyle}>
        <View onLayout={onLayout}>
          {/* Cover */}
          {coverExtra}
          <Pressable
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            className="w-full relative overflow-hidden"
          >
            <PhotoPreview
              className="relative w-full h-48 overflow-hidden bg-muted items-center justify-center"
              source={coverPreviewSource}
              onPress={handlePickCover}
              footer={() => {
                if (currentUser?.id !== id) return null;

                return (
                  <Pressable
                    className="flex flex-row gap-2 items-center px-4 py-2 m-4 mx-auto border border-border rounded-full active:bg-muted"
                    style={{
                      marginBottom: insets.bottom * 2,
                    }}
                    onPress={handlePickCover}
                  >
                    <Icon as={Pencil} color="white" />
                    <Text className="text-white">
                      {t("menu.actions.addCoverPhoto")}
                    </Text>
                  </Pressable>
                );
              }}
            >
              {/* Cover Image */}
              {coverPreviewSource ? (
                <Image
                  source={coverPreviewSource}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : currentUser?.id === id ? (
                <View className="flex flex-row gap-2 items-center z-10">
                  <Icon as={Pencil} color="white" />
                  <Text className="font-medium text-white">
                    {t("menu.actions.addCoverPhoto")}
                  </Text>
                </View>
              ) : null}

              {/* Dynamic Calque Overlay */}
              <LinearGradient
                colors={
                  isHovered
                    ? ["rgba(0,0,0,0.65)", "rgba(0,0,0,0.80)"]
                    : isLightCover
                    ? ["rgba(0,0,0,0.35)", "rgba(0,0,0,0.55)"]
                    : ["rgba(0,0,0,0.15)", "rgba(0,0,0,0.35)"]
                }
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              />
            </PhotoPreview>
          </Pressable>
          {(isCoverUploadPending || isUpdateCoverPending) && (
            <View className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
              <Loader isPending={true} size="large" />
            </View>
          )}
          {/* Header */}
          <View className="-mt-12 px-5 z-50">
            <View className="flex-row items-end justify-between">
              {!profilePictureSource ? (
                <Skeleton className="h-[100px] w-[100px] rounded-full" />
              ) : (
                <PhotoPreview source={profilePictureSource}>
                  {profilePictures[0]}
                </PhotoPreview>
              )}
              {currentUser?.id === id && <ProfileStat />}
            </View>

            {/* Identity */}
            <View className="mt-3">
              <Text className="text-2xl font-bold text-foreground">
                {identity}
              </Text>
              {id && (
                <View className="flex-col items-start justify-between gap-2">
                  <View className="flex flex-row items-center gap-2">
                    <Text className="text-sm text-muted-foreground">
                      @{user?.username}
                    </Text>
                    {!!user?.email &&
                      !user?.emailVerified &&
                      currentUser?.id === id && (
                        <Text className="text-xs text-yellow-600 font-bold">
                          ({t("menu.unverifiedEmail")})
                        </Text>
                      )}
                  </View>
                  {currentUser?.id === id &&
                    user?.email &&
                    !user.emailVerified && (
                      <Pressable
                        onPress={() => sendVerifyEmail()}
                        disabled={isSendVerifyEmailPending}
                        className="flex-row items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 active:opacity-80 bg-yellow-700"
                      >
                        <Icon as={Mail} size={16} color={"white"} />
                        <Text className="text-md font-semibold text-white">
                          {t("menu.actions.verifyEmail")}
                        </Text>
                      </Pressable>
                    )}
                </View>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
      {/* Tabs */}
      <View className="flex-1 mt-2">
        <Tab.Navigator
          screenOptions={{
            tabBarScrollEnabled: false,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "600",
              textTransform: "none",
            },
            tabBarIndicatorStyle: {
              backgroundColor: hslToHex(palette.primary),
            },
            tabBarStyle: { backgroundColor: "transparent" },
            sceneStyle: { flex: 1 },
            swipeEnabled: true,
            animationEnabled: true,
          }}
        >
          <Tab.Screen
            name="About"
            options={{
              tabBarLabel: t("menu.tabs.about.title"),
            }}
          >
            {() => (
              <AboutTab
                className="flex-1"
                user={user}
                onRefresh={onRefresh}
                refreshing={refreshing}
                onScroll={handleScroll}
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="Career"
            options={{
              tabBarLabel: t("menu.tabs.career.title"),
            }}
          >
            {() => (
              <CareerTab
                profileSections={profileSections}
                renderSection={RenderSection}
                userId={id}
                onRefresh={onRefresh}
                refreshing={refreshing}
                onScroll={handleScroll}
              />
            )}
          </Tab.Screen>
          {/* <Tab.Screen
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
                onScroll={handleScroll}
              />
            )}
          </Tab.Screen> */}
        </Tab.Navigator>
      </View>
    </View>
  );
};
