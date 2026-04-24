import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { BrandHeader } from "@/components/BrandHeader";
import { GlassCard } from "@/components/GlassCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { StatusBadge } from "@/components/StatusBadge";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/hooks/useAuth";
import { usePedidos } from "@/hooks/usePedidos";
import { useProfile } from "@/hooks/useProfile";
import { categoriaLabel, formatDateTimeBR } from "@/lib/format";

export default function Perfil() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile, loading, error, update, reload } = useProfile(user?.id);
  const { pedidos, loading: loadingPedidos } = usePedidos(user?.id);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erroEdicao, setErroEdicao] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setNome(profile.nome ?? "");
      setTelefone(profile.telefone ?? "");
      setEndereco(profile.endereco ?? "");
    }
  }, [profile]);

  async function salvar() {
    setMensagem(null);
    setErroEdicao(null);
    if (!nome.trim()) {
      setErroEdicao("Informe seu nome.");
      return;
    }
    setSalvando(true);
    try {
      await update({
        nome: nome.trim(),
        telefone: telefone.trim() || undefined,
        endereco: endereco.trim() || undefined,
      });
      setMensagem("Perfil atualizado.");
    } catch (e) {
      setErroEdicao(
        e instanceof Error ? e.message : "Não foi possível salvar."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function sair() {
    try {
      await signOut();
    } catch (e) {
      Alert.alert("Erro", e instanceof Error ? e.message : "Falha ao sair.");
    }
  }

  return (
    <View className="flex-1 bg-dark">
      <BrandHeader subtitle="Perfil" onBack={() => router.back()} />
      <ScreenContainer>
        {loading ? (
          <View className="items-center py-10">
            <ActivityIndicator color="#FFD700" />
          </View>
        ) : error ? (
          <View className="items-center gap-3 py-10">
            <Text className="text-center text-sm text-danger">{error}</Text>
            <Pressable
              onPress={reload}
              className="rounded-full border border-primary px-4 py-2"
            >
              <Text className="text-sm font-bold text-primary">
                Tentar novamente
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <GlassCard>
              <View className="flex-row items-center gap-3">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-primary">
                  <Ionicons name="person" size={26} color="#1A1A1A" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-extrabold text-white">
                    {profile?.nome ?? "Cliente"}
                  </Text>
                  <Text className="text-xs text-muted">{user?.email}</Text>
                </View>
              </View>
            </GlassCard>

            <Text className="mt-6 text-xs uppercase tracking-widest text-primary">
              Dados pessoais
            </Text>
            <View className="mt-2 gap-3">
              <TextField
                label="Nome completo"
                icon="person"
                value={nome}
                onChangeText={setNome}
              />
              <TextField
                label="Telefone (WhatsApp)"
                icon="call"
                keyboardType="phone-pad"
                value={telefone}
                onChangeText={setTelefone}
              />
              <TextField
                label="Endereço principal"
                icon="location"
                value={endereco}
                onChangeText={setEndereco}
              />
              {erroEdicao ? (
                <Text className="text-center text-sm text-danger">
                  {erroEdicao}
                </Text>
              ) : null}
              {mensagem ? (
                <Text className="text-center text-sm text-primary">
                  {mensagem}
                </Text>
              ) : null}
              <PrimaryButton
                label="Salvar alterações"
                loading={salvando}
                onPress={salvar}
              />
            </View>

            <Text className="mt-8 text-xs uppercase tracking-widest text-primary">
              Histórico de serviços
            </Text>
            {loadingPedidos ? (
              <ActivityIndicator color="#FFD700" style={{ marginTop: 16 }} />
            ) : pedidos.length === 0 ? (
              <Text className="mt-3 text-sm text-muted">
                Você ainda não tem serviços registrados.
              </Text>
            ) : (
              <View className="mt-3 gap-2">
                {pedidos.slice(0, 5).map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => router.push(`/(app)/pedido/${p.id}`)}
                    className="flex-row items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-white">
                        {p.servico?.titulo ?? "Atendimento"}
                      </Text>
                      <Text className="text-xs text-muted">
                        {p.servico
                          ? `${categoriaLabel(p.servico.categoria)} • `
                          : ""}
                        {formatDateTimeBR(p.created_at)}
                      </Text>
                    </View>
                    <StatusBadge status={p.status} />
                  </Pressable>
                ))}
                {pedidos.length > 5 ? (
                  <Pressable
                    onPress={() => router.push("/(app)/pedidos")}
                    className="items-center py-2"
                  >
                    <Text className="text-sm font-bold text-primary">
                      Ver todos →
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            )}

            <Pressable
              onPress={sair}
              className="mt-8 flex-row items-center justify-center gap-2 rounded-xl border border-danger py-3"
            >
              <Ionicons name="log-out" size={18} color="#CC0000" />
              <Text className="text-sm font-bold text-danger">Sair da conta</Text>
            </Pressable>
          </>
        )}
      </ScreenContainer>
    </View>
  );
}
