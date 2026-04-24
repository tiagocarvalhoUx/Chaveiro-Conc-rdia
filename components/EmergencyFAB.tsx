import { useEffect, useRef } from "react";
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
  variant?: "extended" | "compact";
}

const RED = "#DC2626";
const RED_DARK = "#991B1B";
const RED_LIGHT = "#EF4444";

/**
 * FAB de emergência — vermelha estendida, com:
 * - "Breath" sutil (scale 1.0 ↔ 1.04) — chama atenção sem ser agressivo
 * - Glow vermelho pulsante via box-shadow animado (sem anéis "quadrados")
 * - Bolinha branca interna piscando ("dot ativo" estilo notification)
 * - Press feedback: shrink 0.94 + cor mais escura
 * - Variante "compact" se quiser só o círculo (mantém o pulse)
 */
export function EmergencyFAB({
  bottom = 90,
  variant = "extended",
}: EmergencyFABProps) {
  const breath = useRef(new Animated.Value(0)).current;
  const dot = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const breathLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    const dotLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dot, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    breathLoop.start();
    dotLoop.start();
    return () => {
      breathLoop.stop();
      dotLoop.stop();
    };
  }, [breath, dot]);

  const scale = Animated.multiply(
    press,
    breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] })
  );
  const dotOpacity = dot.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });
  const glowOpacity = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0.85],
  });

  // Box-shadow animado funciona só na web; nativo usa shadow* fixos.
  const AnimatedView = Animated.createAnimatedComponent(View);

  const onPressIn = () =>
    Animated.spring(press, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 40,
      bounciness: 8,
    }).start();
  const onPressOut = () =>
    Animated.spring(press, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 10,
    }).start();
  const onPress = () =>
    Linking.openURL(
      `https://wa.me/${BRAND.phoneDigits}?text=${encodeURIComponent(
        "🚨 EMERGÊNCIA — preciso de chaveiro 24h agora!"
      )}`
    );

  // Glow via shadow (mobile) ou boxShadow string (web)
  const glowStyleAnimated = Platform.select<object>({
    web: {
      // boxShadow não anima nativamente em RNW; usamos shadow estático + opacity wrapper
    },
    default: {},
  });

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        right: 16,
        bottom,
        zIndex: 50,
      }}
    >
      {/* Glow externo — view absoluta atrás do botão, opacidade pulsa */}
      <AnimatedView
        pointerEvents="none"
        style={{
          position: "absolute",
          inset: 0,
          opacity: glowOpacity,
          ...(Platform.OS === "web"
            ? ({
                boxShadow: `0 0 32px 8px ${RED_LIGHT}`,
              } as object)
            : {
                shadowColor: RED_LIGHT,
                shadowOpacity: 1,
                shadowRadius: 22,
                shadowOffset: { width: 0, height: 0 },
              }),
        }}
      />

      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel="Emergência 24h via WhatsApp"
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: variant === "extended" ? 10 : 0,
            paddingHorizontal: variant === "extended" ? 18 : 0,
            paddingVertical: 0,
            height: 56,
            width: variant === "extended" ? undefined : 56,
            borderRadius: 28,
            backgroundColor: RED,
            // Sombra direcional + glow vermelho
            ...(Platform.OS === "web"
              ? ({
                  boxShadow:
                    "0 8px 24px rgba(220,38,38,0.45), 0 4px 8px rgba(0,0,0,0.25)",
                } as object)
              : {
                  shadowColor: RED,
                  shadowOpacity: 0.5,
                  shadowRadius: 14,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 10,
                }),
          }}
        >
          {/* Highlight superior — "vidro" sutil */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 28,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              backgroundColor: "rgba(255,255,255,0.16)",
            }}
          />

          {/* Ícone com bolinha pulsante de status */}
          <View
            style={{
              width: 28,
              height: 28,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="logo-whatsapp" size={26} color="#FFFFFF" />
            <Animated.View
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: "#FFFFFF",
                opacity: dotOpacity,
                borderWidth: 1.5,
                borderColor: RED_DARK,
              }}
            />
          </View>

          {variant === "extended" ? (
            <View>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontWeight: "900",
                  fontSize: 13,
                  letterSpacing: 0.6,
                  lineHeight: 14,
                }}
              >
                EMERGÊNCIA
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: "700",
                  fontSize: 10,
                  letterSpacing: 0.4,
                  marginTop: 1,
                }}
              >
                24h • WhatsApp
              </Text>
            </View>
          ) : null}
        </Pressable>
      </Animated.View>
    </View>
  );
}
