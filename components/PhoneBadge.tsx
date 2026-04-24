import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

import { BRAND } from "@/lib/constants";

/**
 * Pílula vermelha pulsante com o telefone 24h.
 */
export function PhoneBadge() {
  const dotOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(dotOpacity, {
          toValue: 0.4,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [dotOpacity]);

  return (
    <View
      className="flex-row items-center gap-2 self-start rounded-full px-3 py-1"
      style={{
        backgroundColor: "rgba(204,0,0,0.15)",
        borderWidth: 1,
        borderColor: "rgba(204,0,0,0.35)",
      }}
    >
      <Animated.View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: "#CC0000",
          opacity: dotOpacity,
        }}
      />
      <Text className="text-xs font-extrabold text-white">
        24h {BRAND.phone}
      </Text>
    </View>
  );
}
