import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";

export default function Intro() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/(app)/home");
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-dark">
      <ActivityIndicator color="#FFD700" size="large" />
    </View>
  );
}
