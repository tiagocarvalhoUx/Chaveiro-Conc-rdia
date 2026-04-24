import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { BrandHeader } from "@/components/BrandHeader";
import { GlassCard } from "@/components/GlassCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { usePedidos } from "@/hooks/usePedidos";
import { useProfile } from "@/hooks/useProfile";
import { categoriaLabel, formatDateTimeBR } from "@/lib/format";

interface ActionTileProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  accent?: "primary" | "danger";
}

function ActionTile({ icon, label, onPress, accent = "primary" }: ActionTileProps) {
  const tone = accent === "danger" ? "border-danger/50" : "border-primary/40";
  const color = accent === "danger" ? "#CC0000" : "#FFD700";
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 items-center justify-center rounded-2xl border ${tone} bg-white/5 p-5`}
      style={{ minHeight: 110 }}
    >
      <Ionicons name={icon} size={28} color={color} />
      <Text className="mt-2 text-center text-sm font-bold text-white">{label}</Text>
    </Pressable>
  );
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { pedidos, loading } = usePedidos(user?.id);

  const ativo = pedidos.find(
    (p) => p.status === "pendente" || p.status === "confirmado" || p.status === "em_atendimento"
  );

  return (
    <View className="flex-1 bg-dark">
      <BrandHeader subtitle={profile?.nome ? `Olá, ${profile.nome}` : "Bem-vindo"} />
      <ScreenContainer>
        <Text className="text-2xl font-extrabold text-white">
          O que você precisa agora?
        </Text>
        <Text className="mt-1 text-sm text-muted">
          Atendimento 24h em Araçatuba/SP.
        </Text>

        <View className="mt-6 gap-3">
          <View className="flex-row gap-3">
            <ActionTile
              icon="construct"
              label="Catálogo"
              onPress={() => router.push("/(app)/catalogo")}
            />
            <ActionTile
              icon="calendar"
              label="Agendar"
              onPress={() => router.push("/(app)/agendamento")}
            />
          </View>
          <View className="flex-row gap-3">
            <ActionTile
              icon="camera"
              label="Orçamento"
              onPress={() => router.push("/(app)/orcamento")}
            />
            <ActionTile
              icon="time"
              label="Meus pedidos"
              onPress={() => router.push("/(app)/pedidos")}
            />
          </View>
          <View className="flex-row gap-3">
            <ActionTile
              icon="person-circle"
              label="Perfil"
              onPress={() => router.push("/(app)/perfil")}
            />
            <ActionTile
              icon="alert-circle"
              label="Contato 24h"
              accent="danger"
              onPress={() => router.push("/(app)/contato")}
            />
          </View>
        </View>

        {loading ? null : ativo ? (
          <Pressable
            onPress={() => router.push(`/(app)/pedido/${ativo.id}`)}
            className="mt-6"
          >
            <GlassCard accent="primary">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs uppercase tracking-widest text-primary">
                  Pedido em andamento
                </Text>
                <StatusBadge status={ativo.status} />
              </View>
              <Text className="mt-2 text-base font-bold text-white">
                {ativo.servico?.titulo ??
                  (ativo.tipo === "orcamento"
                    ? "Orçamento enviado"
                    : "Atendimento")}
              </Text>
              {ativo.servico ? (
                <Text className="mt-1 text-xs text-muted">
                  {categoriaLabel(ativo.servico.categoria)} •{" "}
                  {formatDateTimeBR(ativo.created_at)}
                </Text>
              ) : (
                <Text className="mt-1 text-xs text-muted">
                  {formatDateTimeBR(ativo.created_at)}
                </Text>
              )}
              <Text className="mt-3 text-xs font-bold text-primary">
                Toque para acompanhar →
              </Text>
            </GlassCard>
          </Pressable>
        ) : null}
      </ScreenContainer>
    </View>
  );
}
