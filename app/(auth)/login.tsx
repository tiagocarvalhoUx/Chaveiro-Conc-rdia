import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Link } from "expo-router";

import { KeyMascot } from "@/components/KeyMascot";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/hooks/useAuth";
import { BRAND } from "@/lib/constants";

export default function Login() {
  const { signIn } = useAuth();
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
      className="flex-1 bg-dark"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center">
          <KeyMascot size={120} />
          <Text className="mt-4 text-3xl font-extrabold text-primary">
            {BRAND.name}
          </Text>
          <Text className="mt-1 text-xs uppercase tracking-widest text-muted">
            {BRAND.tagline}
          </Text>
        </View>

        <View className="mt-10 gap-4">
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
            <Text className="text-center text-sm text-danger">{erro}</Text>
          ) : null}

          <PrimaryButton
            label="Entrar"
            loading={loading}
            onPress={handleSubmit}
          />

          <Link href="/(auth)/cadastro" asChild>
            <Pressable className="mt-2 items-center py-2">
              <Text className="text-sm text-muted">
                Ainda não tem conta?{" "}
                <Text className="font-bold text-primary">Cadastre-se</Text>
              </Text>
            </Pressable>
          </Link>
        </View>

        <Text className="mt-10 text-center text-xs text-muted">
          24h • {BRAND.phone} • {BRAND.city}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
