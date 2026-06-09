import { useCallback } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import Constants from "expo-constants";
import { toast } from "sonner-native";
import { api } from "@/api";
import { OAuthProvider, ServerErrorResponse } from "@/types";
import { Platform } from "react-native";

// Ensure web browser redirect is handled properly
WebBrowser.maybeCompleteAuthSession();

// ─── Google OAuth Configuration ────────────────────────────────────────
// Using platform-specific environment variables, fallback to generic
const GOOGLE_CLIENT_ID =
  Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID
    : Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID
      : process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

const googleDiscovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
};

// ─── LinkedIn OAuth Configuration ──────────────────────────────────────
const LINKEDIN_CLIENT_ID = process.env.EXPO_PUBLIC_LINKEDIN_CLIENT_ID;

const linkedInDiscovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: "https://www.linkedin.com/oauth/v2/authorization",
  tokenEndpoint: "https://www.linkedin.com/oauth/v2/accessToken",
};

// ─── Apple OAuth Configuration ─────────────────────────────────────────
const appleDiscovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: "https://appleid.apple.com/auth/authorize",
  tokenEndpoint: "https://appleid.apple.com/auth/token",
};

export function useSSO() {
  // Ensure the redirect URI uses the correct scheme, 
  // For Expo Go, it uses exp:// but Google doesn't allow it. 
  // You should configure a valid Web redirect or Proxy in Google Console.
  const redirectUri =
    Constants.appOwnership === "expo"
      ? AuthSession.makeRedirectUri({
          path: "oauth",
        })
      : AuthSession.makeRedirectUri({
          scheme: "instanctmobileapp",
          path: "oauth",
        });

  console.log("Using SSO Redirect URI:", redirectUri);

  // ── Google Auth Request ────────────────────────────────────────────
  const [googleRequest, , googlePromptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID ?? "",
      redirectUri,
      scopes: ["openid", "profile", "email"],
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    googleDiscovery,
  );

  // ── LinkedIn Auth Request ──────────────────────────────────────────
  const [linkedInRequest, , linkedInPromptAsync] = AuthSession.useAuthRequest(
    {
      clientId: LINKEDIN_CLIENT_ID ?? "",
      redirectUri,
      scopes: ["openid", "profile", "email"],
      responseType: AuthSession.ResponseType.Code,
    },
    linkedInDiscovery,
  );

  // ── Apple Auth Request (iOS only) ──────────────────────────────────
  const [appleRequest, , applePromptAsync] = AuthSession.useAuthRequest(
    {
      clientId: "com.softsurgery.instanctmobileapp",
      redirectUri,
      scopes: ["name", "email"],
      responseType: AuthSession.ResponseType.IdToken,
    },
    appleDiscovery,
  );

  // ── SSO Mutation ───────────────────────────────────────────────────
  const { mutate: performSSOSignIn, isPending } = useMutation({
    mutationFn: async ({
      provider,
      idToken,
      redirectUri,
    }: {
      provider: OAuthProvider;
      idToken: string;
      redirectUri?: string;
    }) => {
      return api.auth.ssoSignIn({ provider, idToken, redirectUri });
    },
    onSuccess: () => {
      router.replace("/");
    },
    onError: (error: ServerErrorResponse) => {
      toast.error(
        error.response?.data?.message ||
          "SSO sign-in failed. Please try again.",
      );
    },
  });

  // ── Google Sign-In ─────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    try {
      const result = await googlePromptAsync();
      if (result.type === "success") {
        const idToken =
          result.params?.id_token || result.authentication?.idToken;
        if (idToken) {
          performSSOSignIn({ provider: OAuthProvider.GOOGLE, idToken, redirectUri });
        } else {
          toast.error("Failed to obtain Google credentials.");
        }
      } else if (result.type === "error") {
        toast.error(result.error?.message || "Google sign-in was cancelled.");
      }
    } catch {
      toast.error("An unexpected error occurred with Google sign-in.");
    }
  }, [googlePromptAsync, performSSOSignIn, redirectUri]);

  // ── LinkedIn Sign-In ───────────────────────────────────────────────
  const signInWithLinkedIn = useCallback(async () => {
    try {
      const result = await linkedInPromptAsync();
      if (result.type === "success" && result.params?.code) {
        // LinkedIn returns an authorization code;
        // send it to the backend which exchanges it for an access token
        performSSOSignIn({
          provider: OAuthProvider.LINKEDIN,
          idToken: result.params.code,
          redirectUri,
        });
      } else if (result.type === "error") {
        toast.error(result.error?.message || "LinkedIn sign-in was cancelled.");
      }
    } catch {
      toast.error("An unexpected error occurred with LinkedIn sign-in.");
    }
  }, [linkedInPromptAsync, performSSOSignIn, redirectUri]);

  // ── Apple Sign-In (iOS only) ───────────────────────────────────────
  const signInWithApple = useCallback(async () => {
    if (Platform.OS !== "ios") return;

    try {
      const result = await applePromptAsync();
      if (result.type === "success") {
        const idToken = result.params?.id_token;
        if (idToken) {
          performSSOSignIn({ provider: OAuthProvider.APPLE, idToken });
        } else {
          toast.error("Failed to obtain Apple credentials.");
        }
      } else if (result.type === "error") {
        toast.error(result.error?.message || "Apple sign-in was cancelled.");
      }
    } catch {
      toast.error("An unexpected error occurred with Apple sign-in.");
    }
  }, [applePromptAsync, performSSOSignIn]);

  return {
    isPending,
    signInWithGoogle,
    signInWithLinkedIn,
    signInWithApple,
    // Expose request readiness for disabling buttons
    isGoogleReady: !!googleRequest,
    isLinkedInReady: !!linkedInRequest,
    isAppleReady: !!appleRequest && Platform.OS === "ios",
  };
}
