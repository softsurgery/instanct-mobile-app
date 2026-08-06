export default ({ config }) => ({
  ...config,
  name: "Instanct",
  slug: "instanct-mobile-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "instanctmobileapp",
  userInterfaceStyle: "automatic",
  assetBundlePatterns: ["**/*"],
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "instanctmobileapp",
    infoPlist: {
      UIDesignRequiresCompatibility: true,
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true
      }
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
    softwareKeyboardLayoutMode: "pan",
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.softsurgery.instanctmobileapp",
  },
  plugins: [
    "expo-font",
    "expo-localization",
    "expo-notifications",
    "expo-router",
    "expo-web-browser",
    "expo-asset",
    "@react-native-community/datetimepicker",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/logo.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    [
      "expo-audio",
      {
        "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone."
      }
    ],
    "expo-video"
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
  },
});
