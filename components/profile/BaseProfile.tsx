import { api } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useFollowSystem } from "@/hooks/content/users/useFollowSystem";
import { useIdentifiedUser } from "@/hooks/content/users/useIdentifiedUser";
import { useServerImage } from "@/hooks/content/useServerImage";
import { identifyUser, identifyUserAvatar } from "@/lib/user";
import { cn } from "@/lib/utils";
import { createClientStore, useClientStore } from "@/stores/useClientStore";
import { Education, Experience, ServerErrorResponse, Skill } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useNavigation } from "expo-router";
import { Mail, Pen, Plus, UserPlus } from "lucide-react-native";
import React from "react";
import { Image, View } from "react-native";
import { showToastable } from "react-native-toastable";
import { StablePressable } from "../shared/StablePressable";
import { StableScrollView } from "../shared/StableScrollView";
import { Separator } from "../ui/separator";
import { ProfileStat } from "./ProfileStat";

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
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const storeRef = React.useRef(createClientStore());
  const { currentUser } = useCurrentUser();
  const clientStore = useClientStore();

  const { user } = useIdentifiedUser({ id });

  const identity = React.useMemo(() => identifyUser(user), [user]);
  const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);
  const { jsx: profilePicture } = useServerImage({
    id: user?.profile?.pictureId,
    fallback,
    wrapperClassName:
      "border border-border bg-background rounded-full shadow-md",
    size: { width: 100, height: 100 },
  });

  React.useEffect(() => {
    if (user) clientStore.set("response", user);
    navigation.setOptions({
      title: user?.username ?? "Profile",
    });
  }, [user]);

  const {
    isFollowing,
    refetchIsFollowing,
    followers,
    followings,
    refetchFollowers,
    refetchFollowing,
    followUser,
    isFollowPending,
    unfollowUser,
    isUnfollowPending,
  } = useFollowSystem({
    id: clientStore?.response?.id!,
    use: ["is-following", "followers", "followings"],
    follow: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["follow-data-count", clientStore?.response?.id],
        });
        refetchFollowers();
        refetchFollowing();
        refetchIsFollowing();
      },
      onError: (err: ServerErrorResponse) => {
        showToastable({ message: err.response?.data.message });
      },
    },
    unfollow: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["follow-data-count", clientStore?.response?.id],
        });
        refetchFollowers();
        refetchFollowing();
        refetchIsFollowing();
      },
      onError: (err: ServerErrorResponse) => {
        showToastable({ message: err.response?.data.message });
      },
    },
  });

  React.useEffect(() => {
    clientStore.set("followers", followers);
    clientStore.set("followings", followings);
  }, [followers, followings]);

  const { data: followDataCount } = useQuery({
    queryKey: ["follow-data-count", user?.id],
    queryFn: () => api.follow.findDataCount(user?.id!),
    enabled: !!user?.id,
  });

  React.useEffect(() => {
    if (followDataCount)
      clientStore.set("responseFollowCountsDto", followDataCount);
  }, [followDataCount]);

  React.useEffect(() => {
    return () => {
      clientStore.reset();
      storeRef.current = null as any;
    };
  }, []);

  // ---------------------------------------------------------------
  //  PROFILE SECTIONS CONFIG
  // ---------------------------------------------------------------
  const profileSections: ProfileSection[] = [
    {
      key: "experience",
      title: "Experience",
      data: user?.profile?.experiences as unknown[],
      editable: currentUser?.id === user?.id,
      renderItem: (experience: Experience) => (
        <View className="flex flex-col">
          <Text className="font-semibold">{experience.title}</Text>
          <Text className="text-sm text-muted-foreground">
            {experience.company}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {experience.startDate} — {experience.endDate}
          </Text>
          <Text className="text-sm mt-1">{experience.description}</Text>
        </View>
      ),
    },
    {
      key: "education",
      title: "Education",
      data: user?.profile?.educations as unknown[],
      editable: currentUser?.id === user?.id,
      renderItem: (edu: Education) => (
        <View className="flex flex-col">
          <Text className="font-semibold">{edu.school}</Text>
          <Text className="text-sm text-muted-foreground">{edu.degree}</Text>
          <Text className="text-xs text-muted-foreground">
            {edu.startYear} — {edu.endYear}
          </Text>
        </View>
      ),
    },
    {
      key: "skills",
      title: "Skills",
      data: user?.profile?.skills as unknown[],
      editable: currentUser?.id === user?.id,
      renderItem: (skill: Skill) => (
        <Text className="text-sm font-bold">{skill.name}</Text>
      ),
    },
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
              onPress={() => router.push("/main/edit-screen")}
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
    <StableScrollView className={cn("flex-1 bg-background", className)}>
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

            <ProfileStat
              clientStore={clientStore}
              className="flex flex-row gap-4"
            />
          </View>
        </View>
      </View>

      {/* Bio + Sections */}
      <View className="flex flex-col gap-4 flex-1 px-4 mt-6 pb-10">
        <Text className="italic text-xs">{user?.profile?.bio}</Text>

        {/* Follow buttons */}
        {currentUser?.id !== user?.id && (
          <View className="flex flex-row w-full justify-between gap-2">
            <Button
              size="sm"
              onPress={() => (isFollowing ? unfollowUser() : followUser())}
              variant={isFollowing ? "outline" : "default"}
              className="flex flex-row flex-1 gap-2"
              disabled={isFollowPending || isUnfollowPending}
            >
              {!isFollowing && <Icon as={UserPlus} size={20} />}
              <Text>{isFollowing ? "Following" : "Follow"}</Text>
            </Button>

            <Button
              size="sm"
              className="flex flex-row flex-1 gap-2"
              variant="outline"
            >
              <Icon as={Mail} size={20} />
              <Text>Send Message</Text>
            </Button>
          </View>
        )}

        {/* Render all abstracted profile sections */}
        <View className="flex flex-col gap-4">
          {profileSections.map(renderSection)}
        </View>
      </View>
    </StableScrollView>
  );
};
