import React from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
  runOnJS,
  type SharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { cn } from "~/lib/utils";
import { THEME, hslToHex } from "~/lib/theme";
import { SelectOption } from "./form-builder/types";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const ITEM_HEIGHT = 25;
const VISIBLE_ITEMS = 7;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const HALF = Math.floor(VISIBLE_ITEMS / 2);

interface StableScrollableProps<T extends string = string> {
  options: SelectOption[];
  /** Currently selected value (controlled) */
  value?: T;
  /** Fires when a new option snaps into the centre */
  onChange?: (option: SelectOption) => void;
  className?: string;
}

const WheelItem = ({
  index,
  label,
  scrollY,
  selectedTextColor,
  textColor,
}: {
  index: number;
  label: string;
  scrollY: SharedValue<number>;
  selectedTextColor: string;
  textColor: string;
}) => {
  const animStyle = useAnimatedStyle(() => {
    // Distance (in items) from the centre slot
    const centreOffset = scrollY.value / ITEM_HEIGHT;
    const dist = index - centreOffset;

    // Rotation around X axis (wheel cylinder)
    const rotateX = interpolate(
      dist,
      [-HALF - 1, 0, HALF + 1],
      [-70, 0, 70],
      Extrapolation.CLAMP,
    );

    // Vertical translation to simulate curvature
    const translateY = interpolate(
      dist,
      [-HALF - 1, 0, HALF + 1],
      [-ITEM_HEIGHT * 0.4, 0, ITEM_HEIGHT * 0.4],
      Extrapolation.CLAMP,
    );

    // Scale items smaller as they move away from centre
    const scale = interpolate(
      Math.abs(dist),
      [0, HALF, HALF + 1],
      [1, 0.75, 0.65],
      Extrapolation.CLAMP,
    );

    // Fade items toward the edges
    const opacity = interpolate(
      Math.abs(dist),
      [0, HALF - 0.5, HALF + 1],
      [1, 0.4, 0],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { translateY },
        { perspective: 800 },
        { rotateX: `${rotateX}deg` },
        { scale },
      ],
      opacity,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const centreOffset = scrollY.value / ITEM_HEIGHT;
    const dist = Math.abs(index - centreOffset);

    const isSelected = dist < 0.5;
    return {
      color: isSelected ? selectedTextColor : textColor,
      borderColor: isSelected ? selectedTextColor : "transparent",
      fontWeight: isSelected ? ("700" as const) : ("400" as const),
      fontSize: interpolate(dist, [0, HALF], [16, 10], Extrapolation.CLAMP),
    };
  });

  return (
    <Animated.View
      style={[
        {
          height: ITEM_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
        },
        animStyle,
      ]}
    >
      <Animated.Text style={textStyle} numberOfLines={1}>
        {label}
      </Animated.Text>
    </Animated.View>
  );
};

export const StableScrollable = <T extends string = string>({
  options,
  value,
  onChange,
  className,
}: StableScrollableProps<T>) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const colors = React.useMemo(() => {
    const t = isDark ? THEME.dark : THEME.light;
    return {
      ribbon: hslToHex(t.input),
      selectedText: hslToHex(t.foreground),
      text: hslToHex(t.cardForeground),
    };
  }, [isDark]);
  const scrollY = useSharedValue(0);
  const currentIndex = useSharedValue(-1);
  const scrollRef = React.useRef<Animated.ScrollView>(null);

  const triggerHaptic = React.useCallback(() => {
    Haptics.selectionAsync();
  }, []);

  React.useEffect(() => {
    if (value == null || !scrollRef.current) return;
    const idx = options.findIndex((o) => o.value === value);
    if (idx >= 0) {
      (scrollRef.current as any).scrollTo?.({
        y: idx * ITEM_HEIGHT,
        animated: true,
      });
    }
  }, [value, options]);

  const emitChange = React.useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, options.length - 1));
      if (options[clamped]) {
        onChange?.(options[clamped]);
      }
    },
    [onChange, options],
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
      const idx = Math.round(e.contentOffset.y / ITEM_HEIGHT);
      if (idx !== currentIndex.value) {
        currentIndex.value = idx;
        runOnJS(triggerHaptic)();
      }
    },
  });

  const lastEmittedIndex = React.useRef(-1);

  const handleScrollEnd = React.useCallback(
    (e: any) => {
      const y = e.nativeEvent.contentOffset.y;
      const idx = Math.round(y / ITEM_HEIGHT);
      if (idx !== lastEmittedIndex.current) {
        lastEmittedIndex.current = idx;
        emitChange(idx);
      }
    },
    [emitChange],
  );

  return (
    <View
      className={cn(
        "items-center justify-center overflow-hidden rounded-md",
        className,
      )}
      style={{
        height: WHEEL_HEIGHT,
        backgroundColor: "transparent",
        borderWidth: 0,
      }}
    >
      <MaskedView
        style={{ flex: 1, width: "100%" }}
        maskElement={
          <LinearGradient
            colors={["transparent", "#000", "#000", "transparent"]}
            locations={[0, 0.2, 0.8, 1]}
            style={{ flex: 1 }}
          />
        }
      >
        <GestureDetector gesture={Gesture.Native()}>
          <Animated.ScrollView
            ref={scrollRef}
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            bounces={false}
            overScrollMode="never"
            onMomentumScrollEnd={handleScrollEnd}
            onScrollEndDrag={(e) => {
              // Also fire when scroll ends without momentum (slow drag/tap)
              handleScrollEnd(e);
            }}
            style={{ backgroundColor: "transparent" }}
            contentContainerStyle={{
              paddingTop: HALF * ITEM_HEIGHT,
              paddingBottom: HALF * ITEM_HEIGHT,
            }}
          >
            {options.map((opt, i) => (
              <WheelItem
                key={opt.value}
                index={i}
                label={opt.label}
                scrollY={scrollY}
                selectedTextColor={colors.selectedText}
                textColor={colors.text}
              />
            ))}
          </Animated.ScrollView>
        </GestureDetector>
      </MaskedView>
    </View>
  );
};
