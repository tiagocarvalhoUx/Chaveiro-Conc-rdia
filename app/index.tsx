import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { KeyMascot } from "@/components/KeyMascot";
import { BRAND } from "@/lib/constants";

/**
 * Tela 0 — Splash + Intro animada.
 *  • 1s: Splash (fundo amarelo + logo)
 *  • 2-3s: Mascote desliza, tagline aparece em fade, número 24h pulsa
 *  • Transição suave para /intro (que decide onde mandar o usuário)
 */
export default function SplashIntro() {
  const router = useRouter();

  const fadeBg = useRef(new Animated.Value(1)).current;
  const mascotTranslate = useRef(new Animated.Value(120)).current;
  const mascotOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const phonePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1) Splash → revela mascote
    Animated.sequence([
      Animated.delay(900),
      Animated.parallel([
        Animated.timing(mascotOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(mascotTranslate, {
          toValue: 0,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulso do telefone 24h
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(phonePulse, {
          toValue: 1.1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(phonePulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    // Transição final
    const timeout = setTimeout(() => {
      Animated.timing(fadeBg, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        router.replace("/intro");
      });
    }, 3400);

    return () => {
      clearTimeout(timeout);
      loop.stop();
    };
  }, [fadeBg, mascotOpacity, mascotTranslate, taglineOpacity, phonePulse, router]);

  return (
    <Animated.View
      style={{ flex: 1, backgroundColor: "#FFD700", opacity: fadeBg }}
      className="items-center justify-center"
    >
      <Animated.View
        style={{
          opacity: mascotOpacity,
          transform: [{ translateY: mascotTranslate }],
        }}
      >
        <KeyMascot size={200} />
      </Animated.View>

      <View className="mt-6 items-center">
        <Text className="text-3xl font-extrabold text-dark">
          {BRAND.name}
        </Text>
        <Animated.Text
          style={{ opacity: taglineOpacity }}
          className="mt-2 text-sm font-semibold uppercase tracking-widest text-dark"
        >
          {BRAND.tagline}
        </Animated.Text>
      </View>

      <Animated.View
        style={{ transform: [{ scale: phonePulse }] }}
        className="mt-10 rounded-full bg-dark px-6 py-3"
      >
        <Text className="text-base font-extrabold text-primary">
          24h • {BRAND.phone}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
