import { cn } from "@/lib/utils";
import { LinearGradient } from "expo-linear-gradient";
import { Check, Lock } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { Text } from "../../ui/text";

interface FeatureItem {
  label: string;
  free: boolean;
  premium: boolean;
}

interface PremiumCardProps {
  title: string;
  tierLabel: string;
  features: FeatureItem[];
  gradientColors: readonly [string, string, ...string[]];
  tierColor?: string;
  buttonText?: string;
  onUpgrade?: () => void;
  className?: string;
}

export const PremiumCard = ({
  title,
  tierLabel,
  features,
  gradientColors,
  tierColor = "#FFD700",
  buttonText = "Upgrade",
  onUpgrade,
  className,
}: PremiumCardProps) => {
  return (
    <LinearGradient
      colors={gradientColors}
      style={{ borderRadius: 18, overflow: "hidden" }}
    >
      <View className={cn("p-5 rounded-lg", className)}>
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center gap-2">
            <Text className="text-white text-xl font-bold">{title}</Text>
            <View
              className="px-2 py-0.5 rounded-md"
              style={{ backgroundColor: tierColor }}
            >
              <Text className="text-black font-semibold text-xs">
                {tierLabel.toUpperCase()}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={onUpgrade}
            className="px-4 py-2 rounded-full"
            style={{ backgroundColor: tierColor }}
          >
            <Text className="font-bold text-sm text-black">{buttonText}</Text>
          </TouchableOpacity>
        </View>

        {/* Features Table Header */}
        <View className="flex-row justify-between mb-3">
          <Text className="text-white font-semibold">What&apos;s included</Text>
          <View className="flex-row gap-6">
            <Text className="text-white/70 text-xs w-10 text-center">Free</Text>
            <Text className="text-white/70 text-xs w-10 text-center">
              {tierLabel}
            </Text>
          </View>
        </View>

        {/* Feature Rows */}
        {features.map((item, index) => (
          <View
            key={index}
            className="flex-row justify-between items-center mb-3"
          >
            <Text className="text-white text-base flex-1">{item.label}</Text>

            {/* Two columns for icons */}
            <View className="flex-row gap-6">
              <View className="w-10 items-center">
                {item.free ? (
                  <Check color="white" size={18} />
                ) : (
                  <Lock color="white" size={18} />
                )}
              </View>
              <View className="w-10 items-center">
                {item.premium ? (
                  <Check color={tierColor} size={18} />
                ) : (
                  <Lock color="white" size={18} />
                )}
              </View>
            </View>
          </View>
        ))}

        {/* Footer */}
        <Text className="text-gray-300 text-center mt-4 underline">
          See All Features
        </Text>
      </View>
    </LinearGradient>
  );
};
