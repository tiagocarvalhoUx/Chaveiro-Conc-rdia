import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { GlassCard } from "@/components/GlassCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { usePedidos } from "@/hooks/usePedidos";
import { STATUS_INFO } from "@/lib/constants";
import {
  categoriaLabel,
  formatBRL,
  formatDateTimeBR,
  statusColor,
  statusStep,
} from "@/lib/format";
import type { PedidoComServico } from "@/services/pedidos";
import type { StatusPedido } from "@/types/database";

const TIMELINE: {
  status: StatusPedido;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  emoji: string;
}[] = [
  { status: "pendente", label: "Pedido recebido", icon: "document-text", emoji: "📅" },
  { status: "confirmado", label: "Confirmado", icon: "checkmark-done", emoji: "✅" },
  { status: "em_atendimento", label: "Em andamento", icon: "construct", emoji: "🔧" },
  { status: "concluido", label: "Concluído", icon: "trophy", emoji: "🎉" },
];

export default function ListaPedidos() {
  const router = useRouter();
  const { user } = useAuth();
  const { pedidos, loading, error, reload } = usePedidos(user?.id);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected: PedidoComServico | null = selectedId
    ? (pedidos.find((p) => p.id === selectedId) ?? null)
    : (pedidos[0] ?? null);

  const liveDot = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(liveDot, {
          toValue: 0.4,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(liveDot, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [liveDot]);

  const currentStep = selected ? statusStep(selected.status) : 0;
  const selectedStatusColor = selected
    ? statusColor(selected.status)
    : "#FFD700";

  return (
    <View className="flex-1 bg-dark">
      <ScreenHeader title="Status dos Pedidos" onBack={() => router.back()} />

      <View className="flex-row items-center gap-2 px-5 pb-2 pt-2">
        <Animated.View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: "#51CF66",
            opacity: liveDot,
          }}
        />
        <Text className="text-[11px] text-white/45">
          Atualização em tempo real
        </Text>
      </View>

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
        ) : pedidos.length === 0 ? (
          <GlassCard className="items-center py-8">
            <Ionicons name="clipboard-outline" size={32} color="#FFD700" />
            <Text className="mt-2 text-base font-extrabold text-white">
              Você ainda não tem pedidos.
            </Text>
            <Text className="mt-1 text-center text-xs text-white/50">
              Solicite um agendamento ou orçamento para começar.
            </Text>
          </GlassCard>
        ) : (
          <View className="gap-3">
            {/* Order list */}
            <View className="gap-2">
              {pedidos.map((p) => {
                const isSelected = selected?.id === p.id;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setSelectedId(p.id)}
                    onLongPress={() => router.push(`/(app)/pedido/${p.id}`)}
                  >
                    <GlassCard
                      selected={isSelected}
                      accent="primary"
                      style={{
                        borderColor: isSelected
                          ? STATUS_INFO[p.status].color
                          : undefined,
                      }}
                    >
                      <View className="flex-row items-center justify-between gap-2">
                        <View className="flex-1">
                          <Text
                            className="text-sm font-semibold text-white"
                            numberOfLines={1}
                          >
                            {p.servico?.titulo ?? "Atendimento"}
                          </Text>
                          <Text className="mt-0.5 text-[11px] text-white/45">
                            {p.id.slice(0, 8).toUpperCase()} •{" "}
                            {formatDateTimeBR(p.created_at)}
                          </Text>
                        </View>
                        <StatusBadge status={p.status} small />
                      </View>
                    </GlassCard>
                  </Pressable>
                );
              })}
            </View>

            {/* Detail */}
            {selected ? (
              <GlassCard className="mt-2">
                <Text
                  className="text-[11px] font-bold uppercase text-white/50"
                  style={{ letterSpacing: 0.5 }}
                >
                  Progresso do pedido
                </Text>

                <View className="mt-3 pl-7">
                  {TIMELINE.map((step, i) => {
                    const done = i < currentStep;
                    const active = i === currentStep - 1;
                    const color = done || active ? selectedStatusColor : "rgba(255,255,255,0.15)";
                    return (
                      <View
                        key={step.status}
                        style={{
                          position: "relative",
                          paddingBottom: i < TIMELINE.length - 1 ? 20 : 0,
                        }}
                      >
                        {i < TIMELINE.length - 1 ? (
                          <View
                            style={{
                              position: "absolute",
                              left: -22,
                              top: 18,
                              width: 2,
                              height: 20,
                              backgroundColor: done
                                ? selectedStatusColor
                                : "rgba(255,255,255,0.1)",
                            }}
                          />
                        ) : null}
                        <View
                          style={{
                            position: "absolute",
                            left: -29,
                            top: 2,
                            width: 14,
                            height: 14,
                            borderRadius: 7,
                            backgroundColor: color,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {done ? (
                            <Ionicons name="checkmark" size={8} color="#fff" />
                          ) : null}
                        </View>
                        <View className="flex-row items-center gap-2">
                          <Text style={{ fontSize: 14 }}>{step.emoji}</Text>
                          <Text
                            className="text-sm"
                            style={{
                              color: done || active ? "#fff" : "rgba(255,255,255,0.45)",
                              fontWeight: active ? "700" : "500",
                            }}
                          >
                            {step.label}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                <View
                  className="mt-4 flex-row items-center justify-between pt-3"
                  style={{ borderTopWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <View className="flex-1">
                    <Text className="text-xs text-white/45">Serviço</Text>
                    <Text className="mt-0.5 text-sm font-extrabold text-white">
                      {selected.servico?.titulo ?? "Atendimento"}
                    </Text>
                    {selected.servico ? (
                      <Text className="text-[11px] text-white/50">
                        {categoriaLabel(selected.servico.categoria)}
                      </Text>
                    ) : null}
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-white/45">Valor</Text>
                    <Text className="mt-0.5 text-base font-extrabold text-primary">
                      {formatBRL(
                        selected.valor_estimado ?? selected.servico?.preco_minimo
                      )}
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => router.push(`/(app)/pedido/${selected.id}`)}
                  className="mt-4 items-center rounded-xl border border-primary py-3"
                >
                  <Text className="text-sm font-extrabold text-primary">
                    Ver detalhes →
                  </Text>
                </Pressable>
              </GlassCard>
            ) : null}
          </View>
        )}
      </ScreenContainer>
    </View>
  );
}
