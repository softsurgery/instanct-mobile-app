import * as Application from "expo-application";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const DEVICE_ID_STORAGE_KEY = "instanct_secure_device_id";

let cachedDeviceId: string | null = null;

/**
 * Retrieves a persistent, unique device identifier for this device.
 *
 * Uses official platform APIs:
 * - Android: `Application.getAndroidId()` (Android ID)
 * - iOS: `Application.getIosIdForVendorAsync()` (Identifier for Vendor - IDFV)
 *
 * Persists the identifier in `expo-secure-store` (Keychain on iOS / EncryptedSharedPreferences on Android)
 * so it remains consistent across app restarts, updates, and reinstalls whenever allowed by OS policies.
 *
 * @throws {Error} If the platform fails to provide an official device identifier.
 */
export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  try {
    const storedId = await SecureStore.getItemAsync(DEVICE_ID_STORAGE_KEY);
    if (storedId && storedId.trim().length > 0) {
      cachedDeviceId = storedId;
      return storedId;
    }
  } catch (error) {
    console.warn("SecureStore read error during device ID lookup:", error);
  }

  let platformId: string | null = null;

  if (Platform.OS === "android") {
    platformId = Application.getAndroidId();
  } else if (Platform.OS === "ios") {
    platformId = await Application.getIosIdForVendorAsync();
  }

  if (!platformId || platformId.trim().length === 0) {
    throw new Error(
      `Unable to retrieve persistent device identifier for platform "${Platform.OS}". Device ID operation failed without returning a fallback.`,
    );
  }

  try {
    await SecureStore.setItemAsync(DEVICE_ID_STORAGE_KEY, platformId);
  } catch (error) {
    console.warn("Failed to persist device ID into SecureStore:", error);
  }

  cachedDeviceId = platformId;
  return platformId;
}
