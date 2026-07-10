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
import { AcceptTerms } from "./AcceptTerms";
import { Rocket, Zap, ShieldCheck } from "lucide-react-native";
import { useColorPalette } from "@/hooks/useColorPalette";
import { ThemeToggle } from "../shared/ThemeToggle";
import { useTranslation } from "react-i18next";

const width = Dimensions.get("window").width;

const ONBOARDING_DATA = [
  { key: "welcome", icon: Rocket },
  { key: "integration", icon: Zap },
  { key: "security", icon: ShieldCheck },
];

interface OnBoardingProps {
  className?: string;
}

export default function OnBoarding({ className }: OnBoardingProps) {
  const { t } = useTranslation("explore");
  const { palette } = useColorPalette();
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);
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
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row gap-3 px-6 items-center">
            <Image
              source={require("~/assets/images/icon.png")}
              style={{ width: 60, height: 60, borderRadius: 12 }}
              contentFit="cover"
            />
            <Text className="text-3xl font-extrabold tracking-tight mt-2">
              Instanct
            </Text>
          </View>
          <ThemeToggle className="mx-6" />
        </View>

        <View className="flex-1 justify-center mt-8">
          <Carousel
            width={width}
            ref={ref}
            style={{ width: width, height: 250 }}
            data={ONBOARDING_DATA}
            onProgressChange={progress}
            renderItem={({ item, index }) => {
              const IconComponent = item.icon;
              return (
                <View className="flex-1 justify-center items-center px-8">
                  <View className="bg-primary/10 p-6 rounded-full mb-2">
                    <IconComponent
                      size={80}
                      color={palette.primary}
                      strokeWidth={1.5}
                    />
                  </View>
                  <Text className="text-3xl font-bold text-center mb-2 text-foreground">
                    {t(`onBoarding.slides.${item.key}.title`)}
                  </Text>
                  <Text className="text-base text-center text-muted-foreground leading-relaxed">
                    {t(`onBoarding.slides.${item.key}.description`)}
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

        <View className="mx-6 mt-8 mb-4">
          <AcceptTerms
            className="mt-4"
            checked={acceptedTerms}
            onCheckedChange={setAcceptedTerms}
          />
          <SSOButtons
            isSignInPending={false}
            acceptedTerms={acceptedTerms}
            classic
          />
        </View>
      </View>
    </StableSafeAreaView>
  );
}
