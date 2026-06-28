import React from "react";
import { ChevronLeft } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import { Icon } from "../ui/icon";
import { router, useNavigation } from "expo-router";
import { Text } from "../ui/text";
import { cn } from "@/lib/utils";
import { useColorPalette } from "@/hooks/useColorPalette";

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

const cleanRouteName = (routeName: string) => {
  if (!routeName) return "Back";
  if (routeName === "index") return "Explore";

  const parts = routeName
    .split("/")
    .filter((p) => p !== "index" && p !== "main");
  const lastPart = parts[parts.length - 1] || "Back";

  return lastPart
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const AppHeaderBack = ({ className }: AppHeaderBackProps) => {
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

  const getPreviousRouteTitle = () => {
    if (routes && routes.length > 1) {
      const prevRoute = routes[routes.length - 2];
      const leafRoute = getLeafRoute(prevRoute);
      return cleanRouteName(leafRoute?.name);
    }
    return "Back";
  };

  return (
    <TouchableOpacity
      onPress={router.back}
      className={cn("flex flex-row items-center h-9", className)}
    >
      <Icon
        as={ChevronLeft}
        size={28}
        color={palette.foreground}
        style={{ opacity: 0.75 }}
      />
      <Text
        variant={"large"}
        style={{ color: palette.foreground, opacity: 0.75 }}
      >
        {getPreviousRouteTitle()}
      </Text>
    </TouchableOpacity>
  );
};
