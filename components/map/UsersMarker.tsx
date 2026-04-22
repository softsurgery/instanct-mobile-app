import React from "react";
import { useCurrentUser } from "@/hooks/content/users/useCurrentUser";
import { useServerImages } from "@/hooks/content/useServerImages";
import { identifyUserAvatar } from "@/lib/user";
import { useMapStore } from "@/stores/useMapStore";
import { NearbyUser } from "@/types";
import { Platform, View } from "react-native";
import { Marker } from "react-native-maps";
import ViewShot from "react-native-view-shot";
import { Text } from "../ui/text";

interface UsersMarkerProps {
  nearbyUsers: NearbyUser[];
  latitude: number;
  longitude: number;
  currentUserIncluded?: boolean;
  onPress: (users: NearbyUser[] | null) => void;
}

export const UsersMarker = ({
  nearbyUsers,
  latitude,
  longitude,
  currentUserIncluded,
  onPress,
}: UsersMarkerProps) => {
  const width = 30;
  const height = 30;
  const { currentUser } = useCurrentUser();
  const mapStore = useMapStore();
  const isAndroid = Platform.OS === "android";

  // Android self-capture state
  const viewShotRef = React.useRef<ViewShot>(null);
  const [imageUri, setImageUri] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (currentUser) mapStore.addUser(currentUser);
  }, [nearbyUsers, mapStore.users, currentUser]);

  const { jsxArray: userPictures } = useServerImages({
    ids: nearbyUsers.map((u) => u?.user?.pictureId),
    className: "rounded-full",
    fallbackClassName: "text-xs",
    size: { width, height },
    fallbacks: mapStore.users.map((u) => identifyUserAvatar(u)),
  });

  const displayUsers = mapStore.users.slice(0, 3);

  const capture = React.useCallback(async () => {
    try {
      if (viewShotRef.current) {
        const uri = await (viewShotRef.current as any).capture();
        setImageUri(uri);
      }
    } catch {
      // View not ready yet
    }
  }, []);

  const handleLayout = React.useCallback(() => {
    if (!isAndroid) return;
    // Capture after a short delay for images to settle
    const t1 = setTimeout(capture, 200);
    const t2 = setTimeout(capture, 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isAndroid, capture]);

  const label = currentUserIncluded
    ? `You & ${nearbyUsers.length - 1} Person${
        nearbyUsers.length > 1 ? "s" : ""
      }`
    : `${nearbyUsers.length} Person${nearbyUsers.length > 1 ? "s" : ""}`;

  const content = (
    <View
      className="flex flex-col items-center justify-center"
      collapsable={false}
    >
      {/* Overlapping user icons */}
      <View className="flex flex-row items-center justify-center">
        {displayUsers.map((user, index) => (
          <View
            key={user.id}
            style={{
              marginLeft:
                nearbyUsers.length > 2 ? (index === 0 ? 0 : -width * 0.4) : 0,
              zIndex: displayUsers.length - index,
            }}
          >
            {userPictures[index]}
          </View>
        ))}
      </View>

      {/* Label */}
      <Text className="mt-1 text-xs font-extrabold bg-background/60 px-2 py-1 rounded-lg text-center">
        {label}
      </Text>
    </View>
  );

  // Android with captured image: use image prop (bypasses canvas bug)
  if (isAndroid && imageUri) {
    return (
      <Marker
        coordinate={{ latitude, longitude }}
        onPress={() => onPress(nearbyUsers)}
        anchor={{ x: 0.5, y: 0.5 }}
        tracksViewChanges={false}
        image={{ uri: imageUri }}
      />
    );
  }

  // Android without capture yet: render children in ViewShot to capture
  if (isAndroid) {
    return (
      <Marker
        coordinate={{ latitude, longitude }}
        onPress={() => onPress(nearbyUsers)}
        anchor={{ x: 0.5, y: 0.5 }}
        tracksViewChanges={false}
      >
        <ViewShot
          ref={viewShotRef}
          options={{ format: "png", result: "tmpfile" }}
          onLayout={handleLayout}
        >
          {content}
        </ViewShot>
      </Marker>
    );
  }

  // iOS: render children directly
  return (
    <Marker
      coordinate={{ latitude, longitude }}
      onPress={() => onPress(nearbyUsers)}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
    >
      {content}
    </Marker>
  );
};
