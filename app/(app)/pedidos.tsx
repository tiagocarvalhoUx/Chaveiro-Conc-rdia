import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { BrandHeader } from "@/components/BrandHeader";
import { GlassCard } from "@/components/GlassCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { usePedidos } from "@/hooks/usePedidos";
import { categoriaLabel, formatDateTimeBR } from "@/lib/format";

export default function ListaPedidos() {
  const router = useRouter();
  const { user } = useAuth();
  const { pedidos, loading, error, reload } = usePedidos(user?.id);

  return (
    <View className="flex-1 bg-dark">
      <BrandHeader subtitle="Meus pedidos" onBack={() => router.back()} />
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
        ) : pedidos.length === 0 ? (
          <GlassCard className="items-center py-8">
            <Text className="text-base font-bold text-white">
              Você ainda não tem pedidos.
            </Text>
            <Text className="mt-1 text-center text-sm text-muted">
              Solicite um agendamento ou orçamento para começar.
            </Text>
          </GlassCard>
        ) : (
          <View className="gap-3">
            {pedidos.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => router.push(`/(app)/pedido/${p.id}`)}
              >
                <GlassCard>
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-xs uppercase tracking-widest text-primary">
                        {p.tipo === "orcamento"
                          ? "Orçamento"
                          : p.tipo === "agendamento"
                            ? "Agendamento"
                            : "Emergência"}
                      </Text>
                      <Text className="mt-1 text-base font-bold text-white">
                        {p.servico?.titulo ??
                          (p.tipo === "orcamento" ? "Orçamento personalizado" : "Atendimento")}
                      </Text>
                      <Text className="mt-1 text-xs text-muted">
                        {p.servico
                          ? `${categoriaLabel(p.servico.categoria)} • `
                          : ""}
                        {formatDateTimeBR(p.created_at)}
                      </Text>
                    </View>
                    <StatusBadge status={p.status} />
                  </View>
                </GlassCard>
              </Pressable>
            ))}
          </View>
        )}
      </ScreenContainer>
    </View>
  );
}
