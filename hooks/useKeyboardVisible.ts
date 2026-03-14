import React from "react";
import { Keyboard } from "react-native";

export const useKeyboardVisible = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(
    Keyboard.isVisible(),
  );

  React.useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardWillShow", () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardWillHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return isKeyboardVisible;
};
