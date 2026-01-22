import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useIdentifiedUser } from "@/hooks/content/users/useIdentifiedUser";
import { useServerImage } from "@/hooks/content/useServerImage";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { cn } from "@/lib/utils";
import { createClientStore, useUserStore } from "@/stores/useUserStore";
import { router, useNavigation } from "expo-router";
import { Pen, Plus } from "lucide-react-native";
import React from "react";
import { Image, RefreshControl, View } from "react-native";
import { StablePressable } from "../shared/StablePressable";
import { StableScrollView } from "../shared/StableScrollView";
import { Separator } from "../ui/separator";
import { ProfileStat } from "./ProfileStat";
import { useEditProfileRecipes } from "./useUpdateProfileRecipe";
import { useSceneBuilderStore } from "../shared/scene-builder/useSceneBuilderStore";
import { useExperiences } from "@/hooks/content/users/useExperiences";
import { ResponseExperienceDto } from "@/types";
import { toDateOnly } from "@/lib/date";
import { SeeMoreText } from "../shared/SeeMoreText";

interface ProfileSection<T = unknown> {
  key: string;
  title: string;
  data: T[];
  editable: boolean;
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

  const { currentUser } = useCurrentUser();
  const { user, isUserPending, refetchUser } = useIdentifiedUser({ id });
  const { experiences, isExperiencesPending, refetchExperiences } =
    useExperiences({ id, enabled: !!user });

  const sceneBuilderStore = useSceneBuilderStore();
  const { experienceRecipe } = useEditProfileRecipes({ store: userStore });

  const identity = React.useMemo(() => identifyUser(user), [user]);
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);
  const { jsx: profilePicture } = useServerImage({
    id: user?.pictureId,
    fallback,
    wrapperClassName:
      "border border-border bg-background rounded-full shadow-md",
    size: { width: 100, height: 100 },
  });

  React.useEffect(() => {
    if (user) userStore.set("response", user);
    if (experiences) userStore.set("experiences", experiences);
    navigation.setOptions({
      title: user?.username,
    });
  }, [user]);

  React.useEffect(() => {
    return () => {
      userStore.reset();
      storeRef.current = null as any;
    };
  }, []);

  const onRefresh = () => {
    refetchUser();
    refetchExperiences();
  };

  const refreshing = isExperiencesPending || isUserPending;

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
          <Text className="text-xs text-muted-foreground mt-2">
            {toDateOnly(new Date(experience.startDate))} —{" "}
            {toDateOnly(new Date(experience.endDate))}
          </Text>
          <SeeMoreText textClassname="text-sm" numberOfLines={1}>
            {experience.description}
          </SeeMoreText>
        </View>
      ),
    },
    // {
    //   key: "education",
    //   title: "Education",
    //   data: user?.educations as unknown[],
    //   editable: currentUser?.id === user?.id,
    //   renderItem: (edu: Education) => (
    //     <View className="flex flex-col">
    //       <Text className="font-semibold">{edu.school}</Text>
    //       <Text className="text-sm text-muted-foreground">{edu.degree}</Text>
    //       <Text className="text-xs text-muted-foreground">
    //         {edu.startYear} — {edu.endYear}
    //       </Text>
    //     </View>
    //   ),
    // },
    // {
    //   key: "skills",
    //   title: "Skills",
    //   data: user?.skills as unknown[],
    //   editable: currentUser?.id === user?.id,
    //   renderItem: (skill: Skill) => (
    //     <Text className="text-sm font-bold">{skill.name}</Text>
    //   ),
    // },
    // {
    //   key: "objectives",
    //   title: "Objectives",
    //   data: user?.skills ? [user?.skills] : [],
    //   editable: currentUser?.id === user?.id,
    //   renderItem: (objective: string) => (
    //     <Text className="text-sm">{objective}</Text>
    //   ),
    // },
  ];

  // ---------------------------------------------------------------
  //  SECTION RENDERER
  // ---------------------------------------------------------------
  const renderSection = (section: ProfileSection) => (
    <Card key={section.key} className="m-0 pt-1">
      <CardHeader className="flex flex-row items-center justify-between mt-2 -mb-2">
        <CardTitle>
          <Text variant="h4">{section.title}</Text>
        </CardTitle>

        {section.editable && (
          <View className="flex flex-row gap-1 items-center -mx-2">
            <StablePressable
              className="p-2"
              onPress={() => router.push("/main/edit-screen")}
              onPressClassname="bg-primary/25 rounded-full"
            >
              <Icon as={Plus} size={20} className="text-muted-foreground" />
            </StablePressable>

            <StablePressable
              className="p-2"
              onPress={() => {
                sceneBuilderStore.push("update-profile", experienceRecipe);
                router.push({
                  pathname: "/main/scene-screen",
                  params: { id: "update-profile" },
                });
              }}
              onPressClassname="bg-primary/25 rounded-full"
            >
              <Icon as={Pen} size={18} className="text-muted-foreground" />
            </StablePressable>
          </View>
        )}
      </CardHeader>

      <Separator />

      <CardContent className="flex flex-col gap-2">
        {Array.isArray(section.data) &&
          section.data.map((item, idx) => (
            <View key={idx}>{section.renderItem(item)}</View>
          ))}
      </CardContent>
    </Card>
  );

  // ---------------------------------------------------------------
  //  UI LAYOUT
  // ---------------------------------------------------------------
  return (
    <StableScrollView
      className={cn("flex-1 bg-background", className)}
      bounces={true}
      refreshControl={
        <RefreshControl
          tintColor={"white"}
          colors={["white"]}
          progressBackgroundColor={"#333"}
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
        <View className="z-10">{profilePicture}</View>

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
      <View className="flex flex-col gap-4 flex-1 px-4 mt-6 pb-10">
        <Text className="italic text-xs">{user?.bio}</Text>

        {/* Render all abstracted profile sections */}
        <View className="flex flex-col gap-4">
          {profileSections.map(renderSection)}
        </View>
      </View>
    </StableScrollView>
  );
};
