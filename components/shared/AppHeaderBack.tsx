import React from "react";
import { ChevronLeft } from "lucide-react-native";
import { TouchableOpacity, Dimensions } from "react-native";
import { Icon } from "../ui/icon";
import { router, useNavigation } from "expo-router";
import { Text } from "../ui/text";
import { cn } from "@/lib/utils";
import { useColorPalette } from "@/hooks/useColorPalette";
import { useTranslation } from "react-i18next";

interface AppHeaderBackProps {
  className?: string;
}

const getLeafRoute = (route: any): any => {
  if (
    route &&
    route.state &&
    route.state.routes &&
    typeof route.state.index === "number"
  ) {
    return getLeafRoute(route.state.routes[route.state.index]);
  }
  return route;
};

/** kebab-case → camelCase: "session-starter" → "sessionStarter" */
const toCamelCase = (str: string) =>
  str.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

/**
 * Extracts the active tab name from a nested (tabs) route state.
 * e.g. route { name:"(tabs)", state:{ index:2, routes:[{name:"index"},{name:"activities"},{name:"map"},{name:"menu"}] } }
 *   → "map"
 */
const getActiveTabName = (route: any): string | null => {
  const tabState = route?.state;
  if (
    tabState &&
    Array.isArray(tabState.routes) &&
    typeof tabState.index === "number"
  ) {
    return tabState.routes[tabState.index]?.name ?? null;
  }
  return null;
};

export const AppHeaderBack = ({ className }: AppHeaderBackProps) => {
  const { t, i18n } = useTranslation("screens");
  const { palette } = useColorPalette();
  const navigation = useNavigation();
  const [routes, setRoutes] = React.useState(
    () => navigation.getState()?.routes,
  );

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("state", () => {
      setRoutes(navigation.getState()?.routes);
    });
    return unsubscribe;
  }, [navigation]);

  /** Try a key in the "screens" namespace; return translation or null. */
  const tryKey = (key: string): string | null => {
    if (key && i18n.exists(key, { ns: "screens" })) {
      return t(key);
    }
    return null;
  };

  const getPreviousRouteTitle = (): string => {
    if (routes && routes.length > 1) {
      const prevRoute = routes[routes.length - 2];
      const leafRoute = getLeafRoute(prevRoute);
      const routeName: string = leafRoute?.name ?? "";

      // 1. Explicit title passed via navigation params
      const paramTitle = leafRoute?.params?.title;
      if (typeof paramTitle === "string" && paramTitle) {
        return tryKey(paramTitle) ?? paramTitle;
      }

      // 2. For (tabs) routes, detect the active tab name
      if (routeName === "(tabs)") {
        const tabName = getActiveTabName(prevRoute);
        if (tabName && tabName !== "index") {
          return tryKey(tabName) ?? t("back");
        }
        return tryKey("explore") ?? t("back");
      }

      // 3. Try the full route name directly (works for "chat", "notifications", etc.)
      const directMatch = tryKey(routeName);
      if (directMatch) return directMatch;

      // 4. Split into segments and try strategies
      const segments = routeName
        .split("/")
        .map((s) => s.replace(/\([^)]+\)/g, "").replace(/\[[^\]]+\]/g, ""))
        .filter((s) => s !== "" && s !== "index");

      // Try last segment as-is (e.g. "industries", "calendar")
      const lastSegment = segments[segments.length - 1] ?? "";
      if (lastSegment) {
        const asIs = tryKey(lastSegment);
        if (asIs) return asIs;

        // Try camelCase of last segment (e.g. "session-starter" → "sessionStarter")
        const camel = tryKey(toCamelCase(lastSegment));
        if (camel) return camel;
      }

      // Try joining all segments as camelCase (e.g. "sessions/details" → try "sessionDetails")
      if (segments.length > 1) {
        const joined = segments
          .map((s, i) => {
            const camel = toCamelCase(s);
            return i === 0
              ? camel
              : camel.charAt(0).toUpperCase() + camel.slice(1);
          })
          .join("");
        const joinedMatch = tryKey(joined);
        if (joinedMatch) return joinedMatch;
      }

      // Try first segment only (e.g. "profile/update-profile" → "profile", "sessions/index" → "sessions")
      if (segments.length > 0) {
        const firstMatch = tryKey(segments[0]);
        if (firstMatch) return firstMatch;
      }

      // If segments is empty (e.g. route was "index", "(tabs)", or "main/(tabs)/index")
      // it means we are at the root tab (Explore)
      if (segments.length === 0) {
        return tryKey("explore") ?? t("");
      }
    }

    return t("");
  };

  const SCREEN_WIDTH = Dimensions.get("screen").width;

  return (
    <TouchableOpacity
      onPress={router.back}
      className={cn("flex-row items-center h-9", className)}
      style={{
        width: SCREEN_WIDTH * 0.4,
        flexShrink: 1,
      }}
    >
      <Icon
        as={ChevronLeft}
        size={28}
        color={palette.foreground}
        style={{
          opacity: 0.75,
          flexShrink: 0,
        }}
      />

      <Text
        variant="large"
        style={{
          color: palette.foreground,
          opacity: 0.75,

          // Important
          flex: 1,
          flexShrink: 1,
          minWidth: 0,

          marginLeft: 4,
        }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {getPreviousRouteTitle()}
      </Text>
    </TouchableOpacity>
  );
};
