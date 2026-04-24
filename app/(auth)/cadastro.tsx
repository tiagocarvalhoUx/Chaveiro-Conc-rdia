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

export default function Cadastro() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function handleSubmit() {
    setErro(null);
    setSucesso(null);
    if (!nome.trim() || !email || !senha) {
      setErro("Preencha nome, e-mail e senha.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha precisa ter ao menos 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não conferem.");
      return;
    }
    setLoading(true);
    try {
      await signUp({
        email,
        password: senha,
        nome: nome.trim(),
        telefone: telefone.trim() || undefined,
      });
      setSucesso("Conta criada! Verifique seu e-mail e faça login.");
      setTimeout(() => router.replace("/(auth)/login"), 1400);
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message.includes("already")
            ? "Este e-mail já está cadastrado."
            : "Não foi possível concluir o cadastro."
          : "Não foi possível concluir o cadastro."
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

        <View className="flex-1 px-6 pb-10 pt-6">
          <Text className="text-2xl font-extrabold text-white">Criar conta</Text>
          <Text className="mt-1 text-sm text-white/50">
            Cadastre-se e solicite serviços com facilidade.
          </Text>

          <View className="mt-6 gap-4">
            <TextField
              label="Nome completo"
              icon="person"
              placeholder="Seu nome"
              value={nome}
              onChangeText={setNome}
            />
            <TextField
              label="Telefone (WhatsApp)"
              icon="call"
              placeholder="(00) 00000-0000"
              keyboardType="phone-pad"
              value={telefone}
              onChangeText={setTelefone}
            />
            <TextField
              label="E-mail"
              icon="mail"
              placeholder="voce@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextField
              label="Senha"
              icon="lock-closed"
              placeholder="Mínimo 6 caracteres"
              password
              value={senha}
              onChangeText={setSenha}
            />
            <TextField
              label="Confirmar senha"
              icon="lock-closed"
              placeholder="Repita a senha"
              password
              value={confirmar}
              onChangeText={setConfirmar}
            />

            {erro ? (
              <View
                className="rounded-xl border px-4 py-3"
                style={{
                  backgroundColor: "rgba(204,0,0,0.15)",
                  borderColor: "rgba(204,0,0,0.3)",
                }}
              >
                <Text className="text-sm font-semibold text-danger">{erro}</Text>
              </View>
            ) : null}
            {sucesso ? (
              <View
                className="rounded-xl border px-4 py-3"
                style={{
                  backgroundColor: "rgba(255,215,0,0.15)",
                  borderColor: "rgba(255,215,0,0.3)",
                }}
              >
                <Text className="text-sm font-semibold text-primary">
                  {sucesso}
                </Text>
              </View>
            ) : null}

            <PrimaryButton
              label="Criar minha conta"
              loading={loading}
              onPress={handleSubmit}
            />
          </View>

          <View className="mt-6 items-center">
            <Text className="text-sm text-white/50">
              Já tem conta?{" "}
              <Link href="/(auth)/login" asChild>
                <Text className="font-extrabold text-primary">Entrar</Text>
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
