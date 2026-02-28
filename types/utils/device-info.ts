import * as Device from "expo-device";

export const generateDeviceInfo = () => {
  return {
    model: Device.modelName || "Unknown",
    platform: Device.osName || "Unknown",
    version: Device.osVersion || "Unknown",
    manufacturer: Device.manufacturer || "Unknown",
  };
};
