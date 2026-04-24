import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { BrandHeader } from "@/components/BrandHeader";
import { GlassCard } from "@/components/GlassCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { StarRating } from "@/components/StarRating";
import { useAuth } from "@/hooks/useAuth";
import { usePedidos } from "@/hooks/usePedidos";
import { categoriaLabel, formatDateTimeBR } from "@/lib/format";

/**
 * Tela 9 — Avaliações.
 * Lista os pedidos concluídos e permite navegar para a tela de status,
 * onde o cliente envia a avaliação 1–5 estrelas.
 */
export default function Avaliacoes() {
  const router = useRouter();
  const { user } = useAuth();
  const { pedidos, loading, error, reload } = usePedidos(user?.id);

  const concluidos = pedidos.filter((p) => p.status === "concluido");

  return (
    <View className="flex-1 bg-dark">
      <BrandHeader subtitle="Avaliações" onBack={() => router.back()} />
      <ScreenContainer>
        <Text className="text-xl font-extrabold text-white">
          Pedidos para avaliar
        </Text>
        <Text className="mt-1 text-sm text-muted">
          Sua nota nos ajuda a melhorar o atendimento.
        </Text>

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
        ) : concluidos.length === 0 ? (
          <GlassCard className="mt-4 items-center py-8">
            <Ionicons name="star-outline" size={32} color="#FFD700" />
            <Text className="mt-2 text-base font-bold text-white">
              Nenhum pedido concluído ainda.
            </Text>
            <Text className="mt-1 text-center text-sm text-muted">
              Quando um serviço for finalizado, você poderá avaliar por aqui.
            </Text>
          </GlassCard>
        ) : (
          <View className="mt-5 gap-3">
            {concluidos.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => router.push(`/(app)/pedido/${p.id}`)}
              >
                <GlassCard>
                  <Text className="text-base font-bold text-white">
                    {p.servico?.titulo ?? "Atendimento personalizado"}
                  </Text>
                  <Text className="mt-1 text-xs text-muted">
                    {p.servico ? `${categoriaLabel(p.servico.categoria)} • ` : ""}
                    {formatDateTimeBR(p.created_at)}
                  </Text>
                  <View className="mt-3 flex-row items-center justify-between">
                    <StarRating value={0} readOnly size={20} />
                    <Text className="text-xs font-bold text-primary">
                      Avaliar agora →
                    </Text>
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
