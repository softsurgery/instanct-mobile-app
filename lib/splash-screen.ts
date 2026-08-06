import * as SplashScreen from "expo-splash-screen";

// Must run before other app modules load so the native splash stays visible.
export const splashPrevented = SplashScreen.preventAutoHideAsync();
