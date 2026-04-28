import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/hooks/useAuth";

interface MagicLinkAccessProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
}

export function MagicLinkAccess({
  title = "Acesse com seu e-mail",
  subtitle = "Enviaremos um link magico para voce entrar sem senha.",
  showBack = true,
}: MagicLinkAccessProps) {
  const router = useRouter();
  const { sendMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function enviarLink() {
    setErro(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setErro("Informe um e-mail valido.");
      return;
    }

    setLoading(true);
    try {
      await sendMagicLink(normalizedEmail);
      setEnviado(true);
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "Nao foi possivel enviar o link de acesso."
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
      <View className="flex-1 justify-center px-6 py-8">
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            className="mb-8 h-11 w-11 items-center justify-center rounded-full border border-white/10"
            style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>
        ) : null}

        <Text className="text-3xl font-black text-white">{title}</Text>
        <Text className="mt-2 text-base text-white/55">{subtitle}</Text>

        {enviado ? (
          <View
            className="mt-8 rounded-2xl border px-4 py-4"
            style={{
              backgroundColor: "rgba(37,211,102,0.1)",
              borderColor: "rgba(37,211,102,0.25)",
            }}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="mail-open" size={24} color="#25D366" />
              <View className="flex-1">
                <Text className="text-sm font-extrabold text-white">
                  Link enviado
                </Text>
                <Text className="mt-1 text-xs text-white/55">
                  Confira seu e-mail para acessar o painel de servicos e chaves.
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="mt-8 gap-4">
            <TextField
              label="Seu e-mail"
              icon="mail"
              placeholder="voce@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              hint="Use o e-mail que voce quer vincular ao seu painel."
            />

            {erro ? (
              <Text className="text-sm font-semibold text-danger">{erro}</Text>
            ) : null}

            <PrimaryButton
              label={loading ? "Enviando..." : "Enviar link de acesso"}
              loading={loading}
              onPress={enviarLink}
            />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
