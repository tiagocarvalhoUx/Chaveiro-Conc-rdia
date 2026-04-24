import "@/global.css";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "@/hooks/useAuth";

SplashScreen.preventAutoHideAsync().catch(() => {
  /* já escondido */
});

function RootStack() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    SplashScreen.hideAsync().catch(() => undefined);
  }, [loading]);

  useEffect(() => {
    if (loading) return;

    const first = segments[0] as string | undefined;
    const inIntro = first === "intro" || first === undefined;
    const inAuth = first === "(auth)";
    const inApp = first === "(app)";
    // Não redirecionar quando já estiver no painel admin
    const inAdmin = first === "(admin)";

    if (!session && (inApp || inAdmin)) {
      router.replace("/(auth)/login");
    } else if (session && (inAuth || inIntro)) {
      router.replace("/(app)/home");
    }
  }, [session, segments, loading, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#1A1A1A" },
        animation: "fade",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="intro" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="(admin)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#1A1A1A" }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" backgroundColor="#1A1A1A" />
          <RootStack />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
