import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";
import { ApplicationHeader } from "~/components//shared/AppHeader";
import { StableSafeAreaView } from "~/components//shared/StableSafeAreaView";
import { StableKeyboardAwareScrollView } from "~/components//shared/StableKeyboardAwareScrollView";
import { Button } from "~/components//ui/button";
import { Icon } from "~/components//ui/icon";
import { Input } from "~/components//ui/input";
import { Text } from "~/components//ui/text";

interface ChangeEmailPortalProps {
  className?: string;
}

type ChangeEmailStep =
  | "current-email"
  | "new-email"
  | "verification"
  | "success";

export const ChangeEmailPortal = ({ className }: ChangeEmailPortalProps) => {
  const { t } = useTranslation();
  const [step, setStep] = React.useState<ChangeEmailStep>("current-email");
  const [currentEmail, setCurrentEmail] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [confirmEmail, setConfirmEmail] = React.useState("");
  const [verificationCode, setVerificationCode] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [resendCountdown, setResendCountdown] = React.useState(0);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const clearError = (key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleContinueFromCurrentEmail = () => {
    const nextErrors: Record<string, string> = {};

    if (!currentEmail.trim())
      nextErrors.currentEmail = "Current email is required";
    else if (!isValidEmail(currentEmail))
      nextErrors.currentEmail = "Please enter a valid email address";

    if (!password.trim())
      nextErrors.password = "Password is required for verification";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setStep("new-email");
  };

  const handleContinueFromNewEmail = () => {
    const nextErrors: Record<string, string> = {};

    if (!newEmail.trim()) nextErrors.newEmail = "New email is required";
    else if (!isValidEmail(newEmail))
      nextErrors.newEmail = "Please enter a valid email address";

    if (!confirmEmail.trim())
      nextErrors.confirmEmail = "Please confirm your email";
    else if (newEmail !== confirmEmail)
      nextErrors.confirmEmail = "Email addresses do not match";

    if (newEmail === currentEmail)
      nextErrors.newEmail = "New email must be different from current email";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setStep("verification");
      setResendCountdown(120);
    }
  };

  const handleVerifyCode = () => {
    const nextErrors: Record<string, string> = {};

    if (!verificationCode.trim())
      nextErrors.verificationCode = "Verification code is required";
    else if (verificationCode.length !== 6)
      nextErrors.verificationCode = "Verification code must be 6 digits";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("success");
    }, 1200);
  };

  React.useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setTimeout(() => {
      setResendCountdown((value) => value - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const progressIndex =
    step === "current-email"
      ? 0
      : step === "new-email"
        ? 1
        : step === "verification"
          ? 2
          : 3;

  const stepLabels = ["Verify", "New Email", "Confirm"];

  return (
    <StableSafeAreaView className={cn("flex-1 bg-card", className)}>
      <ApplicationHeader
        classNames={{ wrapper: "border-b border-border pb-2" }}
        title={t("screens.changeEmail", "Change Email")}
        titleVariant="large"
        reverse
        shortcuts={[
          {
            key: "back",
            icon: ArrowLeft,
            onPress: () => router.back(),
          },
        ]}
      />

      <StableKeyboardAwareScrollView className="bg-background">
        <View className="flex-1 px-4 py-4">
          {step !== "success" ? (
            <View className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <View className="border-b border-border/60 bg-background/70 px-4 py-4">
                <Text className="text-lg font-semibold text-foreground">
                  Change Email
                </Text>
                <Text className="mt-1 text-sm leading-5 text-muted-foreground">
                  Update the email address associated with your account using
                  the same layout as the password flow.
                </Text>
              </View>

              <View className="px-4 py-4">
                <View className="mb-6">
                  <View className="mb-3 flex-row items-center justify-between gap-2">
                    {[0, 1, 2].map((index) => (
                      <React.Fragment key={index}>
                        <View
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full",
                            index <= progressIndex ? "bg-primary" : "bg-muted",
                          )}
                        >
                          <Text
                            className={cn(
                              "text-xs font-semibold",
                              index <= progressIndex
                                ? "text-primary-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {index + 1}
                          </Text>
                        </View>
                        {index < 2 && (
                          <View
                            className={cn(
                              "mx-2 h-1 flex-1 rounded-full",
                              index < progressIndex ? "bg-primary" : "bg-muted",
                            )}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </View>
                  <View className="flex-row justify-between px-1">
                    {stepLabels.map((label) => (
                      <Text
                        key={label}
                        className="text-xs text-muted-foreground"
                      >
                        {label}
                      </Text>
                    ))}
                  </View>
                </View>

                {step === "current-email" ? (
                  <View>
                    <Text className="mb-4 text-sm text-muted-foreground">
                      Verify your identity before changing your email address.
                    </Text>

                    <View className="mb-5">
                      <Text className="mb-2 text-sm font-semibold text-foreground">
                        Current Email
                      </Text>
                      <Input
                        placeholder="your.email@example.com"
                        keyboardType="email-address"
                        value={currentEmail}
                        onChangeText={(text) => {
                          setCurrentEmail(text);
                          clearError("currentEmail");
                        }}
                        editable={!isLoading}
                        className={cn(
                          errors.currentEmail && "border-destructive",
                        )}
                      />
                      {errors.currentEmail ? (
                        <Text className="mt-1 text-xs text-destructive">
                          {errors.currentEmail}
                        </Text>
                      ) : null}
                    </View>

                    <View className="mb-5">
                      <Text className="mb-2 text-sm font-semibold text-foreground">
                        Password
                      </Text>
                      <Input
                        placeholder="Enter your password"
                        secureTextEntry
                        value={password}
                        onChangeText={(text) => {
                          setPassword(text);
                          clearError("password");
                        }}
                        editable={!isLoading}
                        className={cn(errors.password && "border-destructive")}
                      />
                      {errors.password ? (
                        <Text className="mt-1 text-xs text-destructive">
                          {errors.password}
                        </Text>
                      ) : null}
                    </View>

                    <View className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                      <View className="flex-row gap-3">
                        <Icon
                          as={AlertCircle}
                          size={16}
                          className="mt-0.5 flex-shrink-0 text-primary"
                        />
                        <Text className="flex-1 text-xs leading-5 text-muted-foreground">
                          We&apos;ll send a verification code to confirm the new
                          email address before the change becomes active.
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : null}

                {step === "new-email" ? (
                  <View>
                    <Text className="mb-4 text-sm text-muted-foreground">
                      Enter the new email address you want to use for this
                      account.
                    </Text>

                    <View className="mb-5">
                      <Text className="mb-2 text-sm font-semibold text-foreground">
                        New Email Address
                      </Text>
                      <Input
                        placeholder="new.email@example.com"
                        keyboardType="email-address"
                        value={newEmail}
                        onChangeText={(text) => {
                          setNewEmail(text);
                          clearError("newEmail");
                        }}
                        editable={!isLoading}
                        className={cn(errors.newEmail && "border-destructive")}
                      />
                      {errors.newEmail ? (
                        <Text className="mt-1 text-xs text-destructive">
                          {errors.newEmail}
                        </Text>
                      ) : null}
                    </View>

                    <View className="mb-5">
                      <Text className="mb-2 text-sm font-semibold text-foreground">
                        Confirm Email Address
                      </Text>
                      <Input
                        placeholder="new.email@example.com"
                        keyboardType="email-address"
                        value={confirmEmail}
                        onChangeText={(text) => {
                          setConfirmEmail(text);
                          clearError("confirmEmail");
                        }}
                        editable={!isLoading}
                        className={cn(
                          errors.confirmEmail && "border-destructive",
                        )}
                      />
                      {errors.confirmEmail ? (
                        <Text className="mt-1 text-xs text-destructive">
                          {errors.confirmEmail}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ) : null}

                {step === "verification" ? (
                  <View>
                    <Text className="mb-4 text-sm text-muted-foreground">
                      We sent a verification code to the new address.
                    </Text>

                    <View className="mb-5">
                      <Text className="mb-2 text-sm font-semibold text-foreground">
                        Verification Code
                      </Text>
                      <Input
                        placeholder="000000"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={verificationCode}
                        onChangeText={(text) => {
                          setVerificationCode(text);
                          clearError("verificationCode");
                        }}
                        editable={!isLoading}
                        className={cn(
                          "text-center tracking-[8px]",
                          errors.verificationCode && "border-destructive",
                        )}
                      />
                      {errors.verificationCode ? (
                        <Text className="mt-1 text-xs text-destructive">
                          {errors.verificationCode}
                        </Text>
                      ) : null}
                    </View>

                    <View className="mb-5 rounded-xl border border-border bg-muted/20 p-4">
                      {resendCountdown > 0 ? (
                        <View className="flex-row items-center justify-center gap-2">
                          <Icon
                            as={Clock}
                            size={16}
                            className="text-muted-foreground"
                          />
                          <Text className="text-sm text-muted-foreground">
                            Resend code in{" "}
                            <Text className="font-semibold">
                              {resendCountdown}s
                            </Text>
                          </Text>
                        </View>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onPress={() => setResendCountdown(120)}
                          disabled={isLoading}
                        >
                          <Text>Resend code</Text>
                        </Button>
                      )}
                    </View>
                  </View>
                ) : null}

                {step === "current-email" ||
                step === "new-email" ||
                step === "verification" ? (
                  <View className="flex-row gap-3 pt-2">
                    {step === "current-email" ? (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onPress={() => router.back()}
                        disabled={isLoading}
                      >
                        <Text>Cancel</Text>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onPress={() =>
                          setStep(
                            step === "new-email"
                              ? "current-email"
                              : "new-email",
                          )
                        }
                        disabled={isLoading}
                      >
                        <Text>Back</Text>
                      </Button>
                    )}

                    {step === "current-email" ? (
                      <Button
                        className="flex-1"
                        onPress={handleContinueFromCurrentEmail}
                        disabled={
                          isLoading || !currentEmail.trim() || !password.trim()
                        }
                      >
                        <Text className="font-semibold">Continue</Text>
                      </Button>
                    ) : null}

                    {step === "new-email" ? (
                      <Button
                        className="flex-1"
                        onPress={handleContinueFromNewEmail}
                        disabled={
                          isLoading || !newEmail.trim() || !confirmEmail.trim()
                        }
                      >
                        <Text className="font-semibold">Continue</Text>
                      </Button>
                    ) : null}

                    {step === "verification" ? (
                      <Button
                        className="flex-1"
                        onPress={handleVerifyCode}
                        disabled={isLoading || verificationCode.length !== 6}
                      >
                        <Text className="font-semibold">
                          {isLoading ? "Verifying..." : "Verify"}
                        </Text>
                      </Button>
                    ) : null}
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}

          {step === "success" ? (
            <View className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <View className="border-b border-border/60 bg-background/70 px-4 py-4">
                <Text className="text-lg font-semibold text-foreground">
                  Email Updated
                </Text>
                <Text className="mt-1 text-sm text-muted-foreground leading-5">
                  Your account is now linked to the new email address.
                </Text>
              </View>

              <View className="flex items-center px-4 py-8">
                <View className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                  <Icon
                    as={CheckCircle2}
                    size={32}
                    className="text-green-600 dark:text-green-400"
                  />
                </View>

                <Text className="text-center text-xl font-semibold text-foreground">
                  Success
                </Text>
                <Text className="mt-2 text-center text-sm leading-5 text-muted-foreground">
                  Your email address has been updated to
                  {"\n"}
                  <Text className="font-semibold text-foreground">
                    {newEmail}
                  </Text>
                </Text>

                <View className="mt-6 w-full rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                  <View className="flex-row gap-3">
                    <Icon
                      as={AlertCircle}
                      size={16}
                      className="mt-0.5 flex-shrink-0 text-green-600 dark:text-green-400"
                    />
                    <Text className="flex-1 text-xs leading-5 text-green-700 dark:text-green-300">
                      You&apos;ll use your new email address to sign in from now on.
                    </Text>
                  </View>
                </View>

                <Button className="mt-6 w-full" onPress={() => router.back()}>
                  <Text className="font-semibold">Done</Text>
                </Button>
              </View>
            </View>
          ) : null}
        </View>
      </StableKeyboardAwareScrollView>
    </StableSafeAreaView>
  );
};
