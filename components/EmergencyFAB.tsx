import { useEffect, useRef } from "react";
import { Animated, Linking, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { BRAND } from "@/lib/constants";

/**
 * Botão flutuante de emergência (WhatsApp) — visível em todas as telas pós-login.
 */
export function EmergencyFAB() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.12,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-6 right-5"
      style={{ zIndex: 50 }}
    >
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Pressable
          onPress={() => Linking.openURL(BRAND.whatsappUrl)}
          accessibilityRole="button"
          accessibilityLabel="Emergência via WhatsApp"
          className="flex-row items-center gap-2 rounded-full bg-danger px-5 py-4 shadow-lg"
          style={{
            shadowColor: "#CC0000",
            shadowOpacity: 0.5,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
          }}
        >
          <Ionicons name="logo-whatsapp" size={22} color="#FFFFFF" />
          <Text className="text-sm font-extrabold uppercase tracking-wide text-white">
            Emergência 24h
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
