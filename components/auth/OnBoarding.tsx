import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import * as React from "react";
import { Dimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { THEME } from "~/lib/theme";
import { cn } from "~/lib/utils";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";

const data = [...new Array(3).keys()];
const width = Dimensions.get("window").width;

interface OnBoardingProps {
  className?: string;
}

export default function OnBoarding({ className }: OnBoardingProps) {
  const { colorScheme } = useColorScheme();
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
      className={cn("flex-1 justify-between mb-8", className)}
    >
      <View className="flex-1 flex flex-col justify-between">
        <View className="flex flex-row gap-2 px-4 items-center mt-5">
          <Image
            source={require("~/assets/images/logo.png")}
            style={{ width: 60, height: 60 }}
          />
          <Text className="text-[22px] font-bold italic">Instanct</Text>
        </View>

        <View>
          <Carousel
            width={width}
            ref={ref}
            style={{ width, height: width }}
            data={data}
            onProgressChange={progress}
            renderItem={({ index }) => (
              <View className="justify-center items-center">
                <Image
                  source={require("~/assets/images/logo.png")}
                  style={{ width, height: width }}
                />
              </View>
            )}
            autoPlayInterval={3000}
            autoPlay
          />

          <Pagination.Basic
            progress={progress}
            data={data}
            dotStyle={{
              backgroundColor:
                colorScheme == "dark"
                  ? THEME.dark.primary
                  : THEME.light.primary,
              borderRadius: 50,
            }}
            containerStyle={{ gap: 5, marginTop: 10 }}
            onPress={onPressPagination}
          />
        </View>

        <View className="flex flex-col gap-4 px-6 mb-2">
          <Button
            size="lg"
            className="w-full rounded-lg"
            onPress={() => router.navigate("/auth/sign-in")}
          >
            <Text className="text-lg font-bold">Get Started</Text>
          </Button>

          <Button
            size="lg"
            variant="secondary"
            className="w-full gap-3 rounded-lg border-border"
            onPress={() => router.navigate("/auth/sign-in")}
          >
            <Image
              source={require("~/assets/images/google.png")}
              style={{ width: 22, height: 22 }}
              contentFit="contain"
            />
            <Text className="text-lg font-bold">Continue with Google</Text>
          </Button>
        </View>
      </View>
    </StableSafeAreaView>
  );
}
