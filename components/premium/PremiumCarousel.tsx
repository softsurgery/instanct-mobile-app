import { cn } from "@/lib/utils";
import React from "react";
import { Dimensions, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { PremiumCard } from "./PremiumCard";

interface PremiumCarouselProps {
  className?: string;
}

const { width } = Dimensions.get("window");

export const PremiumCarousel = ({ className }: PremiumCarouselProps) => {
  const premiumTiers = [
    {
      title: "Instanct",
      tierLabel: "Gold",
      gradientColors: ["#3a2a00", "#b8860b", "#ffd700"] as const,
      tierColor: "#FFD700",
      features: [
        { label: "See Who Likes You", free: false, premium: true },
        { label: "Top Picks", free: false, premium: true },
        { label: "Free Super Likes", free: false, premium: true },
      ],
    },
    {
      title: "Instanct",
      tierLabel: "Platinum",
      gradientColors: ["#434343", "#b1b1b1", "#e5e4e2"] as const,
      tierColor: "#E5E4E2",
      features: [
        { label: "Priority Likes", free: false, premium: true },
        { label: "Unlimited Rewinds", free: false, premium: true },
        { label: "Boost Visibility", free: false, premium: true },
      ],
    },
    {
      title: "Instanct",
      tierLabel: "Diamond",
      gradientColors: ["#1a2980", "#26d0ce"] as const,
      tierColor: "#26D0CE",
      features: [
        { label: "Message Before Match", free: false, premium: true },
        { label: "Exclusive Badge", free: false, premium: true },
        { label: "See All Likes Instantly", free: false, premium: true },
      ],
    },
  ];

  return (
    <View className={cn("flex items-center justify-center", className)}>
      <Carousel
        width={width}
        height={420}
        data={premiumTiers}
        renderItem={({ item }) => <PremiumCard {...item} />}
        mode="parallax"
        loop
        autoPlay
        autoPlayInterval={3500}
        scrollAnimationDuration={900}
      />
    </View>
  );
};
