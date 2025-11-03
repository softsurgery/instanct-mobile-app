import { cn } from "@/lib/utils";
import { router } from "expo-router";
import React from "react";
import { Image, View } from "react-native";
import { Button } from "./ui/button";
import { Text } from "./ui/text";

interface OnBoardingProps {
  className?: string;
}

export default function OnBoarding({ className }: OnBoardingProps) {
  return (
    <View
      className={cn(
        "flex-1 justify-between items-center p-6 bg-background",
        className
      )}
    >
      <View className="flex-1 justify-center items-center">
        <Image
          className="h-80 w-80"
          source={require("~/assets/images/logo.png")}
          style={{ resizeMode: "contain" }}
        />
        <Text className="text-[50px] font-bold italic">Instanct</Text>
        <Text className="text-xl font-semibold text-primary/70">
          The future of mobile apps
        </Text>
        <Text className="text-sm text-primary/70 text-center px-4">
          Discover the future of mobile apps with Instanct
        </Text>
      </View>

      <Button
        className="w-full mb-6"
        variant="outline"
        onPress={() => router.navigate("/auth/sign-in")}
      >
        <Text>{"Get Started".toUpperCase()}</Text>
      </Button>
    </View>
  );
}
