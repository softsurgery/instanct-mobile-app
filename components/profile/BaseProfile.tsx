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
import { Pen, Plus, Globe, Linkedin } from "lucide-react-native";
import { Image, Linking, ScrollView, View } from "react-native";
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

// Tab Components - defined outside to prevent minification issues
const AboutTab = ({ user }: { user: any }) => (
  <ScrollView className="flex-1 bg-background">
    <View className="flex flex-col gap-4 pb-8">
      {/* Bio Section */}
      {user?.bio ? (
        <View className="bg-card border border-border overflow-hidden">
          <View className="p-4 bg-primary/10">
            <Text variant="h4">About</Text>
          </View>
          <Separator />
          <View className="p-4">
            <SeeMoreText
              textClassname="text-sm leading-6 text-foreground"
              numberOfLines={4}
            >
              {user.bio}
            </SeeMoreText>
          </View>
        </View>
      ) : (
        <View className="bg-card border border-border p-4">
          <Text className="text-sm text-muted-foreground italic text-center">
            No bio added yet
          </Text>
        </View>
      )}

      {/* Links Section */}
      {(user?.website || user?.linkedin) && (
        <View className="flex flex-col gap-2">
          {user?.website && (
            <StablePressable
              className="bg-card border border-border p-4 flex-row items-center gap-3"
              onPress={() => {
                if (user?.website) Linking.openURL(user?.website);
              }}
              onPressClassname="bg-muted"
            >
              <Icon as={Globe} size={20} className="text-primary" />
              <Text
                className="text-sm font-medium text-foreground flex-1"
                numberOfLines={1}
              >
                {user.website}
              </Text>
            </StablePressable>
          )}
          {user?.linkedin && (
            <StablePressable
              className="bg-card border border-border p-4 flex-row items-center gap-3"
              onPress={() => {
                if (user?.linkedin) Linking.openURL(user?.linkedin);
              }}
              onPressClassname="bg-muted"
            >
              <Icon as={Linkedin} size={20} className="text-primary" />
              <Text className="text-sm font-medium text-foreground">
                LinkedIn Profile
              </Text>
            </StablePressable>
          )}
        </View>
      )}
    </View>
  </ScrollView>
);

const ExperienceTab = ({
  profileSections,
  renderSection,
}: {
  profileSections: ProfileSection[];
  renderSection: (section: ProfileSection) => React.ReactNode;
}) => (
  <ScrollView className="flex-1 bg-background">
    <View className="flex flex-col gap-4 pb-8">
      {profileSections
        .filter((s) => s.key === "experience" || s.key === "education")
        .map(renderSection)}
    </View>
  </ScrollView>
);

const InterestsTab = ({
  profileSections,
  renderSection,
}: {
  profileSections: ProfileSection[];
  renderSection: (section: ProfileSection) => React.ReactNode;
}) => (
  <ScrollView className="flex-1 bg-background">
    <View className="flex flex-col gap-4 pb-8">
      {profileSections.filter((s) => s.key === "industries").map(renderSection)}
    </View>
  </ScrollView>
);

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

  const { industries, isIndustriesPending } = useIndustries({
    enabled: !!user,
  });

  const identity = React.useMemo(() => identifyUser(user), [user]);
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

  const { jsxArray: profilePictures } = useServerImages({
    ids: [user?.pictureId],
    fallbacks: [fallback],
    wrapperClassName:
      "border border-border bg-background rounded-full shadow-md",
    size: { width: 100, height: 100 },
    enabled: !!user,
  });

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

  // ---------------------------------------------------------------
  //  SECTION RENDERER
  // ---------------------------------------------------------------
  const isBadgeSection = (key: string) => key === "industries";

  const renderSection = React.useCallback(
    (section: ProfileSection) => {
      const isBadge = isBadgeSection(section.key);

      return (
        <View key={section.key}>
          <View className={cn("pt-x bg-card border border-border")}>
            <View className="flex flex-row items-center justify-between bg-primary/10 py-4">
              <View className="px-4">
                <Text variant="h4">{section.title}</Text>
              </View>

              <View
                className={cn(
                  "flex flex-row gap-1 items-center px-2",
                  !section.editable && "hidden",
                )}
              >
                {!isBadge && (
                  <StablePressable
                    className="p-2"
                    onPress={() => {
                      switch (section.key) {
                        case "experience":
                          router.push("/main/profile/create-experience");
                          break;
                        case "education":
                          router.push("/main/profile/create-education");
                          break;
                      }
                    }}
                    onPressClassname="bg-primary/25 rounded-full"
                  >
                    <Icon
                      as={Plus}
                      size={20}
                      className="text-muted-foreground"
                    />
                  </StablePressable>
                )}

                <StablePressable
                  className="p-2"
                  onPress={() => {
                    switch (section.key) {
                      case "experience":
                        router.push("/main/profile/update-experiences");
                        break;
                      case "education":
                        router.push("/main/profile/update-educations");
                        break;
                      case "industries":
                        router.push({
                          pathname: "/main/profile/industries",
                          params: { userId: id },
                        });
                        break;
                    }
                  }}
                  onPressClassname="bg-primary/25 rounded-full"
                >
                  <Icon as={Pen} size={18} className="text-muted-foreground" />
                </StablePressable>
              </View>
            </View>

            <Separator />

            <View className="p-4">
              {section.data?.length === 0 ? (
                <View key={section.key}>
                  <Text className="text-sm text-muted-foreground italic text-center my-4">
                    No {section.title} added yet
                  </Text>
                </View>
              ) : isBadge ? (
                <View className="flex-row flex-wrap gap-2">
                  {Array.isArray(section.data) &&
                    section.data.map((item, idx) => (
                      <View key={idx}>{section.renderItem(item)}</View>
                    ))}
                </View>
              ) : (
                <View className="flex flex-col gap-4">
                  {Array.isArray(section.data) &&
                    section.data.map((item, idx) => (
                      <View key={idx}>{section.renderItem(item)}</View>
                    ))}
                </View>
              )}
            </View>
          </View>
        </View>
      );
    },
    [id],
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
            <View>{profilePictures[0]}</View>

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
                    renderSection={renderSection}
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
                    renderSection={renderSection}
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
