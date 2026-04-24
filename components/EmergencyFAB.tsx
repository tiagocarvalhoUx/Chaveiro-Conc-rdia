import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Linking,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { BRAND } from "@/lib/constants";

interface EmergencyFABProps {
  bottom?: number;
  extended?: boolean;
}

const BUTTON_SIZE = 58;
const WHATSAPP_GREEN = "#25D366";
const WHATSAPP_GREEN_DARK = "#1FAD54";

/**
 * FAB de emergência (WhatsApp).
 * - Anel de pulse que se expande sem deformar o botão
 * - Gradiente suave (verde claro → escuro) para profundidade
 * - Estado pressed com feedback visual (escala + cor mais escura)
 * - Label "Emergência 24h" opcional em tela larga
 */
export function EmergencyFAB({
  bottom = 90,
  extended = false,
}: EmergencyFABProps) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const pulse = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    const a = pulse(ring1, 0);
    const b = pulse(ring2, 1000);
    a.start();
    b.start();
    return () => {
      a.stop();
      b.stop();
    };
  }, [ring1, ring2]);

  const renderRing = (anim: Animated.Value) => {
    const scale = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2],
    });
    const opacity = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.45, 0],
    });
    return (
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          borderRadius: BUTTON_SIZE / 2,
          backgroundColor: WHATSAPP_GREEN,
          opacity,
          transform: [{ scale }],
        }}
      />
    );
  };

  const shadowStyle =
    Platform.OS === "web"
      ? ({
          boxShadow:
            "0 12px 24px rgba(37,211,102,0.45), 0 6px 10px rgba(0,0,0,0.18)",
        } as unknown as object)
      : {
          shadowColor: WHATSAPP_GREEN,
          shadowOpacity: 0.45,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
        };

  return (
    <View
      pointerEvents="box-none"
      accessible={false}
      style={{
        position: "absolute",
        right: 18,
        bottom,
        zIndex: 50,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Rings (não afetam layout) */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {renderRing(ring1)}
        {renderRing(ring2)}
      </View>

      <Animated.View style={[{ transform: [{ scale: pressScale }] }, shadowStyle]}>
        <Pressable
          onPressIn={() => {
            setPressed(true);
            Animated.spring(pressScale, {
              toValue: 0.92,
              useNativeDriver: true,
              speed: 40,
              bounciness: 8,
            }).start();
          }}
          onPressOut={() => {
            setPressed(false);
            Animated.spring(pressScale, {
              toValue: 1,
              useNativeDriver: true,
              speed: 30,
              bounciness: 10,
            }).start();
          }}
          onPress={() =>
            Linking.openURL(
              `https://wa.me/${BRAND.phoneDigits}?text=${encodeURIComponent(
                "Preciso de atendimento urgente 24h"
              )}`
            )
          }
          accessibilityRole="button"
          accessibilityLabel="Emergência 24h via WhatsApp"
          style={{
            width: extended ? undefined : BUTTON_SIZE,
            height: BUTTON_SIZE,
            paddingHorizontal: extended ? 20 : 0,
            borderRadius: BUTTON_SIZE / 2,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: extended ? 8 : 0,
            backgroundColor: pressed ? WHATSAPP_GREEN_DARK : WHATSAPP_GREEN,
            borderWidth: 1.5,
            borderColor: "rgba(255,255,255,0.25)",
            overflow: "hidden",
          }}
        >
          {/* Highlight interno (topo mais claro) */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: BUTTON_SIZE / 2,
              borderTopLeftRadius: BUTTON_SIZE / 2,
              borderTopRightRadius: BUTTON_SIZE / 2,
              backgroundColor: "rgba(255,255,255,0.18)",
            }}
          />
          <Ionicons name="logo-whatsapp" size={28} color="#FFFFFF" />
          {extended ? (
            <Text
              style={{
                color: "#FFFFFF",
                fontWeight: "800",
                fontSize: 14,
                letterSpacing: 0.3,
              }}
            >
              Emergência 24h
            </Text>
          ) : null}
        </Pressable>
      </Animated.View>
    </View>
  );
}
