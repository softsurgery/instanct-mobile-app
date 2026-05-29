import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
  interpolate,
  Extrapolation,
  withDecay,
  withSpring,
  withTiming,
  cancelAnimation,
  runOnJS,
  type SharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "~/lib/utils";
import { hslToHex } from "~/lib/theme";
import { SelectOption } from "./form-builder/types";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useColorPalette } from "@/hooks/useColorPalette";

// ─── Constants ───────────────────────────────────────────────────────────────
const ITEM_HEIGHT = 25;
const VISIBLE_ITEMS = 7;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const HALF = Math.floor(VISIBLE_ITEMS / 2);

const SNAP_SPRING = { damping: 20, stiffness: 260, mass: 0.8 };
const DECAY_DECELERATION = 0.997;
const RUBBER_BAND_FACTOR = 0.3;

// ─── Types ───────────────────────────────────────────────────────────────────
interface StableScrollableProps<T extends string = string> {
  options: SelectOption[];
  /** Currently selected value (controlled) */
  value?: T;
  /** Fires when a new option snaps into the centre */
  onChange?: (option: SelectOption) => void;
  className?: string;
}

// ─── Helper: rubber-band clamp ───────────────────────────────────────────────
function rubberBandClamp(
  offset: number,
  min: number,
  max: number,
  dim: number,
  factor: number,
): number {
  "worklet";
  if (offset >= min && offset <= max) return offset;
  const overflow = offset < min ? offset - min : offset - max;
  return (
    (offset < min ? min : max) +
    factor *
      dim *
      (1 - Math.exp(-Math.abs(overflow) / (factor * dim))) *
      Math.sign(overflow)
  );
}

// ─── Snap helper ─────────────────────────────────────────────────────────────
function snapPoint(value: number, max: number): number {
  "worklet";
  const snapped = Math.round(value / ITEM_HEIGHT) * ITEM_HEIGHT;
  return Math.max(0, Math.min(snapped, max));
}

// ─── Memoised wheel item ─────────────────────────────────────────────────────
const WheelItem = React.memo(
  ({
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
      const absDist = Math.abs(dist);

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
        absDist,
        [0, HALF, HALF + 1],
        [1, 0.75, 0.65],
        Extrapolation.CLAMP,
      );

      // Fade items toward the edges
      const opacity = interpolate(
        absDist,
        [0, HALF - 0.5, HALF + 1],
        [1, 0.4, 0],
        Extrapolation.CLAMP,
      );

      return {
        // Position this item relative to the centre of the wheel
        // Each item is placed at centre + dist * ITEM_HEIGHT
        transform: [
          { translateY: (HALF + dist) * ITEM_HEIGHT + translateY },
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
        fontWeight: isSelected ? ("700" as const) : ("400" as const),
        fontSize: interpolate(dist, [0, HALF], [18, 14], Extrapolation.CLAMP),
      };
    });

    return (
      <Animated.View style={[styles.item, animStyle]}>
        <Animated.Text style={textStyle} numberOfLines={1}>
          {label}
        </Animated.Text>
      </Animated.View>
    );
  },
);
WheelItem.displayName = "WheelItem";

// ─── Main component ──────────────────────────────────────────────────────────
export const StableScrollable = <T extends string = string>({
  options,
  value,
  onChange,
  className,
}: StableScrollableProps<T>) => {
  const { palette } = useColorPalette();

  const colors = React.useMemo(() => {
    return {
      selectedText: hslToHex(palette.foreground),
      text: hslToHex(palette.cardForeground),
    };
  }, [palette]);

  const optionCount = options.length;
  const maxScroll = Math.max(0, (optionCount - 1) * ITEM_HEIGHT);

  // ── Compute initial scroll position from the controlled value ─────────
  const initialIndex = React.useMemo(() => {
    if (value == null) return 0;
    const idx = options.findIndex((o) => o.value === value);
    return idx >= 0 ? idx : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Shared values ────────────────────────────────────────────────────────
  const scrollY = useSharedValue(initialIndex * ITEM_HEIGHT);
  const dragStartY = useSharedValue(0);
  const lastHapticIndex = useSharedValue(initialIndex);
  const isSnapping = useSharedValue(false);
  const isFirstRender = React.useRef(true);

  // ── Callbacks (JS thread) ────────────────────────────────────────────────
  const triggerHaptic = React.useCallback(() => {
    Haptics.selectionAsync();
  }, []);

  const stableOnChange = React.useRef(onChange);
  stableOnChange.current = onChange;

  const stableOptions = React.useRef(options);
  stableOptions.current = options;

  const emitChange = React.useCallback((index: number) => {
    const opts = stableOptions.current;
    const cb = stableOnChange.current;
    const clamped = Math.max(0, Math.min(index, opts.length - 1));
    if (opts[clamped]) {
      cb?.(opts[clamped]);
    }
  }, []);

  // ── Haptic tick on index change (UI thread) ──────────────────────────────
  useDerivedValue(() => {
    const idx = Math.round(scrollY.value / ITEM_HEIGHT);
    if (idx !== lastHapticIndex.value && !isSnapping.value) {
      lastHapticIndex.value = idx;
      runOnJS(triggerHaptic)();
    }
  });

  // ── Controlled value: scroll to updated value (skip first render) ────
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (value == null) return;
    const idx = options.findIndex((o) => o.value === value);
    if (idx >= 0) {
      const target = idx * ITEM_HEIGHT;
      scrollY.value = withTiming(target, { duration: 300 });
      lastHapticIndex.value = idx;
    }
  }, [value, options, scrollY, lastHapticIndex]);

  // ── Pan gesture (replaces ScrollView entirely) ───────────────────────────
  const panGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-2, 2])
        .failOffsetX([-20, 20])
        .blocksExternalGesture()
        .onStart(() => {
          cancelAnimation(scrollY);
          dragStartY.value = scrollY.value;
          isSnapping.value = false;
        })
        .onUpdate((e) => {
          const raw = dragStartY.value - e.translationY;
          scrollY.value = rubberBandClamp(
            raw,
            0,
            maxScroll,
            WHEEL_HEIGHT,
            RUBBER_BAND_FACTOR,
          );
        })
        .onEnd((e) => {
          const velocity = -e.velocityY;

          // If out of bounds, spring back
          if (scrollY.value < 0 || scrollY.value > maxScroll) {
            const target = snapPoint(
              Math.max(0, Math.min(scrollY.value, maxScroll)),
              maxScroll,
            );
            isSnapping.value = true;
            const idx = Math.round(target / ITEM_HEIGHT);
            runOnJS(emitChange)(idx);
            scrollY.value = withSpring(target, SNAP_SPRING, (finished) => {
              if (finished) {
                isSnapping.value = false;
              }
            });
            return;
          }

          // Inertial decay, then snap
          scrollY.value = withDecay(
            {
              velocity,
              deceleration: DECAY_DECELERATION,
              clamp: [0, maxScroll],
              rubberBandEffect: false,
            },
            (finished) => {
              if (finished !== false) {
                const target = snapPoint(scrollY.value, maxScroll);
                isSnapping.value = true;
                const idx = Math.round(target / ITEM_HEIGHT);
                runOnJS(emitChange)(idx);
                scrollY.value = withSpring(
                  target,
                  SNAP_SPRING,
                  (snapFinished) => {
                    if (snapFinished) {
                      isSnapping.value = false;
                    }
                  },
                );
              }
            },
          );
        }),
    [scrollY, dragStartY, maxScroll, emitChange, isSnapping],
  );

  // ── Render items (stable across re-renders) ─────────────────────────────
  const renderedItems = React.useMemo(
    () =>
      options.map((opt, i) => (
        <WheelItem
          key={opt.value}
          index={i}
          label={opt.label}
          scrollY={scrollY}
          selectedTextColor={colors.selectedText}
          textColor={colors.text}
        />
      )),
    [options, scrollY, colors.selectedText, colors.text],
  );

  return (
    <View
      className={cn("items-center justify-center overflow-hidden", className)}
      style={styles.container}
    >
      <MaskedView
        style={styles.mask}
        maskElement={
          <LinearGradient
            colors={["transparent", "#000", "#000", "transparent"]}
            locations={[0, 0.2, 0.8, 1]}
            style={StyleSheet.absoluteFill}
          />
        }
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View style={styles.wheelContainer}>
            {renderedItems}
          </Animated.View>
        </GestureDetector>
      </MaskedView>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    height: WHEEL_HEIGHT,
    backgroundColor: "transparent",
  },
  mask: {
    flex: 1,
    width: "100%",
  },
  wheelContainer: {
    width: "100%",
    height: WHEEL_HEIGHT,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
});
