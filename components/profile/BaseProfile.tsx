import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useEducations } from "@/hooks/content/users/useEducations";
import { useExperiences } from "@/hooks/content/users/useExperiences";
import { useIdentifiedUser } from "@/hooks/content/users/useIdentifiedUser";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { cn } from "@/lib/utils";
import { createClientStore, useUserStore } from "@/stores/useUserStore";
import { ResponseEducationDto, ResponseExperienceDto } from "@/types";
import { format } from "date-fns";
import { router, useNavigation } from "expo-router";
import { Pen, Plus } from "lucide-react-native";
import { Image, RefreshControl, View } from "react-native";
import { SeeMoreText } from "../shared/SeeMoreText";
import { StablePressable } from "../shared/StablePressable";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { ProfileStat } from "./ProfileStat";
import StableScrollView from "../shared/StableScrollView";
import { useUserIndustries } from "@/hooks/content/users/useUserIndustries";
import { useUserObjectives } from "@/hooks/content/users/useUserObjectives";
import { useIndustries } from "@/hooks/content/reference-types/useIndustries";
import { useObjectives } from "@/hooks/content/reference-types/useObjectives";
import { useServerImages } from "@/hooks/content/useServerImages";

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
  const userStore = useUserStore(); // TODO: use the store ref instead

  // user side-effects
  const { currentUser } = useCurrentUser();
  const { user, isUserPending, refetchUser } = useIdentifiedUser({ id });
  React.useEffect(() => {
    if (user) userStore.set("response", user);
    navigation.setOptions({
      title: user?.username,
    });
  }, [user]);

  // experience side-effects
  const { experiences, isExperiencesPending, refetchExperiences } =
    useExperiences({ id, enabled: !!user });
  React.useEffect(() => {
    if (experiences) userStore.set("experiences", experiences);
  }, [experiences]);

  // education side-effects
  const { educations, isEducationsPending, refetchEducations } = useEducations({
    id,
    enabled: !!user,
  });
  React.useEffect(() => {
    if (educations) userStore.set("educations", educations);
  }, [educations]);

  // industries side-effects
  const { userIndustries, isUserIndustriesPending, refetchUserIndustries } =
    useUserIndustries({ userId: id, enabled: !!user });

  // objectives side-effects
  const { userObjectives, isUserObjectivesPending, refetchUserObjectives } =
    useUserObjectives({ userId: id, enabled: !!user });

  const { industries, isIndustriesPending, refetchIndustries } = useIndustries({
    enabled: !!user,
  });

  const { objectives, isObjectivesPending, refetchObjectives } = useObjectives({
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
      userStore.reset();
      storeRef.current = null as any;
    };
  }, []);

  const onRefresh = () => {
    refetchUser();
    refetchExperiences();
    refetchEducations();
    refetchUserIndustries();
    refetchUserObjectives();
    refetchIndustries();
    refetchObjectives();
  };

  const refreshing =
    isUserPending ||
    isExperiencesPending ||
    isEducationsPending ||
    isUserIndustriesPending ||
    isUserObjectivesPending ||
    isIndustriesPending ||
    isObjectivesPending;

  // ---------------------------------------------------------------
  //  PROFILE SECTIONS CONFIG
  // ---------------------------------------------------------------

  const profileSections: ProfileSection[] = [
    {
      key: "experience",
      title: "Experience",
      data: experiences as unknown[],
      editable: currentUser?.id === user?.id,
      renderItem: (experience: ResponseExperienceDto) => (
        <View className="flex flex-col mb-4">
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
        <View className="flex flex-col mb-4">
          <Text className="font-semibold">{education.title}</Text>
          <Text className="text-sm text-muted-foreground">
            {education.institution}
          </Text>
          <Text className="text-xs text-muted-foreground my-1">
            {format(new Date(education.startDate), "MMM yyyy")} —{" "}
            {education.endDate
              ? format(new Date(education.endDate), "MMM yyyy")
              : "Present"}
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
      renderItem: (industry) => (
        <Badge className={cn("px-2 py-1")}>
          <Text className="text-xs">{industry.label}</Text>
        </Badge>
      ),
    },
    {
      key: "objectives",
      title: "Objectives",
      data: objectives.filter((objective) =>
        userObjectives?.some((id) => id === objective.id),
      ) as unknown[],
      editable: currentUser?.id === user?.id,
      renderItem: (objective) => (
        <Badge className={cn("px-2 py-1")}>
          <Text className="text-xs">{objective.label}</Text>
        </Badge>
      ),
    },
  ];

  // ---------------------------------------------------------------
  //  SECTION RENDERER
  // ---------------------------------------------------------------
  const isBadgeSection = (key: string) =>
    key === "industries" || key === "objectives";

  const renderSection = (section: ProfileSection) => {
    const isBadge = isBadgeSection(section.key);

    return (
      <View key={section.key}>
        <Card className={cn("m-0 pt-1")}>
          <CardHeader className="flex flex-row items-center justify-between mt-2 -mb-2">
            <CardTitle>
              <Text variant="h4">{section.title}</Text>
            </CardTitle>

            {section.editable && (
              <View className="flex flex-row gap-1 items-center -mx-2">
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
                      case "objectives":
                        router.push({
                          pathname: "/main/profile/objectives",
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
            )}
          </CardHeader>

          <Separator />

          <CardContent>
            {section.data?.length === 0 ? (
              <View key={section.key}>
                <Text className="text-sm text-muted-foreground italic text-center">
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
              <View className="flex flex-col gap-2">
                {Array.isArray(section.data) &&
                  section.data.map((item, idx) => (
                    <View key={idx}>{section.renderItem(item)}</View>
                  ))}
              </View>
            )}
          </CardContent>
        </Card>
      </View>
    );
  };

  // ---------------------------------------------------------------
  //  UI LAYOUT
  // ---------------------------------------------------------------
  return (
    <StableScrollView
      className={cn("flex-1 bg-background", className)}
      refreshControl={
        <RefreshControl
          progressViewOffset={50}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
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
            <ProfileStat className="flex flex-row gap-4" />
          </View>
        </View>
      </View>
      {/* Bio + Sections */}
      <View className="flex flex-col gap-4 flex-1 px-2 mt-6 pb-8">
        <Text className="italic text-xs">{user?.bio}</Text>
        {/* Render all abstracted profile sections */}
        <View className="flex flex-col gap-4">
          {profileSections.map(renderSection)}
        </View>
      </View>
    </StableScrollView>
  );
};
