import { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { KeyMascot } from "@/components/KeyMascot";
import { BRAND } from "@/lib/constants";

/**
 * Tela 0 — Splash + Intro animada.
 *  • Splash amarelo com logo e nome da marca.
 *  • Após 1.6s, faz fade-out e vai para /intro (decide login ou home).
 */
export default function SplashIntro() {
  const router = useRouter();

  const bgOpacity = useRef(new Animated.Value(0)).current;
  const sparkRotate = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const phoneScale = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(bgOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    Animated.timing(taglineOpacity, {
      toValue: 1,
      duration: 700,
      delay: 300,
      useNativeDriver: true,
    }).start();

    const spin = Animated.loop(
      Animated.timing(sparkRotate, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(phoneScale, {
          toValue: 1.08,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(phoneScale, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    const timeout = setTimeout(() => {
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }).start(() => {
        router.replace("/intro");
      });
    }, 2400);

    return () => {
      clearTimeout(timeout);
      spin.stop();
      pulse.stop();
    };
  }, [bgOpacity, contentOpacity, phoneScale, router, sparkRotate, taglineOpacity]);

  const spin = sparkRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: "#FFD700" }}>
      <Animated.View
        style={{ opacity: contentOpacity, alignItems: "center", gap: 20, paddingHorizontal: 32 }}
      >
        <View style={{ position: "relative" }}>
          <KeyMascot size={140} />
          <Animated.Text
            style={{
              position: "absolute",
              top: -4,
              right: -8,
              fontSize: 26,
              transform: [{ rotate: spin }],
            }}
          >
            ✨
          </Animated.Text>
        </View>

        <View className="items-center">
          <Text className="text-center text-3xl font-black text-dark" style={{ letterSpacing: -0.5 }}>
            Chaveiro
          </Text>
          <Text className="text-center text-3xl font-black text-dark" style={{ letterSpacing: -0.5 }}>
            Concórdia
          </Text>
          <Animated.Text
            style={{
              opacity: taglineOpacity,
              marginTop: 6,
              letterSpacing: 2,
              fontSize: 12,
              fontWeight: "700",
              color: "rgba(26,26,26,0.7)",
            }}
          >
            {BRAND.tagline}
          </Animated.Text>
        </View>

        <Animated.View
          style={{
            transform: [{ scale: phoneScale }],
            backgroundColor: "#1A1A1A",
            borderRadius: 24,
            paddingHorizontal: 22,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#CC0000" }} />
          <Text className="text-base font-extrabold text-white">
            24h — {BRAND.phone}
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
