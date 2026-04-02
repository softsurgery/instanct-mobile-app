import { Image } from "expo-image";
import { useColorScheme } from "nativewind";
import * as React from "react";
import { Dimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { Text } from "~/components/ui/text";
import { THEME } from "~/lib/theme";
import { cn } from "~/lib/utils";
import { StableSafeAreaView } from "../shared/StableSafeAreaView";
import { SSOButtons } from "./SSOButtons";

const data = [...new Array(3).keys()];
const width = Dimensions.get("window").width;
const eWidth = width * 0.8;

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
      className={cn("flex-1 justify-between bg-background", className)}
    >
      <View className="flex-1 flex flex-col justify-between">
        <View className="flex flex-row gap-2 px-4 items-center">
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
            style={{ width: width, height: eWidth }}
            data={data}
            onProgressChange={progress}
            renderItem={({ index }) => (
              <View className="justify-center items-center">
                <Image
                  source={require("~/assets/images/logo.png")}
                  style={{ width: eWidth, height: eWidth }}
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
                colorScheme === "dark"
                  ? THEME.dark.foreground
                  : THEME.light.foreground,
              borderRadius: 50,
            }}
            containerStyle={{ gap: 5 }}
            onPress={onPressPagination}
          />
        </View>

        <SSOButtons
          className="mx-4 mb-4 flex-1"
          isSignInPending={false}
          classic
        />
      </View>
    </StableSafeAreaView>
  );
}
