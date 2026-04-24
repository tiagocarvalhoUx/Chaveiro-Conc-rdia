import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Não encontrado" }} />
      <View className="flex-1 items-center justify-center bg-dark px-6">
        <Text className="text-2xl font-extrabold text-primary">
          404 — Página não encontrada
        </Text>
        <Text className="mt-2 text-center text-sm text-muted">
          A tela que você procura não existe.
        </Text>
        <Link href="/" className="mt-6 rounded-full bg-primary px-5 py-3">
          <Text className="text-sm font-bold text-dark">Voltar ao início</Text>
        </Link>
      </View>
    </>
  );
}
