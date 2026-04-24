import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { GlassCard } from "@/components/GlassCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/hooks/useAuth";
import { usePedidos } from "@/hooks/usePedidos";
import { useProfile } from "@/hooks/useProfile";
import { formatDateBR } from "@/lib/format";

export default function Perfil() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile, loading, error, update, reload } = useProfile(user?.id);
  const { pedidos } = usePedidos(user?.id);

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

  const stats = useMemo(() => {
    const total = pedidos.length;
    const concluidos = pedidos.filter((p) => p.status === "concluido").length;
    const emAndamento = pedidos.filter(
      (p) =>
        p.status === "pendente" ||
        p.status === "confirmado" ||
        p.status === "em_atendimento"
    ).length;
    return [
      { label: "Serviços", value: String(total) },
      { label: "Concluídos", value: String(concluidos) },
      { label: "Em aberto", value: String(emAndamento) },
    ];
  }, [pedidos]);

  const displayName = profile?.nome ?? user?.email?.split("@")[0] ?? "Cliente";
  const initial = displayName[0]?.toUpperCase() ?? "C";

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
      router.replace("/(auth)/login");
    } catch (e) {
      Alert.alert("Erro", e instanceof Error ? e.message : "Falha ao sair.");
    }
  }

  return (
    <View className="flex-1 bg-dark">
      <ScreenHeader title="Meu Perfil" onBack={() => router.back()} />
      <ScreenContainer showTabBar>
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
            {/* Avatar */}
            <View className="items-center py-3">
              <View
                className="h-20 w-20 items-center justify-center rounded-full"
                style={{
                  backgroundColor: "#FFD700",
                  borderWidth: 3,
                  borderColor: "rgba(255,215,0,0.3)",
                }}
              >
                <Text className="text-3xl font-black text-dark">{initial}</Text>
              </View>
              <Text className="mt-3 text-lg font-extrabold text-white">
                {displayName}
              </Text>
              <Text className="mt-0.5 text-xs text-white/50">
                {user?.email ?? "cliente@email.com"}
              </Text>
            </View>

            {/* Stats */}
            <View className="mt-2 flex-row gap-2">
              {stats.map((s) => (
                <GlassCard
                  key={s.label}
                  className="flex-1 items-center"
                  style={{ paddingVertical: 14 }}
                >
                  <Text className="text-xl font-black text-primary">
                    {s.value}
                  </Text>
                  <Text className="mt-0.5 text-[11px] text-white/50">
                    {s.label}
                  </Text>
                </GlassCard>
              ))}
            </View>

            {/* Edit profile */}
            <GlassCard className="mt-4">
              <Text className="mb-3 text-sm font-extrabold text-white">
                Dados pessoais
              </Text>
              <View className="gap-3">
                <TextField
                  label="Nome completo"
                  icon="person"
                  placeholder="Seu nome"
                  value={nome}
                  onChangeText={setNome}
                />
                <TextField
                  label="Telefone"
                  icon="call"
                  placeholder="(00) 00000-0000"
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
                  small
                />
              </View>
            </GlassCard>

            {/* History */}
            <Text className="mt-5 text-sm font-extrabold text-white">
              Histórico de serviços
            </Text>
            {pedidos.length === 0 ? (
              <Text className="mt-2 text-sm text-white/50">
                Você ainda não tem serviços registrados.
              </Text>
            ) : (
              <View className="mt-2 gap-2">
                {pedidos.slice(0, 5).map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => router.push(`/(app)/pedido/${p.id}`)}
                  >
                    <GlassCard className="flex-row items-center justify-between">
                      <View className="flex-1 pr-2">
                        <Text
                          className="text-sm font-semibold text-white"
                          numberOfLines={1}
                        >
                          {p.servico?.titulo ?? "Atendimento"}
                        </Text>
                        <Text className="mt-0.5 text-[11px] text-white/45">
                          {formatDateBR(p.created_at)}
                        </Text>
                      </View>
                      <StatusBadge status={p.status} small />
                    </GlassCard>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Logout */}
            <Pressable
              onPress={sair}
              className="mt-6 flex-row items-center justify-center gap-2 rounded-2xl border py-3.5"
              style={{
                backgroundColor: "rgba(204,0,0,0.1)",
                borderColor: "rgba(204,0,0,0.25)",
              }}
            >
              <Ionicons name="log-out" size={18} color="#ff6b6b" />
              <Text className="text-sm font-extrabold" style={{ color: "#ff6b6b" }}>
                Sair da conta
              </Text>
            </Pressable>
          </>
        )}
      </ScreenContainer>
    </View>
  );
}
