import React from "react";
import { Text } from "@/components/ui/text";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useEducations } from "@/hooks/content/users/useEducations";
import { useExperiences } from "@/hooks/content/users/useExperiences";
import { useIdentifiedUser } from "@/hooks/content/users/useIdentifiedUser";
import { identifyUser } from "@/lib/user";
import { cn } from "@/lib/utils";
import { createClientStore, useUserStore } from "@/stores/useUserStore";
import {
  ResponseEducationDto,
  ResponseExperienceDto,
  ResponseRefParamDto,
  ServerErrorResponse,
} from "@/types";
import { useFocusEffect, useNavigation } from "expo-router";
import { View, Pressable } from "react-native";
import { ProfileStat } from "./ProfileStat";
import { useUserIndustries } from "@/hooks/content/users/useUserIndustries";
import { useIndustries } from "@/hooks/content/reference-types/useIndustries";

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { AboutTab } from "./sections/AboutTab";
import { CareerTab } from "./sections/CareerTab";
import { RenderSection } from "./sections/RenderSection";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileCover } from "./ProfileCover";
import { toast } from "sonner-native";
import { api } from "@/api";
import { useMutation } from "@tanstack/react-query";
import { Icon } from "../ui/icon";
import { Mail } from "lucide-react-native";
import { BaseProfileSkeleton } from "./BaseProfileSkeleton";
import { ExperienceInstance } from "./experience/ExperienceInstance";
import { EducationInstance } from "./education/EducationInstance";
import { hslToHex } from "@/lib/theme";
import { useColorPalette } from "@/hooks/useColorPalette";
import { useScrollableElement } from "@/hooks/useScrollableElement";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useLoader } from "@/contexts/LoaderContext";

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
  const { animatedHeaderStyle, handleScroll, onLayout, showHeader } =
    useScrollableElement({
      deltaThreshold: 0,
      duration: 400,
      checkScrollable: true,
    });
  const insets = useSafeAreaInsets();
  const { palette } = useColorPalette();
  const { t } = useTranslation("menu");
  const navigation = useNavigation();
  const { setLoading } = useLoader();

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
      setLoading(false);
    };
  }, []);

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

  const Tab = createMaterialTopTabNavigator();

  const animatedTabsStyle = useAnimatedStyle(() => {
    return {
      paddingTop: withTiming(showHeader.value ? 0 : insets.top, {
        duration: 400,
      }),
    };
  });

  if (refreshing || !user) {
    return <BaseProfileSkeleton className={className} />;
  }

  return (
    <View className={cn("bg-background flex-1", className)}>
      <Animated.View style={animatedHeaderStyle}>
        <View onLayout={onLayout}>
          {/* Cover */}
          <ProfileCover
            user={user}
            currentUser={currentUser}
            onRefresh={onRefresh}
            coverExtra={coverExtra}
          />
          {/* Header */}
          <View className="-mt-12 px-5 z-50">
            <View className="flex-row items-end justify-between">
              <ProfileAvatar
                user={user}
                currentUser={currentUser}
                onRefresh={onRefresh}
              />
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
      <Animated.View
        className={cn("flex-1", !user?.emailVerified ? "mt-2" : "")}
        style={animatedTabsStyle}
      >
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
            name={t("menu.tabs.about.title")}
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
            name={t("menu.tabs.career.title")}
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
      </Animated.View>
    </View>
  );
};
