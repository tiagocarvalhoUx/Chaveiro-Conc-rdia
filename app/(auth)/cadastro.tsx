import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";

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
      setSucesso(
        "Conta criada! Verifique seu e-mail para confirmar e depois faça login."
      );
      setTimeout(() => router.replace("/(auth)/login"), 1500);
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
      className="flex-1 bg-dark"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mt-10">
          <Text className="text-3xl font-extrabold text-primary">Criar conta</Text>
          <Text className="mt-1 text-sm text-muted">
            Acesse {BRAND.name} 24h em {BRAND.city}.
          </Text>
        </View>

        <View className="mt-8 gap-4">
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
            <Text className="text-center text-sm text-danger">{erro}</Text>
          ) : null}
          {sucesso ? (
            <Text className="text-center text-sm text-primary">{sucesso}</Text>
          ) : null}

          <PrimaryButton
            label="Criar conta"
            loading={loading}
            onPress={handleSubmit}
          />

          <Link href="/(auth)/login" asChild>
            <Pressable className="items-center py-2">
              <Text className="text-sm text-muted">
                Já tem conta?{" "}
                <Text className="font-bold text-primary">Entrar</Text>
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
