import { useServerImage } from "@/hooks/content/useServerImage";
import { identifyUserAvatar } from "@/lib/user";
import { useMapStore } from "@/stores/useMapStore";
import { ResponseClientDto } from "@/types";
import React from "react";
import { Animated, Easing, View } from "react-native";
import { Marker } from "react-native-maps";

interface UserMarkerProps {
  userId: string;
  latitude: number;
  longitude: number;
  isOnline?: boolean;
  onPress: (user: ResponseClientDto | null) => void;
}

interface UserMarkerProps {
  userId: string;
  latitude: number;
  longitude: number;
  isOnline?: boolean;
  onPress: (user: ResponseClientDto | null) => void;
}

export const UserMarker = React.memo(
  ({ userId, latitude, longitude, isOnline, onPress }: UserMarkerProps) => {
    const mapStore = useMapStore();
    const user = React.useMemo(() => mapStore.getUserById(userId), [userId]);
    const fallback = React.useMemo(() => identifyUserAvatar(user), [user]);

    const { jsx: profilePicture } = useServerImage({
      id: user?.profile?.pictureId,
      fallback,
      className: "rounded-full",
      size: { width: 48, height: 48 },
    });

    // Pulse animation setup
    const scale = React.useRef(new Animated.Value(1)).current;
    const opacity = React.useRef(new Animated.Value(0.6)).current;

    React.useEffect(() => {
      if (!isOnline) return;

      const pulse = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1.8,
              duration: 1200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0,
              duration: 1200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.6,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      pulse.start();
      return () => pulse.stop();
    }, [isOnline, scale, opacity]);

    return (
      <Marker
        coordinate={{ latitude, longitude }}
        onPress={() => onPress(user)}
        anchor={{ x: 0.5, y: 0.5 }}
      >
        {isOnline && (
          <Animated.View
            style={[
              {
                position: "absolute",
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "rgba(34,197,94,0.8)",
                transform: [{ scale }],
                opacity,
              },
            ]}
          />
        )}
        <View className="rounded-full overflow-hidden bg-background/25">
          {profilePicture}
        </View>
      </Marker>
    );
  }
);

UserMarker.displayName = "UserMarker";
