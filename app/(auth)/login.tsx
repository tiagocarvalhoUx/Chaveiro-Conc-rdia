import { useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";

import { KeyMascot } from "@/components/KeyMascot";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/hooks/useAuth";
import { BRAND } from "@/lib/constants";

export default function Login() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit() {
    setErro(null);
    if (!email || !senha) {
      setErro("Informe e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      await signIn(email, senha);
      router.replace("/(app)/home");
    } catch (e) {
      setErro(
        e instanceof Error
          ? "E-mail ou senha incorretos. Tente novamente."
          : "Não foi possível entrar."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
      style={{ backgroundColor: "#111111" }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header amarelo */}
        <View
          style={{
            backgroundColor: "#FFD700",
            paddingTop: 48,
            paddingHorizontal: 28,
            paddingBottom: 48,
          }}
        >
          <View className="flex-row items-center gap-3">
            <KeyMascot size={46} />
            <View>
              <Text className="text-lg font-black text-dark">{BRAND.name}</Text>
              <Text
                className="text-[11px] font-bold text-dark/70"
                style={{ letterSpacing: 1 }}
              >
                {BRAND.tagline}
              </Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View className="flex-1 px-6 pb-10 pt-6">
          <Text className="text-2xl font-extrabold text-white">
            Entrar na conta
          </Text>
          <Text className="mt-1 text-sm text-white/50">
            Bem-vindo de volta! Acesse seus pedidos.
          </Text>

          <View className="mt-6 gap-4">
            <TextField
              label="E-mail"
              icon="mail"
              placeholder="voce@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />
            <TextField
              label="Senha"
              icon="lock-closed"
              placeholder="••••••••"
              password
              value={senha}
              onChangeText={setSenha}
            />

            {erro ? (
              <View
                className="rounded-xl border px-4 py-3"
                style={{
                  backgroundColor: "rgba(204,0,0,0.15)",
                  borderColor: "rgba(204,0,0,0.3)",
                }}
              >
                <Text className="text-sm font-semibold text-danger">
                  {erro}
                </Text>
              </View>
            ) : null}

            <PrimaryButton
              label={loading ? "Aguarde..." : "Entrar"}
              loading={loading}
              onPress={handleSubmit}
            />
          </View>

          <View className="mt-6 items-center">
            <Text className="text-sm text-white/50">
              Não tem conta?{" "}
              <Link href="/(auth)/cadastro" asChild>
                <Text className="font-extrabold text-primary">Cadastre-se</Text>
              </Link>
            </Text>
          </View>

          <View className="mt-8 items-center border-t border-white/10 pt-5">
            <Text className="text-xs text-white/40">Emergência 24h</Text>
            <Pressable
              onPress={() => Linking.openURL(`tel:${BRAND.phoneDigits}`)}
              className="mt-1"
            >
              <Text className="text-base font-extrabold text-danger">
                📞 {BRAND.phone}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
