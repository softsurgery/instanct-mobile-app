import React, { forwardRef } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Laptop, Smartphone, Monitor } from "lucide-react-native";

export const getDeviceIcon = (os: string = "", name: string = "") => {
  const osLower = os.toLowerCase();
  const nameLower = name.toLowerCase();

  if (
    osLower.includes("mac") ||
    osLower.includes("ios") ||
    nameLower.includes("mac") ||
    nameLower.includes("iphone") ||
    nameLower.includes("ipad") ||
    nameLower.includes("apple")
  ) {
    const AppleIcon = forwardRef((props: any, ref: any) => (
      <MaterialCommunityIcons name="apple" ref={ref} {...props} />
    ));
    AppleIcon.displayName = "AppleIcon";
    return AppleIcon;
  }
  if (osLower.includes("android") || nameLower.includes("android")) {
    const AndroidIcon = forwardRef((props: any, ref: any) => (
      <MaterialCommunityIcons name="android" ref={ref} {...props} />
    ));
    AndroidIcon.displayName = "AndroidIcon";
    return AndroidIcon;
  }
  if (osLower.includes("windows") || nameLower.includes("windows")) {
    const WindowsIcon = forwardRef((props: any, ref: any) => (
      <MaterialCommunityIcons name="microsoft-windows" ref={ref} {...props} />
    ));
    WindowsIcon.displayName = "WindowsIcon";
    return WindowsIcon;
  }
  if (
    osLower.includes("linux") ||
    nameLower.includes("linux") ||
    nameLower.includes("ubuntu")
  ) {
    const LinuxIcon = forwardRef((props: any, ref: any) => (
      <MaterialCommunityIcons name="linux" ref={ref} {...props} />
    ));
    LinuxIcon.displayName = "LinuxIcon";
    return LinuxIcon;
  }


  if (
    osLower.includes("ios") ||
    osLower.includes("android") ||
    nameLower.includes("phone")
  ) {
    return Smartphone;
  }
  if (
    osLower.includes("mac") ||
    osLower.includes("windows") ||
    osLower.includes("linux") ||
    nameLower.includes("laptop") ||
    nameLower.includes("macbook")
  ) {
    return Laptop;
  }
  return Monitor;
};
