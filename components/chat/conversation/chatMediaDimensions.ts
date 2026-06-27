import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

export const CHAT_MEDIA_WIDTH = Math.round(screenWidth * 0.72);
export const CHAT_MEDIA_HEIGHT = Math.round(CHAT_MEDIA_WIDTH * 0.75);
