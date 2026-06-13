import { Image } from "expo-image";
import * as React from "react";
import { Dimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { SSOButtons } from "./SSOButtons";
import { Rocket, Zap, ShieldCheck } from "lucide-react-native";
import { useColorPalette } from "@/hooks/useColorPalette";

const width = Dimensions.get("window").width;

const ONBOARDING_DATA = [
  {
    title: "Welcome to Instanct",
    description:
      "Experience the next generation of connectivity with our cutting-edge platform tailored just for you.",
    icon: Rocket,
  },
  {
    title: "Seamless Integration",
    description:
      "Sync your data effortlessly and enjoy a flawless experience across all your devices, anywhere, anytime.",
    icon: Zap,
  },
  {
    title: "Secure & Private",
    description:
      "Your privacy is our top priority. We employ industry-leading security to keep your information safe.",
    icon: ShieldCheck,
  },
];

interface OnBoardingProps {
  className?: string;
}

export default function OnBoarding({ className }: OnBoardingProps) {
  const { palette } = useColorPalette();
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  return (
    <StableSafeAreaView
      className={cn("flex-1 justify-between bg-background", className)}
    >
      <View className="flex-1 flex flex-col justify-between py-4">
        <View className="flex flex-row gap-3 px-6 items-center">
          <Image
            source={require("~/assets/images/logo.png")}
            style={{ width: 60, height: 60, borderRadius: 12 }}
            contentFit="cover"
          />
          <Text className="text-3xl font-extrabold tracking-tight mt-2">
            Instanct
          </Text>
        </View>

        <View className="flex-1 justify-center mt-8">
          <Carousel
            width={width}
            ref={ref}
            style={{ width: width, height: 300 }}
            data={ONBOARDING_DATA}
            onProgressChange={progress}
            renderItem={({ item, index }) => {
              const IconComponent = item.icon;
              return (
                <View className="flex-1 justify-center items-center px-8">
                  <View className="bg-primary/10 p-6 rounded-full mb-8">
                    <IconComponent
                      size={100}
                      color={palette.primary}
                      strokeWidth={1.5}
                    />
                  </View>
                  <Text className="text-3xl font-bold text-center mb-4 text-foreground">
                    {item.title}
                  </Text>
                  <Text className="text-base text-center text-muted-foreground leading-relaxed">
                    {item.description}
                  </Text>
                </View>
              );
            }}
            autoPlayInterval={4000}
            autoPlay
          />

          <Pagination.Basic
            progress={progress}
            data={ONBOARDING_DATA}
            dotStyle={{
              backgroundColor: palette.mutedForeground,
              borderRadius: 50,
              width: 8,
              height: 8,
            }}
            activeDotStyle={{
              backgroundColor: palette.foreground,
              width: 24,
              height: 8,
              borderRadius: 50,
            }}
            containerStyle={{ gap: 8, marginTop: 24 }}
            onPress={onPressPagination}
          />
        </View>

        <SSOButtons
          className="mx-6 mt-8 mb-4"
          isSignInPending={false}
          classic
        />
      </View>
    </StableSafeAreaView>
  );
}
