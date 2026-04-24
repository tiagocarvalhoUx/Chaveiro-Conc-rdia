import { Pressable, Text, View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Linking } from "react-native";

import { BRAND } from "@/lib/constants";

interface BrandHeaderProps {
  subtitle?: string;
  showPhone?: boolean;
  onBack?: () => void;
}

export function BrandHeader({
  subtitle,
  showPhone = true,
  onBack,
}: BrandHeaderProps) {
  return (
    <View className="border-b border-primary/20 bg-dark px-5 pb-4 pt-6">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {onBack ? (
            <Pressable
              onPress={onBack}
              hitSlop={10}
              className="rounded-full bg-white/5 p-2"
            >
              <Ionicons name="chevron-back" size={20} color="#FFD700" />
            </Pressable>
          ) : null}
          <Image
            source={require("../assets/logo-chaveiro.png")}
            style={{ width: 36, height: 36, resizeMode: "contain" }}
            accessibilityLabel="Logo Chaveiro Concórdia"
            className="mr-2 rounded-full bg-white/10"
          />
          <View>
            <Text className="text-xl font-extrabold text-primary">
              {BRAND.name}
            </Text>
            <Text className="text-xs text-muted">{subtitle ?? BRAND.tagline}</Text>
          </View>
        </View>
        {showPhone ? (
          <Pressable
            onPress={() => Linking.openURL(`tel:${BRAND.phoneDigits}`)}
            className="flex-row items-center gap-1 rounded-full bg-danger px-3 py-2"
            hitSlop={10}
          >
            <Ionicons name="call" size={14} color="#FFFFFF" />
            <Text className="text-xs font-bold text-white">24h</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
