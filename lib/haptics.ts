import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/**
 * Triggers impact haptic feedback.
 * On Android, Medium impacts are often too strong and are mapped to Light.
 */
export const triggerHaptic = async (
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium,
) => {
  if (
    Platform.OS === "android" &&
    style === Haptics.ImpactFeedbackStyle.Medium
  ) {
    return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  return Haptics.impactAsync(style);
};

/**
 * Triggers a selection haptic feedback.
 */
export const triggerSelectionHaptic = async () => {
  return Haptics.selectionAsync();
};
