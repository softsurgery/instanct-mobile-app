import * as Device from "expo-device";
import { Platform } from "react-native";

export interface ClientDeviceInfo {
  device: string;
  os: string;
}

/**
 * Returns human-readable device name (e.g. "iPhone 15 Pro" or "Pixel 8")
 * and OS string (e.g. "iOS 18.5" or "Android 14").
 */
export function getClientDeviceInfo(): ClientDeviceInfo {
  let deviceName = Device.modelName || Device.deviceName;

  if (!deviceName || deviceName.trim() === "") {
    if (Platform.OS === "ios") {
      deviceName = "iPhone";
    } else if (Platform.OS === "android") {
      deviceName = "Android Device";
    } else {
      deviceName = "Mobile Device";
    }
  }

  const osName =
    Device.osName || (Platform.OS === "ios" ? "iOS" : Platform.OS === "android" ? "Android" : "Mobile OS");
  const osVersion = Device.osVersion || "";
  const os = `${osName} ${osVersion}`.trim();

  return {
    device: deviceName,
    os,
  };
}
