import OnBoarding from "@/components/OnBoarding";
import { useAuthPersistStore } from "@/hooks/useAuthPersistStore";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

export default function Screen() {
  const { isAuthenticated, isReady: isAuthPersistStoreReady } =
    useAuthPersistStore();

  React.useEffect(() => {
    if (isAuthenticated && isAuthPersistStoreReady) {
      router.replace("/main/(tabs)");

      if (router.canDismiss()) router.dismissAll?.();
    }
  }, [isAuthenticated, isAuthPersistStoreReady]);

  return (
    <View className="flex-1 flex items-center justify-center w-full">
      {!isAuthenticated && isAuthPersistStoreReady ? (
        <OnBoarding className="w-full" />
      ) : (
        <ActivityIndicator size="large" />
      )}
    </View>
  );
}
