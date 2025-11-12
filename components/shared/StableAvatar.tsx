import { Image } from "expo-image";
import React, { createContext, useContext, useState } from "react";
import { StyleSheet, View } from "react-native";
import { cn } from "~/lib/utils";

const AvatarContext = createContext<{
  showFallback: boolean;
  setShowFallback: (value: boolean) => void;
} | null>(null);

const Avatar = React.forwardRef<
  View,
  React.ComponentPropsWithoutRef<typeof View> & { alt?: string }
>(({ className, style, children, ...props }, ref) => {
  const [showFallback, setShowFallback] = useState(false);

  return (
    <AvatarContext.Provider value={{ showFallback, setShowFallback }}>
      <View
        ref={ref}
        style={[styles.container, style]}
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-full bg-muted",
          className
        )}
        {...props}
      >
        {children}
      </View>
    </AvatarContext.Provider>
  );
});
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  Image,
  React.ComponentPropsWithoutRef<typeof Image>
>(({ className, style, source, ...props }, ref) => {
  const context = useContext(AvatarContext);
  if (!context) throw new Error("AvatarImage must be used within Avatar");

  const { setShowFallback } = context;

  React.useEffect(() => {
    if (
      !source ||
      typeof source !== "object" ||
      Array.isArray(source) ||
      !("uri" in source) ||
      !(source as { uri?: string }).uri
    ) {
      setShowFallback(true);
    }
  }, [source, setShowFallback]);

  if (
    !source ||
    typeof source !== "object" ||
    !("uri" in source) ||
    !(source as { uri?: string }).uri
  ) {
    return null;
  }

  return (
    <Image
      ref={ref}
      source={source}
      style={[StyleSheet.absoluteFill, style]}
      className={cn("aspect-square w-full h-full", className)}
      contentFit="cover"
      onError={() => setShowFallback(true)}
      onLoad={() => setShowFallback(false)}
      cachePolicy="memory-disk"
      {...props}
    />
  );
});

AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  View,
  React.ComponentPropsWithoutRef<typeof View>
>(({ className, children, style, ...props }, ref) => {
  const context = useContext(AvatarContext);
  if (!context) throw new Error("AvatarFallback must be used within Avatar");

  const { showFallback } = context;

  if (!showFallback) return null;

  return (
    <View
      ref={ref}
      style={[StyleSheet.absoluteFill, styles.fallback, style]}
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      {children}
    </View>
  );
});
AvatarFallback.displayName = "AvatarFallback";

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1,
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export { Avatar, AvatarFallback, AvatarImage };
