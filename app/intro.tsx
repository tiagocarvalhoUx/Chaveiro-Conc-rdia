import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/hooks/useAuth";

/**
 * Tela de transição: aguarda o estado de auth e redireciona.
 * Mantida separada para a animação de fade do Splash → próxima rota.
 */
export default function Intro() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (session) {
      router.replace("/(app)/home");
    } else {
      router.replace("/(auth)/login");
    }
  }, [loading, session, router]);

  return (
    <View className="flex-1 items-center justify-center bg-dark">
      <ActivityIndicator color="#FFD700" size="large" />
    </View>
  );
}
