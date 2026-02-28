import React from "react";
import { View } from "react-native";

export type ScrollViewContextType = {
  scrollToView: (viewRef: React.RefObject<View | null>) => void;
};

export const ScrollViewContext = React.createContext<ScrollViewContextType>({
  scrollToView: () => {},
});
