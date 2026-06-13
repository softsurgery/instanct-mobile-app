import { useCallback } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
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
    ? process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID
    : Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
        process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID
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
  // We need two redirect URIs:
  // 1. backendRedirectUri: Sent to OAuth providers so they redirect to our backend server.
  // 2. deepLinkUri: The app's deep link, which WebBrowser waits for to close automatically.
  const backendRedirectUri =
    process.env.EXPO_PUBLIC_OAUTH_REDIRECT_URI ?? "exp://";
  const deepLinkUri = AuthSession.makeRedirectUri({ path: "oauth" });

  // ── Google Auth Request ────────────────────────────────────────────
  const [googleRequest, , googlePromptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID ?? "",
      redirectUri: deepLinkUri,
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
      redirectUri: deepLinkUri,
      scopes: ["openid", "profile", "email"],
      responseType: AuthSession.ResponseType.Code,
    },
    linkedInDiscovery,
  );

  // ── Apple Auth Request (iOS only) ──────────────────────────────────
  const [appleRequest, , applePromptAsync] = AuthSession.useAuthRequest(
    {
      clientId: "com.softsurgery.instanctmobileapp",
      redirectUri: deepLinkUri,
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
      codeVerifier,
      redirectUri,
    }: {
      provider: OAuthProvider;
      idToken: string;
      codeVerifier?: string;
      redirectUri?: string;
    }) => {
      return api.auth.ssoSignIn({
        provider,
        idToken,
        codeVerifier,
        redirectUri,
      });
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

  // Helper to modify the auth URL to point to the backend
  const getModifiedUrl = useCallback(
    async (
      request: AuthSession.AuthRequest | null,
      discovery: AuthSession.DiscoveryDocument,
    ) => {
      if (!request) return null;
      const authUrl = await request.makeAuthUrlAsync(discovery);
      // We pass the backend URL to the provider so it redirects to our backend,
      // but AuthSession expects the deepLinkUri to close the browser.
      return authUrl.replace(
        encodeURIComponent(deepLinkUri),
        encodeURIComponent(backendRedirectUri),
      );
    },
    [backendRedirectUri, deepLinkUri],
  );

  // ── Google Sign-In ─────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    try {
      if (!googleRequest) return;
      const modifiedAuthUrl = await getModifiedUrl(
        googleRequest,
        googleDiscovery,
      );
      if (!modifiedAuthUrl) return;

      const result = await googlePromptAsync({ url: modifiedAuthUrl });
      if (result.type === "success") {
        const code = result.params?.code;
        const codeVerifier = googleRequest?.codeVerifier;
        if (code) {
          performSSOSignIn({
            provider: OAuthProvider.GOOGLE,
            idToken: code,
            codeVerifier,
            redirectUri: backendRedirectUri,
          });
        } else {
          toast.error("Failed to obtain Google credentials.");
        }
      } else if (result.type === "error") {
        toast.error(result.error?.message || "Google sign-in was cancelled.");
      }
    } catch {
      toast.error("An unexpected error occurred with Google sign-in.");
    }
  }, [
    googlePromptAsync,
    googleRequest,
    performSSOSignIn,
    backendRedirectUri,
    getModifiedUrl,
  ]);

  // ── LinkedIn Sign-In ───────────────────────────────────────────────
  const signInWithLinkedIn = useCallback(async () => {
    try {
      if (!linkedInRequest) return;
      const modifiedAuthUrl = await getModifiedUrl(
        linkedInRequest,
        linkedInDiscovery,
      );
      if (!modifiedAuthUrl) return;

      const result = await linkedInPromptAsync({ url: modifiedAuthUrl });
      if (result.type === "success" && result.params?.code) {
        // LinkedIn returns an authorization code;
        // send it to the backend which exchanges it for an access token
        performSSOSignIn({
          provider: OAuthProvider.LINKEDIN,
          idToken: result.params.code,
          redirectUri: backendRedirectUri,
        });
      } else if (result.type === "error") {
        toast.error(result.error?.message || "LinkedIn sign-in was cancelled.");
      }
    } catch {
      toast.error("An unexpected error occurred with LinkedIn sign-in.");
    }
  }, [
    linkedInPromptAsync,
    linkedInRequest,
    performSSOSignIn,
    backendRedirectUri,
    getModifiedUrl,
  ]);

  // ── Apple Sign-In (iOS only) ───────────────────────────────────────
  const signInWithApple = useCallback(async () => {
    if (Platform.OS !== "ios") return;

    try {
      if (!appleRequest) return;
      const modifiedAuthUrl = await getModifiedUrl(
        appleRequest,
        appleDiscovery,
      );
      if (!modifiedAuthUrl) return;

      const result = await applePromptAsync({ url: modifiedAuthUrl });
      if (result.type === "success") {
        const idToken = result.params?.id_token;
        if (idToken) {
          performSSOSignIn({
            provider: OAuthProvider.APPLE,
            idToken,
            redirectUri: backendRedirectUri,
          });
        } else {
          toast.error("Failed to obtain Apple credentials.");
        }
      } else if (result.type === "error") {
        toast.error(result.error?.message || "Apple sign-in was cancelled.");
      }
    } catch {
      toast.error("An unexpected error occurred with Apple sign-in.");
    }
  }, [
    applePromptAsync,
    appleRequest,
    performSSOSignIn,
    backendRedirectUri,
    getModifiedUrl,
  ]);

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
