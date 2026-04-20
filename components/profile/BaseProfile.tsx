import React from "react";
import { Icon } from "@/components/ui/icon";
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
} from "@/types";
import { format } from "date-fns";
import { router, useNavigation } from "expo-router";
import { Pen, Plus } from "lucide-react-native";
import { Image, ScrollView, View } from "react-native";
import { SeeMoreText } from "../shared/SeeMoreText";
import { StablePressable } from "../shared/StablePressable";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { ProfileStat } from "./ProfileStat";
import { useUserIndustries } from "@/hooks/content/users/useUserIndustries";
import { useIndustries } from "@/hooks/content/reference-types/useIndustries";
import { useServerImages } from "@/hooks/content/useServerImages";
import { BaseProfileSkeleton } from "./BaseProfileSkeleton";
import { Loader } from "../shared/Loader";
import { useDebounce } from "@/hooks/useDebounce";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { ProfilePhotoPreview } from "./ProfilePhotoPreview";
import { AboutTab } from "./sections/AboutTab";
import { ExperienceTab } from "./sections/ExperienceTab";
import { InterestsTab } from "./sections/InterestsTab";
import { RenderSection } from "./sections/RenderSection";

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

  const { uploads: profileUploads, jsxArray: profilePictures } =
    useServerImages({
      ids: [user?.pictureId],
      fallbacks: [fallback],
      wrapperClassName:
        "border border-border bg-background rounded-full shadow-md",
      size: { width: 100, height: 100 },
      enabled: !!user,
    });
  const profilePictureSource = profileUploads?.[0];

  React.useEffect(() => {
    return () => {
      userStore?.reset();
      storeRef.current = null as any;
    };
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.allSettled([
      refetchUser(),
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
          <View className="relative w-full h-48 bg-card">
            {coverExtra}
            <Image
              source={require("@/assets/images/partial-react-logo.png")}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
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
