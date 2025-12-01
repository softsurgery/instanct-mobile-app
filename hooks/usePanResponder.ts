import { useRef } from "react";
import { Dimensions, PanResponder, PanResponderInstance } from "react-native";

/**
 * usePanResponder
 *
 * Returns a PanResponder that intercepts gestures starting
 * near the bottom edge of the screen to prevent iOS split-screen.
 *
 * @param bottomEdgeHeight Height from bottom to block gestures (default: 50)
 */
export const usePanResponder = (bottomEdgeHeight = 50): PanResponderInstance => {
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Intercept gestures that start near the bottom of the screen
        return gestureState.moveY > Dimensions.get("window").height - bottomEdgeHeight;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: () => {},
      onPanResponderRelease: () => {},
      onPanResponderTerminate: () => {},
    })
  ).current;

  return panResponder;
};
